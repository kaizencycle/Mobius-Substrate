import crypto from 'node:crypto';
import fs from 'node:fs';

function stableJSONStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function hmacSign(hexSecret: string | Buffer | string, payload: any): string {
  return crypto.createHmac('sha3-256', hexSecret).update(Buffer.from(stableJSONStringify(payload))).digest('hex');
}

function ed25519Sign(privateKeyPEM: string, payload: any): string {
  const key = crypto.createPrivateKey(privateKeyPEM);
  const sig = crypto.sign(null, Buffer.from(stableJSONStringify(payload)), key); // null => Ed25519
  return sig.toString('base64');
}

export async function attestEpochTransition(epochNumber: number, decay: any, ubi: any): Promise<void> {
  const url = process.env.LEDGER_URL ?? 'http://localhost:3000/attest/epoch';

  const body = {
    epoch: epochNumber,
    decay: {
      decayedShards: String(decay.decayedShards),
      reabsorbedShards: String(decay.reabsorbedShards)
    },
    ubi: {
      poolTotal: String(ubi.poolTotal),
      perCapita: String(ubi.perCapitaFinal ?? ubi.perCapita),
      recipients: ubi.recipients ?? 0
    },
    meta: { source: 'epoch-burn@0.1.0' }
  };

  // Prepare headers
  const hmacSigner = 'AUREA';
  const hmacSecret = process.env.ATTEST_HMAC_SECRET_AUREA || '';
  const zeusPrivPath = process.env.ZEUS_ED25519_PRIV_PEM || '';
  const zeusPriv = zeusPrivPath && fs.existsSync(zeusPrivPath) ? fs.readFileSync(zeusPrivPath, 'utf8') : '';

  const headers: Record<string, string> = { 'content-type': 'application/json' };

  if (hmacSecret) {
    headers['x-hmac-signer'] = hmacSigner;
    headers['x-hmac'] = hmacSign(hmacSecret, body);
  }

  if (zeusPriv) {
    headers['x-ed25519-signer'] = 'ZEUS';
    headers['x-ed25519-sig'] = ed25519Sign(zeusPriv, body);
  }

  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const js = await res.json().catch(() => ({}));
    if (!res.ok) console.error('[ATT] ledger rejected:', js);
    else console.log('[ATT] ledger accepted:', js);
  } catch (e: any) {
    console.error('[ATT] failed to post to ledger:', e?.message ?? e);
  }
}

