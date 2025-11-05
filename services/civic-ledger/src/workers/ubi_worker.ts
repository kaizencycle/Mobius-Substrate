import { withTx, pool } from '../db/pool.js';
import { calculateUBI } from '../services/ubi/calculator.js';
import { getGI_TWA } from '../services/gi/client.js';
import cfg from '../config.js';
import { SHARDS_PER_CREDIT } from '@civic/integrity-units';
import { strict as assert } from 'node:assert';
import { enqueueOutboxForRun } from '../services/settlement/outbox.js';

/** Placeholder: replace with your real eligibility integration. */
async function fetchEligibleWallets(): Promise<string[]> {
  // TODO: integrate with identity/eligibility service
  // Must enforce: KYC, residency, wallet_age_days, anti-sybil, etc.
  return [
    'wallet_demo_1',
    'wallet_demo_2',
    'wallet_demo_3'
  ];
}

/** Snapshot eligibility rows for traceability. */
async function snapshotEligibility(client: any, runId: number, wallets: string[]) {
  const q = `
    INSERT INTO ubi_eligibility_snapshots (run_id, wallet, eligible, reason)
    VALUES ($1, $2, TRUE, 'kyc_stub')
    ON CONFLICT (run_id, wallet) DO NOTHING
  `;
  for (const w of wallets) {
    await client.query(q, [runId, w]);
  }
}

type CreateRunInput = {
  epoch: number;           // 90-day epoch
  monthKey: string;        // e.g., '2025-11-01'
  issuanceShards?: bigint; // optional alpha funding source
  decayReabsorbedShards?: bigint; // beta funding source (preferred)
  donationsShards?: bigint;       // optional
  reservesShards?: bigint;        // for caps
  circulatingShards?: bigint;     // for caps
};

export async function createAndPrepareUBIRun(input: CreateRunInput) {
  // Defaults if not supplied
  const issuanceShards = input.issuanceShards ?? 0n;
  const decayReabsorbedShards = input.decayReabsorbedShards ?? 2_000_000_000_000n; // demo
  const donationsShards = input.donationsShards ?? 0n;
  const reservesShards = input.reservesShards ?? 10_000_000_000_000n;
  const circulatingShards = input.circulatingShards ?? 50_000_000_000_000n;

  // GI trailing average (time-weighted), configurable window
  const lookback = cfg?.gi?.aggregator?.twa_lookback_days ?? Number(process.env.GI_TWA_LOOKBACK_DAYS ?? 30);
  const GI = await getGI_TWA(lookback);

  // Eligibility universe
  const wallets = await fetchEligibleWallets();
  const N = wallets.length;
  assert(N > 0, 'no_eligible_wallets');

  // Calculate per-capita shards using shard-denominated calculator
  const res = calculateUBI({
    N,
    I: issuanceShards,
    Re: decayReabsorbedShards,
    D: donationsShards,
    GI,
    reservesShards,
    circulatingShards
  }, cfg.ubi as any);

  // GI halt (calculator already returns 0 if below floor, but we add hard stop)
  if (res.perCapitaFinal === 0n) {
    throw new Error(`gi_halt_or_zero_percapita: GI=${GI}`);
  }

  // Idempotently create run + payouts inside one transaction
  return withTx(async (client) => {
    // Prevent duplicates for (epoch, month_key)
    const upsertRun = `
      INSERT INTO ubi_runs (epoch, month_key, gi_used, pool_total_shards, per_capita_shards, recipients, status, meta)
      VALUES ($1, $2::date, $3, $4, $5, $6, 'prepared', $7::jsonb)
      ON CONFLICT (epoch, month_key) DO UPDATE SET
         gi_used = EXCLUDED.gi_used,
         pool_total_shards = EXCLUDED.pool_total_shards,
         per_capita_shards = EXCLUDED.per_capita_shards,
         recipients = EXCLUDED.recipients,
         status = 'prepared',
         meta = EXCLUDED.meta
      RETURNING id
    `;

    const meta = {
      credits_per_capita: Number(res.perCapitaFinal) / Number(SHARDS_PER_CREDIT),
      gi_multiplier: res.giMultiplier,
      price_multiplier: res.priceMultiplier
    };

    const runRow = await client.query(upsertRun, [
      input.epoch,
      input.monthKey,
      res.giMultiplier ? GI : GI,          // store GI used
      String(res.poolTotal),               // NUMERIC
      String(res.perCapitaFinal),
      N,
      JSON.stringify(meta)
    ]);

    const runId = Number(runRow.rows[0].id);

    // Snapshot eligibility
    await snapshotEligibility(client, runId, wallets);

    // Insert payouts (idempotent on (run_id, wallet))
    const insPayout = `
      INSERT INTO ubi_payouts (run_id, wallet, amount_shards, status)
      VALUES ($1, $2, $3, 'queued')
      ON CONFLICT (run_id, wallet) DO NOTHING
    `;

    for (const w of wallets) {
      await client.query(insPayout, [runId, w, String(res.perCapitaFinal)]);
    }

    // Mark finished_at for the prepare phase
    await client.query(`UPDATE ubi_runs SET finished_at = NOW() WHERE id = $1`, [runId]);

    return {
      run_id: runId,
      epoch: input.epoch,
      month_key: input.monthKey,
      gi_used: GI,
      recipients: N,
      per_capita_shards: res.perCapitaFinal.toString(),
      per_capita_credits: Number(res.perCapitaFinal) / Number(SHARDS_PER_CREDIT),
      pool_total_shards: res.poolTotal.toString()
    };
  });
}

/** Mark payouts as 'sent' (simulate settlement). In production, call wallet service. */
export async function settleRun(runId: number, walletIds?: string[]) {
  // Instead of flipping directly to 'sent', enqueue to settlement outbox:
  await enqueueOutboxForRun(runId);

  // Optional filter: if walletIds provided, re-queue only those (advanced: omitted here)

  return { ok: true, enqueued: true };
}

