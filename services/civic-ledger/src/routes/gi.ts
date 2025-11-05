import type { Request, Response } from 'express';
import { insertGISample, getGI_TWA_DB } from '../services/gi/store.js';

export async function giStatus(_req: Request, res: Response) {
  // Return TWA over default window
  const twa = await getGI_TWA_DB(Number(process.env.GI_TWA_LOOKBACK_DAYS || 30));
  res.json({ gi: twa, updated_at: new Date().toISOString() });
}

export async function giIngest(req: Request, res: Response) {
  const { gi, source } = req.body || {};
  const val = Number(gi);
  if (Number.isNaN(val) || val < 0 || val > 1) {
    return res.status(400).json({ error: 'invalid_gi' });
  }
  await insertGISample(val, source || 'manual');
  res.json({ ok: true });
}

export async function giTwa(req: Request, res: Response) {
  const days = Number(req.query.days || process.env.GI_TWA_LOOKBACK_DAYS || 30);
  const twa = await getGI_TWA_DB(days);
  res.json({ gi_twa: twa, window_days: days });
}
