import crypto from 'node:crypto';
import { loadYaml } from '../../yaml.js';

type AttestorConfig = {
  version: number;
  policy: {
    require_hmac: boolean;
    require_ed25519: boolean;
    min_total_signers: number;
  };
  hmac_signers: { id: string; env_secret: string }[];
  ed25519_signers: { id: string; public_key_pem: string }[];
};

const cfg: AttestorConfig = loadYaml<AttestorConfig>('configs/attestors.yaml');

function stableJSONStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export type VerifyResult = {
  ok: boolean;
  accepted: string[];  // signer IDs accepted
  reasons?: string[];
};

export function verifyDualSignatures(headers: Record<string, string | undefined>, body: any): VerifyResult {
  const reasons: string[] = [];
  const accepted: string[] = [];
  const msg = Buffer.from(stableJSONStringify(body));

  // HMAC (at least one required if policy says so)
  const hmacSignerId = headers['x-hmac-signer']?.toUpperCase();
  const hmacHex = headers['x-hmac'] || '';
  let hmacOK = false;

  if (hmacSignerId) {
    const signer = cfg.hmac_signers.find(s => s.id.toUpperCase() === hmacSignerId);
    if (!signer) {
      reasons.push(`unknown HMAC signer: ${hmacSignerId}`);
    } else {
      const secret = process.env[signer.env_secret];
      if (!secret) reasons.push(`missing env secret for ${hmacSignerId}`);
      else {
        const mac = crypto.createHmac('sha3-256', secret).update(msg).digest('hex');
        if (crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(hmacHex))) {
          accepted.push(hmacSignerId);
          hmacOK = true;
        } else {
          reasons.push(`HMAC mismatch for ${hmacSignerId}`);
        }
      }
    }
  } else {
    reasons.push('missing x-hmac-signer/x-hmac headers');
  }

  // Ed25519 (at least one required if policy says so)
  const edSignerId = headers['x-ed25519-signer']?.toUpperCase();
  const edSigB64 = headers['x-ed25519-sig'] || '';
  let edOK = false;

  if (edSignerId) {
    const signer = cfg.ed25519_signers.find(s => s.id.toUpperCase() === edSignerId);
    if (!signer) {
      reasons.push(`unknown Ed25519 signer: ${edSignerId}`);
    } else {
      try {
        const pub = crypto.createPublicKey(signer.public_key_pem);
        const sig = Buffer.from(edSigB64, 'base64');
        const ok = crypto.verify(null, msg, pub, sig); // null => Ed25519
        if (ok) {
          accepted.push(edSignerId);
          edOK = true;
        } else reasons.push(`Ed25519 verify failed for ${edSignerId}`);
      } catch (e: any) {
        reasons.push(`Ed25519 key/sig error for ${edSignerId}: ${e?.message ?? e}`);
      }
    }
  } else {
    reasons.push('missing x-ed25519-signer/x-ed25519-sig headers');
  }

  // Policy
  const totalOK = accepted.length;
  const ok =
    (!cfg.policy.require_hmac || hmacOK) &&
    (!cfg.policy.require_ed25519 || edOK) &&
    totalOK >= (cfg.policy.min_total_signers ?? 2);

  return ok ? { ok: true, accepted } : { ok: false, accepted, reasons };
}

