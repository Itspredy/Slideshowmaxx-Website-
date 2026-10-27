# Slideshowmaxx live checkout checklist

Check an item only after its evidence is recorded. Keep real API keys and the Google private key in local or hosting secrets, never in this file or GitHub.

## 1. Merchant and product setup

- [ ] Dodo merchant verification is approved and live payments are enabled. Evidence: dashboard status.
- [ ] Create two **test-mode, one-time USD** Slideshowmaxx products: regular **$49** and offer **$29**. Evidence: both product IDs and checkout prices.
- [ ] Create a Dodo **test-mode API key** and set `DODO_MODE=test_mode`, `DODO_PAYMENTS_API_KEY`, `DODO_REGULAR_PRODUCT_ID`, and `DODO_OFFER_PRODUCT_ID` in the test deployment. Evidence: a hosted checkout opens for each offer.
- [ ] Create or copy the matching **live-mode** products and a separate live API key. Evidence: live product IDs, prices, and merchant account approval. Keep `DODO_LIVE_ENABLED=false` until the final step.

## 2. Buyer record and manual delivery

- [x] Create the [Slideshowmaxx Orders Sheet](https://docs.google.com/spreadsheets/d/15JIk5Q9zOYVHWA9ARYiQ_8E9R3kkiFMbSGJWy-QecKo/edit) with an `Orders` tab and headers: Paid at, Payment ID, Checkout email, Delivery email, Offer, Status.
- [x] Put the Sheet ID and `Orders` tab name in the ignored local `.env.local` file. This does **not** connect Google yet.
- [ ] Enable the Google Sheets API in a Google Cloud project, create a dedicated service account, and share **only this Sheet** with its email as Editor. Evidence: the service account appears in Sheet sharing.
- [ ] Put `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, and `GOOGLE_SHEET_TAB=Orders` in the server environment. Evidence: a test paid order writes one row to the Sheet. Never put the key in this checklist.
- [ ] Confirm the exact Slideshowmaxx ZIP, included files, setup instructions, and commercial licence that each buyer will receive. Evidence: final delivery package and a sample delivery email.
- [ ] Assign someone to check Dodo payments and the Sheet frequently enough to fulfill every confirmed order within **24 hours**. If a buyer leaves before entering a delivery email, use their Dodo checkout email to follow up. Mark sent orders in the Sheet and retain delivery evidence.

## 3. Website and deployment

- [ ] Deploy this **Next.js server app** at a final HTTPS URL; a static-only export cannot run `/api/checkout` or `/api/delivery-email`. Set `PUBLIC_SITE_URL` to that exact origin. Evidence: deployed page and server routes respond.
- [ ] Confirm every $49 button goes to the regular Dodo product and the timed-offer $29 button goes to the offer product. Evidence: Dodo checkout displays the intended product and amount for both paths.
- [ ] Confirm the payment return page asks for the chosen delivery email only after Dodo reports `succeeded`; pending, failed, cancelled, and unverifiable payments do not show a paid confirmation.
- [ ] Confirm the chosen email is saved under the correct payment ID, and the thank-you page shows the chosen email, the **24-hour** delivery promise, and the Contact link to `Khatrikunal457@gmail.com`.
- [ ] Publish and review customer-facing product details, contact information, privacy terms, and refund terms before accepting money.
- [ ] Review the landing page against the actual deliverable. In particular, verify or correct simulated buyer/stock notices, feature and scheduling claims, and discount math (`$250` to `$49` is about 80% off; `$250` to `$29` is about 88% off). Evidence: approved final sales copy. Dodo's [merchant policy](https://docs.dodopayments.com/miscellaneous/merchant-acceptance) calls out misleading claims and artificial urgency.

## 4. Test and go live

- [ ] Run one clean production build in an environment without the local `.next` file-permission conflict. Evidence: `npm run build` exits successfully.
- [ ] Complete a **test-mode $49** purchase, including Dodo return, delivery-email submission, one Sheet row, and the thank-you page.
- [ ] Complete the same **test-mode $29** purchase. Also check cancellation, pending/failed payment, return-page refresh, and an invalid payment ID. Evidence: recorded outcomes; none of these should create a false paid order.
- [ ] Confirm a Sheet write failure shows a retry/contact path, and manually reconcile a paid buyer who never submits the delivery form.
- [ ] After all items above pass, set the live API key and live product IDs in the production server, set `DODO_MODE=live_mode`, then set `DODO_LIVE_ENABLED=true`. Evidence: both live checkout pages show the correct products and prices. Do not place a live charge solely to check layout.
- [ ] Monitor the first live orders in Dodo and the Sheet and deliver the software within 24 hours. Keep the live flag off again if checkout, recording, or delivery fails.

## Current state (28 October 2026)

The Next.js payment code is pushed to the website repository. This workspace has no configured Dodo product IDs or API keys, Google service-account credentials, or production URL; no real test payment has been verified. The local post-payment previews are development-only and are not proof of a paid flow.
