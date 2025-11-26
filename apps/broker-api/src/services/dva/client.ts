// apps/broker-api/src/services/dva/client.ts
// DVA.LITE Telemetry Client

export interface DVAEvent {
  type: "gi_score" | "consensus" | "drift" | "validation" | "security";
  timestamp: string;
  agent: string;
  metrics: Record<string, number>;
  metadata?: Record<string, any>;
}

export interface DVAMetricsBatch {
  events: DVAEvent[];
  timestamp: string;
  source: string;
}

let metricsBuffer: DVAEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;
const FLUSH_INTERVAL = 10000; // 10 seconds
const MAX_BUFFER_SIZE = 100;

/**
 * Publishes a single metric event
 */
export async function publishDVAMetric(event: DVAEvent): Promise<void> {
  metricsBuffer.push(event);
  
  // Flush if buffer is full
  if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
    await flushMetrics();
  } else {
    // Schedule flush if not already scheduled
    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flushMetrics().catch(console.error);
      }, FLUSH_INTERVAL);
    }
  }
}

/**
 * Flushes buffered metrics to DVA.LITE
 */
async function flushMetrics(): Promise<void> {
  if (metricsBuffer.length === 0) return;
  
  const dvaUrl = process.env.DVA_LITE_URL;
  const dvaKey = process.env.DVA_LITE_API_KEY;
  
  if (!dvaUrl || !dvaKey) {
    console.warn("[DVA.LITE] Not configured, discarding metrics");
    metricsBuffer = [];
    return;
  }

  const batch: DVAMetricsBatch = {
    events: metricsBuffer,
    timestamp: new Date().toISOString(),
    source: "echo-layer"
  };

  try {
    const response = await fetch(`${dvaUrl}/api/v1/metrics/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": dvaKey,
        "User-Agent": "mobius-echo/1.0"
      },
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      throw new Error(`DVA.LITE returned ${response.status}`);
    }

    console.log(`[DVA.LITE] Flushed ${metricsBuffer.length} metrics`);
    metricsBuffer = [];
    
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  } catch (error) {
    console.error("[DVA.LITE] Failed to flush metrics:", error);
    // Don't clear buffer - will retry next flush
  }
}

/**
 * Tracks a GI score event
 */
export async function trackGIScore(
  query: string,
  giScore: number,
  agreement: number,
  sourceQuality: number,
  processingTimeMs: number
): Promise<void> {
  await publishDVAMetric({
    type: "gi_score",
    timestamp: new Date().toISOString(),
    agent: "echo-consensus",
    metrics: {
      gi_score: giScore,
      consensus_agreement: agreement,
      source_quality: sourceQuality,
      processing_time_ms: processingTimeMs
    },
    metadata: {
      query_preview: query.substring(0, 100)
    }
  });
}

/**
 * Tracks a drift event
 */
export async function trackDrift(
  baselineGI: number,
  correctedGI: number,
  severity: "minor" | "moderate" | "major"
): Promise<void> {
  await publishDVAMetric({
    type: "drift",
    timestamp: new Date().toISOString(),
    agent: "drift-guard",
    metrics: {
      baseline_gi: baselineGI,
      corrected_gi: correctedGI,
      drift_severity: severity === "minor" ? 0.05 : severity === "moderate" ? 0.1 : 0.2
    }
  });
}

/**
 * Tracks a consensus formation
 */
export async function trackConsensus(
  sentinelCount: number,
  avgConfidence: number,
  processingTimeMs: number
): Promise<void> {
  await publishDVAMetric({
    type: "consensus",
    timestamp: new Date().toISOString(),
    agent: "consensus-engine",
    metrics: {
      sentinel_count: sentinelCount,
      avg_confidence: avgConfidence,
      processing_time_ms: processingTimeMs
    }
  });
}

/**
 * Tracks memory validation results
 */
export async function trackMemoryValidation(stats: {
  validated: number;
  updated: number;
  failed: number;
  humanReviewRequired: number;
}): Promise<void> {
  await publishDVAMetric({
    type: "validation",
    timestamp: new Date().toISOString(),
    agent: "memory-validator",
    metrics: {
      entries_validated: stats.validated,
      entries_updated: stats.updated,
      entries_failed: stats.failed,
      entries_human_review: stats.humanReviewRequired
    }
  });
}

/**
 * Tracks security events
 */
export async function trackSecurityEvent(
  eventType: string,
  severity: string,
  giScore?: number
): Promise<void> {
  await publishDVAMetric({
    type: "security",
    timestamp: new Date().toISOString(),
    agent: "security-monitor",
    metrics: {
      severity_score: severity === "critical" ? 1.0 : severity === "high" ? 0.75 : 
                     severity === "medium" ? 0.5 : 0.25,
      gi_score: giScore || 0
    },
    metadata: {
      event_type: eventType
    }
  });
}

