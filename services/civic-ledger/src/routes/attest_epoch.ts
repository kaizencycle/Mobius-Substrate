import type { Request, Response } from 'express';
import { getGI_TWA } from '../services/gi/client.js';
import cfg from '../config.js';
import { storeEpochAttestation } from '../services/attest/epoch.js';
import { verifyDualSignatures } from '../services/attest/verify.js';

export async function attestEpochRoute(req: Request, res: Response) {
  // 1) Verify dual signatures
  const ver = verifyDualSignatures(
    {
      'x-hmac-signer': req.get('x-hmac-signer') ?? undefined,
      'x-hmac': req.get('x-hmac') ?? undefined,
      'x-ed25519-signer': req.get('x-ed25519-signer') ?? undefined,
      'x-ed25519-sig': req.get('x-ed25519-sig') ?? undefined,
    },
    req.body
  );

  if (!ver.ok) {
    return res.status(401).json({ error: 'signature_verification_failed', details: ver.reasons, accepted: ver.accepted });
  }

  // 2) Shape checks
  const body = req.body ?? {};
  if (typeof body.epoch !== 'number' || !body.decay || !body.ubi) {
    return res.status(400).json({ error: 'invalid_body' });
  }

  // 3) Bind to GI (TWA)
  let gi_used: number;
  try {
    gi_used = await getGI_TWA(cfg?.gi?.aggregator?.twa_lookback_days ?? 30);
  } catch (e: any) {
    return res.status(502).json({ error: 'gi_aggregator_unavailable', details: String(e?.message ?? e) });
  }

  // 4) Enforce GI floor
  const halt = cfg?.gi?.thresholds?.halt ?? 0.9;
  if (gi_used < halt) {
    return res.status(409).json({ error: 'gi_below_halt', gi: gi_used, halt });
  }

  // 5) Store attestation
  await storeEpochAttestation({
    epoch: Number(body.epoch),
    gi_used,
    decay: {
      decayedShards: String(body.decay.decayedShards),
      reabsorbedShards: String(body.decay.reabsorbedShards)
    },
    ubi: {
      poolTotal: String(body.ubi.poolTotal),
      perCapita: String(body.ubi.perCapita),
      recipients: Number(body.ubi.recipients ?? 0)
    },
    meta: body.meta ?? {},
    accepted_signers: ver.accepted
  });

  return res.json({ ok: true, gi_used, accepted_signers: ver.accepted });
}

