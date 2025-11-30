// Example usage of MIC minting
// C-150: MIC + Kaizen Shards Integration

import { mintMic, KaizenShard, MicMintContext } from '../index';

/**
 * Example: One reflection day → MIC
 * 
 * Say a citizen has:
 * - 3 reflection shards (weight=1.0)
 * - 1 civic shard (weight=1.5)
 * - 1 stability shard (weight=2.0)
 * - MII for the day = 0.97, threshold = 0.95
 * 
 * Total shard value:
 * - S = 3·1.0 + 1·1.5 + 1·2.0 = 3 + 1.5 + 2 = 6.5
 * 
 * MIC minted:
 * - MIC = S * (MII - τ) = 6.5 * (0.97 - 0.95) = 6.5 * 0.02 = 0.13
 */
export function exampleMicMinting() {
  const now = new Date();

  const shards: KaizenShard[] = [
    {
      citizenId: 'citizen-kaizen',
      shardType: 'reflection',
      baseValue: 1.0,
      createdAt: now,
    },
    {
      citizenId: 'citizen-kaizen',
      shardType: 'reflection',
      baseValue: 1.0,
      createdAt: now,
    },
    {
      citizenId: 'citizen-kaizen',
      shardType: 'reflection',
      baseValue: 1.0,
      createdAt: now,
    },
    {
      citizenId: 'citizen-kaizen',
      shardType: 'civic',
      baseValue: 1.0,
      context: {
        app: 'mobius-habits',
        note: 'Helped another citizen with onboarding',
      },
      createdAt: now,
    },
    {
      citizenId: 'citizen-kaizen',
      shardType: 'stability',
      baseValue: 1.0,
      context: {
        repo: 'mobius-systems',
        note: 'Fixed critical bug in ledger-api',
      },
      createdAt: now,
    },
  ];

  const context: MicMintContext = {
    citizenId: 'citizen-kaizen',
    cycleId: 'cycle-150',
    miiScore: 0.97, // Above threshold of 0.95
    shards,
    now,
  };

  const result = mintMic(context);

  console.log('=== MIC Minting Example ===');
  console.log(`Citizen: ${context.citizenId}`);
  console.log(`Cycle: ${context.cycleId}`);
  console.log(`MII Score: ${result.miiScore}`);
  console.log(`Threshold: ${result.threshold}`);
  console.log(`Total Shard Value: ${result.totalShardValue}`);
  console.log(`MIC Minted: ${result.mintedMic}`);
  console.log(`Shard Counts:`, result.shardCountsByType);
  console.log('==========================');

  // Expected output:
  // Total Shard Value: 6.5
  // MIC Minted: 0.13
  // Shard Counts: { reflection: 3, civic: 1, stability: 1, ... }

  return result;
}

/**
 * Example: MII below threshold → No MIC minted
 * 
 * If someone spams low-quality reflections and their MII drops under 0.95:
 * - They may still earn shards (system remembers they did something)
 * - but MIC minted = 0 → no value without integrity
 */
export function exampleNoMicMinting() {
  const now = new Date();

  const shards: KaizenShard[] = [
    {
      citizenId: 'citizen-low-integrity',
      shardType: 'reflection',
      baseValue: 1.0,
      createdAt: now,
    },
  ];

  const context: MicMintContext = {
    citizenId: 'citizen-low-integrity',
    cycleId: 'cycle-150',
    miiScore: 0.90, // Below threshold of 0.95
    shards,
    now,
  };

  const result = mintMic(context);

  console.log('=== No MIC Example ===');
  console.log(`MII Score: ${result.miiScore} (below threshold ${result.threshold})`);
  console.log(`Total Shard Value: ${result.totalShardValue}`);
  console.log(`MIC Minted: ${result.mintedMic} (shards recorded but no value)`);
  console.log('======================');

  // Expected output:
  // MIC Minted: 0
  // Shards are still recorded for history

  return result;
}
