import DodoPayments from 'dodopayments';

export const offers = {
  regular: { label: '$49', productEnv: 'DODO_REGULAR_PRODUCT_ID' },
  offer: { label: '$29', productEnv: 'DODO_OFFER_PRODUCT_ID' },
};

export function getDodoConfig() {
  const mode = process.env.DODO_MODE || 'test_mode';
  if (mode !== 'test_mode' && mode !== 'live_mode') throw new Error('Invalid DODO_MODE.');
  if (mode === 'live_mode' && process.env.DODO_LIVE_ENABLED !== 'true') {
    throw new Error('Live checkout has not been enabled.');
  }
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error('Dodo API key is not configured.');
  return { client: new DodoPayments({ bearerToken: key, environment: mode }), key, mode };
}

export function getOffer(kind) {
  if (!Object.hasOwn(offers, kind)) return null;
  const offer = offers[kind];
  const productId = process.env[offer.productEnv];
  if (!productId) throw new Error(`${offer.productEnv} is not configured.`);
  return { ...offer, productId, kind };
}

export async function getVerifiedPayment(paymentId, session) {
  if (!/^pay_[a-zA-Z0-9_-]+$/.test(paymentId || '') || !session) return { state: 'invalid' };
  try {
    const offer = getOffer(session.offer);
    const { client } = getDodoConfig();
    const payment = await client.payments.retrieve(paymentId);
    if (payment.checkout_session_id !== session.id ||
        !offer ||
        payment.product_cart?.length !== 1 ||
        payment.product_cart[0].product_id !== offer.productId ||
        payment.product_cart[0].quantity !== 1) {
      return { state: 'invalid' };
    }
    if (payment.status === 'succeeded' && payment.refund_status !== 'full') {
      return { state: 'succeeded', payment, offer };
    }
    if (payment.status === 'failed' || payment.status === 'cancelled') return { state: 'failed' };
    return { state: 'pending' };
  } catch (error) {
    console.error('Could not verify Dodo payment:', error);
    return { state: 'unavailable' };
  }
}
