/**
 * Answer with ECHO Layer Wrapper
 * Implements ECHO Layer: checks cache before running full deliberation
 */

import { canonicalizeKey } from '../utils/textCanonicalization';
import {
  GI_STRICT_THRESHOLD,
  GI_BASELINE,
  SIMILARITY_MIN,
  DEFAULT_LOCALE,
  inferFreshnessTag,
} from '../config/integrityCache';
import {
  getExactFromEchoCache,
  getSimilarFromEchoCache,
  writeToEchoCache,
} from './echo/cache';
import { runEchoReview } from './echo/reviewEngine';

const GI_HUMAN_REVIEW = 0.85;
const NON_CACHEABLE_DOMAINS = new Set([
  "personal_medical",
  "personal_legal",
  "therapy",
  "individual_counseling"
]);

interface AnswerOptions {
  domain?: string;
  locale?: string;
  jurisdiction?: string;
  cacheable?: boolean;
  bypassCache?: boolean;
}

interface AnswerResult {
  answer: string;
  giScore: number;
  cacheHit: "exact" | "semantic" | null;
  similarity?: number;
  ledgerTxId: string | null;
  sources: any[];
  sentinels: any;
  requiresReview?: boolean;
}

/**
 * Answer with ECHO Layer
 * 
 * Flow:
 * 1. Check exact cache hit (Tier 0)
 * 2. Check semantic cache hit (Tier 1)
 * 3. Run full deliberation if no cache hit (Tier 2)
 * 4. Cache result if GI >= baseline
 */
export async function answerWithEcho(
  question: string,
  opts: AnswerOptions = {}
): Promise<AnswerResult> {
  const startTime = Date.now();
  const domain = opts.domain || "general";
  const locale = opts.locale || DEFAULT_LOCALE;

  // Privacy override: never cache sensitive domains
  const isCacheable = opts.cacheable !== false && 
                     !NON_CACHEABLE_DOMAINS.has(domain) &&
                     !opts.bypassCache;

  // 1. Tier 0: Exact cache hit
  if (isCacheable) {
    const canonicalKey = canonicalizeKey(question);
    const exactEntry = await getExactFromEchoCache(canonicalKey);
    
    if (exactEntry && 
        exactEntry.gi_score >= GI_STRICT_THRESHOLD &&
        isFresh(exactEntry)) {
      
      console.log("[ECHO] Exact hit", { 
        canonicalKey, 
        gi: exactEntry.gi_score,
        domain 
      });
      
      return {
        answer: exactEntry.answer_text,
        giScore: exactEntry.gi_score,
        cacheHit: "exact",
        ledgerTxId: exactEntry.ledger_tx_id,
        sources: Array.isArray(exactEntry.sources_json) ? exactEntry.sources_json : [],
        sentinels: exactEntry.sentinels_json || {},
      };
    }
  }

  // 2. Tier 1: Semantic cache hit
  if (isCacheable) {
    const semanticEntry = await getSimilarFromEchoCache(
      question,
      domain,
      0.85 // Lower threshold for semantic matches
    );
    
    if (semanticEntry && 
        semanticEntry.similarity !== undefined &&
        semanticEntry.similarity >= 0.85 &&
        semanticEntry.gi_score >= GI_BASELINE &&
        isFresh(semanticEntry)) {
      
      console.log("[ECHO] Semantic hit", {
        similarity: semanticEntry.similarity,
        gi: semanticEntry.gi_score,
        domain
      });
      
      return {
        answer: semanticEntry.answer_text,
        giScore: semanticEntry.gi_score,
        cacheHit: "semantic",
        similarity: semanticEntry.similarity,
        ledgerTxId: semanticEntry.ledger_tx_id,
        sources: Array.isArray(semanticEntry.sources_json) ? semanticEntry.sources_json : [],
        sentinels: semanticEntry.sentinels_json || {},
      };
    }
  }

  // 3. Tier 2: Full deliberation
  console.log("[ECHO] Cache miss, running deliberation", { domain });
  const canonicalKey = canonicalizeKey(question);
  const reviewResult = await runEchoReview(question, {
    domain,
    locale,
    jurisdiction: opts.jurisdiction
  }, {
    cacheKey: canonicalKey,
    domain,
    enableValidation: true
  });
  
  const deliberation = {
    answer: reviewResult.consensus.answer,
    giScore: reviewResult.consensus.giScore,
    sources: reviewResult.consensus.sources,
    sentinels: reviewResult.consensus.sentinels,
    ledgerTxId: null,
    ledgerHash: null
  };

  const duration = Date.now() - startTime;
  
  // 4. Store if high GI
  if (deliberation.giScore >= GI_BASELINE) {
    try {
      const cacheId = await writeToEchoCache(canonicalKey, {
        query: question,
        answer: deliberation.answer,
        giScore: deliberation.giScore,
        sources: deliberation.sources,
        sentinels: deliberation.sentinels,
        domain,
        locale,
        freshnessTag: inferFreshnessTag(domain)
      });
      
      console.log("[ECHO] Cached new entry", {
        cacheId,
        gi: deliberation.giScore,
        durationMs: duration
      });
    } catch (error) {
      console.error("[ECHO] Failed to cache entry", { error });
      // Non-critical: don't fail the request if caching fails
    }
  } else if (deliberation.giScore < GI_HUMAN_REVIEW) {
    // Route low-GI answers to human review
    await enqueueForHumanReview({
      question,
      deliberation,
      reason: `Low GI score: ${deliberation.giScore} < ${GI_HUMAN_REVIEW}`,
    });
    
    return {
      answer: deliberation.answer,
      giScore: deliberation.giScore,
      cacheHit: null,
      ledgerTxId: deliberation.ledgerTxId,
      sources: deliberation.sources,
      sentinels: deliberation.sentinels,
      requiresReview: true,
    };
  }

  return {
    answer: deliberation.answer,
    giScore: deliberation.giScore,
    cacheHit: null,
    ledgerTxId: deliberation.ledgerTxId,
    sources: deliberation.sources,
    sentinels: deliberation.sentinels,
  };
}

// Helpers
function isFresh(entry: { valid_until: Date | null }): boolean {
  if (!entry.valid_until) return true;
  return new Date(entry.valid_until) > new Date();
}

async function enqueueForHumanReview(data: any): Promise<void> {
  // TODO: Integrate with DVA.ONE review queue
  console.warn("[ECHO] Human review required", { 
    question: data.question?.substring(0, 100) 
  });
}
