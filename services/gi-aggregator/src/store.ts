import type { GISample } from './types.js';

const MAX_SAMPLES = 50_000; // ring buffer
const samples: GISample[] = [];

export function pushSample(s: GISample) {
  samples.push(s);
  if (samples.length > MAX_SAMPLES) samples.shift();
}

export function getSamplesSince(sinceMs: number): GISample[] {
  return samples.filter(s => s.t >= sinceMs);
}

// Seed a healthy default spot value so /twa works before real feeds exist
pushSample({ t: Date.now(), gi: 0.982, w: 1 });

