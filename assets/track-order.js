/**
 * Antigravity Theme - Custom Order Tracking Web Component / Controller
 * Lightweight Vanilla JS (Zero external dependencies)
 */

class TrackOrderSection extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('.track-order__form');
    this.orderInput = this.querySelector('[name="order_number"]');
    this.emailInput = this.querySelector('[name="email"]');
    this.submitBtn = this.querySelector('.track-order__submit-btn');
    this.errorBanner = this.querySelector('.track-order__error-banner');
    this.errorMessageEl = this.querySelector('.track-order__error-message');
    this.skeletonContainer = this.querySelector('.track-order__skeleton-card');
    this.resultWrapper = this.querySelector('.track-order__result-wrapper');

    this.apiEndpoint = this.dataset.apiEndpoint || '';
    this.demoMode = this.dataset.demoMode === 'true';
    this.demoOrderNumber = (this.dataset.demoOrderNumber || '#1001').trim();
    this.demoEmail = (this.dataset.demoEmail || 'demo@example.com').trim().toLowerCase();

    // Editable Error Text Strings from Schema
    this.errEmpty = this.dataset.errEmpty || 'Please enter both Order Number and Email Address.';
    this.errNotFound = this.dataset.errNotFound || 'No order found matching this Order Number and Email.';
    this.errServer = this.dataset.errServer || 'Unable to connect to order tracking service. Please try again.';
  }

  connectedCallback() {
    if (this.form) {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.hideError();

    const orderNumber = this.orderInput ? this.orderInput.value.trim() : '';
    const email = this.emailInput ? this.emailInput.value.trim() : '';

    if (!orderNumber || !email) {
      this.showError(this.errEmpty);
      return;
    }

    this.setLoading(true);

    try {
      let data = null;

      // Clean order number for comparison
      const cleanInputOrder = orderNumber.startsWith('#') ? orderNumber.toLowerCase() : `#${orderNumber.toLowerCase()}`;
      const cleanDemoOrder = this.demoOrderNumber.startsWith('#') ? this.demoOrderNumber.toLowerCase() : `#${this.demoOrderNumber.toLowerCase()}`;

      const isDemoMatch = (cleanInputOrder === cleanDemoOrder) && (email.toLowerCase() === this.demoEmail);

      if (this.demoMode && isDemoMatch) {
        await new Promise(res => setTimeout(res, 800)); // Simulate network latency
        data = this.getDemoOrderData(orderNumber, email);
      } else if (this.demoMode && !this.apiEndpoint) {
        // In demo mode without endpoint, if credentials don't match demo config, throw not found
        await new Promise(res => setTimeout(res, 600));
        throw new Error(this.errNotFound);
      } else if (this.apiEndpoint) {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_number: orderNumber, email: email })
        });

        const resJson = await response.json().catch(() => ({}));

        if (!response.ok || !resJson.success) {
          throw new Error(resJson.message || this.errNotFound);
        }

        data = resJson.order;
      } else {
        // Fallback demo mode if no endpoint is configured yet
        await new Promise(res => setTimeout(res, 800));
        data = this.getDemoOrderData(orderNumber, email);
      }

      this.renderOrderResult(data);
    } catch (err) {
      this.showError(err.message || this.errServer);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (this.submitBtn) {
      this.submitBtn.disabled = isLoading;
      const btnText = this.submitBtn.querySelector('.track-order__btn-text');
      const spinner = this.submitBtn.querySelector('.track-order__spinner');
      if (btnText && spinner) {
        btnText.style.display = isLoading ? 'none' : 'inline-block';
        spinner.style.display = isLoading ? 'inline-block' : 'none';
      }
    }

    if (this.skeletonContainer) {
      this.skeletonContainer.style.display = isLoading ? 'flex' : 'none';
    }

    if (isLoading && this.resultWrapper) {
      this.resultWrapper.style.display = 'none';
    }
  }

  showError(msg) {
    if (this.errorBanner && this.errorMessageEl) {
      this.errorMessageEl.textContent = msg;
      this.errorBanner.style.display = 'flex';
    }
  }

  hideError() {
    if (this.errorBanner) {
      this.errorBanner.style.display = 'none';
    }
  }

  renderOrderResult(order) {
    if (!this.resultWrapper) return;

    // 1. Text elements
    const setElText = (selector, val) => {
      const el = this.resultWrapper.querySelector(selector);
      if (el) el.textContent = val;
    };

    setElText('[data-bind="customer_name"]', order.customer_name);
    setElText('[data-bind="order_number"]', order.order_number);
    setElText('[data-bind="order_date"]', new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }));
    setElText('[data-bind="courier"]', order.shipping_info.courier);
    setElText('[data-bind="tracking_number"]', order.shipping_info.tracking_number);
    setElText('[data-bind="estimated_delivery"]', order.shipping_info.estimated_delivery);
    setElText('[data-bind="subtotal"]', `${order.totals.currency} $${order.totals.subtotal}`);
    setElText('[data-bind="shipping"]', `${order.totals.currency} $${order.totals.shipping}`);
    setElText('[data-bind="discount"]', `-$${order.totals.discount}`);
    setElText('[data-bind="tax"]', `${order.totals.currency} $${order.totals.tax}`);
    setElText('[data-bind="grand_total"]', `${order.totals.currency} $${order.totals.grand_total}`);

    // 2. Tracking link
    const trackBtn = this.resultWrapper.querySelector('[data-bind="tracking_url"]');
    if (trackBtn) {
      trackBtn.href = order.shipping_info.tracking_url || '#';
      if (!order.shipping_info.tracking_url || order.shipping_info.tracking_url === '#') {
        trackBtn.style.display = 'none';
      } else {
        trackBtn.style.display = 'inline-flex';
      }
    }

    // 3. Status Badges
    this.updateBadge('[data-bind="financial_status_badge"]', order.financial_status);
    this.updateBadge('[data-bind="fulfillment_status_badge"]', order.fulfillment_status);

    // 4. Order Timeline Progress
    this.updateTimeline(order.timeline.current_step, order.cancelled);

    // 5. Line Items List
    const itemsList = this.resultWrapper.querySelector('[data-bind="items_list"]');
    if (itemsList && Array.isArray(order.items)) {
      itemsList.innerHTML = order.items.map(item => `
        <div class="track-order__item-row">
          <img src="${item.image || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'}" alt="${item.title}" class="track-order__item-thumb" width="64" height="64" loading="lazy" />
          <div class="track-order__item-info">
            <span class="track-order__item-title">${item.title}</span>
            ${item.variant_title ? `<span class="track-order__item-meta">${item.variant_title}</span>` : ''}
            <span class="track-order__item-meta">Qty: ${item.quantity}</span>
          </div>
          <span class="track-order__item-price">$${item.price}</span>
        </div>
      `).join('');
    }

    this.resultWrapper.style.display = 'block';
    this.resultWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  updateBadge(selector, statusStr) {
    const el = this.resultWrapper.querySelector(selector);
    if (!el) return;

    const lower = (statusStr || '').toLowerCase();
    el.textContent = statusStr || 'Pending';
    el.className = 'track-order__badge';

    if (['paid', 'confirmed', 'fulfilled', 'delivered'].includes(lower)) {
      el.classList.add('track-order__badge--confirmed');
    } else if (['processing', 'shipped', 'packed', 'partial', 'in_transit'].includes(lower)) {
      el.classList.add('track-order__badge--processing');
    } else if (['cancelled', 'refunded', 'returned'].includes(lower)) {
      el.classList.add('track-order__badge--cancelled');
    } else {
      el.classList.add('track-order__badge--pending');
    }
  }

  updateTimeline(currentStep, isCancelled) {
    const steps = this.querySelectorAll('.track-order__timeline-step');
    const fillBar = this.querySelector('.track-order__timeline-progress-fill');
    const totalSteps = steps.length || 7;

    steps.forEach((step, idx) => {
      const stepNum = idx + 1;
      step.classList.remove('is-completed', 'is-current');

      if (isCancelled) {
        // Leave uncompleted
      } else if (stepNum < currentStep) {
        step.classList.add('is-completed');
      } else if (stepNum === currentStep) {
        step.classList.add('is-current');
      }
    });

    if (fillBar) {
      let pct = 0;
      if (currentStep > 1 && !isCancelled) {
        pct = Math.min(100, Math.round(((currentStep - 1) / (totalSteps - 1)) * 100));
      }
      if (window.innerWidth <= 768) {
        fillBar.style.height = `${pct}%`;
        fillBar.style.width = '3px';
      } else {
        fillBar.style.width = `${pct}%`;
        fillBar.style.height = '3px';
      }
    }
  }

  getDemoOrderData(ordNum, emailStr) {
    return {
      id: 99999,
      order_number: ordNum.startsWith('#') ? ordNum : `#${ordNum}`,
      created_at: new Date().toISOString(),
      customer_name: 'Alex Morgan',
      email: emailStr,
      financial_status: 'Paid',
      fulfillment_status: 'Shipped',
      cancelled: false,

      shipping_info: {
        courier: 'FedEx Express',
        tracking_number: 'FX-9823471029',
        tracking_url: 'https://www.fedex.com',
        shipment_status: 'shipped',
        estimated_delivery: '2 - 3 Business Days'
      },

      timeline: {
        current_step: 5,
        total_steps: 7
      },

      totals: {
        subtotal: '120.00',
        shipping: '15.00',
        discount: '10.00',
        tax: '8.40',
        grand_total: '133.40',
        currency: 'USD'
      },

      items: [
        {
          id: 1,
          title: 'Premium Antigravity Hoodie',
          variant_title: 'Matte Black / Large',
          quantity: 1,
          price: '85.00',
          image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'
        },
        {
          id: 2,
          title: 'Minimalist Water Bottle',
          variant_title: 'Stainless Steel / 750ml',
          quantity: 1,
          price: '35.00',
          image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png'
        }
      ]
    };
  }
}

if (!customElements.get('track-order-section')) {
  customElements.define('track-order-section', TrackOrderSection);
}
