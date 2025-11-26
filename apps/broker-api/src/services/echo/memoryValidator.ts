// apps/broker-api/src/services/echo/memoryValidator.ts
// ECHO Memory Validator
// Periodically revalidates cache entries to prevent epistemic rot

import { Pool } from "pg";
import { 
  MAX_STALENESS_DAYS,
  FRESHNESS_RULES,
  DEFAULT_LOCALE
} from "../../config/integrityCache";
import { runEchoReview } from "./reviewEngine";
import { getStaleEchoCacheEntries, updateEchoCacheEntry } from "./cache";

const VALIDATION_BATCH_SIZE = 100;
const MAX_CACHE_AGE_MS = MAX_STALENESS_DAYS * 24 * 60 * 60 * 1000;

/**
 * Validates a batch of stale cache entries
 */
export async function validateEchoMemoryBatch(limit: number = VALIDATION_BATCH_SIZE): Promise<{
  validated: number;
  updated: number;
  failed: number;
  humanReviewRequired: number;
}> {
  console.log(`[ECHO Memory Validator] Starting batch validation (limit: ${limit})`);
  const staleEntries = await getStaleEchoCacheEntries(limit);
  
  const stats = {
    validated: 0,
    updated: 0,
    failed: 0,
    humanReviewRequired: 0
  };

  for (const entry of staleEntries) {
    try {
      stats.validated++;
      
      // Re-run ECHO review on the same question
      const result = await runEchoReview(entry.question_raw, {
        domain: entry.domain,
        locale: entry.locale || DEFAULT_LOCALE
      }, {
        cacheKey: entry.canonical_key,
        enableValidation: true,
        domain: entry.domain
      });

      if (result.status === "APPROVED") {
        // Update cache with new consensus
        await updateEchoCacheEntry(entry.canonical_key, {
          answer_text: result.consensus.answer,
          gi_score: result.consensus.giScore,
          sources_json: JSON.stringify(result.consensus.sources),
          sentinels_json: JSON.stringify(result.consensus.sentinels)
        } as any);

        stats.updated++;
        
        console.log(`[ECHO Memory Validator] Updated: ${entry.question_raw.substring(0, 50)}...`);
      } else if (result.status === "HUMAN_REVIEW_REQUIRED") {
        // Flag for human review
        await markCacheEntryForReview(entry.canonical_key, result.consensus);
        
        stats.humanReviewRequired++;
        
        console.warn(`[ECHO Memory Validator] Human review needed: ${entry.question_raw.substring(0, 50)}...`);
      }
    } catch (error) {
      stats.failed++;
      console.error(`[ECHO Memory Validator] Failed for entry ${entry.canonical_key}:`, error);
    }
    
    // Rate limiting - small delay between validations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`[ECHO Memory Validator] Batch complete:`, stats);
  return stats;
}

/**
 * Runs the memory validator on a schedule
 */
export async function startMemoryValidator(scheduleMs: number = MAX_CACHE_AGE_MS): Promise<void> {
  console.log(`[ECHO Memory Validator] Starting scheduled validator (interval: ${scheduleMs}ms)`);
  
  // Run immediately
  await validateEchoMemoryBatch();
  
  // Set up interval
  setInterval(async () => {
    try {
      await validateEchoMemoryBatch();
    } catch (error) {
      console.error("[ECHO Memory Validator] Scheduled validation failed:", error);
    }
  }, scheduleMs);
}

/**
 * Gets validation statistics
 */
export async function getMemoryValidatorStats(): Promise<{
  totalValidated: number;
  totalUpdated: number;
  totalFailed: number;
  avgProcessingTimeMs: number;
}> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Create validation log table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS echo_validation_log (
        id SERIAL PRIMARY KEY,
        canonical_key TEXT NOT NULL,
        status TEXT NOT NULL,
        processing_time_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const { rows } = await pool.query(
      `SELECT 
          COUNT(*) as total_validated,
          COUNT(CASE WHEN status = 'updated' THEN 1 END) as total_updated,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as total_failed,
          AVG(processing_time_ms) as avg_processing_time_ms
       FROM echo_validation_log
       WHERE created_at > NOW() - INTERVAL '30 days'`
    );

    return {
      totalValidated: parseInt(rows[0]?.total_validated || "0"),
      totalUpdated: parseInt(rows[0]?.total_updated || "0"),
      totalFailed: parseInt(rows[0]?.total_failed || "0"),
      avgProcessingTimeMs: parseFloat(rows[0]?.avg_processing_time_ms || "0")
    };
  } catch (error) {
    console.error("[Memory Validator] Failed to get stats:", error);
    return {
      totalValidated: 0,
      totalUpdated: 0,
      totalFailed: 0,
      avgProcessingTimeMs: 0
    };
  }
}

/**
 * Marks a cache entry as needing human review
 */
async function markCacheEntryForReview(
  canonicalKey: string,
  consensus: any
): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    await pool.query(
      `UPDATE echo_layer_entries
       SET status = 'review_required',
           updated_at = NOW()
       WHERE canonical_key = $1`,
      [canonicalKey]
    );
  } catch (error) {
    console.error("[Memory Validator] Failed to mark for review:", error);
  }
}

