// Stub module for HMAC verification
import crypto from 'crypto';

export function verifyHmac(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const computed = hmac.digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
  } catch {
    return false;
  }
}

export default verifyHmac;
