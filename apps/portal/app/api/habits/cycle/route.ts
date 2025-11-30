// API Route for Mobius Habits Cycle Processing
// C-150: MIC + Kaizen Shards Integration
// This endpoint processes a cycle and mints MIC based on shards and MII

import { NextRequest, NextResponse } from 'next/server';
import {
  mintMic,
  MicMintContext,
  KaizenShard,
  ShardType,
} from '@civic/integrity-core';

const LEDGER_API_BASE =
  process.env.LEDGER_API_BASE || 'http://localhost:5411';

interface CycleProcessRequest {
  citizenId: string;
  cycleId: string;
  miiScore: number;
  shards: Array<{
    shardType: ShardType;
    baseValue: number;
    multiplier?: number;
    context?: Record<string, unknown>;
    createdAt: string;
  }>;
  threshold?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CycleProcessRequest = await request.json();
    const { citizenId, cycleId, miiScore, shards, threshold } = body;

    if (!citizenId || !cycleId || miiScore === undefined || !shards) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: citizenId, cycleId, miiScore, shards',
        },
        { status: 400 }
      );
    }

    // Convert shards to KaizenShard format
    const kaizenShards: KaizenShard[] = shards.map((s) => ({
      citizenId,
      shardType: s.shardType,
      baseValue: s.baseValue,
      multiplier: s.multiplier,
      context: s.context,
      createdAt: new Date(s.createdAt),
    }));

    // Create mint context
    const context: MicMintContext = {
      citizenId,
      cycleId,
      miiScore,
      threshold,
      shards: kaizenShards,
      now: new Date(),
    };

    // Calculate MIC minting
    const result = mintMic(context);

    // TODO: Wire to actual ledger via MicMintService
    // For now, return the calculation result
    return NextResponse.json({
      success: true,
      result: {
        mintedMic: result.mintedMic,
        miiScore: result.miiScore,
        threshold: result.threshold,
        totalShardValue: result.totalShardValue,
        shardCountsByType: result.shardCountsByType,
      },
      message:
        result.mintedMic > 0
          ? `MIC minted: ${result.mintedMic.toFixed(6)}`
          : 'No MIC minted (MII below threshold or no shards)',
    });
  } catch (error) {
    console.error('Cycle processing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
