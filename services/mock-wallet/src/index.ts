import express, { type Request, type Response } from 'express';
import crypto from 'node:crypto';

const app = express();
app.use(express.json());

const KEY = process.env.WALLET_HMAC_KEY || 'dev-secret';

function signPayloadHMAC(payload: unknown, key: string): string {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', key).update(body).digest('hex');
}

function verifyPayloadHMAC(payload: unknown, key: string, sig: string): boolean {
  const expected = signPayloadHMAC(payload, key);
  // timing-safe compare
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true, service: 'mock-wallet' }));

app.post('/api/transfer', (req: Request, res: Response) => {
  const sig = req.header('x-signature') || '';
  const ok = verifyPayloadHMAC(req.body, KEY, sig);

  if (!ok) return res.status(401).json({ ok: false, error: 'bad_signature' });

  // pretend to "send" shards
  const { to, amount_shards, payout_id, run_id } = req.body || {};

  if (!to || !amount_shards) return res.status(400).json({ ok: false, error: 'bad_payload' });

  return res.json({
    ok: true,
    txid: `mock_${run_id}_${payout_id}_${Date.now()}`,
    to,
    amount_shards
  });
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => console.log(`🪪 Mock Wallet running on :${PORT}`));

