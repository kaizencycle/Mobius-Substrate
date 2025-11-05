import type { GISample } from './types.js';

export function timeWeightedAverage(samples: GISample[], now = Date.now()): number | null {
  if (!samples.length) return null;

  // weight by recency (newer => higher weight), exponential decay over lookback
  const lookbackMs = (samples[samples.length - 1].t - samples[0].t) || 1;
  let num = 0;
  let den = 0;

  for (const s of samples) {
    const age = Math.max(0, now - s.t);
    const frac = 1 - Math.min(1, age / (lookbackMs || 1)); // 0..1
    const w = (s.w ?? 1) * (0.2 + 0.8 * frac);             // floor 0.2 to avoid zeroing older samples
    num += s.gi * w;
    den += w;
  }

  return den > 0 ? num / den : null;
}

export function rejectOutliers(samples: GISample[], zMax = 3): GISample[] {
  if (samples.length < 8) return samples;

  const vals = samples.map(s => s.gi);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const sd = Math.sqrt(variance) || 1e-6;

  return samples.filter(s => Math.abs(s.gi - mean) / sd <= zMax);
}

