// apps/broker-api/src/services/echo/cache.ts
// ECHO Layer Cache Operations

import { Pool } from "pg";
import { 
  GI_STRICT_THRESHOLD,
  GI_BASELINE,
  inferFreshnessTag,
  computeValidUntil,
  DEFAULT_LOCALE,
  FreshnessTag
} from "../../config/integrityCache";
import { canonicalizeKey, canonicalizeText } from "../../utils/textCanonicalization";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Mock embedding function - replace with actual embedding service
async function embedText(text: string): Promise<number[]> {
  // TODO: Replace with actual embedding API call
  // For now, return empty array (semantic search disabled)
  return [];
}

export interface EchoCacheEntry {
  id: string;
  canonical_key: string;
  question_raw: string;
  question_norm: string;
  answer_text: string;
  gi_score: number;
  ledger_tx_id: string | null;
  sources_json: any;
  sentinels_json: any;
  embedding: number[];
  domain: string;
  locale: string;
  freshness_tag: string | null;
  valid_until: Date | null;
  status: string;
  hit_count?: number;
  last_hit_at?: Date | null;
  similarity?: number;
}

/**
 * Retrieves an exact match from the cache
 */
export async function getExactFromEchoCache(
  canonicalKey: string
): Promise<EchoCacheEntry | null> {
  try {
    const res = await pool.query(
      `SELECT * FROM echo_layer_entries 
       WHERE canonical_key = $1 
         AND status = 'active'
         AND (valid_until IS NULL OR valid_until > NOW())
       ORDER BY gi_score DESC, created_at DESC
       LIMIT 1`,
      [canonicalKey]
    );

    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      ...row,
      sources_json: typeof row.sources_json === 'string' ? JSON.parse(row.sources_json) : row.sources_json,
      sentinels_json: typeof row.sentinels_json === 'string' ? JSON.parse(row.sentinels_json) : row.sentinels_json,
      embedding: row.embedding ? (typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding) : []
    };
  } catch (error) {
    console.error("[ECHO Cache] Error fetching exact entry:", error);
    return null;
  }
}

/**
 * Finds semantically similar entries
 */
export async function getSimilarFromEchoCache(
  question: string,
  domain?: string,
  similarityThreshold: number = 0.85
): Promise<EchoCacheEntry | null> {
  try {
    const embedding = await embedText(question);
    
    if (embedding.length === 0) {
      return null; // Semantic search disabled without embeddings
    }

    const filters = ["status = 'active'", "gi_score >= $2", "(valid_until IS NULL OR valid_until > NOW())"];
    const params: any[] = [`[${embedding.join(',')}]`, GI_BASELINE];
    
    if (domain) {
      filters.push(`domain = $${params.length + 1}`);
      params.push(domain);
    }

    const res = await pool.query(
      `SELECT *, (1 - (embedding <=> $1::vector)) AS similarity
       FROM echo_layer_entries
       WHERE ${filters.join(" AND ")}
       ORDER BY embedding <=> $1::vector
       LIMIT 1`,
      params
    );

    if (res.rows.length === 0 || parseFloat(res.rows[0].similarity) < similarityThreshold) {
      return null;
    }

    const row = res.rows[0];
    return {
      ...row,
      similarity: parseFloat(row.similarity),
      sources_json: typeof row.sources_json === 'string' ? JSON.parse(row.sources_json) : row.sources_json,
      sentinels_json: typeof row.sentinels_json === 'string' ? JSON.parse(row.sentinels_json) : row.sentinels_json,
      embedding: row.embedding ? (typeof row.embedding === 'string' ? JSON.parse(row.embedding) : row.embedding) : []
    };
  } catch (error) {
    console.error("[ECHO Cache] Error fetching similar entry:", error);
    return null;
  }
}

/**
 * Writes a new entry to the cache
 */
export async function writeToEchoCache(
  cacheKey: string,
  data: {
    query: string;
    answer: string;
    giScore: number;
    sentinels: any[];
    sources: any[];
    domain?: string;
    locale?: string;
    context?: any;
    freshnessTag?: FreshnessTag;
  }
): Promise<string> {
  try {
    const questionNorm = canonicalizeText(data.query);
    const embedding = await embedText(data.query);
    const domain = data.domain || "general";
    const freshnessTag: FreshnessTag = data.freshnessTag ?? inferFreshnessTag(domain);
    const validUntil = computeValidUntil(freshnessTag);

    // Convert embedding array to PostgreSQL vector format
    const embeddingStr = embedding.length > 0 ? `[${embedding.join(',')}]` : null;

    const res = await pool.query(
      `INSERT INTO echo_layer_entries (
        canonical_key, question_raw, question_norm, answer_text, gi_score,
        ledger_tx_id, ledger_hash, sources_json, sentinels_json, embedding,
        domain, locale, jurisdiction, freshness_tag, valid_until, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, $11, $12, $13, $14, $15, 'active')
      ON CONFLICT (canonical_key) 
      DO UPDATE SET
        answer_text = EXCLUDED.answer_text,
        gi_score = EXCLUDED.gi_score,
        sources_json = EXCLUDED.sources_json,
        sentinels_json = EXCLUDED.sentinels_json,
        updated_at = NOW()
      RETURNING id`,
      [
        cacheKey,
        data.query,
        questionNorm,
        data.answer,
        data.giScore,
        null, // ledger_tx_id - filled later
        null, // ledger_hash - filled later
        JSON.stringify(data.sources),
        JSON.stringify(data.sentinels),
        embeddingStr,
        domain,
        data.locale || DEFAULT_LOCALE,
        null, // jurisdiction
        freshnessTag,
        validUntil
      ]
    );

    return res.rows[0].id;
  } catch (error) {
    console.error("[ECHO Cache] Error writing entry:", error);
    throw error;
  }
}

// Allowlist of valid column names for update operations (security: prevent SQL injection)
const ALLOWED_UPDATE_COLUMNS = new Set([
  'question_raw', 'question_norm', 'answer_text', 'gi_score', 
  'ledger_tx_id', 'sources_json', 'sentinels_json', 'embedding',
  'domain', 'locale', 'freshness_tag', 'valid_until', 'status',
  'hit_count', 'last_hit_at', 'jurisdiction'
]);

/**
 * Updates an existing cache entry (for revalidation)
 */
export async function updateEchoCacheEntry(
  canonicalKey: string,
  updates: Partial<EchoCacheEntry>
): Promise<void> {
  try {
    // Filter to only allowed columns (security: prevent SQL injection via column names)
    const validKeys = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'canonical_key')
      .filter(key => ALLOWED_UPDATE_COLUMNS.has(key));
    
    if (validKeys.length === 0) {
      return; // No valid updates to apply
    }
    
    const fields = validKeys
      .map((key, i) => `${key} = $${i + 2}`)
      .join(", ");

    await pool.query(
      `UPDATE echo_layer_entries
       SET ${fields}, updated_at = NOW()
       WHERE canonical_key = $1`,
      [canonicalKey, ...validKeys.map(k => updates[k as keyof EchoCacheEntry])]
    );
  } catch (error) {
    console.error("[ECHO Cache] Error updating entry:", error);
    throw error;
  }
}

/**
 * Increments hit count for a cache entry
 */
export async function incrementEchoHitCount(
  canonicalKey: string
): Promise<void> {
  try {
    await pool.query(
      `UPDATE echo_layer_entries
       SET hit_count = COALESCE(hit_count, 0) + 1,
           last_hit_at = NOW()
       WHERE canonical_key = $1`,
      [canonicalKey]
    );
  } catch (error) {
    console.error("[ECHO Cache] Error incrementing hit count:", error);
  }
}

/**
 * Retrieves stale entries for revalidation
 */
export async function getStaleEchoCacheEntries(
  limit: number = 100
): Promise<Array<Pick<EchoCacheEntry, "canonical_key" | "question_raw" | "domain" | "locale" | "valid_until">>> {
  try {
    const res = await pool.query(
      `SELECT canonical_key, question_raw, domain, locale, valid_until
       FROM echo_layer_entries
       WHERE status = 'active'
         AND (valid_until IS NOT NULL AND valid_until < NOW())
       ORDER BY valid_until ASC
       LIMIT $1`,
      [limit]
    );

    return res.rows;
  } catch (error) {
    console.error("[ECHO Cache] Error fetching stale entries:", error);
    return [];
  }
}

/**
 * Marks an entry as deprecated
 */
export async function deprecateEchoCacheEntry(
  canonicalKey: string,
  reason: string
): Promise<void> {
  try {
    await pool.query(
      `UPDATE echo_layer_entries
       SET status = 'deprecated',
           updated_at = NOW()
       WHERE canonical_key = $1`,
      [canonicalKey]
    );
  } catch (error) {
    console.error("[ECHO Cache] Error deprecating entry:", error);
    throw error;
  }
}

/**
 * Gets cache statistics
 */
export async function getEchoStats(domain?: string): Promise<{
  hitRate: number;
  totalEntries: number;
  avgGIScore: number;
  domainBreakdown: Record<string, { hitRate: number; count: number }>;
}> {
  try {
    const filters = domain ? [`domain = $1`] : [];
    const params = domain ? [domain] : [];

    const res = await pool.query(
      `SELECT 
        COUNT(*) as total_entries,
        AVG(gi_score) as avg_gi_score,
        COUNT(*) FILTER (WHERE hit_count > 0) as entries_with_hits
       FROM echo_layer_entries
       WHERE status = 'active'
       ${filters.length > 0 ? `AND ${filters.join(' AND ')}` : ''}`,
      params
    );

    const row = res.rows[0];
    const totalEntries = parseInt(row.total_entries || "0");
    const entriesWithHits = parseInt(row.entries_with_hits || "0");

    // Domain breakdown
    const domainRes = await pool.query(
      `SELECT domain, COUNT(*) as count, AVG(gi_score) as avg_gi
       FROM echo_layer_entries
       WHERE status = 'active'
       GROUP BY domain`
    );

    const domainBreakdown: Record<string, { hitRate: number; count: number }> = {};
    for (const dRow of domainRes.rows) {
      domainBreakdown[dRow.domain] = {
        hitRate: parseFloat(dRow.avg_gi || "0"),
        count: parseInt(dRow.count || "0")
      };
    }

    return {
      hitRate: totalEntries > 0 ? entriesWithHits / totalEntries : 0,
      totalEntries,
      avgGIScore: parseFloat(row.avg_gi_score || "0"),
      domainBreakdown
    };
  } catch (error) {
    console.error("[ECHO Cache] Error fetching stats:", error);
    return {
      hitRate: 0,
      totalEntries: 0,
      avgGIScore: 0,
      domainBreakdown: {}
    };
  }
}

