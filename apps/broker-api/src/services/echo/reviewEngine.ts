// apps/broker-api/src/services/echo/reviewEngine.ts
// ECHO Review Engine
// Orchestrates the tri-sentinel peer review flow

// Sentinel configuration - add to config file
const PRIMARY_SENTINELS = ["claude", "gpt"] as const;
const VALIDATOR_SENTINEL = "eve" as const;
const FALLBACK_SENTINELS = ["atlas", "aurea"] as const;
const GI_HUMAN_REVIEW_THRESHOLD = 0.85;
const SENTINEL_TIMEOUT_MS = 30000;
const SENTINEL_MAX_RETRIES = 3;
import { computeEchoConsensus, SentinelResult, EchoConsensusResult } from "./consensus";
import { writeToEchoCache } from "./cache";

export interface ReviewEngineOptions {
  giThreshold?: number;
  cacheKey?: string;
  domain?: string;
  enableValidation?: boolean;
}

export interface ReviewResult {
  status: "APPROVED" | "HUMAN_REVIEW_REQUIRED" | "BLOCKED";
  consensus: EchoConsensusResult;
  cacheId?: string;
  processingTimeMs: number;
}

// Mock sentinel client - replace with actual implementation
async function callSentinel(sentinelName: string, query: string, context: any): Promise<SentinelResult> {
  // TODO: Replace with actual sentinel client call
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  return {
    name: sentinelName as any,
    answer: `${sentinelName} analyzed: "${query}". Recommendation based on integrity principles.`,
    confidence: 0.85 + Math.random() * 0.1,
    sources: [],
    vote: "APPROVE",
    reasoning: "Analysis complete"
  };
}

/**
 * Runs the complete ECHO review flow:
 * 1. Dual-sentinel answering
 * 2. Validator review
 * 3. GI scoring
 * 4. Cache/escalation decision
 */
export async function runEchoReview(
  query: string,
  context: any = {},
  opts: ReviewEngineOptions = {}
): Promise<ReviewResult> {
  const startTime = Date.now();
  const giThreshold = opts.giThreshold ?? GI_HUMAN_REVIEW_THRESHOLD;
  
  try {
    // Phase 1: Dual-sentinel answering (parallel)
    const [sentinelA, sentinelB] = await Promise.all([
      callSentinelWithRetry(PRIMARY_SENTINELS[0], query, context),
      callSentinelWithRetry(PRIMARY_SENTINELS[1], query, context)
    ]);

    // Phase 2: Validator review
    const validator = await callSentinelWithRetry(
      VALIDATOR_SENTINEL,
      query,
      {
        ...context,
        candidates: [sentinelA.answer, sentinelB.answer],
        sources: [...sentinelA.sources, ...sentinelB.sources]
      }
    );

    // Phase 3: Consensus calculation
    const consensus = computeEchoConsensus([sentinelA, sentinelB, validator]);

    // Phase 4: Decision routing
    let status: ReviewResult["status"];
    let cacheId: string | undefined;

    if (consensus.giScore >= GI_HUMAN_REVIEW_THRESHOLD) {
      // High GI: cache and approve
      status = "APPROVED";
      
      if (opts.cacheKey) {
        cacheId = await writeToEchoCache(opts.cacheKey, {
          query,
          answer: consensus.answer,
          giScore: consensus.giScore,
          sentinels: consensus.sentinels,
          sources: consensus.sources,
          domain: opts.domain,
          context
        });
      }
    } else if (consensus.giScore >= 0.70) {
      // Medium GI: route to human review
      status = "HUMAN_REVIEW_REQUIRED";
      
      await enqueueForHumanReview({
        query,
        context,
        consensus,
        reason: `GI score ${consensus.giScore} below threshold ${giThreshold}`
      });
    } else {
      // Very low GI: block
      status = "BLOCKED";
      
      // Log security incident
      await logSecurityEvent({
        type: "ECHO_BLOCK",
        query,
        giScore: consensus.giScore,
        sentinels: consensus.sentinels.map(s => ({
          name: s.name,
          confidence: s.confidence
        }))
      });
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      status,
      consensus,
      cacheId,
      processingTimeMs
    };
  } catch (error) {
    // If any sentinel fails, attempt DriftGuard fallback
    console.warn(`[ECHO Review] Primary flow failed, activating DriftGuard: ${error}`);
    
    return await runDriftGuardFallback(query, context, opts);
  }
}

/**
 * Calls a sentinel with retry logic
 */
async function callSentinelWithRetry(
  sentinelName: string,
  query: string,
  context: any
): Promise<SentinelResult> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < SENTINEL_MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        callSentinel(sentinelName, query, context),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), SENTINEL_TIMEOUT_MS)
        )
      ]);
      
      return {
        name: sentinelName as any,
        answer: result.answer,
        confidence: result.confidence ?? 0.85,
        sources: result.sources ?? [],
        vote: result.vote,
        reasoning: result.reasoning
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`[ECHO] Sentinel ${sentinelName} attempt ${attempt + 1} failed: ${error}`);
      
      if (attempt < SENTINEL_MAX_RETRIES - 1) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
  
  throw new Error(
    `Sentinel ${sentinelName} failed after ${SENTINEL_MAX_RETRIES} attempts: ${lastError?.message}`
  );
}

/**
 * DriftGuard fallback when primary sentinels fail
 */
async function runDriftGuardFallback(
  query: string,
  context: any,
  opts: ReviewEngineOptions
): Promise<ReviewResult> {
  const startTime = Date.now();
  
  // Call fallback sentinels
  const fallbackResults = await Promise.allSettled(
    FALLBACK_SENTINELS.map(name => 
      callSentinel(name, query, context).catch(err => {
        console.warn(`[ECHO Fallback] ${name} failed: ${err}`);
        return null;
      })
    )
  );

  const validResults = fallbackResults
    .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
    .map(r => r.value)
    .filter(Boolean);

  if (validResults.length === 0) {
    // All sentinels failed - escalate to emergency human review
    await enqueueForHumanReview({
      query,
      context,
      reason: "All sentinels failed - emergency escalation",
      priority: "critical"
    });

    return {
      status: "HUMAN_REVIEW_REQUIRED",
      consensus: {
        answer: "Unable to generate answer - all AI systems failed. Escalated to human review.",
        giScore: 0,
        sentinels: [],
        sources: [],
        reasoning: "Emergency fallback - system failure",
        meta: {
          agreement: 0,
          sourceQuality: 0,
          confidenceVariance: 0
        }
      },
      processingTimeMs: Date.now() - startTime
    };
  }

  // Compute consensus from fallback results
  const fallbackSentinels: SentinelResult[] = validResults.map(result => ({
    name: result.name as any,
    answer: result.answer,
    confidence: result.confidence ?? 0.75, // Lower confidence for fallbacks
    sources: result.sources ?? [],
    vote: result.vote,
    reasoning: result.reasoning
  }));

  const consensus = computeEchoConsensus(fallbackSentinels);
  
  return {
    status: consensus.giScore >= GI_HUMAN_REVIEW_THRESHOLD ? "APPROVED" : "HUMAN_REVIEW_REQUIRED",
    consensus,
    processingTimeMs: Date.now() - startTime
  };
}

/**
 * Enqueues for human review
 */
async function enqueueForHumanReview(data: any): Promise<void> {
  // TODO: Integrate with DVA.ONE review queue
  console.warn("[ECHO] Human review required", { 
    question: data.query?.substring(0, 100) 
  });
}

/**
 * Logs security incidents for monitoring
 */
async function logSecurityEvent(event: any): Promise<void> {
  // TODO: Integrate with DVA.LITE security monitoring
  console.error("[ECHO Security Event]", JSON.stringify(event));
}

