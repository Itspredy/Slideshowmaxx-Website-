import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getDodoConfig } from './dodo';

const cookieName = 'slideshowmaxx_checkout';

function signature(payload) {
  const { key } = getDodoConfig();
  return createHmac('sha256', key).update(payload).digest('base64url');
}

export function makeCheckoutCookie(sessionId, offer) {
  const payload = Buffer.from(JSON.stringify({ id: sessionId, offer })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export async function readCheckoutSession() {
  const raw = (await cookies()).get(cookieName)?.value;
  if (!raw) return null;
  const [payload, received, extra] = raw.split('.');
  if (!payload || !received || extra) return null;
  try {
    const expected = Buffer.from(signature(payload));
    const actual = Buffer.from(received);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!/^cks_[a-zA-Z0-9_-]+$/.test(session.id) || !['regular', 'offer'].includes(session.offer)) return null;
    return session;
  } catch {
    return null;
  }
}

export const checkoutCookieName = cookieName;
