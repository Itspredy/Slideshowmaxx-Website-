import Link from 'next/link';
import { readCheckoutSession } from '../../../lib/checkout-session';
import { getVerifiedPayment } from '../../../lib/dodo';
import { getDeliveryRecord } from '../../../lib/orders';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order confirmed · Slideshowmaxx' };

export default async function ThankYou({ searchParams }) {
  const params = await searchParams;
  const paymentId = typeof params?.payment_id === 'string' ? params.payment_id : '';
  const verified = await getVerifiedPayment(paymentId, await readCheckoutSession());
  let record = null;
  if (verified.state === 'succeeded') {
    try { record = await getDeliveryRecord(paymentId); }
    catch (error) { console.error('Could not read delivery record:', error); }
  }
  if (!record) {
    return (
      <main className="purchase-page"><section className="purchase-card">
        <h1>Delivery details are not confirmed yet.</h1>
        <p>Please return to the order page to enter your email, or contact us if you need help.</p>
        <Link href={`/checkout/return?payment_id=${encodeURIComponent(paymentId)}`} className="purchase-button">Return to your order →</Link>
        <Link href="/contact" className="purchase-link">Contact us</Link>
      </section></main>
    );
  }
  return (
    <main className="purchase-page">
      <div className="purchase-top"><Link href="/" className="purchase-brand"><span className="brand-mark">S</span> Slideshowmaxx</Link></div>
      <section className="purchase-card purchase-confirmation">
        <span className="purchase-check" aria-hidden="true">✓</span>
        <span className="purchase-eyebrow">ALL SET</span>
        <h1>We’ll email your Slideshowmaxx software within 24 hours.</h1>
        <p>Your delivery email is <strong>{record.values[3]}</strong>. The 24-hour window starts from your confirmed payment.</p>
        <p className="purchase-note">If you have any issue or need to change your email, you can contact me. Include your Dodo payment reference so I can find your order.</p>
        <div className="purchase-actions"><Link href="/contact" className="purchase-button">Contact me →</Link><Link href="/" className="purchase-link">Back to Slideshowmaxx</Link></div>
      </section>
    </main>
  );
}
