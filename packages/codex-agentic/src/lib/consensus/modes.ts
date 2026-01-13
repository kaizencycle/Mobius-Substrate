/**
 * Consensus Mode Implementations
 * Phase 3: Enhanced Deliberation & Consensus Modes
 */

import type {
  CodexVote,
  ConsensusMode,
  ConsensusConfig,
  ProviderWeights,
  ProviderId,
  FoundingAgent,
} from '../../types';
import { calculateAgreement, groupByTextSimilarity } from '../gi/metrics';
import { generateAgentAnalytics } from '../memory/analytics';

/**
 * Consensus result
 */
export interface ConsensusResult {
  winner: CodexVote;
  agreement: number;
  mode: ConsensusMode;
  success: boolean;
  reasoning: string;
  weights?: ProviderWeights[];
  minorityGroups?: {
    votes: CodexVote[];
    supportPercentage: number;
  }[];
}

/**
 * Calculate consensus using specified mode
 */
export async function calculateConsensus(
  votes: CodexVote[],
  config: ConsensusConfig,
  agent: FoundingAgent
): Promise<ConsensusResult> {
  const { mode } = config;

  switch (mode) {
    case 'simple':
      return simpleConsensus(votes);
    case 'unanimous':
      return unanimousConsensus(votes);
    case 'supermajority':
      return supermajorityConsensus(votes, config.threshold || 0.66);
    case 'weighted':
      return await weightedConsensus(votes, config, agent);
    case 'quorum':
      return quorumConsensus(votes, config.quorum || 0.5);
    case 'ranked':
      return rankedConsensus(votes);
    case 'veto':
      return vetoConsensus(votes);
    default:
      return simpleConsensus(votes);
  }
}

/**
 * Simple consensus: Largest agreement group wins
 */
function simpleConsensus(votes: CodexVote[]): ConsensusResult {
  const groups = groupByTextSimilarity(votes, 0.80);
  const topGroup = groups.sort((a, b) => b.length - a.length)[0];
  const winner = topGroup[0];
  const agreement = calculateAgreement(votes, 0.80);

  return {
    winner,
    agreement,
    mode: 'simple',
    success: true,
    reasoning: `Simple majority: ${topGroup.length}/${votes.length} providers agree`,
    minorityGroups: groups.slice(1).map((group) => ({
      votes: group,
      supportPercentage: group.length / votes.length,
    })),
  };
}

/**
 * Unanimous consensus: All providers must agree
 */
function unanimousConsensus(votes: CodexVote[]): ConsensusResult {
  const groups = groupByTextSimilarity(votes, 0.80);
  const topGroup = groups[0];
  const agreement = calculateAgreement(votes, 0.80);
  const unanimous = groups.length === 1 || agreement >= 0.99;

  return {
    winner: topGroup[0],
    agreement,
    mode: 'unanimous',
    success: unanimous,
    reasoning: unanimous
      ? `Unanimous agreement: all ${votes.length} providers agree`
      : `Not unanimous: ${groups.length} distinct positions (${(agreement * 100).toFixed(0)}% agreement)`,
    minorityGroups: unanimous
      ? []
      : groups.slice(1).map((group) => ({
          votes: group,
          supportPercentage: group.length / votes.length,
        })),
  };
}

/**
 * Supermajority consensus: Require threshold (e.g., 2/3, 3/4)
 */
function supermajorityConsensus(
  votes: CodexVote[],
  threshold: number
): ConsensusResult {
  const groups = groupByTextSimilarity(votes, 0.80);
  const topGroup = groups.sort((a, b) => b.length - a.length)[0];
  const winner = topGroup[0];
  const agreement = calculateAgreement(votes, 0.80);
  const supermajority = agreement >= threshold;

  return {
    winner,
    agreement,
    mode: 'supermajority',
    success: supermajority,
    reasoning: supermajority
      ? `Supermajority achieved: ${(agreement * 100).toFixed(0)}% >= ${(threshold * 100).toFixed(0)}% threshold`
      : `Supermajority not met: ${(agreement * 100).toFixed(0)}% < ${(threshold * 100).toFixed(0)}% threshold`,
    minorityGroups: groups.slice(1).map((group) => ({
      votes: group,
      supportPercentage: group.length / votes.length,
    })),
  };
}

/**
 * Weighted consensus: Weight votes by historical provider performance
 */
async function weightedConsensus(
  votes: CodexVote[],
  config: ConsensusConfig,
  agent: FoundingAgent
): Promise<ConsensusResult> {
  // Get historical performance for weighting
  const analytics = await generateAgentAnalytics(agent, 30);

  // Calculate weights for each provider
  const weights: ProviderWeights[] = votes.map((vote) => {
    const providerStats = analytics.providerStats[vote.provider];

    if (!providerStats || providerStats.uses === 0) {
      // No history, use neutral weight
      return {
        provider: vote.provider,
        weight: 0.5,
        basedOn: {
          agreement: 0,
          giScore: 0,
          errorRate: 0,
          sampleSize: 0,
        },
      };
    }

    // Calculate weight based on historical performance
    const weightFactors = config.weights || {
      agreement: 0.4,
      giScore: 0.4,
      errorRate: 0.2,
    };

    const weight =
      providerStats.avgAgreement * weightFactors.agreement +
      providerStats.avgGI * weightFactors.giScore +
      (1 - providerStats.errorRate) * weightFactors.errorRate;

    return {
      provider: vote.provider,
      weight,
      basedOn: {
        agreement: providerStats.avgAgreement,
        giScore: providerStats.avgGI,
        errorRate: providerStats.errorRate,
        sampleSize: providerStats.uses,
      },
    };
  });

  // Group by similarity and calculate weighted support
  const groups = groupByTextSimilarity(votes, 0.80);
  const weightedGroups = groups.map((group) => {
    const totalWeight = group.reduce((sum, vote) => {
      const weight = weights.find((w) => w.provider === vote.provider)?.weight || 0.5;
      return sum + weight;
    }, 0);

    return {
      group,
      totalWeight,
      avgWeight: totalWeight / group.length,
    };
  });

  // Select winner by highest total weight
  const topWeightedGroup = weightedGroups.sort(
    (a, b) => b.totalWeight - a.totalWeight
  )[0];
  const winner = topWeightedGroup.group[0];

  // Calculate weighted agreement
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const agreement = topWeightedGroup.totalWeight / totalWeight;

  return {
    winner,
    agreement,
    mode: 'weighted',
    success: true,
    reasoning: `Weighted consensus: ${topWeightedGroup.group.length} providers with ${topWeightedGroup.totalWeight.toFixed(2)} total weight (${(agreement * 100).toFixed(0)}%)`,
    weights,
    minorityGroups: weightedGroups.slice(1).map((wg) => ({
      votes: wg.group,
      supportPercentage: wg.totalWeight / totalWeight,
    })),
  };
}

/**
 * Quorum consensus: Require minimum participation
 */
function quorumConsensus(
  votes: CodexVote[],
  minQuorum: number
): ConsensusResult {
  const groups = groupByTextSimilarity(votes, 0.80);
  const topGroup = groups.sort((a, b) => b.length - a.length)[0];
  const winner = topGroup[0];
  const agreement = calculateAgreement(votes, 0.80);
  const participation = topGroup.length / votes.length;
  const quorumMet = participation >= minQuorum;

  return {
    winner,
    agreement,
    mode: 'quorum',
    success: quorumMet,
    reasoning: quorumMet
      ? `Quorum met: ${(participation * 100).toFixed(0)}% >= ${(minQuorum * 100).toFixed(0)}% minimum`
      : `Quorum not met: ${(participation * 100).toFixed(0)}% < ${(minQuorum * 100).toFixed(0)}% minimum`,
    minorityGroups: groups.slice(1).map((group) => ({
      votes: group,
      supportPercentage: group.length / votes.length,
    })),
  };
}

/**
 * Ranked consensus: Ranked-choice voting
 */
function rankedConsensus(votes: CodexVote[]): ConsensusResult {
  // Group by similarity
  const groups = groupByTextSimilarity(votes, 0.80);

  // Rank groups by support
  const rankedGroups = groups
    .map((group, index) => ({
      group,
      rank: index + 1,
      support: group.length / votes.length,
    }))
    .sort((a, b) => b.support - a.support);

  const winner = rankedGroups[0].group[0];
  const agreement = calculateAgreement(votes, 0.80);

  return {
    winner,
    agreement,
    mode: 'ranked',
    success: true,
    reasoning: `Ranked-choice: ${rankedGroups[0].group.length} first-choice votes (${(rankedGroups[0].support * 100).toFixed(0)}%)`,
    minorityGroups: rankedGroups.slice(1).map((rg) => ({
      votes: rg.group,
      supportPercentage: rg.support,
    })),
  };
}

/**
 * Veto consensus: Any dissent blocks (require full agreement)
 */
function vetoConsensus(votes: CodexVote[]): ConsensusResult {
  const groups = groupByTextSimilarity(votes, 0.80);
  const topGroup = groups[0];
  const agreement = calculateAgreement(votes, 0.80);
  const noVeto = groups.length === 1 || agreement >= 0.99;

  return {
    winner: topGroup[0],
    agreement,
    mode: 'veto',
    success: noVeto,
    reasoning: noVeto
      ? `No veto: all ${votes.length} providers agree`
      : `Veto present: ${groups.length - 1} dissenting position(s)`,
    minorityGroups: noVeto
      ? []
      : groups.slice(1).map((group) => ({
          votes: group,
          supportPercentage: group.length / votes.length,
        })),
  };
}

/**
 * Resolve ties using tie-break strategy
 */
export function resolveTie(
  groups: CodexVote[][],
  strategy: 'random' | 'highest-gi' | 'lowest-cost' | 'fastest'
): CodexVote {
  const topGroups = groups.filter((g) => g.length === groups[0].length);

  if (topGroups.length === 1) {
    return topGroups[0][0];
  }

  switch (strategy) {
    case 'random':
      return topGroups[Math.floor(Math.random() * topGroups.length)][0];

    case 'highest-gi':
      // Would need GI scores in meta, fallback to random
      return topGroups[Math.floor(Math.random() * topGroups.length)][0];

    case 'lowest-cost':
      // Would need cost in meta, fallback to random
      return topGroups[Math.floor(Math.random() * topGroups.length)][0];

    case 'fastest':
      // Would need latency in meta, fallback to random
      return topGroups[Math.floor(Math.random() * topGroups.length)][0];

    default:
      return topGroups[0][0];
  }
}
