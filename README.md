# ZYVORA — Full Website Package

A complete, runnable website project package for the ZYVORA luxury-style marketplace, including storefront UI, category filters, product search/sorting, cart, wishlist, checkout form, local order API, newsletter endpoint, admin catalogue/order tools, Paystack initialization foundation, responsive styles, cinematic hero assets, and supporting About, Contact, FAQ, Shipping, Returns, Privacy, Terms and Order Help pages.

## Run on Windows

1. Install Node.js 20 or newer from https://nodejs.org/.
2. Extract the ZIP to a normal folder (not inside the ZIP preview).
3. Double-click `START-ZYVORA.bat`, or open this folder in VS Code and run `npm start` in Terminal.
4. Visit http://localhost:3000. Admin page: http://localhost:3000/admin.html.

The server uses Node's built-in modules; no npm packages need installing.

## Included functionality

- Responsive storefront and category sections
- Product search, category filtering, sorting and product catalogue loaded from `data/products.json`
- Persistent browser cart and wishlist
- Checkout that validates submitted cart items against the server catalogue
- Cash-on-delivery order creation saved in `data/orders.json`
- Newsletter subscription saved in `data/subscribers.json`
- Admin API key protection for order viewing/status changes and catalogue updates
- Paystack transaction initialization when configured
- Optional ambience control in the storefront (browser audio rules apply)
- Standalone support and policy pages

## Important — before accepting real customers

This is a runnable full-stack website project, **not a production-ready hosted commerce service**. The included catalogue is illustrative starter inventory; replace it with real products, actual stock, accurate prices, licensed product photos and delivery costs. The provided dragon video contains legacy SCORPIO lettering in the source scene and is only a cinematic background loop; it does not contain a verified realistic head-turn/fire-breath performance. Replace it with a properly licensed clean dragon video if you want that specific effect.

Customer accounts are not implemented as a secure account system; the account panel is informational. There is no secure public order-tracking portal, live inventory reservation, automated fulfilment, email/SMS notification, tax/shipping calculator, or multi-vendor seller dashboard. The supporting policy pages are templates and must be reviewed and completed with the actual business details and applicable law.

Before production launch, add a managed database, HTTPS deployment, secure authentication and session handling, rate limiting, CSRF/security headers, privacy-safe logs, backups, payment verification and signed webhooks, admin access controls, transactional notifications, stock management, monitored support contacts and end-to-end testing. Do not expose a local server to the public internet as-is. Never commit secret keys to source control.

## Paystack setup

Set `PAYSTACK_SECRET_KEY` in the server environment (never in browser JavaScript). Optional `PAYSTACK_CALLBACK_URL` can override the callback URL. The current endpoint initializes a transaction, but a successful redirect alone is **not proof of payment**. Implement and test provider verification/webhooks before fulfilling online-paid orders.

Set `ADMIN_API_KEY` in the server environment to enable admin API calls. Example PowerShell session:

```powershell
$env:ADMIN_API_KEY = "use-a-long-random-secret-here"
$env:PAYSTACK_SECRET_KEY = "your-secret-key"
npm start
```

## API routes

- `GET /api/health` — health check
- `GET /api/products` — product catalogue
- `POST /api/orders` — create COD order or initialize Paystack transaction
- `POST /api/newsletter` — subscribe email
- `GET /api/admin/orders` — list orders (requires `x-admin-key`)
- `POST /api/admin/orders` — update order status (requires `x-admin-key`)
- `POST /api/admin/products` — replace catalogue (requires `x-admin-key`)

All orders/subscribers are stored as local JSON files and can be lost if the host or files are lost. Back them up and migrate to a database before production.
