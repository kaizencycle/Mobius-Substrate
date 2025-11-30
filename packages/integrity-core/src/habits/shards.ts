// Mobius Habits - Kaizen Shards (Testnet Badges)
// C-150: Milestone-based shard unlocks

export type KaizenShardType = 'Consistency' | 'Shieldbearer' | 'Signal' | 'Pioneer';

export interface UserStats {
  streak: number; // Consecutive days of reflections
  shieldWeeks: number; // Number of weeks with completed Shield
  daysAbove95: number; // Days with MII >= 0.95
  isEarlyAdopter?: boolean; // Among first 100 testnet users
}

/**
 * Check which Kaizen Shards a user has earned based on their stats
 * 
 * Shard I - Consistency: 7-day streak of reflections
 * Shard II - Shieldbearer: Citizen Shield completed 4 weeks in a row
 * Shard III - Signal: 30 days overall with MII_daily >= 0.95
 * Shard IV - Pioneer: Among first 100 testnet users to meet Shard III
 * 
 * @param stats - User statistics
 * @param existingShards - Shards already earned (to avoid duplicates)
 * @returns Array of newly earned shard types
 */
export function checkShards(
  stats: UserStats,
  existingShards: KaizenShardType[] = []
): KaizenShardType[] {
  const newShards: KaizenShardType[] = [];

  // Shard I: Consistency
  if (stats.streak >= 7 && !existingShards.includes('Consistency')) {
    newShards.push('Consistency');
  }

  // Shard II: Shieldbearer
  if (stats.shieldWeeks >= 4 && !existingShards.includes('Shieldbearer')) {
    newShards.push('Shieldbearer');
  }

  // Shard III: Signal
  if (stats.daysAbove95 >= 30 && !existingShards.includes('Signal')) {
    newShards.push('Signal');
  }

  // Shard IV: Pioneer (requires Signal + early adopter status)
  if (
    stats.daysAbove95 >= 30 &&
    stats.isEarlyAdopter &&
    !existingShards.includes('Pioneer')
  ) {
    newShards.push('Pioneer');
  }

  return newShards;
}
