/**
 * Deliberation Strategy Implementations
 * Phase 3: Enhanced Deliberation & Consensus Modes
 */

import type {
  CodexRequest,
  CodexVote,
  DeliberationStrategy,
  DeliberationConfig,
  ProviderId,
} from '../../types';
import { PROVIDER_DISPATCH } from '../codex/providers/unified';

/**
 * Deliberation result
 */
export interface DeliberationResult {
  votes: CodexVote[];
  strategy: DeliberationStrategy;
  rounds?: {
    roundNumber: number;
    votes: CodexVote[];
    agreement: number;
  }[];
  metadata: {
    totalProviderCalls: number;
    roundsExecuted: number;
    earlyExit: boolean;
  };
}

/**
 * Execute deliberation using specified strategy
 */
export async function executeDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[],
  config: DeliberationConfig
): Promise<DeliberationResult> {
  const { strategy } = config;

  switch (strategy) {
    case 'parallel':
      return await parallelDeliberation(prompt, req, providers);
    case 'sequential':
      return await sequentialDeliberation(prompt, req, providers, config);
    case 'debate':
      return await debateDeliberation(prompt, req, providers, config);
    case 'multi-round':
      return await multiRoundDeliberation(prompt, req, providers, config);
    case 'cascade':
      return await cascadeDeliberation(prompt, req, providers, config);
    case 'tournament':
      return await tournamentDeliberation(prompt, req, providers);
    default:
      return await parallelDeliberation(prompt, req, providers);
  }
}

/**
 * Parallel deliberation: All providers simultaneously (default)
 */
async function parallelDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[]
): Promise<DeliberationResult> {
  const votes = await Promise.all(
    providers.map((provider) =>
      PROVIDER_DISPATCH[provider](prompt, req).catch((error) => ({
        provider,
        output: `[ERROR: ${error.message}]`,
        meta: { error: true },
      }))
    )
  );

  return {
    votes,
    strategy: 'parallel',
    metadata: {
      totalProviderCalls: providers.length,
      roundsExecuted: 1,
      earlyExit: false,
    },
  };
}

/**
 * Sequential deliberation: One provider at a time, building context
 */
async function sequentialDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[],
  config: DeliberationConfig
): Promise<DeliberationResult> {
  const votes: CodexVote[] = [];
  let contextualPrompt = prompt;

  for (const provider of providers) {
    try {
      const vote = await PROVIDER_DISPATCH[provider](contextualPrompt, req);
      votes.push(vote);

      // Build context for next provider
      if (config.includePreviousRounds !== false) {
        contextualPrompt = `${prompt}\n\nPrevious provider (${provider}) response:\n${vote.output}`;
      }
    } catch (error: any) {
      votes.push({
        provider,
        output: `[ERROR: ${error.message}]`,
        meta: { error: true },
      });
    }
  }

  return {
    votes,
    strategy: 'sequential',
    metadata: {
      totalProviderCalls: providers.length,
      roundsExecuted: 1,
      earlyExit: false,
    },
  };
}

/**
 * Debate deliberation: Providers critique each other's outputs
 */
async function debateDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[],
  config: DeliberationConfig
): Promise<DeliberationResult> {
  const debateConfig = config.debateConfig || {
    rounds: 2,
    includeCounterArguments: true,
    requireSynthesis: true,
  };

  const rounds: { roundNumber: number; votes: CodexVote[]; agreement: number }[] = [];
  let currentPrompt = prompt;

  // Initial round
  const initialVotes = await Promise.all(
    providers.map((provider) =>
      PROVIDER_DISPATCH[provider](currentPrompt, req).catch((error) => ({
        provider,
        output: `[ERROR: ${error.message}]`,
        meta: { error: true },
      }))
    )
  );

  rounds.push({
    roundNumber: 1,
    votes: initialVotes.filter((v) => !v.meta?.error),
    agreement: calculateSimpleAgreement(initialVotes),
  });

  // Debate rounds
  for (let round = 2; round <= debateConfig.rounds; round++) {
    const previousRound = rounds[rounds.length - 1];

    // Create debate prompt with previous outputs
    const debatePrompt = `${prompt}\n\n===DEBATE ROUND ${round}===\n\nPrevious round outputs:\n${previousRound.votes.map((v, i) => `Provider ${i + 1} (${v.provider}): ${v.output}`).join('\n\n')}\n\n${debateConfig.includeCounterArguments ? 'Please critique the above responses and provide your refined answer.' : 'Please refine your answer based on the above responses.'}`;

    const debateVotes = await Promise.all(
      providers.map((provider) =>
        PROVIDER_DISPATCH[provider](debatePrompt, req).catch((error) => ({
          provider,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        }))
      )
    );

    rounds.push({
      roundNumber: round,
      votes: debateVotes.filter((v) => !v.meta?.error),
      agreement: calculateSimpleAgreement(debateVotes),
    });
  }

  // Synthesis round (optional)
  let finalVotes = rounds[rounds.length - 1].votes;

  if (debateConfig.requireSynthesis) {
    const synthesisPrompt = `${prompt}\n\n===FINAL SYNTHESIS===\n\nAll debate rounds:\n${rounds.map((r) => `Round ${r.roundNumber}:\n${r.votes.map((v) => `- ${v.provider}: ${v.output.slice(0, 200)}...`).join('\n')}`).join('\n\n')}\n\nProvide your final synthesized answer.`;

    finalVotes = await Promise.all(
      providers.map((provider) =>
        PROVIDER_DISPATCH[provider](synthesisPrompt, req).catch((error) => ({
          provider,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        }))
      )
    );
  }

  return {
    votes: finalVotes,
    strategy: 'debate',
    rounds,
    metadata: {
      totalProviderCalls:
        providers.length * (debateConfig.rounds + (debateConfig.requireSynthesis ? 1 : 0)),
      roundsExecuted: debateConfig.rounds + (debateConfig.requireSynthesis ? 1 : 0),
      earlyExit: false,
    },
  };
}

/**
 * Multi-round deliberation: Multiple iterations for refinement
 */
async function multiRoundDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[],
  config: DeliberationConfig
): Promise<DeliberationResult> {
  const maxRounds = config.maxRounds || 3;
  const earlyExitThreshold = config.earlyExitThreshold || 0.95;

  const rounds: { roundNumber: number; votes: CodexVote[]; agreement: number }[] = [];
  let earlyExit = false;

  for (let round = 1; round <= maxRounds; round++) {
    let roundPrompt = prompt;

    // Include previous round context
    if (round > 1 && config.includePreviousRounds !== false) {
      const prevRound = rounds[rounds.length - 1];
      roundPrompt = `${prompt}\n\n===ROUND ${round} (Refinement)===\n\nPrevious round best answer:\n${prevRound.votes[0]?.output}\n\nPlease refine this answer.`;
    }

    const roundVotes = await Promise.all(
      providers.map((provider) =>
        PROVIDER_DISPATCH[provider](roundPrompt, req).catch((error) => ({
          provider,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        }))
      )
    );

    const validVotes = roundVotes.filter((v) => !v.meta?.error);
    const agreement = calculateSimpleAgreement(validVotes);

    rounds.push({
      roundNumber: round,
      votes: validVotes,
      agreement,
    });

    // Early exit if agreement threshold met
    if (agreement >= earlyExitThreshold) {
      earlyExit = true;
      console.log(
        `[Deliberation] Early exit at round ${round}: agreement ${(agreement * 100).toFixed(0)}% >= ${(earlyExitThreshold * 100).toFixed(0)}%`
      );
      break;
    }
  }

  return {
    votes: rounds[rounds.length - 1].votes,
    strategy: 'multi-round',
    rounds,
    metadata: {
      totalProviderCalls: providers.length * rounds.length,
      roundsExecuted: rounds.length,
      earlyExit,
    },
  };
}

/**
 * Cascade deliberation: Fallback chain with early exit
 */
async function cascadeDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[],
  config: DeliberationConfig
): Promise<DeliberationResult> {
  const cascadeConfig = config.cascadeConfig || {
    providers: providers,
    stopOnSuccess: true,
    combineBest: 1,
  };

  const orderedProviders = cascadeConfig.providers.length > 0
    ? cascadeConfig.providers
    : providers;

  const votes: CodexVote[] = [];
  let success = false;

  for (const provider of orderedProviders) {
    try {
      const vote = await PROVIDER_DISPATCH[provider](prompt, req);
      votes.push(vote);

      // Check if successful (no error)
      if (!vote.meta?.error) {
        success = true;

        if (cascadeConfig.stopOnSuccess) {
          console.log(`[Deliberation] Cascade success with ${provider}, stopping`);
          break;
        }
      }
    } catch (error: any) {
      votes.push({
        provider,
        output: `[ERROR: ${error.message}]`,
        meta: { error: true },
      });
    }

    // If not stop on success, continue to get combineBest results
    if (!cascadeConfig.stopOnSuccess && votes.length >= (cascadeConfig.combineBest || 1)) {
      break;
    }
  }

  return {
    votes,
    strategy: 'cascade',
    metadata: {
      totalProviderCalls: votes.length,
      roundsExecuted: 1,
      earlyExit: success && cascadeConfig.stopOnSuccess === true,
    },
  };
}

/**
 * Tournament deliberation: Pairwise elimination
 */
async function tournamentDeliberation(
  prompt: string,
  req: CodexRequest,
  providers: ProviderId[]
): Promise<DeliberationResult> {
  // Get all initial responses
  const initialVotes = await Promise.all(
    providers.map((provider) =>
      PROVIDER_DISPATCH[provider](prompt, req).catch((error) => ({
        provider,
        output: `[ERROR: ${error.message}]`,
        meta: { error: true },
      }))
    )
  );

  const validVotes = initialVotes.filter((v) => !v.meta?.error);

  // Simple tournament: just return all votes (real tournament would do pairwise comparisons)
  // For now, this is a placeholder for future LLM-as-judge implementation
  return {
    votes: validVotes,
    strategy: 'tournament',
    metadata: {
      totalProviderCalls: providers.length,
      roundsExecuted: 1,
      earlyExit: false,
    },
  };
}

/**
 * Simple agreement calculation for deliberation strategies
 */
function calculateSimpleAgreement(votes: CodexVote[]): number {
  if (votes.length === 0) return 0;

  // Count unique outputs (simple text comparison)
  const outputs = votes.map((v) => v.output.toLowerCase().trim());

  // Agreement = most common output / total votes
  const counts = new Map<string, number>();
  for (const output of outputs) {
    counts.set(output, (counts.get(output) || 0) + 1);
  }

  const maxCount = Math.max(...counts.values());
  return maxCount / votes.length;
}
