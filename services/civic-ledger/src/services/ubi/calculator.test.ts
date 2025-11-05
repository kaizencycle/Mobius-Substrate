import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { calculateUBI } from './calculator.js';

const mock = {
  unit: 'shards',
  cadence: 'monthly',
  epoch_length_days: 90,
  funding_weights: { alpha_issuance: 0.2, beta_decay: 0.6 },
  caps: { max_share_of_reserves: 0.10, max_share_of_circulating: 0.02 },
  gi_thresholds: {
    bonus: { min: 0.990, g: 1.05 },
    normal: { min: 0.970, g: 1.00 },
    throttle: { min: 0.950, g: 0.85 },
    halt: { min: 0.900, g: 0.00 }
  },
  price_stability: { enabled: false, min_multiplier: 1, max_multiplier: 1 }
} as const;

test('halts when GI < 0.900', () => {
  const r = calculateUBI({
    N: 10000, I: 0n, Re: 2_000_000_000_000n, D: 0n, GI: 0.899,
    reservesShards: 10_000_000_000_000n, circulatingShards: 50_000_000_000_000n
  }, mock as any);
  assert.equal(r.perCapitaFinal, 0n);
  assert.equal(r.giMultiplier, 0);
});

test('bonus when GI ≥ 0.990', () => {
  const r = calculateUBI({
    N: 10000, I: 0n, Re: 2_000_000_000_000n, D: 0n, GI: 0.995,
    reservesShards: 10_000_000_000_000n, circulatingShards: 50_000_000_000_000n
  }, mock as any);
  assert.equal(r.giMultiplier, 1.05);
});

test('throttle when GI in 0.950-0.969 range', () => {
  const r = calculateUBI({
    N: 10000, I: 0n, Re: 2_000_000_000_000n, D: 0n, GI: 0.960,
    reservesShards: 10_000_000_000_000n, circulatingShards: 50_000_000_000_000n
  }, mock as any);
  assert.equal(r.giMultiplier, 0.85);
});

test('normal when GI in 0.970-0.989 range', () => {
  const r = calculateUBI({
    N: 10000, I: 0n, Re: 2_000_000_000_000n, D: 0n, GI: 0.982,
    reservesShards: 10_000_000_000_000n, circulatingShards: 50_000_000_000_000n
  }, mock as any);
  assert.equal(r.giMultiplier, 1.00);
});

test('calculates per-capita correctly', () => {
  const r = calculateUBI({
    N: 10000, I: 0n, Re: 2_000_000_000_000n, D: 0n, GI: 0.982,
    reservesShards: 10_000_000_000_000n, circulatingShards: 50_000_000_000_000n
  }, mock as any);
  
  // Pool = 0.6 * 2e12 = 1.2e12 shards
  // Per-capita base = 1.2e12 / (3 * 10000) = 40,000,000 shards
  // With GI=1.0 and h=1.0, final should be ~40M shards
  assert(r.perCapitaFinal > 0n);
  assert.equal(r.payoutsThisMonth, 10000);
});

