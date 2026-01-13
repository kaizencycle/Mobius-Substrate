/**
 * Decision Quality Analysis
 * Phase 3: Enhanced Deliberation & Consensus Modes
 */

import type {
  CodexVote,
  DecisionQuality,
  ConsensusMode,
  ProviderId,
} from '../../types';
import { groupByTextSimilarity } from '../gi/metrics';
import type { ConsensusResult } from './modes';

/**
 * Analyze decision quality
 */
export function analyzeDecisionQuality(
  votes: CodexVote[],
  consensusResult: ConsensusResult
): DecisionQuality {
  // Calculate confidence
  const confidence = calculateConfidence(votes, consensusResult);

  // Calculate uncertainty metrics
  const uncertainty = calculateUncertainty(votes);

  // Generate minority reports
  const minorityReports = generateMinorityReports(
    votes,
    consensusResult.winner,
    consensusResult.minorityGroups || []
  );

  // Generate reasoning
  const reasoning = generateReasoning(votes, consensusResult);

  return {
    confidence,
    uncertainty,
    minorityReports,
    reasoning,
  };
}

/**
 * Calculate confidence in the decision (0-1)
 */
function calculateConfidence(
  votes: CodexVote[],
  consensusResult: ConsensusResult
): number {
  const { agreement, mode, success } = consensusResult;

  // Base confidence on agreement
  let confidence = agreement;

  // Adjust based on consensus mode success
  if (!success) {
    confidence *= 0.7; // Reduce confidence if consensus mode failed
  }

  // Adjust based on mode strictness
  switch (mode) {
    case 'unanimous':
    case 'veto':
      confidence *= 1.1; // Higher confidence for unanimous consensus
      break;
    case 'supermajority':
      confidence *= 1.05; // Slightly higher for supermajority
      break;
    case 'weighted':
      confidence *= 1.0; // Neutral for weighted
      break;
    default:
      confidence *= 0.95; // Slightly lower for simple majority
  }

  // Adjust for number of participants
  const participationBonus = Math.min(votes.length / 5, 1.0) * 0.1;
  confidence += participationBonus;

  // Clamp to [0, 1]
  return Math.min(Math.max(confidence, 0), 1);
}

/**
 * Calculate uncertainty metrics
 */
function calculateUncertainty(votes: CodexVote[]): {
  spread: number;
  ambiguity: number;
  volatility: number;
} {
  const groups = groupByTextSimilarity(votes, 0.80);

  // Spread: How diverse are the outputs?
  const spread = (groups.length - 1) / Math.max(votes.length - 1, 1);

  // Ambiguity: How close are the top groups?
  const sortedGroups = groups.sort((a, b) => b.length - a.length);
  const ambiguity =
    sortedGroups.length > 1
      ? 1 - Math.abs(sortedGroups[0].length - sortedGroups[1].length) / votes.length
      : 0;

  // Volatility: Standard deviation of group sizes
  const avgGroupSize = votes.length / groups.length;
  const variance =
    groups.reduce((sum, g) => sum + Math.pow(g.length - avgGroupSize, 2), 0) /
    groups.length;
  const volatility = Math.sqrt(variance) / votes.length;

  return {
    spread: Math.min(spread, 1),
    ambiguity: Math.min(ambiguity, 1),
    volatility: Math.min(volatility, 1),
  };
}

/**
 * Generate minority reports (dissenting views)
 */
function generateMinorityReports(
  votes: CodexVote[],
  winner: CodexVote,
  minorityGroups: { votes: CodexVote[]; supportPercentage: number }[]
): {
  provider: ProviderId;
  output: string;
  supportPercentage: number;
  reasoning?: string;
}[] {
  const reports: {
    provider: ProviderId;
    output: string;
    supportPercentage: number;
    reasoning?: string;
  }[] = [];

  for (const minority of minorityGroups) {
    // Only include significant minorities (>10% support)
    if (minority.supportPercentage < 0.1) continue;

    const representative = minority.votes[0];

    reports.push({
      provider: representative.provider,
      output: representative.output,
      supportPercentage: minority.supportPercentage,
      reasoning: `Minority position supported by ${(minority.supportPercentage * 100).toFixed(0)}% of providers (${minority.votes.length}/${votes.length})`,
    });
  }

  return reports.slice(0, 3); // Max 3 minority reports
}

/**
 * Generate reasoning transparency
 */
function generateReasoning(
  votes: CodexVote[],
  consensusResult: ConsensusResult
): {
  agreementCalculation: string;
  winnerSelection: string;
  keyFactors: string[];
  warnings?: string[];
} {
  const validVotes = votes.filter((v) => !v.meta?.error);
  const errorVotes = votes.filter((v) => v.meta?.error);

  const agreementCalculation = `Agreement calculated using ${consensusResult.mode} consensus mode: ${(consensusResult.agreement * 100).toFixed(1)}% of ${validVotes.length} valid providers agree`;

  const winnerSelection = `Winner selected from ${consensusResult.mode} consensus: ${consensusResult.winner.provider} with ${consensusResult.reasoning}`;

  const keyFactors: string[] = [
    `${validVotes.length}/${votes.length} providers responded successfully`,
    `${consensusResult.agreement >= 0.9 ? 'High' : consensusResult.agreement >= 0.7 ? 'Moderate' : 'Low'} agreement (${(consensusResult.agreement * 100).toFixed(0)}%)`,
  ];

  if (consensusResult.weights) {
    const avgWeight =
      consensusResult.weights.reduce((sum, w) => sum + w.weight, 0) /
      consensusResult.weights.length;
    keyFactors.push(
      `Weighted voting used (avg weight: ${avgWeight.toFixed(2)})`
    );
  }

  if (consensusResult.minorityGroups && consensusResult.minorityGroups.length > 0) {
    keyFactors.push(
      `${consensusResult.minorityGroups.length} minority position(s) identified`
    );
  }

  const warnings: string[] = [];

  if (errorVotes.length > 0) {
    warnings.push(
      `${errorVotes.length} provider(s) failed: ${errorVotes.map((v) => v.provider).join(', ')}`
    );
  }

  if (!consensusResult.success) {
    warnings.push(
      `Consensus mode '${consensusResult.mode}' requirements not fully met`
    );
  }

  if (consensusResult.agreement < 0.7) {
    warnings.push('Low agreement - consider additional deliberation rounds');
  }

  if (
    consensusResult.minorityGroups &&
    consensusResult.minorityGroups.length > 0 &&
    consensusResult.minorityGroups[0].supportPercentage > 0.3
  ) {
    warnings.push(
      'Significant minority position - review minority reports carefully'
    );
  }

  return {
    agreementCalculation,
    winnerSelection,
    keyFactors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Assess decision risk level
 */
export function assessDecisionRisk(quality: DecisionQuality): 'low' | 'medium' | 'high' {
  const { confidence, uncertainty, reasoning } = quality;

  // High risk conditions
  if (confidence < 0.6) return 'high';
  if (uncertainty.spread > 0.7) return 'high';
  if (reasoning.warnings && reasoning.warnings.length >= 3) return 'high';

  // Medium risk conditions
  if (confidence < 0.8) return 'medium';
  if (uncertainty.ambiguity > 0.5) return 'medium';
  if (reasoning.warnings && reasoning.warnings.length >= 1) return 'medium';

  // Low risk
  return 'low';
}

/**
 * Generate quality summary
 */
export function summarizeQuality(quality: DecisionQuality): string {
  const risk = assessDecisionRisk(quality);
  const lines: string[] = [];

  lines.push(`Decision Quality: ${(quality.confidence * 100).toFixed(0)}% confidence`);
  lines.push(`Risk Level: ${risk.toUpperCase()}`);
  lines.push('');

  lines.push('Uncertainty:');
  lines.push(
    `  - Spread: ${(quality.uncertainty.spread * 100).toFixed(0)}% (diversity of outputs)`
  );
  lines.push(
    `  - Ambiguity: ${(quality.uncertainty.ambiguity * 100).toFixed(0)}% (closeness of top choices)`
  );
  lines.push(
    `  - Volatility: ${(quality.uncertainty.volatility * 100).toFixed(0)}% (stability)`
  );
  lines.push('');

  if (quality.minorityReports && quality.minorityReports.length > 0) {
    lines.push(
      `Minority Reports: ${quality.minorityReports.length} dissenting view(s)`
    );
    for (const report of quality.minorityReports) {
      lines.push(
        `  - ${report.provider}: ${(report.supportPercentage * 100).toFixed(0)}% support`
      );
    }
    lines.push('');
  }

  lines.push('Reasoning:');
  lines.push(`  - ${quality.reasoning.agreementCalculation}`);
  lines.push(`  - ${quality.reasoning.winnerSelection}`);

  if (quality.reasoning.warnings && quality.reasoning.warnings.length > 0) {
    lines.push('');
    lines.push('⚠️  Warnings:');
    for (const warning of quality.reasoning.warnings) {
      lines.push(`  - ${warning}`);
    }
  }

  return lines.join('\n');
}
