// apps/broker-api/src/config/echo.ts
// ECHO Layer Configuration

export const ECHO_CONFIG = {
  // Sentinels
  PRIMARY_SENTINELS: ["claude-sonnet", "gpt-4"] as const,
  VALIDATOR_SENTINEL: "gemini-pro" as const,
  FALLBACK_SENTINELS: ["deepseek", "gpt-4-turbo"] as const,
  
  // GI Thresholds
  GI_BASELINE: 0.70,
  GI_HUMAN_REVIEW_THRESHOLD: 0.85,
  GI_STRICT_THRESHOLD: 0.93,
  
  // Drift Guard
  DRIFT_GUARD_GI_THRESHOLD: 0.80,
  DRIFT_REVERT_THRESHOLD: 0.15,
  DRIFT_REVIEW_THRESHOLD: 0.08,
  
  // Cache
  MAX_CACHE_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  VALIDATION_BATCH_SIZE: 100,
  
  // Freshness Rules (days)
  FRESHNESS_RULES: {
    "breaking-news": 1,
    "medical": 30,
    "legal": 90,
    "scientific": 180,
    "historical": 365,
    "general": 90
  } as Record<string, number>,
  
  // Embeddings
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSION: 1536,
  
  // Timeouts
  SENTINEL_TIMEOUT_MS: 30000,
  SENTINEL_MAX_RETRIES: 3,
  
  // Locale
  DEFAULT_LOCALE: "en-US"
} as const;

export type SentinelName = 
  | typeof ECHO_CONFIG.PRIMARY_SENTINELS[number] 
  | typeof ECHO_CONFIG.VALIDATOR_SENTINEL
  | typeof ECHO_CONFIG.FALLBACK_SENTINELS[number];

