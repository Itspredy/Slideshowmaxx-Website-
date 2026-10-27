# Slideshowmaxx Website

Next.js landing page for Slideshowmaxx.

```bash
npm ci
npm run dev
```

For a production build, run `npm run build` and `npm start`.

In the full local workspace, `npm run dev` and `npm run build` first sync content from the sibling `LandingPage` folder. A standalone checkout of this repository uses the committed page files and assets instead.

## Payments and delivery emails

The regular checkout is $49 and the timed offer checkout is $29. Both use Dodo-hosted checkout sessions created by the Next.js server. After Dodo returns the buyer, the server verifies the payment before asking for a delivery email. A successful form submission writes one order row to Google Sheets and shows the 24-hour delivery message. Fulfillment is manual; review Dodo payments and the Sheet, then email the software to the delivery address.

Copy `.env.example` to `.env.local` locally, or add the same values as server environment variables in your hosting provider. Never commit real credentials.

1. Complete Dodo merchant verification. In **test mode**, create two **one-time** Slideshowmaxx products in USD: regular **$49** and offer **$29**. Copy their product IDs into `DODO_REGULAR_PRODUCT_ID` and `DODO_OFFER_PRODUCT_ID` and create a test API key for `DODO_PAYMENTS_API_KEY`. Keep `DODO_MODE=test_mode` and `DODO_LIVE_ENABLED=false`.
2. Create a Google Sheet with an `Orders` tab. Put these headers in row 1, cells A1:F1: `Paid at`, `Payment ID`, `Checkout email`, `Delivery email`, `Offer`, `Status`. Copy the Sheet ID from its URL into `GOOGLE_SHEET_ID`.
3. In a Google Cloud project, enable the **Google Sheets API**, create a service account, generate its JSON key, and share the Sheet with the service account email as **Editor**. Put `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` into `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` as a server secret. A literal `\n` in the private key is supported.
4. Set `PUBLIC_SITE_URL` to the exact origin serving this Next.js app, for example `https://your-domain.com`. Test both prices and the full return → email → Sheet → thank-you flow. Dodo's return URL is built from this setting. Cancelling checkout returns to the pricing section.
5. For live mode, create or copy the corresponding $49 and $29 products in Dodo's live catalog, use a live API key and those live product IDs, set `DODO_MODE=live_mode`, and set `DODO_LIVE_ENABLED=true` only after your merchant account, product descriptions, domain, and current landing-page claims are ready for live buyers. Test and live credentials are separate.

For the standalone `LandingPage` preview, checkout links assume the Next.js app shares the same origin. If the static page is hosted elsewhere, set `window.SLIDESHOWMAX_CHECKOUT_ORIGIN = 'https://your-nextjs-domain.com'` before loading its `script.js`; all buy links will route to the Next.js checkout.

If a buyer does not submit a delivery email after paying, their Dodo checkout email is still available in the Dodo dashboard for manual follow-up. The Contact page uses `Khatrikunal457@gmail.com`.
