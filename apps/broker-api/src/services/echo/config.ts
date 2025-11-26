// ECHO Layer Configuration
// Epistemic Cache & Heuristic Orchestrator
// Mobius Systems - Constitutional Knowledge Substrate

// ============================================================================
// GI (Global Integrity) Thresholds
// ============================================================================

/** Threshold for exact cache reuse - very high confidence required */
export const GI_STRICT_THRESHOLD = 0.97;

/** Minimum GI to write into cache or serve from semantic match */
export const GI_BASELINE = 0.95;

/** Below this GI, answers are routed to human review */
export const GI_HUMAN_REVIEW_THRESHOLD = 0.93;

/** Critical threshold - below this, answers are blocked entirely */
export const GI_BLOCK_THRESHOLD = 0.70;

// ============================================================================
// Semantic Search Configuration
// ============================================================================

/** Minimum cosine similarity for semantic cache reuse */
export const SIMILARITY_MIN = 0.90;

/** Similarity threshold for "near match" suggestions */
export const SIMILARITY_SUGGEST = 0.80;

/** Embedding dimension (OpenAI ada-002 compatible) */
export const EMBEDDING_DIMENSION = 1536;

// ============================================================================
// Locale & Domain Defaults
// ============================================================================

export const DEFAULT_LOCALE = "en-US";
export const DEFAULT_DOMAIN = "general";

// ============================================================================
// Freshness Configuration
// ============================================================================

export type FreshnessTag = 
  | "static"      // Immutable facts (laws of physics, historical dates)
  | "law"         // Legal/policy content (changes with legislation)
  | "civic"       // Government positions, policies (election cycles)
  | "news"        // Current events (changes daily)
  | "general";    // Default category

/** Days until cache entry requires revalidation */
export const FRESHNESS_RULES: Record<FreshnessTag, number> = {
  static: 365,    // 1 year
  law: 30,        // 1 month
  civic: 90,      // 3 months (election cycle sensitive)
  news: 3,        // 3 days
  general: 90,    // 3 months default
};

// ============================================================================
// Sentinel Configuration
// ============================================================================

export type SentinelName = 
  | "claude"
  | "gpt"
  | "gemini"
  | "deepseek"
  | "mistral"
  | "local";

/** Primary sentinels for dual-answer phase */
export const PRIMARY_SENTINELS: [SentinelName, SentinelName] = ["claude", "gpt"];

/** Default validator sentinel */
export const VALIDATOR_SENTINEL: SentinelName = "gemini";

/** Fallback sentinels for DriftGuard */
export const FALLBACK_SENTINELS: SentinelName[] = ["deepseek", "mistral"];

/** Maximum retries per sentinel */
export const SENTINEL_MAX_RETRIES = 2;

/** Timeout per sentinel call (ms) */
export const SENTINEL_TIMEOUT_MS = 30000;

// ============================================================================
// Cache Configuration
// ============================================================================

/** Maximum age for cache entries before forced revalidation (ms) */
export const MAX_CACHE_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** Maximum entries to validate per batch */
export const VALIDATION_BATCH_SIZE = 50;

/** Rate limit for cache writes (per minute) */
export const CACHE_WRITE_RATE_LIMIT = 100;

// ============================================================================
// DriftGuard Configuration
// ============================================================================

/** Minimum GI before DriftGuard activates */
export const DRIFT_GUARD_GI_THRESHOLD = 0.93;

/** Drift severity threshold for automatic reversion */
export const DRIFT_REVERT_THRESHOLD = 0.7;

/** Drift severity threshold for human review */
export const DRIFT_REVIEW_THRESHOLD = 0.4;

// Export for backward compatibility
export const DRIFT_GUARD_ENABLED = true;

// ============================================================================
// Human Review Configuration
// ============================================================================

/** Maximum pending reviews before alerting */
export const HUMAN_REVIEW_ALERT_THRESHOLD = 100;

/** Days before stale review escalation */
export const HUMAN_REVIEW_STALE_DAYS = 7;

// ============================================================================
// Monitoring Configuration
// ============================================================================

/** Stats aggregation interval (ms) */
export const STATS_INTERVAL_MS = 1000 * 60 * 60; // 1 hour

/** Minimum cache hit rate before alerting */
export const CACHE_HIT_RATE_ALERT_THRESHOLD = 0.3;

/** Maximum hallucination rate before alerting */
export const HALLUCINATION_RATE_ALERT_THRESHOLD = 0.05;

// ============================================================================
// API Configuration
// ============================================================================

export const API_BASE_PATH = "/api/echo";
export const API_VERSION = "v1";

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  /** Enable semantic cache lookup */
  SEMANTIC_CACHE_ENABLED: true,
  
  /** Enable DriftGuard fallback sentinels */
  DRIFT_GUARD_ENABLED: true,
  
  /** Enable automatic cache writes */
  AUTO_CACHE_WRITE_ENABLED: true,
  
  /** Enable Civic Ledger attestation */
  LEDGER_ATTESTATION_ENABLED: true,
  
  /** Enable human review queue */
  HUMAN_REVIEW_ENABLED: true,
  
  /** Enable stats collection */
  STATS_COLLECTION_ENABLED: true,
};

