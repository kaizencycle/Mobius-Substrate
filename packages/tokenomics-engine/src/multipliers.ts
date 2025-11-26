export const giMultiplier = (gi: number): number => {
  if (gi < 0.9) return 0;
  return (gi - 0.9) / 0.1;
};

export const consensusMultiplier = (sentinelCount: number): number => {
  if (sentinelCount >= 3) return 2.0;
  if (sentinelCount === 2) return 1.5;
  return 1.0;
};

export const noveltyMultiplier = (isNewKnowledge: boolean): number =>
  isNewKnowledge ? 1.4 : 1.0;

export const antiDriftMultiplier = (corrected: boolean): number =>
  (corrected ? 3.0 : 1.0);
