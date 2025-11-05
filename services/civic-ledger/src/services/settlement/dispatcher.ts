import cfg from '../../config.js';
import { claimNextBatch, markAck, markFail, reconcileAckToPayout, buildSignedHeaders } from './outbox.js';

async function postJson(url: string, payload: any, headers: Record<string, string>) {
  const timeoutMs = Number(process.env.WALLET_HTTP_TIMEOUT_MS || 8000);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload), headers, signal: controller.signal });
    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch {}

    if (!res.ok) throw new Error(`http_${res.status}: ${text}`);
    return body;
  } finally {
    clearTimeout(t);
  }
}

export async function dispatchOnce(limit = 50) {
  const batch = await claimNextBatch(limit);

  for (const row of batch) {
    try {
      const headers = buildSignedHeaders(row.payload);
      const providerUrl = process.env.WALLET_PROVIDER_URL || 'http://localhost:3100/api/transfer';
      const resp = await postJson(providerUrl, row.payload, headers);

      if (resp?.ok) {
        await markAck(row.id, resp);
        await reconcileAckToPayout(row.id);
      } else {
        await markFail(row.id, `provider_nok: ${JSON.stringify(resp).slice(0, 200)}`);
      }
    } catch (e: any) {
      await markFail(row.id, e?.message || 'dispatch_error');
    }
  }

  return { attempted: batch.length };
}

