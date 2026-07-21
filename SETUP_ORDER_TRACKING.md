# 🚀 Free Real Order Tracking Setup Guide (Step-by-Step)

Hanji! Yeh system **100% FREE** hai. Cloudflare Worker ka free tier daily **100,000 free tracking requests** deta hai (jo kisi bhi store ke liye bahut ziada hai).

---

## ❓ Kyun Chahiye Cloudflare Worker Proxy?

Shopify security reasons ki waja se frontend browser ko direct customer orders search karne ki permission nahi deta. Is waja se Admin API access token ko secure jagah par rakhna hota hai taaki koi aapka store data hack na kar sake. 

---

## 📋 Complete Setup (3 Steps - 5 Minutes)

### Step 1: Shopify Admin se API Token lein

1. **Shopify Admin** par jayein.
2. **Settings → Apps and sales channels → Develop apps** par click karein.
3. **Create an app** button par click karein aur naam rakhein: `Order Tracker`.
4. **Configure Admin API scopes** par click karein.
5. Search bar mein `orders` dhoondhein aur **`read_orders`** check-box ko select karein.
6. **Save** karke top par **Install app** par click karein.
7. **Admin API access token** ko copy kar lein (yeh `shpat_xxxxxxxx...` jaisa hoga).

---

### Step 2: Free Cloudflare Worker Deploy Karein

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) par free account banayein ya login karein.
2. **Workers & Pages** tab mein ja kar **Create Application → Create Worker** par click karein.
3. Worker ka naam rakhein (e.g. `my-store-tracker`) aur **Deploy** daba dein.
4. **Edit Code** par click karein aur wahan mojood saara code delete karke is file [`worker/worker.js`](file:///c:/Users/ma567/OneDrive/Documents/Clay-theme-main/worker/worker.js) ka poora code paste kar dein.
5. Top right par **Save and Deploy** dabayein.
6. **Settings → Variables** tab par jayein aur **Add variable** karke 2 variables add karein:

| Variable Name | Value |
| :--- | :--- |
| `SHOPIFY_STORE_DOMAIN` | `rbmittistore.myshopify.com` (apna `.myshopify.com` domain) |
| `SHOPIFY_ADMIN_API_TOKEN` | `shpat_xxxxxxxx...` (Step 1 wala token) |

7. Save kar lein aur apna Worker URL copy kar lein (e.g. `https://my-store-tracker.yourname.workers.dev`).

---

### Step 3: Theme Editor Mein Endpoint Link Karein

1. **Shopify Admin → Online Store → Themes → Customize** (Editor) kholein.
2. Top dropdown se **Pages → track-order** select karein.
3. Left sidebar se **Track Order System** section par click karein.
4. **Cloudflare Worker API Endpoint URL** box mein apna Worker URL paste karein.
5. **Enable Demo / Test Mode** box ko **UNCHECK (Off)** kar dein.
6. Top right par **Save** daba dein!

---

🎉 **Done!** Ab aapka live customer order `#1001` real-time Shopify database se tracking data fetch karega!
