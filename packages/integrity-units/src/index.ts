/**
 * @civic/integrity-units
 * Canonical conversion utilities for the integrity economy
 * 
 * IMMUTABLE CONSTANT: 1 Credit = 1,000,000 Shards
 */

export const SHARDS_PER_CREDIT = 1_000_000n;

/**
 * Convert shards (BigInt) to credits (number with 6 decimal precision)
 */
export function shardsToCredits(shards: bigint): number {
  const whole = Number(shards / SHARDS_PER_CREDIT);
  const rem = Number(shards % SHARDS_PER_CREDIT);
  return whole + rem / Number(SHARDS_PER_CREDIT);
}

/**
 * Convert credits (number) to shards (BigInt)
 * Floors to nearest shard (no fractional shards)
 */
export function creditsToShards(credits: number): bigint {
  if (!Number.isFinite(credits) || credits < 0) {
    throw new Error("invalid credits: must be finite non-negative number");
  }
  return BigInt(Math.floor(credits * Number(SHARDS_PER_CREDIT)));
}

/**
 * Format credits for display (6 decimal places)
 */
export function formatCredits(credits: number): string {
  return credits.toFixed(6);
}

/**
 * Format shards for display (integer string)
 */
export function formatShards(shards: bigint): string {
  return shards.toString();
}

/**
 * Parse credit string to number
 */
export function parseCredits(s: string): number {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("invalid credit string");
  }
  return Number(n.toFixed(6));
}

/**
 * Validate credit amount
 */
export function isValidCredits(credits: number): boolean {
  return Number.isFinite(credits) && credits >= 0;
}

/**
 * Validate shard amount
 */
export function isValidShards(shards: bigint): boolean {
  return shards >= 0n;
}

/**
 * Calculate total integrity value from mixed balance
 */
export function calculateTotalValue(credits: number, shards: bigint): number {
  return credits + shardsToCredits(shards);
}
