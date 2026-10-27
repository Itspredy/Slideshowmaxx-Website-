import { NextResponse } from 'next/server';
import { readCheckoutSession } from '../../../lib/checkout-session';
import { getVerifiedPayment } from '../../../lib/dodo';
import { saveDeliveryEmail } from '../../../lib/orders';

export const runtime = 'nodejs';

export async function POST(request) {
  let paymentId = '';
  try {
    const form = await request.formData();
    paymentId = String(form.get('payment_id') || '');
    const email = String(form.get('delivery_email') || '').trim();
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.redirect(new URL(`/checkout/return?payment_id=${encodeURIComponent(paymentId)}&error=email`, request.url), 303);
    }
    const verified = await getVerifiedPayment(paymentId, await readCheckoutSession());
    if (verified.state !== 'succeeded') {
      return NextResponse.redirect(new URL('/checkout/return?error=verification', request.url), 303);
    }
    await saveDeliveryEmail(verified.payment, verified.offer, email);
    return NextResponse.redirect(new URL(`/checkout/thank-you?payment_id=${encodeURIComponent(paymentId)}`, request.url), 303);
  } catch (error) {
    console.error('Could not save delivery email:', error);
    return NextResponse.redirect(new URL(`/checkout/return?payment_id=${encodeURIComponent(paymentId)}&error=save`, request.url), 303);
  }
}
