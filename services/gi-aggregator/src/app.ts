import express, { type Request, type Response } from 'express';
import { pushSample, getSamplesSince } from './store.js';
import { rejectOutliers, timeWeightedAverage } from './metrics.js';

const app = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'gi-aggregator', version: '0.1.0' });
});

// POST a new sample: { gi: number (0..1), w?: number, t?: number(ms) }
app.post('/gi/sample', (req: Request, res: Response) => {
  const { gi, w, t } = req.body ?? {};
  const g = Number(gi);
  if (!Number.isFinite(g) || g < 0 || g > 1) {
    return res.status(400).json({ error: 'gi must be 0..1' });
  }
  pushSample({ gi: g, w: Number.isFinite(w) ? Number(w) : 1, t: Number.isFinite(t) ? Number(t) : Date.now() });
  res.json({ ok: true });
});

// Current spot GI: last sample
app.get('/gi/spot', (_req: Request, res: Response) => {
  const samples = getSamplesSince(0);
  const last = samples.at(-1);
  res.json({ gi: last?.gi ?? 0.0, updated_at: last ? new Date(last.t).toISOString() : null });
});

// Time-weighted average over lookback days (default 30)
app.get('/gi/twa', (req: Request, res: Response) => {
  const days = Number(req.query.days ?? 30);
  const since = Date.now() - days * 86400_000;
  let samples = getSamplesSince(since);
  const minSamples = Number(req.query.min_samples ?? 100);
  if (samples.length >= minSamples) samples = rejectOutliers(samples);
  const twa = timeWeightedAverage(samples);
  res.json({
    gi: twa ?? null,
    samples: samples.length,
    lookback_days: days,
    updated_at: new Date().toISOString()
  });
});

export default app;

