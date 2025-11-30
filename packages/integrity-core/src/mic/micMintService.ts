// MIC Mint Service - Ledger Integration Layer
// C-150: MIC + Kaizen Shards Integration

import {
  mintMic,
  computeShardValue,
} from './micMinting';
import {
  MicMintContext,
  KaizenShard,
  MicMintResult,
  ShardType,
} from './types';

/**
 * Ledger Event Types for MIC and Kaizen Shards
 */
export interface KaizenShardEarnedEvent {
  type: 'KAIZEN_SHARD_EARNED';
  citizenId: string;
  shardType: ShardType;
  shardValue: number;
  cycleId: string;
  context?: Record<string, unknown>;
  createdAt: string;
}

export interface MicMintEvent {
  type: 'MIC_MINT';
  citizenId: string;
  amountMic: string; // decimal as string for precision
  miiScore: number;
  threshold: number;
  shardSummary: {
    totalShards: number;
    byType: Record<ShardType, number>;
  };
  cycleId: string;
  timestamp: string;
}

/**
 * Ledger Client Interface
 * Implement this interface to connect to your ledger backend
 */
export interface LedgerClient {
  runInTransaction<T>(
    callback: (tx: LedgerTransaction) => Promise<T>
  ): Promise<T>;
}

export interface LedgerTransaction {
  appendEvent(event: KaizenShardEarnedEvent | MicMintEvent): Promise<void>;
}

/**
 * MIC Mint Service
 * Handles minting MIC for cycles and writing ledger events
 */
export class MicMintService {
  constructor(private readonly ledger: LedgerClient) {}

  /**
   * Mint MIC for a cycle given shards and MII score
   * 
   * This method:
   * 1. Computes MIC using the formula: MIC = max(0, S * (MII - τ))
   * 2. Always records shard events (historical facts)
   * 3. Only records MIC_MINT event if MIC > 0
   * 4. Writes all events atomically in a transaction
   */
  async mintForCycle(input: {
    citizenId: string;
    cycleId: string;
    miiScore: number;
    shards: KaizenShard[];
    threshold?: number;
  }): Promise<MicMintEvent> {
    const now = new Date();

    const ctx: MicMintContext = {
      citizenId: input.citizenId,
      cycleId: input.cycleId,
      miiScore: input.miiScore,
      threshold: input.threshold,
      shards: input.shards,
      now,
    };

    const result = mintMic(ctx);

    // 1) Always record shard events (they are factual history)
    const shardEvents: KaizenShardEarnedEvent[] = input.shards.map((shard) => ({
      type: 'KAIZEN_SHARD_EARNED',
      citizenId: shard.citizenId,
      shardType: shard.shardType,
      shardValue: computeShardValue(shard),
      cycleId: input.cycleId,
      context: shard.context ?? {},
      createdAt: shard.createdAt.toISOString(),
    }));

    // 2) Only create MIC_MINT event if > 0
    let mintEvent: MicMintEvent | null = null;
    if (result.mintedMic > 0) {
      mintEvent = {
        type: 'MIC_MINT',
        citizenId: input.citizenId,
        amountMic: result.mintedMic.toFixed(6), // 6 decimal precision
        miiScore: result.miiScore,
        threshold: result.threshold,
        shardSummary: {
          totalShards: input.shards.length,
          byType: result.shardCountsByType,
        },
        cycleId: input.cycleId,
        timestamp: now.toISOString(),
      };
    }

    // 3) Persist atomically in the ledger
    await this.ledger.runInTransaction(async (tx) => {
      for (const ev of shardEvents) {
        await tx.appendEvent(ev);
      }
      if (mintEvent) {
        await tx.appendEvent(mintEvent);
      }
    });

    // 4) Return mint event (or zero-mint with context)
    return (
      mintEvent ?? {
        type: 'MIC_MINT',
        citizenId: input.citizenId,
        amountMic: '0',
        miiScore: result.miiScore,
        threshold: result.threshold,
        shardSummary: {
          totalShards: input.shards.length,
          byType: result.shardCountsByType,
        },
        cycleId: input.cycleId,
        timestamp: now.toISOString(),
      }
    );
  }
}
