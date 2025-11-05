import type { Request, Response } from 'express';
import { createAndPrepareUBIRun, settleRun } from '../workers/ubi_worker.js';
import { pool } from '../db/pool.js';

export async function startUbiRun(req: Request, res: Response) {
  try {
    const { epoch, month_key } = req.body ?? {};
    if (!epoch || !month_key) {
      return res.status(400).json({ error: 'epoch_and_month_key_required' });
    }

    const result = await createAndPrepareUBIRun({
      epoch: Number(epoch),
      monthKey: String(month_key)
    });

    res.json({ ok: true, run: result });
  } catch (e: any) {
    res.status(500).json({ error: 'ubi_run_failed', message: e?.message });
  }
}

export async function listUbiRuns(_req: Request, res: Response) {
  const rows = await pool.query(
    `SELECT id, epoch, month_key, started_at, finished_at, status, gi_used,
            pool_total_shards, per_capita_shards, recipients, meta
       FROM ubi_runs
      ORDER BY started_at DESC
      LIMIT 50`
  );
  res.json({ items: rows.rows });
}

export async function getUbiRun(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });

  const run = await pool.query(
    `SELECT id, epoch, month_key, started_at, finished_at, status, gi_used,
            pool_total_shards, per_capita_shards, recipients, meta
       FROM ubi_runs WHERE id = $1`,
    [id]
  );

  const payouts = await pool.query(
    `SELECT wallet, amount_shards, status, reason, created_at, sent_at
       FROM ubi_payouts
      WHERE run_id = $1
      ORDER BY wallet ASC`,
    [id]
  );

  res.json({ run: run.rows[0] ?? null, payouts: payouts.rows });
}

export async function settleUbiRun(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'invalid_id' });

  const { wallets } = req.body ?? {};
  const out = await settleRun(id, Array.isArray(wallets) ? wallets : undefined);

  res.json(out);
}

