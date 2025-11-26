import {
  giMultiplier,
  consensusMultiplier,
  noveltyMultiplier,
  antiDriftMultiplier
} from './multipliers';
import type { NodeActivity, RewardOptions, RewardResult } from './schema';

const DEFAULT_SENTINELS = 1;

export function computeReward(
  activity: NodeActivity,
  options: RewardOptions = {}
): RewardResult {
  const {
    nodeId,
    gi,
    integrityWork,
    humanIntent,
    coordinationValue,
    resilienceWork,
    timestamp
  } = activity;

  const sentinelCount = options.sentinelCount ?? activity.sentinelCount ?? DEFAULT_SENTINELS;
  const isNewKnowledge = options.isNewKnowledge ?? activity.isNewKnowledge ?? false;
  const correctedDrift = options.correctedDrift ?? activity.correctedDrift ?? false;

  const mGi = giMultiplier(gi);
  const mConsensus = consensusMultiplier(sentinelCount);
  const mNovel = noveltyMultiplier(isNewKnowledge);
  const mDrift = antiDriftMultiplier(correctedDrift);

  const base =
    Math.max(0, integrityWork) +
    Math.max(0, humanIntent) +
    Math.max(0, coordinationValue) +
    Math.max(0, resilienceWork);

  const mic = base * mGi * mConsensus * mNovel * mDrift;

  return {
    nodeId,
    mic,
    breakdown: {
      integrity: integrityWork,
      humanIntent,
      coordination: coordinationValue,
      resilience: resilienceWork,
      multipliers: {
        giMultiplier: mGi,
        consensusMultiplier: mConsensus,
        noveltyMultiplier: mNovel,
        antiDriftMultiplier: mDrift
      }
    },
    timestamp
  };
}
