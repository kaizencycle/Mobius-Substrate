import crypto from 'node:crypto';

export function signPayloadHMAC(payload: unknown, key: string): string {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', key).update(body).digest('hex');
}

export function verifyPayloadHMAC(payload: unknown, key: string, sig: string): boolean {
  const expected = signPayloadHMAC(payload, key);
  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

