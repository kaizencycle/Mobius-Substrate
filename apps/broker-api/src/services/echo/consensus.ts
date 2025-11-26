// apps/broker-api/src/services/echo/consensus.ts
// ECHO Consensus Engine
// Implements the consensus logic for combining multiple sentinel answers

import { 
  GI_BASELINE 
} from "../../config/integrityCache";

export type SentinelName = "claude" | "gpt" | "eve" | "atlas" | "aurea" | "hermes" | "jade";

export interface SentinelResult {
  name: SentinelName;
  answer: string;
  confidence: number; // 0..1
  sources: any[];
  vote?: "APPROVE" | "REJECT" | "UNCERTAIN";
  reasoning?: string;
}

export interface EchoConsensusResult {
  answer: string;
  giScore: number;
  sentinels: SentinelResult[];
  sources: any[];
  reasoning: string;
  meta: {
    agreement: number;
    sourceQuality: number;
    confidenceVariance: number;
  };
}

/**
 * Computes consensus from multiple sentinel answers
 * Uses weighted voting based on confidence and source quality
 */
export function computeEchoConsensus(results: SentinelResult[]): EchoConsensusResult {
  if (!results.length) {
    throw new Error("ECHO Consensus requires at least one result");
  }

  // Normalize answers for comparison
  const normalized = results.map(r => ({
    ...r,
    normalized: r.answer.trim().toLowerCase().replace(/\s+/g, " ")
  }));

  // Group by answer content
  const groups = new Map<string, SentinelResult[]>();
  for (const r of normalized) {
    const key = r.normalized;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  // Find the answer with highest total confidence
  const [winningAnswer, winningGroup] = Array.from(groups.entries())
    .sort((a, b) => {
      const scoreA = a[1].reduce((sum, r) => sum + r.confidence, 0);
      const scoreB = b[1].reduce((sum, r) => sum + r.confidence, 0);
      return scoreB - scoreA;
    })[0];

  // Merge all unique sources
  const allSources = new Map();
  for (const r of results) {
    for (const source of r.sources) {
      const key = source.url || source.id || JSON.stringify(source);
      if (!allSources.has(key)) {
        allSources.set(key, source);
      }
    }
  }

  // Calculate agreement rate
  const agreement = winningGroup.length / results.length;

  // Calculate source quality (simplified)
  const sourceQuality = Math.min(1, allSources.size / 3); // Bonus for multiple sources

  // Calculate confidence variance (lower is better)
  const avgConfidence = winningGroup.reduce((sum, r) => sum + r.confidence, 0) / winningGroup.length;
  const confidenceVariance = Math.sqrt(
    winningGroup.reduce((sum, r) => sum + Math.pow(r.confidence - avgConfidence, 2), 0) / winningGroup.length
  );

  // Compute final GI score
  const giScore = Math.min(1, 
    avgConfidence * 0.5 +        // Base confidence (50%)
    agreement * 0.3 +            // Agreement rate (30%)
    sourceQuality * 0.2          // Source quality (20%)
  );

  return {
    answer: winningGroup[0].answer, // Original formatting
    giScore,
    sentinels: results,
    sources: Array.from(allSources.values()),
    reasoning: `Consensus reached with ${results.length} sentinels. ` +
               `Agreement: ${(agreement * 100).toFixed(1)}%. ` +
               `Average confidence: ${(avgConfidence * 100).toFixed(1)}%. ` +
               `Sources: ${allSources.size} unique.`,
    meta: {
      agreement,
      sourceQuality,
      confidenceVariance
    }
  };
}

/**
 * Checks if a consensus result meets the baseline GI threshold
 */
export function isConsensusValid(result: EchoConsensusResult): boolean {
  return result.giScore >= GI_BASELINE;
}

/**
 * Merges two consensus results (for DriftGuard)
 */
export function mergeConsensus(
  baseline: EchoConsensusResult,
  fallback: EchoConsensusResult
): EchoConsensusResult {
  // Combine all sentinels
  const allSentinels = [...baseline.sentinels, ...fallback.sentinels];
  
  // Recompute consensus with expanded sentinel set
  return computeEchoConsensus(allSentinels);
}

