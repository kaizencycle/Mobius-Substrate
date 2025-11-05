import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { dispatchOnce } from '../services/settlement/dispatcher.js';
import { enqueueOutboxForRun } from '../services/settlement/outbox.js';

export async function listOutbox(_req: Request, res: Response) {
  const rows = await pool.query(
    `SELECT id, run_id, payout_id, wallet, amount_shards, status, attempts, last_error, created_at, updated_at
       FROM settlement_outbox
      ORDER BY created_at ASC
      LIMIT 200`
  );
  res.json({ items: rows.rows });
}

export async function enqueueRun(req: Request, res: Response) {
  const { run_id } = req.body ?? {};
  if (!run_id) return res.status(400).json({ error: 'run_id_required' });

  const out = await enqueueOutboxForRun(Number(run_id));
  res.json(out);
}

export async function dispatchNow(_req: Request, res: Response) {
  const out = await dispatchOnce(100);
  res.json(out);
}

