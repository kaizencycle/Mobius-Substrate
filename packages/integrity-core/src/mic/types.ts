// MIC (Mobius Integrity Credits) and Kaizen Shards Types
// C-150: MIC + Kaizen Shards Integration

export type ShardType =
  | 'reflection'
  | 'learning'
  | 'civic'
  | 'stability'
  | 'stewardship'
  | 'innovation'
  | 'guardian';

export interface KaizenShard {
  citizenId: string;
  shardType: ShardType;
  // base value of a single shard instance, can be 1.0 for most
  baseValue: number;
  // optional multiplier if needed per event
  multiplier?: number;
  context?: {
    app?: string;
    sentinel?: string;
    reflectionId?: string;
    repo?: string;
    note?: string;
  };
  createdAt: Date;
}

export interface MicMintContext {
  citizenId: string;
  cycleId: string;
  miiScore: number;          // 0.0 – 1.0
  threshold?: number;        // default 0.95
  shards: KaizenShard[];
  now: Date;
}

export interface MicMintResult {
  mintedMic: number;
  miiScore: number;
  threshold: number;
  totalShardValue: number;
  shardCountsByType: Record<ShardType, number>;
}
