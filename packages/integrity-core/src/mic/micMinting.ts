// MIC Minting Core Logic
// C-150: MIC + Kaizen Shards Integration

import { KaizenShard, MicMintContext, MicMintResult, ShardType } from './types';
import { loadShardWeights, getMiiThresholdFromConfig } from './shardWeights';

export function computeShardValue(shard: KaizenShard): number {
  const weights = loadShardWeights();
  const weight = weights[shard.shardType] ?? 1.0;
  const multiplier = shard.multiplier ?? 1.0;
  return shard.baseValue * weight * multiplier;
}

export function aggregateShards(shards: KaizenShard[]): {
  totalValue: number;
  countsByType: Record<ShardType, number>;
} {
  const countsByType = {
    reflection: 0,
    learning: 0,
    civic: 0,
    stability: 0,
    stewardship: 0,
    innovation: 0,
    guardian: 0,
  } as Record<ShardType, number>;

  let totalValue = 0;

  for (const shard of shards) {
    const value = computeShardValue(shard);
    totalValue += value;
    countsByType[shard.shardType] = (countsByType[shard.shardType] ?? 0) + 1;
  }

  return { totalValue, countsByType };
}

/**
 * MIC_minted = max(0, S * (MII - τ))
 *   S   = total shard value
 *   MII = miiScore
 *   τ   = threshold (usually 0.95)
 */
export function mintMic(context: MicMintContext): MicMintResult {
  const { shards, miiScore } = context;
  const threshold = context.threshold ?? getMiiThresholdFromConfig();
  const { totalValue, countsByType } = aggregateShards(shards);

  if (shards.length === 0) {
    return {
      mintedMic: 0,
      miiScore,
      threshold,
      totalShardValue: 0,
      shardCountsByType: countsByType,
    };
  }

  if (miiScore <= threshold) {
    // No MIC minted, but shards may still be recorded for history
    return {
      mintedMic: 0,
      miiScore,
      threshold,
      totalShardValue: totalValue,
      shardCountsByType: countsByType,
    };
  }

  const delta = miiScore - threshold;
  const mintedMic = Math.max(0, totalValue * delta);

  return {
    mintedMic,
    miiScore,
    threshold,
    totalShardValue: totalValue,
    shardCountsByType: countsByType,
  };
}
