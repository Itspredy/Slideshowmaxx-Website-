import { NextResponse } from 'next/server';
import { getDodoConfig, getOffer } from '../../../lib/dodo';
import { checkoutCookieName, makeCheckoutCookie } from '../../../lib/checkout-session';
import { getSheetConfig } from '../../../lib/orders';

export const runtime = 'nodejs';

export async function POST(request) {
  let offerKind;
  try {
    const form = await request.formData();
    offerKind = form.get('offer');
    if (typeof offerKind !== 'string' || !['regular', 'offer'].includes(offerKind)) {
      return NextResponse.json({ error: 'Invalid offer.' }, { status: 400 });
    }
    const offer = getOffer(offerKind);
    const { client } = getDodoConfig();
    getSheetConfig();
    if (process.env.DODO_MODE === 'live_mode' && !process.env.PUBLIC_SITE_URL) {
      throw new Error('PUBLIC_SITE_URL is required for live checkout.');
    }
    const origin = process.env.PUBLIC_SITE_URL || new URL(request.url).origin;
    const siteUrl = new URL(origin);
    if (!['https:', 'http:'].includes(siteUrl.protocol)) throw new Error('Invalid PUBLIC_SITE_URL.');
    if (process.env.DODO_MODE === 'live_mode' && siteUrl.protocol !== 'https:') {
      throw new Error('Live checkout requires an HTTPS PUBLIC_SITE_URL.');
    }
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: offer.productId, quantity: 1 }],
      return_url: new URL('/checkout/return', siteUrl).toString(),
      cancel_url: new URL('/#pricing-timeline', siteUrl).toString(),
    });
    if (!session.checkout_url || !session.session_id) throw new Error('Dodo did not return a checkout URL.');
    const checkoutUrl = new URL(session.checkout_url);
    const allowedHost = process.env.DODO_MODE === 'live_mode' ? 'checkout.dodopayments.com' : 'test.checkout.dodopayments.com';
    if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== allowedHost) throw new Error('Unexpected checkout URL.');
    const response = NextResponse.redirect(checkoutUrl, 303);
    response.cookies.set(checkoutCookieName, makeCheckoutCookie(session.session_id, offerKind), {
      httpOnly: true,
      secure: siteUrl.protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error('Could not start Dodo checkout:', error);
    return NextResponse.redirect(new URL('/checkout/start?error=unavailable&offer=' + (offerKind === 'offer' ? 'offer' : 'regular'), request.url), 303);
  }
}
