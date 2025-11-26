/**
 * ECHO Layer Service
 * Epistemically Cached Heuristic Outcomes: High-GI answer caching to reduce hallucinations and drift
 */

import { Pool } from 'pg';
import {
  GI_STRICT_THRESHOLD,
  GI_BASELINE,
  SIMILARITY_MIN,
  FRESHNESS_RULES,
  FreshnessTag,
  DEFAULT_LOCALE,
  inferFreshnessTag,
  computeValidUntil,
} from '../config/echo';
import { canonicalizeKey, canonicalizeText } from '../utils/textCanonicalization';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.INTEGRITY_CACHE_DB_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface EchoLayerEntry {
  id: string;
  canonical_key: string;
  question_raw: string;
  question_norm: string;
  answer_text: string;
  answer_format: string;
  gi_score: number;
  ledger_tx_id: string | null;
  ledger_hash: string | null;
  sources_json: any[];
  sentinels_json: any;
  domain: string;
  locale: string;
  jurisdiction: string | null;
  freshness_tag: string | null;
  valid_until: Date | null;
  status: string;
  similarity?: number;
}

/**
 * Get exact cache entry by canonical key
 */
export async function getExactEntry(canonicalKey: string): Promise<EchoLayerEntry | null> {
  try {
    const res = await pool.query<EchoLayerEntry>(
      `SELECT *
       FROM echo_layer_entries
       WHERE canonical_key = $1
         AND status = 'active'
         AND (valid_until IS NULL OR valid_until > NOW())
       ORDER BY gi_score DESC
       LIMIT 1`,
      [canonicalKey]
    );

    if (res.rowCount === 0) return null;
    return res.rows[0];
  } catch (error) {
    console.error('[IntegrityCache] Error fetching exact entry:', error);
    return null;
  }
}

/**
 * Get nearest semantic match using vector similarity
 */
export async function getNearestEntry(opts: {
  question: string;
  domain?: string;
  locale?: string;
  embedding?: number[];
}): Promise<EchoLayerEntry | null> {
  try {
    // If no embedding provided, we can't do semantic search
    // In production, you'd call an embedding service here
    if (!opts.embedding || opts.embedding.length === 0) {
      return null;
    }

    const params: any[] = [`[${opts.embedding.join(',')}]`];
    let idx = 2;
    let filter = "status = 'active' AND embedding IS NOT NULL";

    if (opts.domain) {
      filter += ` AND domain = $${idx++}`;
      params.push(opts.domain);
    }

    if (opts.locale) {
      filter += ` AND locale = $${idx++}`;
      params.push(opts.locale);
    }

    const res = await pool.query<EchoLayerEntry & { similarity: number }>(
      `SELECT *,
              1 - (embedding <=> $1::vector) AS similarity
       FROM echo_layer_entries
       WHERE ${filter}
         AND (valid_until IS NULL OR valid_until > NOW())
       ORDER BY embedding <=> $1::vector
       LIMIT 1`,
      params
    );

    if (res.rowCount === 0) return null;

    const row = res.rows[0];
    return {
      ...row,
      similarity: Number(row.similarity),
    };
  } catch (error) {
    console.error('[IntegrityCache] Error fetching nearest entry:', error);
    return null;
  }
}

/**
 * Store a new cache entry
 */
export async function storeEntry(entry: {
  questionRaw: string;
  answerText: string;
  giScore: number;
  sources: any[];
  sentinels: any;
  ledgerTxId?: string | null;
  ledgerHash?: string | null;
  domain?: string;
  locale?: string;
  jurisdiction?: string | null;
  embedding?: number[];
}): Promise<void> {
  try {
    const questionNorm = canonicalizeText(entry.questionRaw);
    const canonicalKey = canonicalizeKey(entry.questionRaw);
    const domain = entry.domain ?? 'general';
    const locale = entry.locale ?? DEFAULT_LOCALE;
    const freshnessTag = inferFreshnessTag(domain);
    const validUntil = computeValidUntil(freshnessTag);

    // Convert embedding array to PostgreSQL vector format
    const embeddingStr = entry.embedding
      ? `[${entry.embedding.join(',')}]`
      : null;

    await pool.query(
      `INSERT INTO echo_layer_entries (
        canonical_key,
        question_raw,
        question_norm,
        answer_text,
        answer_format,
        gi_score,
        ledger_tx_id,
        ledger_hash,
        sources_json,
        sentinels_json,
        embedding,
        domain,
        locale,
        jurisdiction,
        freshness_tag,
        valid_until,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11::vector, $12, $13, $14, $15, $16, 'active'
      )`,
      [
        canonicalKey,
        entry.questionRaw,
        questionNorm,
        entry.answerText,
        'markdown',
        entry.giScore,
        entry.ledgerTxId ?? null,
        entry.ledgerHash ?? null,
        JSON.stringify(entry.sources),
        JSON.stringify(entry.sentinels),
        embeddingStr,
        domain,
        locale,
        entry.jurisdiction ?? null,
        freshnessTag,
        validUntil,
      ]
    );
  } catch (error) {
    console.error('[IntegrityCache] Error storing entry:', error);
    throw error;
  }
}

/**
 * Get cache statistics for DVA.LITE monitoring
 */
export async function getCacheStats(): Promise<{
  total_entries: number;
  active_entries: number;
  avg_gi_score: number;
  entries_last_24h: number;
  expired_entries: number;
  unique_domains: number;
}> {
  try {
    const res = await pool.query(
      `SELECT * FROM echo_layer_stats`
    );
    return res.rows[0] || {
      total_entries: 0,
      active_entries: 0,
      avg_gi_score: 0,
      entries_last_24h: 0,
      expired_entries: 0,
      unique_domains: 0,
    };
  } catch (error) {
    console.error('[IntegrityCache] Error fetching stats:', error);
    return {
      total_entries: 0,
      active_entries: 0,
      avg_gi_score: 0,
      entries_last_24h: 0,
      expired_entries: 0,
      unique_domains: 0,
    };
  }
}

/**
 * Check if entry is stale (expired)
 */
export function isStale(entry: EchoLayerEntry | null): boolean {
  if (!entry || !entry.valid_until) return false;
  return new Date(entry.valid_until) < new Date();
}

