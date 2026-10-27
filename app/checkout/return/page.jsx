import Link from 'next/link';
import { readCheckoutSession } from '../../../lib/checkout-session';
import { getVerifiedPayment } from '../../../lib/dodo';
import { getDeliveryRecord } from '../../../lib/orders';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your purchase · Slideshowmaxx' };

export default async function CheckoutReturn({ searchParams }) {
  const params = await searchParams;
  const paymentId = typeof params?.payment_id === 'string' ? params.payment_id : '';
  const verified = await getVerifiedPayment(paymentId, await readCheckoutSession());
  let recorded = false;
  if (verified.state === 'succeeded') {
    try { recorded = Boolean(await getDeliveryRecord(paymentId)); }
    catch (error) { console.error('Could not read delivery record:', error); }
  }
  return (
    <main className="purchase-page">
      <div className="purchase-top"><Link href="/" className="purchase-brand"><span className="brand-mark">S</span> Slideshowmaxx</Link></div>
      <section className="purchase-card">
        <span className="purchase-eyebrow">YOUR ORDER</span>
        {verified.state === 'succeeded' && recorded ? (
          <>
            <h1>Your delivery email is saved.</h1>
            <p>We’ll email your Slideshowmaxx software within 24 hours of your payment.</p>
            <p className="purchase-note">Need to change your delivery email? Enter the new one below.</p>
          </>
        ) : verified.state === 'succeeded' ? (
          <><h1>Payment confirmed.</h1><p>Where should we email your Slideshowmaxx software?</p></>
        ) : verified.state === 'pending' ? (
          <><h1>Payment is still processing.</h1><p>Refresh this page in a little while. We’ll ask for your delivery email once Dodo confirms the payment.</p></>
        ) : verified.state === 'failed' ? (
          <><h1>Payment was not completed.</h1><p>We couldn’t confirm a completed payment for this order. You can try again from the pricing page.</p></>
        ) : verified.state === 'unavailable' ? (
          <><h1>We can’t check your payment yet.</h1><p>Please refresh this page in a moment. If the issue continues, contact us with your payment reference.</p></>
        ) : (
          <><h1>We couldn’t verify this order.</h1><p>Open the return link in the same browser where you paid. If you need help, contact us with your payment reference.</p></>
        )}
        {verified.state === 'succeeded' && (
          <>
            {params?.error === 'email' && <p className="purchase-error" role="alert">Enter a valid email address.</p>}
            {params?.error === 'save' && <p className="purchase-error" role="alert">We couldn’t save your email. Please try again or contact us.</p>}
            <form method="post" action="/api/delivery-email" className="purchase-form">
              <input type="hidden" name="payment_id" value={paymentId} />
              <label htmlFor="delivery-email">Email for delivery</label>
              <input id="delivery-email" type="email" name="delivery_email" required autoComplete="email" maxLength="254" placeholder="you@example.com" />
              <button type="submit" className="purchase-button">Save delivery email →</button>
            </form>
            <p className="purchase-note">We’ll deliver within 24 hours of your confirmed payment. Keep your Dodo receipt for your records.</p>
          </>
        )}
        <div className="purchase-actions"><Link href="/contact" className="purchase-link">Need help? Contact us</Link><Link href="/" className="purchase-link">Back to Slideshowmaxx</Link></div>
      </section>
    </main>
  );
}
