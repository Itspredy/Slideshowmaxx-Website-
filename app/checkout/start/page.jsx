import Link from 'next/link';
import { offers } from '../../../lib/dodo';

export const metadata = { title: 'Secure checkout · Slideshowmaxx' };

export default async function CheckoutStart({ searchParams }) {
  const params = await searchParams;
  const kind = params?.offer === 'offer' ? 'offer' : 'regular';
  const error = params?.error;
  return (
    <main className="purchase-page">
      <div className="purchase-top"><Link href="/" className="purchase-brand"><span className="brand-mark">S</span> Slideshowmaxx</Link></div>
      <section className="purchase-card">
        <span className="purchase-eyebrow">ONE-TIME PURCHASE</span>
        <h1>Get Slideshowmaxx for {offers[kind].label}</h1>
        <p>Continue to Dodo Payments to complete your purchase securely.</p>
        {error && <p className="purchase-error" role="alert">Checkout is unavailable right now. Please try again later or contact us.</p>}
        <form method="post" action="/api/checkout">
          <input type="hidden" name="offer" value={kind} />
          <button className="purchase-button" type="submit">Continue to secure checkout →</button>
        </form>
        <p className="purchase-note">Pay once. After payment, you can choose the email address where we’ll send the software.</p>
        <Link href="/#pricing-timeline" className="purchase-link">Back to pricing</Link>
      </section>
    </main>
  );
}
