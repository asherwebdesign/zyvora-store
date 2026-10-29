# ZYVORA — Complete Website Project

A full-stack starter storefront for the ZYVORA luxury marketplace aesthetic: black, crimson, and gold styling; cinematic dragon-themed hero; product browsing/search/filtering; cart and wishlist; checkout; order API; newsletter endpoint; admin tools; and About, Contact, FAQ, Shipping, Returns, Privacy, Terms, and Order Status pages.

## Run locally on Windows
1. Install Node.js 20 or newer from https://nodejs.org/.
2. Extract this ZIP completely to a normal folder.
3. Open the extracted `ZYVORA` folder in VS Code.
4. Open Terminal → New Terminal and run `npm start`.
5. Visit `http://localhost:3000`.

No npm packages are required. `START-ZYVORA.bat` is also included for Windows.

## Publish with Render
1. Upload the **contents of this `ZYVORA` folder** to the root of the GitHub repository (not the outer ZIP and not a nested extra folder).
2. In Render, create a **Web Service** and connect the GitHub repository.
3. Use these settings:
   - Runtime/language: Node
   - Branch: `main`
   - Build command: `npm install` (no third-party dependencies are currently needed; `npm install` is still acceptable)
   - Start command: `npm start`
4. Deploy. Render supplies the public URL and `PORT` environment variable.

If the repository already contains files, GitHub may ask you to replace/merge files. Keep the website files at the repository root so `package.json`, `server.js`, `index.html`, `styles.css`, `script.js`, `assets/`, and `data/` are directly visible on the repository's main page.

## Included functionality
- Responsive storefront, product search, category filtering and sorting
- Browser-persistent cart and wishlist
- Checkout with server-side product/price validation
- Cash-on-delivery order creation
- Newsletter endpoint
- Admin order/catalogue API foundation
- Paystack transaction-initialization foundation
- Supporting brand, help, and policy pages

## Important production limitations — please read
This is a runnable full-stack starter project, **not a 100%-production-ready commerce platform**. A public deployment alone does not make payments or customer-data handling production-safe. Before taking real customer orders/payments, arrange persistent database storage, secure admin authentication, payment verification and signed webhooks, HTTPS/security headers, rate limiting, backups, real stock/shipping/tax rules, email/SMS notifications, monitoring, and end-to-end testing. Render's local filesystem may not be durable for order files across redeploys/restarts, so migrate orders and subscribers to a managed database before launch.

The included product catalogue is sample inventory; replace names, prices, stock, and images with accurate, licensed business content. The dragon video is a stylized cinematic background loop and includes legacy SCORPIO lettering in its source scene; it is not a newly generated realistic dragon performance. Review all policy pages and fill in actual business contact, delivery, returns, and legal details before publishing.

Never commit a real `.env` file, payment secret key, password, or customer data to GitHub. `.env.example` contains configuration placeholders only. Set secrets in the hosting provider's environment-variable settings instead.

## Environment variables
- `ADMIN_API_KEY`: set a long random secret for admin API calls.
- `PAYSTACK_SECRET_KEY`: optional Paystack secret key; keep it server-side only.
- `PAYSTACK_CALLBACK_URL`: optional callback URL override.

Use Paystack test keys while testing. A successful redirect is not proof of payment; verify transactions server-side and implement webhooks before fulfilling paid orders.
