# 🚀 How to Enable Real Shopify Order Tracking (Step-by-Step Guide)

Follow these 3 simple steps to connect real Shopify order data (e.g. Order `#1001` with `manees78682@gmail.com`) to your Track Order page.

---

## 🔑 Step 1: Get Shopify Admin API Token (2 minutes)

1. Open your **Shopify Admin** (`https://admin.shopify.com`).
2. Go to **Settings** (bottom left) ⚙️ → **Apps and sales channels**.
3. Click **Develop apps** (top right) → Click **Create an app**.
4. App name: `Order Tracking Backend` → Click **Create app**.
5. Click **Configure Admin API scopes**.
6. Search for `orders` and check **`read_orders`** permission.
7. Click **Save** → Click **Install app** (top right) → Confirm **Install**.
8. Under **Admin API access token**, click **Reveal token once** and COPY the token (it starts with `shpat_...`).

---

## ⚡ Step 2: Deploy Cloudflare Worker Proxy (2 minutes)

1. Open free [Cloudflare Dashboard](https://dash.cloudflare.com/) and log in (or create a free account).
2. Go to **Workers & Pages** → Click **Create application** → **Create Worker**.
3. Name your worker: `shopify-order-tracker` → Click **Deploy**.
4. Click **Edit code** on the top right.
5. Delete all existing code in the editor, copy the entire code from [`worker/worker.js`](file:///c:/Users/ma567/OneDrive/Documents/Clay-theme-main/worker/worker.js), and paste it into Cloudflare.
6. Click **Save and deploy**.
7. Go back to your Worker settings: Click **Settings** tab → **Variables & Secrets** → Click **Add**.
   - **Key 1**: `SHOPIFY_STORE_DOMAIN` | **Value**: `rbmittistore.myshopify.com` (Your store myshopify domain)
   - **Key 2**: `SHOPIFY_ADMIN_API_TOKEN` | **Value**: `shpat_xxxxxxxx` (Token copied in Step 1)
8. Click **Deploy / Save**.
9. Copy your Worker URL from the top of the page (e.g. `https://shopify-order-tracker.yourname.workers.dev`).

---

## 🎨 Step 3: Link Worker URL in Shopify Theme Editor (1 minute)

1. Go to **Shopify Admin → Online Store → Themes** → Click **Customize** on your theme.
2. In the top page selector dropdown, choose **Pages → track-order**.
3. On the left sidebar, click **Track Order System** section.
4. Under **Backend Proxy Configuration**:
   - Paste your Worker URL in **Cloudflare Worker API Endpoint URL**.
   - **UNCHECK (Turn OFF) "Enable Demo / Test Mode"**.
5. Click **Save** (top right).

---

## ✅ Step 4: Test Real Orders Live!

Go to your store URL `/pages/track-order` and test:
- **Order Number**: `1001` (or `#1001`)
- **Email Address**: `manees78682@gmail.com`

Your live Shopify order details, line items, payment status, fulfillment status, and carrier tracking links will now load automatically!
