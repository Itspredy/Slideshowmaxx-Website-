import Link from 'next/link';

export const metadata = { title: 'Contact · Slideshowmaxx' };

export default function Contact() {
  return (
    <main className="purchase-page">
      <div className="purchase-top"><Link href="/" className="purchase-brand"><span className="brand-mark">S</span> Slideshowmaxx</Link></div>
      <section className="purchase-card">
        <span className="purchase-eyebrow">CONTACT</span>
        <h1>Need help with your order?</h1>
        <p>Email me at <a href="mailto:Khatrikunal457@gmail.com" className="purchase-link">Khatrikunal457@gmail.com</a>.</p>
        <p className="purchase-note">If you’ve already paid, include the email you used at checkout and your Dodo payment reference. I’ll use those to find your order.</p>
        <a href="mailto:Khatrikunal457@gmail.com?subject=Slideshowmaxx%20order%20support" className="purchase-button">Email me →</a>
        <Link href="/" className="purchase-link">Back to Slideshowmaxx</Link>
      </section>
    </main>
  );
}
