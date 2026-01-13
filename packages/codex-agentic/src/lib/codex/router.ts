/**
 * Codex Router - Multi-LLM Deliberation Engine
 * Orchestrates DelibProof consensus across multiple LLM providers
 * Phase 2: Includes memory & learning persistence
 */

import { getAnchor } from '../../agents/anchors';
import type { CodexRequest, CodexVote, DelibProof, ProviderId, MemoryEntry } from '../../types';
import { PROVIDER_DISPATCH } from './providers/unified';
import { giScoreFor, calculateAgreement, groupByTextSimilarity } from '../gi/metrics';
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

/**
 * Provider dispatch table (imported from unified provider interface)
 */
const DISPATCH = PROVIDER_DISPATCH;

/**
 * Main deliberation function
 * Executes DelibProof consensus across multiple providers
 * Phase 2: Includes memory retrieval and persistence
 */
export async function codexDeliberate(req: CodexRequest): Promise<DelibProof> {
  const anchor = getAnchor(req.agent);

  if (!anchor || !anchor.active) {
    throw new Error(`Anchor not available for agent ${req.agent}`);
  }

  // Phase 2: Get or create session for memory tracking
  const session = await getOrCreateSession(
    req.agent,
    req.context?.sessionId as string | undefined,
    req.tags
  ).catch(() => undefined); // Non-critical, continue if fails

  // Phase 2: Retrieve relevant context from memory (if enabled)
  let relevantContext: MemoryEntry[] = [];
  const useMemory = process.env.CODEX_USE_MEMORY !== 'false'; // Default: enabled

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

  // 1) Build the prompt with constitutional context and memory
  const prompt = buildPrompt(req, relevantContext);

  // 2) Fan out to all providers in the anchor's default route
  console.log(
    `[Codex] Deliberating for ${req.agent} via [${anchor.defaultRoute.join(', ')}]`
  );

  const votes = await Promise.all(
    anchor.defaultRoute.map((provider) => {
      return DISPATCH[provider](prompt, req).catch((error) => {
        console.error(`[Codex] Provider ${provider} failed:`, error);
        // Return a failure vote instead of throwing
        return {
          provider,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        } as CodexVote;
      });
    })
  );

  // Filter out error votes for consensus calculation
  const validVotes = votes.filter((v) => !v.meta?.error);

  if (validVotes.length === 0) {
    throw new Error('All providers failed - no valid votes');
  }

  // 3) Calculate agreement using text similarity
  const agreement = calculateAgreement(validVotes, 0.80);

  // 4) Select winner (first from largest agreement group)
  const groups = groupByTextSimilarity(validVotes, 0.80);
  const topGroup = groups.sort((a, b) => b.length - a.length)[0];
  const winner = topGroup[0];

  // 5) Compute GI score
  const giScore = giScoreFor({
    agent: anchor.agent,
    agreement,
    votes: validVotes,
  });

  // 6) Generate trace ID
  const traceId = generateTraceId({ t: Date.now(), req, votes });

  // 7) Build DelibProof result
  const proof: DelibProof = {
    agreement,
    votes,
    winner,
    traceId,
    giScore,
    timestamp: new Date().toISOString(),
  };

  // 8) Attest to Civic Ledger (fire-and-forget)
  attestToLedger({
    namespace: anchor.ledgerNamespace,
    traceId,
    agent: anchor.agent,
    agreement,
    giScore,
    providers: validVotes.map((v) => v.provider),
  }).catch((err) => console.error('[Ledger] Attestation failed:', err));

  // 9) Teach OAA Hub if webhook configured and consent given
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

  // 10) Check minimum agreement threshold
  if (agreement < anchor.minAgreement) {
    console.warn(
      `[Codex] Agreement ${agreement.toFixed(2)} below minimum ${anchor.minAgreement} for ${req.agent}`
    );
    // Include warning in proof metadata
    proof.winner.meta = {
      ...proof.winner.meta,
      belowThreshold: true,
      minAgreement: anchor.minAgreement,
    };
  }

  console.log(
    `[Codex] Deliberation complete: agreement=${agreement.toFixed(2)}, gi=${giScore.toFixed(3)}`
  );

  // Phase 2: Store deliberation in memory (if enabled)
  if (useMemory) {
    try {
      const storage = await getMemoryStorage();

      // Create memory entry
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
        votes,
        winner,
        success: agreement >= anchor.minAgreement && giScore >= anchor.giTarget,
        belowThreshold: agreement < anchor.minAgreement,
        errorCount: votes.length - validVotes.length,
      };

      // Enrich with keywords and domain
      memoryEntry = enrichMemoryEntry(memoryEntry);

      // Store in memory
      await storage.storeEntry(memoryEntry);

      console.log(`[Memory] Stored deliberation ${traceId}`);
    } catch (error) {
      console.error('[Memory] Storage failed:', error);
    }
  }

  return proof;
}

/**
 * Build a prompt with constitutional context and memory
 * Phase 2: Includes relevant past deliberations for learning
 */
function buildPrompt(req: CodexRequest, relevantContext?: MemoryEntry[]): string {
  const systemPrompt =
    process.env.CODEX_SYSTEM ||
    'Follow Virtue Accords. Prioritize integrity, privacy, safety. Cite sources when non-trivial.';

  // Format memory context if available
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

/**
 * Execute a council-wide deliberation across all active agents
 */
export async function councilDeliberate(input: string): Promise<{
  councilAgreement: number;
  giAvg: number;
  results: DelibProof[];
}> {
  const { getActiveAnchors } = await import('../../agents/anchors');
  const activeAgents = getActiveAnchors();

  console.log(`[Council] Starting deliberation with ${activeAgents.length} active agents`);

  const results = await Promise.all(
    activeAgents.map((anchor) =>
      codexDeliberate({
        agent: anchor.agent,
        input,
      })
    )
  );

  const councilAgreement =
    results.reduce((sum, r) => sum + r.agreement, 0) / Math.max(1, results.length);

  const giAvg = results.reduce((sum, r) => sum + r.giScore, 0) / Math.max(1, results.length);

  console.log(
    `[Council] Deliberation complete: councilAgreement=${councilAgreement.toFixed(2)}, giAvg=${giAvg.toFixed(3)}`
  );

  return {
    councilAgreement,
    giAvg,
    results,
  };
}
