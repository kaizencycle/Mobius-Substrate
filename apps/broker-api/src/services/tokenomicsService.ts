import type {
  NodeActivity,
  RewardOptions,
  RewardResult
} from '@mobius/tokenomics-engine';
import { computeReward } from '@mobius/tokenomics-engine';

function assertPositive(value: number | undefined, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
  return value;
}

export function previewReward(
  activity: Partial<NodeActivity>,
  options: RewardOptions = {}
): RewardResult {
  if (!activity.nodeId) {
    throw new Error('nodeId is required');
  }
  if (typeof activity.gi !== 'number') {
    throw new Error('gi is required');
  }
  if (!activity.timestamp) {
    activity.timestamp = new Date().toISOString();
  }

  const normalizedActivity: NodeActivity = {
    nodeId: activity.nodeId,
    gi: activity.gi,
    integrityWork: assertPositive(activity.integrityWork, 'integrityWork'),
    humanIntent: assertPositive(activity.humanIntent, 'humanIntent'),
    coordinationValue: assertPositive(activity.coordinationValue, 'coordinationValue'),
    resilienceWork: assertPositive(activity.resilienceWork, 'resilienceWork'),
    timestamp: activity.timestamp,
    sentinelCount: activity.sentinelCount,
    isNewKnowledge: activity.isNewKnowledge,
    correctedDrift: activity.correctedDrift
  };

  return computeReward(normalizedActivity, options);
}
