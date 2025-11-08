import type { MKM } from "../types.js";

const DEFAULT_ENTROPY_PENALTY = 0.02;

export function computePreMII(mkm: MKM, scores: Record<string, number>): number {
  const weights = mkm.consensus.voting_weights;
  let weightedSum = 0;

  for (const [sentinel, score] of Object.entries(scores)) {
    const weight = weights[sentinel] ?? 0;
    weightedSum += score * weight;
  }

  const adjusted = weightedSum - DEFAULT_ENTROPY_PENALTY;
  return adjusted > 0 ? adjusted : 0;
}
