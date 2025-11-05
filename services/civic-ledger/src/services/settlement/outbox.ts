import cfg from '../../config.js';
import { pool, withTx } from '../../db/pool.js';
import { signPayloadHMAC } from '../../crypto/hmac.js';

type OutboxRow = {
  id: number;
  run_id: number;
  payout_id: number;
  wallet: string;
  amount_shards: string;
  payload: any;
  status: 'queued'|'dispatched'|'acked'|'failed';
  attempts: number;
};

export async function enqueueOutboxForRun(runId: number) {
  return withTx(async (client) => {
    // only queued payouts
    const payouts = await client.query(
      `SELECT id, wallet, amount_shards
         FROM ubi_payouts
        WHERE run_id = $1 AND status = 'queued'`,
      [runId]
    );

    for (const p of payouts.rows) {
      const payload = {
        purpose: 'UBI_TRANSFER',
        run_id: runId,
        payout_id: Number(p.id),
        to: p.wallet,
        amount_shards: String(p.amount_shards),
        nonce: Date.now()
      };

      await client.query(
        `INSERT INTO settlement_outbox (run_id, payout_id, wallet, amount_shards, payload, status)
         VALUES ($1,$2,$3,$4,$5::jsonb,'queued')
         ON CONFLICT (payout_id) DO NOTHING`,
        [runId, p.id, p.wallet, String(p.amount_shards), JSON.stringify(payload)]
      );
    }

    return { enqueued: payouts.rowCount };
  });
}

export async function claimNextBatch(limit = 50): Promise<OutboxRow[]> {
  // simple claim: mark as dispatched with optimistic update
  const { rows } = await pool.query(
    `UPDATE settlement_outbox
        SET status = 'dispatched', updated_at = NOW()
      WHERE id IN (
        SELECT id FROM settlement_outbox
         WHERE status = 'queued'
         ORDER BY created_at ASC
         LIMIT $1
         FOR UPDATE SKIP LOCKED
      )
      RETURNING id, run_id, payout_id, wallet, amount_shards, payload, status, attempts`,
    [limit]
  );
  return rows as any;
}

export async function markAck(id: number, providerResp: any) {
  await withTx(async (client) => {
    await client.query(
      `INSERT INTO settlement_deliveries (outbox_id, provider_response) VALUES ($1, $2::jsonb)`,
      [id, JSON.stringify(providerResp)]
    );

    await client.query(
      `UPDATE settlement_outbox SET status='acked', updated_at=NOW() WHERE id=$1`,
      [id]
    );
  });
}

export async function markFail(id: number, err: string) {
  const maxAttempts = Number(process.env.WALLET_MAX_ATTEMPTS || 6);
  await pool.query(
    `UPDATE settlement_outbox
        SET status = CASE WHEN attempts + 1 >= $2 THEN 'failed' ELSE 'queued' END,
            attempts = attempts + 1,
            last_error = $3,
            updated_at = NOW()
      WHERE id = $1`,
    [id, maxAttempts, err.slice(0, 1000)]
  );
}

/** When acked, flip ubi_payouts → sent (idempotent) + possibly close run. */
export async function reconcileAckToPayout(outboxId: number) {
  await withTx(async (client) => {
    const ob = await client.query(`SELECT payout_id, run_id FROM settlement_outbox WHERE id=$1`, [outboxId]);
    if (!ob.rowCount) return;

    const { payout_id, run_id } = ob.rows[0];

    await client.query(
      `UPDATE ubi_payouts SET status='sent', sent_at=NOW()
        WHERE id=$1 AND status <> 'sent'`, [payout_id]
    );

    const queuedLeft = await client.query(
      `SELECT COUNT(*) FROM settlement_outbox WHERE run_id=$1 AND status <> 'acked'`, [run_id]
    );

    if (Number(queuedLeft.rows[0].count) === 0) {
      await client.query(`UPDATE ubi_runs SET status='settled' WHERE id=$1`, [run_id]);
    }
  });
}

export function buildSignedHeaders(payload: any) {
  const key = process.env.WALLET_HMAC_KEY || 'dev-secret';
  const sig = signPayloadHMAC(payload, key);
  return {
    'content-type': 'application/json',
    'x-sig-alg': 'HMAC-SHA256',
    'x-signature': sig
  };
}

