import { pool } from '../../db/pool.js';

type EpochAttestation = {
  epoch: number;
  gi_used: number;
  decay: { decayedShards: string; reabsorbedShards: string };
  ubi: { poolTotal: string; perCapita: string; recipients: number };
  meta?: any;
  accepted_signers?: string[];
};

export async function storeEpochAttestation(a: EpochAttestation): Promise<void> {
  const text = `
    INSERT INTO epoch_attestations
      (epoch, gi_used, decay_decayed_shards, decay_reabsorbed_shards, ubi_pool_total, ubi_per_capita, ubi_recipients, meta, accepted_signers)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::text[])
    ON CONFLICT (epoch) DO UPDATE SET
      gi_used = EXCLUDED.gi_used,
      decay_decayed_shards = EXCLUDED.decay_decayed_shards,
      decay_reabsorbed_shards = EXCLUDED.decay_reabsorbed_shards,
      ubi_pool_total = EXCLUDED.ubi_pool_total,
      ubi_per_capita = EXCLUDED.ubi_per_capita,
      ubi_recipients = EXCLUDED.ubi_recipients,
      meta = EXCLUDED.meta,
      accepted_signers = EXCLUDED.accepted_signers
  `;
  const vals = [
    a.epoch,
    a.gi_used,
    a.decay.decayedShards,
    a.decay.reabsorbedShards,
    a.ubi.poolTotal,
    a.ubi.perCapita,
    a.ubi.recipients,
    JSON.stringify(a.meta ?? {}),
    a.accepted_signers ?? []
  ];
  await pool.query(text, vals);
}

