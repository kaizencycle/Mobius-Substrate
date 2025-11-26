// apps/broker-api/src/services/echo/driftGuard.ts
// DriftGuard: Fallback validation for low-confidence answers

const FALLBACK_SENTINELS = ["atlas", "aurea"] as const;
const DRIFT_GUARD_GI_THRESHOLD = 0.85;
const DRIFT_REVERT_THRESHOLD = 0.15;
const DRIFT_REVIEW_THRESHOLD = 0.10;

import { computeEchoConsensus, EchoConsensusResult, SentinelResult } from "./consensus";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Mock sentinel client - replace with actual implementation
async function callSentinel(sentinelName: string, query: string, context: any): Promise<SentinelResult> {
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

export interface DriftGuardOptions {
  query: string;
  context?: any;
  enableFallback?: boolean;
}

/**
 * DriftGuard: Validates baseline consensus with additional sentinels
 * Activates when GI is borderline or sources are weak
 */
export async function runDriftGuard(
  baseline: EchoConsensusResult,
  options: DriftGuardOptions
): Promise<EchoConsensusResult> {
  const { query, context = {}, enableFallback = true } = options;

  // Check if DriftGuard is needed
  const hasSources = baseline.sources.length > 0;
  const hasHighConfidence = baseline.sentinels.some(s => s.confidence >= 0.95);

  if (baseline.giScore >= DRIFT_GUARD_GI_THRESHOLD && hasSources && hasHighConfidence) {
    // Baseline is strong enough - no DriftGuard needed
    return baseline;
  }

  if (!enableFallback) {
    // DriftGuard disabled - return baseline with warning
    console.warn(`[DriftGuard] Skipped for query: ${query.substring(0, 50)}...`);
    return baseline;
  }

  console.log(`[DriftGuard] Activating for query: ${query.substring(0, 50)}...`, {
    giScore: baseline.giScore,
    sources: baseline.sources.length,
    hasHighConfidence
  });

  // Call fallback sentinels
  const fallbackResults = await Promise.allSettled(
    FALLBACK_SENTINELS.map(async (sentinelName) => {
      try {
        const result = await callSentinel(sentinelName, query, {
          ...context,
          baselineAnswer: baseline.answer,
          baselineSources: baseline.sources
        });
        return {
          name: sentinelName,
          answer: result.answer,
          confidence: result.confidence ?? 0.85,
          sources: result.sources ?? [],
          vote: result.vote,
          reasoning: result.reasoning,
          isFallback: true
        } as SentinelResult;
      } catch (error) {
        console.warn(`[DriftGuard] Fallback sentinel ${sentinelName} failed: ${error}`);
        return null;
      }
    })
  );

  const validResults = fallbackResults
    .filter((r): r is PromiseFulfilledResult<SentinelResult | null> => r.status === "fulfilled")
    .map(r => r.value)
    .filter(Boolean) as SentinelResult[];

  if (validResults.length === 0) {
    // No fallback sentinels available - return baseline
    console.warn("[DriftGuard] No fallback sentinels succeeded");
    return baseline;
  }

  // Combine baseline with fallback results
  const allSentinels = [...baseline.sentinels, ...validResults];

  // Recompute consensus with expanded sentinel set
  const corrected = computeEchoConsensus(allSentinels);

  // Analyze drift severity
  const driftSeverity = Math.abs(corrected.giScore - baseline.giScore);
  
  if (driftSeverity > DRIFT_REVERT_THRESHOLD) {
    // Major divergence detected
    console.error("[DriftGuard] Major drift detected!", {
      query: query.substring(0, 50),
      baselineGI: baseline.giScore,
      correctedGI: corrected.giScore,
      severity: driftSeverity
    });
    // Flag for immediate human review
    await flagForUrgentReview({
      query,
      baseline,
      corrected,
      severity: "major",
      reason: `DriftGuard detected major divergence: ${driftSeverity.toFixed(3)}`
    });
  } else if (driftSeverity > DRIFT_REVIEW_THRESHOLD) {
    // Moderate divergence
    console.warn("[DriftGuard] Moderate drift detected", {
      severity: driftSeverity
    });
    // Log for monitoring
    await logDriftEvent({
      query,
      baseline,
      corrected,
      severity: "moderate"
    });
  }

  return corrected;
}

/**
 * Runs drift detection on a batch of cached answers
 */
export async function detectCacheDrift(batchSize: number = 100): Promise<{
  drifted: Array<{ query: string; severity: number }>;
  totalChecked: number;
}> {
  const { rows } = await pool.query(
    `SELECT canonical_key, question_raw, gi_score, sources_json
     FROM echo_layer_entries
     WHERE status = 'active'
       AND valid_until > NOW()
     ORDER BY random()
     LIMIT $1`,
    [batchSize]
  );

  const drifted = [];
  for (const row of rows) {
    const parsedSources = JSON.parse(row.sources_json || "[]");
    
    // Simulate what DriftGuard would do
    const hasRecentSources = parsedSources.some((s: any) => {
      const sourceAge = Date.now() - new Date(s.timestamp || 0).getTime();
      return sourceAge < 1000 * 60 * 60 * 24 * 30; // Within 30 days
    });
    if (row.gi_score < DRIFT_GUARD_GI_THRESHOLD && !hasRecentSources) {
      drifted.push({
        query: row.question_raw,
        severity: DRIFT_GUARD_GI_THRESHOLD - row.gi_score
      });
    }
  }

  return {
    drifted,
    totalChecked: rows.length
  };
}

/**
 * Flags for urgent human review
 */
async function flagForUrgentReview(data: any): Promise<void> {
  // TODO: Create urgent_review_queue table if needed
  try {
    await pool.query(
      `INSERT INTO human_review_queue (deliberation_id, question, answer_candidate, gi_score, priority, status)
       VALUES ($1, $2, $3, $4, 'critical', 'pending')`,
      [
        `urgent-${Date.now()}`,
        data.query,
        data.corrected?.answer || data.baseline?.answer,
        data.corrected?.giScore || data.baseline?.giScore
      ]
    );
  } catch (error) {
    console.error("[DriftGuard] Failed to flag for urgent review:", error);
  }
  
  // Alert DVA.LITE
  if (process.env.DVA_LITE_URL) {
    await fetch(`${process.env.DVA_LITE_URL}/alert`, {
      method: "POST",
      body: JSON.stringify({
        type: "drift_guard_major",
        data,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {});
  }
}

/**
 * Logs drift events for trend analysis
 */
async function logDriftEvent(event: any): Promise<void> {
  // TODO: Create drift_events table if needed
  console.log("[DriftGuard] Drift event logged", {
    severity: event.severity,
    query: event.query?.substring(0, 50)
  });
}

