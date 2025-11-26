import { describe, it, expect } from 'vitest';
import { computeReward } from '../src/computeReward';
import type { NodeActivity } from '../src/schema';

describe('computeReward', () => {
  const baseActivity: NodeActivity = {
    nodeId: 'node-1',
    gi: 0.96,
    integrityWork: 10,
    humanIntent: 2,
    coordinationValue: 5,
    resilienceWork: 3,
    timestamp: new Date().toISOString()
  };

  it('calculates MIC with all multipliers enabled', () => {
    const result = computeReward(baseActivity, {
      sentinelCount: 3,
      isNewKnowledge: true,
      correctedDrift: true
    });

    expect(result.nodeId).toEqual('node-1');
    expect(result.mic).toBeGreaterThan(0);
    expect(result.breakdown.multipliers.giMultiplier).toBeCloseTo(0.6);
    expect(result.breakdown.multipliers.consensusMultiplier).toBe(2);
    expect(result.breakdown.multipliers.noveltyMultiplier).toBe(1.4);
    expect(result.breakdown.multipliers.antiDriftMultiplier).toBe(3);
  });

  it('returns zero reward when GI below threshold', () => {
    const result = computeReward({ ...baseActivity, gi: 0.85 }, { sentinelCount: 1 });
    expect(result.mic).toEqual(0);
  });
});
