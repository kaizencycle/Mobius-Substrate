import { SHARDS_PER_CREDIT } from '@civic/integrity-units';
import type { UBIConfig } from './types.js';

export interface UBICalculationInput {
  N: number;                 // eligible population
  I: bigint;                 // net issuance (shards)
  Re: bigint;                // reabsorbed shards from decay
  D: bigint;                 // donations/fees (shards)
  GI: number;                // global integrity [0..1]
  reservesShards: bigint;    // 12m reserves (shards)
  circulatingShards: bigint; // circulating (shards)
}

export interface UBICalculationResult {
  poolTotal: bigint;
  perCapitaBase: bigint;
  perCapitaFinal: bigint;
  giMultiplier: number;
  priceMultiplier: number;
  payoutsThisMonth: number;
  credits: number;
}

export function calculateUBI(input: UBICalculationInput, config: UBIConfig & { unit?: 'shards' | 'credits' }): UBICalculationResult {
  const { N, I, Re, D, GI, reservesShards, circulatingShards } = input;
  const { funding_weights, caps, gi_thresholds } = config;

  // 1) pool U = α·I + β·Re + D  (fixed-point via 1e6)
  const α = BigInt(Math.floor(funding_weights.alpha_issuance * 1e6));
  const β = BigInt(Math.floor(funding_weights.beta_decay * 1e6));
  const U = (α * I + β * Re) / 1_000_000n + D;

  // 2) caps κ, σ
  const capRes = (reservesShards * BigInt(Math.floor(caps.max_share_of_reserves * 1e6))) / 1_000_000n;
  const capCirc = (circulatingShards * BigInt(Math.floor(caps.max_share_of_circulating * 1e6))) / 1_000_000n;
  const Ueff = U < capRes ? (U < capCirc ? U : capCirc) : capRes;

  // 3) monthly cadence within 90-day epoch → m = 3
  const m = 3n;
  const perCapitaBase = Ueff / (m * BigInt(N));

  // 4) GI multiplier (spot for now; TODO: time-weighted GI)
  let g: number;
  if (GI >= gi_thresholds.bonus.min) g = gi_thresholds.bonus.g;
  else if (GI >= gi_thresholds.normal.min) g = gi_thresholds.normal.g;
  else if (GI >= gi_thresholds.throttle.min) g = gi_thresholds.throttle.g;
  else return {
    poolTotal: Ueff, perCapitaBase, perCapitaFinal: 0n, giMultiplier: 0, priceMultiplier: 1,
    payoutsThisMonth: 0, credits: 0
  };

  // 5) price stability throttle OFF until metrics exist
  const h = 1.0;

  // 6) final (integer shards; no rounding drift)
  const perCapitaFinal = BigInt(Math.floor(Number(perCapitaBase) * g * h));

  return {
    poolTotal: Ueff,
    perCapitaBase,
    perCapitaFinal,
    giMultiplier: g,
    priceMultiplier: h,
    payoutsThisMonth: N,
    credits: Number(perCapitaFinal) / Number(SHARDS_PER_CREDIT)
  };
}
