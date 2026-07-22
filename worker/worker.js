/**
 * Cloudflare Worker - Shopify Order Tracking Proxy
 * Securely fetches order details from Shopify Admin API without exposing Admin Access Tokens.
 *
 * Environment Variables (Set in Cloudflare Dashboard / wrangler.toml):
 * - SHOPIFY_STORE_DOMAIN: e.g. "your-store.myshopify.com"
 * - SHOPIFY_ADMIN_API_TOKEN: e.g. "shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
 * - ALLOWED_ORIGIN: e.g. "https://yourdomain.com" (or "*" for testing)
 * - RATE_LIMIT_MAX: e.g. 10 (Max requests per IP per minute)
 */

// Simple In-Memory Rate Limiting Bucket for Workers
const ipRateMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight Handling
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'METHOD_NOT_ALLOWED', message: 'Only POST requests are allowed.' }),
        { headers: corsHeaders, status: 405 }
      );
    }

    // 2. IP Rate Limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('x-real-ip') || 'unknown';
    const maxRequests = parseInt(env.RATE_LIMIT_MAX || '10', 10);
    const now = Date.now();

    let clientData = ipRateMap.get(clientIP);
    if (!clientData || (now - clientData.startTime) > RATE_LIMIT_WINDOW_MS) {
      clientData = { count: 1, startTime: now };
    } else {
      clientData.count += 1;
    }
    ipRateMap.set(clientIP, clientData);

    if (clientData.count > maxRequests) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many tracking requests. Please wait a minute before trying again.'
        }),
        { headers: corsHeaders, status: 429 }
      );
    }

    try {
      // 3. Input Validation
      const body = await request.json().catch(() => ({}));
      let { order_number, email } = body;

      if (!order_number || !email) {
        return new Response(
          JSON.stringify({ success: false, error: 'INVALID_INPUT', message: 'Order number and Email address are required.' }),
          { headers: corsHeaders, status: 400 }
        );
      }

      // Clean & normalize order number (e.g. "#1001" or "1001" -> "1001" and "#1001")
      let cleanOrderNum = String(order_number).trim();
      if (!cleanOrderNum.startsWith('#')) {
        cleanOrderNum = '#' + cleanOrderNum;
      }
      const cleanEmail = String(email).trim().toLowerCase();

      const storeDomain = env.SHOPIFY_STORE_DOMAIN;
      const apiToken = env.SHOPIFY_ADMIN_API_TOKEN;

      if (!storeDomain || !apiToken) {
        return new Response(
          JSON.stringify({ success: false, error: 'SERVER_CONFIG_ERROR', message: 'Backend proxy is missing configuration.' }),
          { headers: corsHeaders, status: 500 }
        );
      }

      // 4. Query Shopify Admin API with Multi-Fallback Strategy
      const rawOrderNum = cleanOrderNum.replace('#', '').trim();
      const fetchHeaders = {
        'X-Shopify-Access-Token': apiToken,
        'Content-Type': 'application/json'
      };

      const urlsToTry = [
        `https://${storeDomain}/admin/api/2024-04/orders.json?name=${encodeURIComponent(rawOrderNum)}&status=any`,
        `https://${storeDomain}/admin/api/2024-04/orders.json?name=${encodeURIComponent(cleanOrderNum)}&status=any`,
        `https://${storeDomain}/admin/api/2024-04/orders.json?status=any&limit=100`,
        `https://${storeDomain}/admin/api/2024-04/draft_orders.json?status=any&limit=100`
      ];

      let allOrders = [];
      for (const url of urlsToTry) {
        try {
          const res = await fetch(url, { method: 'GET', headers: fetchHeaders });
          if (res.ok) {
            const data = await res.json();
            const list = data.orders || data.draft_orders || [];
            if (list.length > 0) {
              allOrders.push(...list);
            }
          }
        } catch (e) {
          // Continue to next fallback
        }
      }

      if (allOrders.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NOT_FOUND',
            message: 'No orders found in Shopify store.'
          }),
          { headers: corsHeaders, status: 444 }
        );
      }

      // Find exact order matching order name/number & email (case-insensitive & trimmed)
      const matchedOrder = allOrders.find(ord => {
        const ordName = (ord.name || '').toLowerCase().trim();
        const ordNum = String(ord.order_number || ord.name || ord.id || '').trim();
        const targetClean = cleanOrderNum.toLowerCase().trim();
        const targetRaw = rawOrderNum.toLowerCase().trim();

        const matchesName = ordName === targetClean || 
                            ordName === `#${targetRaw}` || 
                            ordName === targetRaw ||
                            ordNum === targetRaw ||
                            ordName.includes(targetRaw) ||
                            ordNum.includes(targetRaw);
        
        const ordEmail = (
          ord.email || 
          ord.contact_email || 
          (ord.customer && ord.customer.email) || 
          (ord.billing_address && ord.billing_address.email) ||
          (ord.shipping_address && ord.shipping_address.email) ||
          ''
        ).toLowerCase().trim();

        const matchesEmail = !ordEmail || 
                             ordEmail === cleanEmail || 
                             (ordEmail.length > 0 && cleanEmail.includes(ordEmail)) || 
                             (ordEmail.length > 0 && ordEmail.includes(cleanEmail));

        return matchesName && matchesEmail;
      });

      if (!matchedOrder) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'NOT_FOUND',
            message: 'No matching order found for the provided Order Number and Email Address.'
          }),
          { headers: corsHeaders, status: 444 }
        );
      }

      // 5. Parse Fulfillment & Tracking Information
      const fulfillments = matchedOrder.fulfillments || [];
      const latestFulfillment = fulfillments.length > 0 ? fulfillments[fulfillments.length - 1] : null;

      let trackingNumber = 'N/A';
      let trackingCompany = 'N/A';
      let trackingUrl = '#';
      let shipmentStatus = 'processing'; // default

      if (latestFulfillment) {
        trackingNumber = latestFulfillment.tracking_number || (latestFulfillment.tracking_numbers && latestFulfillment.tracking_numbers[0]) || 'N/A';
        trackingCompany = latestFulfillment.tracking_company || 'Standard Shipping';
        trackingUrl = latestFulfillment.tracking_url || (latestFulfillment.tracking_urls && latestFulfillment.tracking_urls[0]) || '#';
        shipmentStatus = latestFulfillment.shipment_status || 'shipped';
      }

      // Determine Timeline Step Index (1 to 7)
      let currentStep = 1;
      const financialStatus = (matchedOrder.financial_status || matchedOrder.status || '').toLowerCase();
      const fulfillmentStatus = (matchedOrder.fulfillment_status || '').toLowerCase();
      const cancelledAt = matchedOrder.cancelled_at;

      if (financialStatus === 'paid' || financialStatus === 'authorized' || financialStatus === 'partially_paid') {
        currentStep = 2; // Payment Accepted
      }

      if (fulfillmentStatus === 'partial' || fulfillmentStatus === 'fulfilled' || fulfillments.length > 0) {
        currentStep = 4; // Packed
      }

      if (latestFulfillment) {
        currentStep = 5; // Shipped
        if (shipmentStatus === 'out_for_delivery') {
          currentStep = 6;
        } else if (shipmentStatus === 'delivered' || fulfillmentStatus === 'fulfilled') {
          currentStep = 7;
        }
      }

      // Handle Cancelled / Refunded Override
      if (cancelledAt) {
        currentStep = 0; // Indicates cancelled
      }

      // 6. Format Line Items (Extract or fetch real product image)
      const lineItems = await Promise.all((matchedOrder.line_items || []).map(async item => {
        let imageUrl = item.featured_image?.src || item.featured_image?.url || item.image || item.image_url || '';

        // If no direct image on line_item, try fetching product image from product_id if available
        if (!imageUrl && item.product_id) {
          try {
            const pRes = await fetch(`https://${storeDomain}/admin/api/2024-04/products/${item.product_id}.json?fields=image,images`, {
              headers: fetchHeaders
            });
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.product) {
                imageUrl = pData.product.image?.src || (pData.product.images && pData.product.images[0]?.src) || '';
              }
            }
          } catch (e) {
            // Ignore fetch error fallback
          }
        }

        return {
          id: item.id,
          title: item.title,
          variant_title: item.variant_title || '',
          quantity: item.quantity,
          price: parseFloat(item.price || 0).toFixed(2),
          sku: item.sku || '',
          image: imageUrl
        };
      }));

      const custName = (matchedOrder.customer ? `${matchedOrder.customer.first_name || ''} ${matchedOrder.customer.last_name || ''}`.trim() : '') ||
                       (matchedOrder.billing_address ? `${matchedOrder.billing_address.first_name || ''} ${matchedOrder.billing_address.last_name || ''}`.trim() : '') ||
                       'Valued Customer';

      // Build Clean Sanitized Response
      const responsePayload = {
        success: true,
        order: {
          id: matchedOrder.id,
          order_number: matchedOrder.name || `#${matchedOrder.order_number || rawOrderNum}`,
          created_at: matchedOrder.created_at,
          customer_name: custName,
          email: matchedOrder.email || matchedOrder.contact_email || cleanEmail,
          financial_status: financialStatus,
          fulfillment_status: fulfillmentStatus || 'unfulfilled',
          cancelled: Boolean(cancelledAt),
          cancelled_at: cancelledAt,
          cancel_reason: matchedOrder.cancel_reason || '',
          
          shipping_info: {
            courier: trackingCompany,
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            shipment_status: shipmentStatus,
            estimated_delivery: matchedOrder.estimated_delivery_at || '3 - 5 Business Days'
          },

          timeline: {
            current_step: currentStep,
            total_steps: 7
          },

          totals: {
            subtotal: parseFloat(matchedOrder.subtotal_price || 0).toFixed(2),
            shipping: parseFloat(matchedOrder.total_shipping_price_set?.shop_money?.amount || 0).toFixed(2),
            discount: parseFloat(matchedOrder.total_discounts || 0).toFixed(2),
            tax: parseFloat(matchedOrder.total_tax || 0).toFixed(2),
            grand_total: parseFloat(matchedOrder.total_price || 0).toFixed(2),
            currency: matchedOrder.currency || 'USD'
          },

          items: lineItems
        }
      };

      return new Response(JSON.stringify(responsePayload), {
        headers: corsHeaders,
        status: 200
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: 'SERVER_ERROR', message: err.message || 'An unexpected error occurred.' }),
        { headers: corsHeaders, status: 500 }
      );
    }
  }
};
