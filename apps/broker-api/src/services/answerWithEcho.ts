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
} from '../config/echo';
import {
  getExactEntry,
  getNearestEntry,
  storeEntry,
  isStale,
  EchoLayerEntry,
} from './echoLayer';

// Mock embedding function - replace with actual embedding service
async function embedText(text: string): Promise<number[]> {
  // In production, call OpenAI/Anthropic embedding API
  // For now, return empty array (semantic search disabled)
  return [];
}

interface AnswerWithIntegrityOptions {
  domain?: string;
  locale?: string;
  jurisdiction?: string;
  cacheable?: boolean; // Allow opt-out for personal/sensitive flows
  embedding?: number[]; // Optional pre-computed embedding
}

interface DeliberationResult {
  answer: string;
  gi: number;
  sources?: any[];
  sentinels?: any;
  ledgerTxId?: string | null;
  ledgerHash?: string | null;
}

interface AnswerResult {
  answer: string;
  gi: number;
  cacheHit: 'exact' | 'semantic' | null;
  similarity?: number;
  ledgerTx: string | null;
}

/**
 * Run full deliberation (placeholder - integrate with actual deliberation engine)
 */
async function runDeliberation(
  question: string,
  opts: { domain?: string }
): Promise<DeliberationResult> {
  // This should call the actual deliberation engine
  // For now, return a placeholder
  throw new Error('Deliberation engine integration required');
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
  opts: AnswerWithIntegrityOptions = {},
  deliberationFn?: (q: string, o: { domain?: string }) => Promise<DeliberationResult>
): Promise<AnswerResult> {
  const now = new Date();
  const domain = opts.domain ?? 'general';
  const locale = opts.locale ?? DEFAULT_LOCALE;

  // Bypass cache for non-cacheable requests (personal/therapeutic)
  if (opts.cacheable === false) {
    const deliberation = deliberationFn
      ? await deliberationFn(question, { domain })
      : await runDeliberation(question, { domain });

    return {
      answer: deliberation.answer,
      gi: deliberation.gi,
      cacheHit: null,
      ledgerTx: deliberation.ledgerTxId ?? null,
    };
  }

  const canonicalKey = canonicalizeKey(question);

  // Tier 0: Exact cache hit
  const exact = await getExactEntry(canonicalKey);
  if (
    exact &&
    exact.gi_score >= GI_STRICT_THRESHOLD &&
    !isStale(exact)
  ) {
    return {
      answer: exact.answer_text,
      gi: Number(exact.gi_score),
      cacheHit: 'exact',
      ledgerTx: exact.ledger_tx_id,
    };
  }

  // Tier 1: Semantic cache hit
  const embedding = opts.embedding || await embedText(question);
  if (embedding.length > 0) {
    const nearest = await getNearestEntry({
      question,
      domain,
      locale,
      embedding,
    });

    if (
      nearest &&
      nearest.similarity !== undefined &&
      nearest.similarity >= SIMILARITY_MIN &&
      nearest.gi_score >= GI_BASELINE &&
      !isStale(nearest)
    ) {
      return {
        answer: nearest.answer_text,
        gi: Number(nearest.gi_score),
        cacheHit: 'semantic',
        similarity: nearest.similarity,
        ledgerTx: nearest.ledger_tx_id,
      };
    }
  }

  // Tier 2: Full deliberation
  const deliberation = deliberationFn
    ? await deliberationFn(question, { domain })
    : await runDeliberation(question, { domain });

  // Cache if GI >= baseline
  if (deliberation.gi >= GI_BASELINE) {
    try {
      await storeEntry({
        questionRaw: question,
        answerText: deliberation.answer,
        giScore: deliberation.gi,
        sources: deliberation.sources ?? [],
        sentinels: deliberation.sentinels ?? {},
        ledgerTxId: deliberation.ledgerTxId ?? null,
        ledgerHash: deliberation.ledgerHash ?? null,
        domain,
        locale,
        jurisdiction: opts.jurisdiction ?? null,
        embedding,
      });
    } catch (error) {
      console.error('[AnswerWithIntegrity] Failed to cache entry:', error);
      // Don't fail the request if caching fails
    }
  } else {
    // Low GI - could enqueue for human review here
    // await enqueueForHumanReview(deliberation);
  }

  return {
    answer: deliberation.answer,
    gi: deliberation.gi,
    cacheHit: null,
    ledgerTx: deliberation.ledgerTxId ?? null,
  };
}

