import { LaborAnalysisContext, GIResult } from "./index";

export interface WorkerCompSnapshot {
  workerId: string;
  role: string;
  yearsExperience?: number;
  location?: string;
  currentSalary: number;
}

export interface MarketBand {
  p25: number;
  p50: number;
  p75: number;
}

export interface WageFairnessInput extends LaborAnalysisContext {
  worker: WorkerCompSnapshot;
  internalPeers?: { salary: number }[];
  externalMarketBand?: MarketBand;
}

export interface WageDelta {
  toInternalMedian?: number;
  toExternalMedian?: number;
}

export interface WageFairnessResult extends GIResult {
  verdict: "FAIR" | "BELOW_MARKET" | "ABOVE_MARKET";
  delta: WageDelta;
  recommendation: string;
}

/**
 * Compare worker compensation against internal and market benchmarks.
 */
export async function analyzeWageFairness(
  input: WageFairnessInput
): Promise<WageFairnessResult> {
  const { worker, internalPeers, externalMarketBand } = input;
  let toInternalMedian: number | undefined;
  let toExternalMedian: number | undefined;

  if (internalPeers && internalPeers.length > 0) {
    const sorted = [...internalPeers].map((p) => p.salary).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    toInternalMedian = median - worker.currentSalary;
  }

  if (externalMarketBand) {
    toExternalMedian = externalMarketBand.p50 - worker.currentSalary;
  }

  let verdict: WageFairnessResult["verdict"] = "FAIR";
  let recommendation = "Compensation appears broadly aligned with benchmarks.";
  let giScore = 0.96;

  if (typeof toExternalMedian === "number" && toExternalMedian > 5000) {
    verdict = "BELOW_MARKET";
    recommendation = `Consider raising salary by at least $${Math.round(
      toExternalMedian
    )} to align with external median.`;
    giScore = 0.89;
  }

  const delta: WageDelta = {
    toInternalMedian,
    toExternalMedian
  };

  return {
    giScore,
    verdict,
    delta,
    recommendation,
    notes: [
      "This is a simple numeric benchmark. Future versions should include bias analysis and GI-aware weighting."
    ]
  };
}
