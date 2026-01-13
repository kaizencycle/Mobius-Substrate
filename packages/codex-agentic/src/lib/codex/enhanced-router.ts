/**
 * Enhanced Codex Router
 * Phase 3: Enhanced Deliberation & Consensus Modes
 * Supports advanced consensus modes, deliberation strategies, and adaptive routing
 */

import { getAnchor } from '../../agents/anchors';
import type {
  EnhancedCodexRequest,
  EnhancedDelibProof,
  CodexVote,
  ProviderId,
  MemoryEntry,
} from '../../types';
import { giScoreFor } from '../gi/metrics';
import { attestToLedger } from '../gi/ledger';
import { oaaLearn, hasOAAConsent } from '../discourse/oaa';
import { generateTraceId } from '../util/hash';
import {
  getMemoryStorage,
  enrichMemoryEntry,
  getRelevantContext,
  formatContextForPrompt,
  getOrCreateSession,
} from '../memory';
import {
  calculateConsensus,
  executeDeliberation,
  analyzeDecisionQuality,
  selectProvidersAdaptively,
  estimateDeliberationCost,
  estimateDeliberationLatency,
  recommendStrategy,
} from '../consensus';

/**
 * Enhanced deliberation function with Phase 3 features
 */
export async function enhancedCodexDeliberate(
  req: EnhancedCodexRequest
): Promise<EnhancedDelibProof> {
  const startTime = Date.now();

  const anchor = getAnchor(req.agent);

  if (!anchor || !anchor.active) {
    throw new Error(`Anchor not available for agent ${req.agent}`);
  }

  // Phase 3: Recommend strategy if not specified
  if (!req.consensus && !req.deliberation && (req.maxCost || req.maxLatency)) {
    const recommendation = recommendStrategy({
      maxCost: req.maxCost,
      maxLatency: req.maxLatency,
      minAgreement: anchor.minAgreement,
    });

    console.log(`[Enhanced] Strategy recommendation: ${recommendation.reasoning}`);

    // Apply recommendations
    if (!req.consensus) {
      req.consensus = { mode: recommendation.consensus };
    }
    if (!req.deliberation) {
      req.deliberation = { strategy: recommendation.deliberation };
    }
  }

  // Set defaults
  const consensusConfig = req.consensus || { mode: 'simple' };
  const deliberationConfig = req.deliberation || { strategy: 'parallel' };

  // Phase 2: Get or create session for memory tracking
  const session = await getOrCreateSession(
    req.agent,
    req.context?.sessionId as string | undefined,
    req.tags
  ).catch(() => undefined);

  // Phase 2: Retrieve relevant context from memory
  let relevantContext: MemoryEntry[] = [];
  const useMemory = process.env.CODEX_USE_MEMORY !== 'false';

  if (useMemory) {
    try {
      const context = await getRelevantContext(req.input, req.agent, {
        maxEntries: 5,
        includeSimilar: true,
        includeRecent: true,
        includeDomain: true,
      });
      relevantContext = context.all;

      if (relevantContext.length > 0) {
        console.log(
          `[Memory] Retrieved ${relevantContext.length} relevant past deliberations`
        );
      }
    } catch (error) {
      console.warn('[Memory] Context retrieval failed:', error);
    }
  }

  // Phase 3: Adaptive provider selection
  let providers = anchor.defaultRoute;

  if (req.adaptiveRouting) {
    try {
      const selection = await selectProvidersAdaptively(
        req.agent,
        req.input,
        anchor.defaultRoute,
        {
          maxCost: req.maxCost,
          maxLatency: req.maxLatency,
          preferPerformance: true,
          domainAware: true,
        }
      );

      providers = selection.providers;

      console.log(
        `[Adaptive] Provider selection: ${selection.reasoning} (confidence: ${(selection.confidence * 100).toFixed(0)}%)`
      );
    } catch (error) {
      console.warn('[Adaptive] Provider selection failed, using defaults:', error);
    }
  }

  // Estimate cost and latency
  const estimatedCost = estimateDeliberationCost(providers);
  const estimatedLatency = estimateDeliberationLatency(
    providers,
    deliberationConfig.strategy === 'parallel'
  );

  console.log(
    `[Enhanced] Estimated cost: $${estimatedCost.toFixed(4)}, latency: ${estimatedLatency}ms`
  );

  // Build the prompt with constitutional context and memory
  const prompt = buildEnhancedPrompt(req, relevantContext);

  // Phase 3: Execute deliberation with chosen strategy
  console.log(
    `[Enhanced] Deliberating for ${req.agent} using ${deliberationConfig.strategy} strategy with ${consensusConfig.mode} consensus`
  );

  const deliberationResult = await executeDeliberation(
    prompt,
    req,
    providers,
    deliberationConfig
  );

  // Filter out error votes for consensus calculation
  const validVotes = deliberationResult.votes.filter((v) => !v.meta?.error);

  if (validVotes.length === 0) {
    throw new Error('All providers failed - no valid votes');
  }

  // Phase 3: Calculate consensus using chosen mode
  const consensusResult = await calculateConsensus(
    validVotes,
    consensusConfig,
    req.agent
  );

  const { winner, agreement } = consensusResult;

  // Compute GI score
  const giScore = giScoreFor({
    agent: anchor.agent,
    agreement,
    votes: validVotes,
  });

  // Generate trace ID
  const traceId = generateTraceId({ t: Date.now(), req, votes: validVotes });

  // Phase 3: Analyze decision quality (if requested)
  let quality;

  if (req.analyzeQuality !== false) {
    quality = analyzeDecisionQuality(validVotes, consensusResult);
    console.log(
      `[Quality] Confidence: ${(quality.confidence * 100).toFixed(0)}%, Spread: ${(quality.uncertainty.spread * 100).toFixed(0)}%`
    );

    if (quality.reasoning.warnings) {
      for (const warning of quality.reasoning.warnings) {
        console.warn(`[Quality] ⚠️  ${warning}`);
      }
    }
  }

  // Calculate actual cost and latency
  const totalLatency = Date.now() - startTime;

  // Build enhanced proof
  const proof: EnhancedDelibProof = {
    agreement,
    votes: deliberationResult.votes,
    winner,
    traceId,
    giScore,
    timestamp: new Date().toISOString(),

    // Phase 3 enhancements
    quality,
    consensusMode: consensusConfig.mode,
    deliberationStrategy: deliberationConfig.strategy,
    providerWeights: consensusResult.weights,
    metrics: {
      totalCost: estimatedCost, // Would need actual tracking per provider
      totalLatency,
      providerMetrics: deliberationResult.votes.map((vote) => ({
        provider: vote.provider,
        cost: estimatedCost / providers.length, // Simple average for now
        latency: totalLatency / providers.length,
        success: !vote.meta?.error,
      })),
    },
    rounds: deliberationResult.rounds,
  };

  // Attest to Civic Ledger
  attestToLedger({
    namespace: anchor.ledgerNamespace,
    traceId,
    agent: anchor.agent,
    agreement,
    giScore,
    providers: validVotes.map((v) => v.provider),
  }).catch((err) => console.error('[Ledger] Attestation failed:', err));

  // Teach OAA Hub
  if (anchor.learnWebhook && hasOAAConsent(anchor.agent)) {
    oaaLearn(anchor.learnWebhook, {
      agent: anchor.agent,
      traceId,
      input: req.input,
      output: winner.output,
      agreement,
      giScore,
    }).catch((err) => console.error('[OAA] Learning failed:', err));
  }

  // Check minimum agreement threshold
  if (agreement < anchor.minAgreement) {
    console.warn(
      `[Enhanced] Agreement ${agreement.toFixed(2)} below minimum ${anchor.minAgreement} for ${req.agent}`
    );
  }

  // Phase 2: Store in memory
  if (useMemory) {
    try {
      const storage = await getMemoryStorage();

      let memoryEntry: MemoryEntry = {
        traceId,
        agent: anchor.agent,
        timestamp: proof.timestamp,
        sessionId: session?.sessionId,
        input: req.input,
        inputContext: req.context,
        tags: req.tags,
        output: winner.output,
        agreement,
        giScore,
        providers: validVotes.map((v) => v.provider),
        votes: validVotes,
        winner,
        success: agreement >= anchor.minAgreement && giScore >= anchor.giTarget,
        belowThreshold: agreement < anchor.minAgreement,
        errorCount: deliberationResult.votes.length - validVotes.length,
      };

      memoryEntry = enrichMemoryEntry(memoryEntry);
      await storage.storeEntry(memoryEntry);

      console.log(`[Memory] Stored deliberation ${traceId}`);
    } catch (error) {
      console.error('[Memory] Storage failed:', error);
    }
  }

  console.log(
    `[Enhanced] Deliberation complete: agreement=${agreement.toFixed(2)}, gi=${giScore.toFixed(3)}, latency=${totalLatency}ms, cost=$${estimatedCost.toFixed(4)}`
  );

  return proof;
}

/**
 * Build enhanced prompt with constitutional context and memory
 */
function buildEnhancedPrompt(
  req: EnhancedCodexRequest,
  relevantContext?: MemoryEntry[]
): string {
  const systemPrompt =
    process.env.CODEX_SYSTEM ||
    'Follow Virtue Accords. Prioritize integrity, privacy, safety. Cite sources when non-trivial.';

  const memoryContext =
    relevantContext && relevantContext.length > 0
      ? `\n\nPast Deliberations (for context):\n${formatContextForPrompt(relevantContext)}`
      : '';

  return `Agent: ${req.agent}
Constitution: ${systemPrompt}
Task: ${req.input}
Constraints: GI >= 0.95, provide clear rationale.

${req.context ? `Context: ${JSON.stringify(req.context)}` : ''}${memoryContext}`.trim();
}
