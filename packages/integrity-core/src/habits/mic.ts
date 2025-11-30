// Mobius Habits - MIC (Mobius Integrity Credits) Award Logic
// C-150: Testnet-only MIC emission rules

/**
 * Award MIC points based on daily MII score
 * 
 * Rules:
 * - MII >= 0.95: 10 points
 * - 0.90 <= MII < 0.95: 5 points
 * - MII < 0.90: 0 points
 * 
 * @param mii - Daily MII score (0.0 to 1.0)
 * @returns MIC points awarded
 */
export function awardMIC(mii: number): number {
  if (mii >= 0.95) {
    return 10;
  } else if (mii >= 0.90) {
    return 5;
  }
  return 0;
}

/**
 * Calculate weekly bonus MIC for completing both reflections and Shield
 * 
 * @param reflectionCount - Number of reflections completed this week
 * @param shieldCompleted - Whether Citizen Shield was fully completed
 * @returns Bonus MIC points (25 if eligible, 0 otherwise)
 */
export function calculateWeeklyBonus(reflectionCount: number, shieldCompleted: boolean): number {
  if (reflectionCount >= 5 && shieldCompleted) {
    return 25;
  }
  return 0;
}
