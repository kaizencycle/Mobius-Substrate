import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';

export async function listEpochAttestations(req: Request, res: Response) {
  const limit = Math.min(100, Number(req.query.limit ?? 25));
  const rows = await pool.query(
    `SELECT epoch, ts, gi_used,
            decay_decayed_shards, decay_reabsorbed_shards,
            ubi_pool_total, ubi_per_capita, ubi_recipients,
            meta, accepted_signers
       FROM epoch_attestations
      ORDER BY epoch DESC
      LIMIT $1`,
    [limit]
  );
  res.json({ items: rows.rows });
}

