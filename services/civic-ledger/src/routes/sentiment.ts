import type { Request, Response } from 'express';
import { z } from 'zod';
import { saveSentiment, getSentiment } from '../store/sentimentStore.js';

const ingestSchema = z.object({
  source: z.literal('bettafish'),
  epoch: z.number().int().nonnegative(),
  window_start: z.string(),
  window_end: z.string(),
  avg_sentiment: z.number().gte(-1).lte(1),
  polarization: z.number().gte(0).lte(1),
  volume: z.number().int().nonnegative(),
  topics: z.array(z.object({ topic: z.string(), score: z.number().gte(-1).lte(1) })).optional(),
});

function requireApiKey(req: Request): boolean {
  const key = req.header('x-ledger-key');
  return key !== undefined && key === process.env.LEDGER_INGEST_KEY;
}

export async function ingestSentiment(req: Request, res: Response) {
  if (!requireApiKey(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const parsed = ingestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const saved = saveSentiment(parsed.data);
  res.json({ ok: true, saved });
}

export async function getSentimentSummary(_req: Request, res: Response) {
  const s = getSentiment();
  if (!s) {
    return res.status(404).json({ error: 'no sentiment yet' });
  }
  res.json(s);
}
