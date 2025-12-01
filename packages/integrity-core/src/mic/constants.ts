// MIC/KS Constants
// Cycle: C-151

/**
 * Number of Kaizen Shards per MIC
 * 1 MIC = 1,000,000 KS
 */
export const KS_PER_MIC = 1_000_000;

/**
 * MIC decimal precision
 */
export const MIC_DECIMALS = 6;

/**
 * KS decimal precision (integer only)
 */
export const KS_DECIMALS = 0;

/**
 * MII threshold for minting
 * MIC is only minted when MII >= this value
 */
export const MII_THRESHOLD = 0.95;

/**
 * Base minting coefficient (α)
 */
export const MINT_COEFFICIENT = 1.0;

/**
 * Base burn coefficient (β)
 */
export const BURN_COEFFICIENT = 0.05;

/**
 * Maximum MIC per cycle per citizen
 */
export const MAX_MIC_PER_CYCLE = 10.0;

/**
 * Maximum KS per cycle per citizen
 */
export const MAX_KS_PER_CYCLE = MAX_MIC_PER_CYCLE * KS_PER_MIC;

/**
 * Shard type weights
 */
export const SHARD_WEIGHTS = {
  reflection: 1.0,
  learning: 1.0,
  civic: 1.5,
  stability: 2.0,
  stewardship: 2.0,
  innovation: 2.5,
  guardian: 3.0
} as const;

/**
 * Currency aliases for backward compatibility
 */
export const CURRENCY_ALIASES = {
  GIC: 'MIC',
  gic: 'mic',
  shard: 'KS',
  shards: 'ks',
  governance_integrity_credit: 'MIC'
} as const;
