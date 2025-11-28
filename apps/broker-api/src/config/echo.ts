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

// Export individual constants for backward compatibility
export const GI_BASELINE = ECHO_CONFIG.GI_BASELINE;
export const GI_HUMAN_REVIEW_THRESHOLD = ECHO_CONFIG.GI_HUMAN_REVIEW_THRESHOLD;
export const GI_STRICT_THRESHOLD = ECHO_CONFIG.GI_STRICT_THRESHOLD;
export const DRIFT_GUARD_GI_THRESHOLD = ECHO_CONFIG.DRIFT_GUARD_GI_THRESHOLD;
export const DRIFT_REVERT_THRESHOLD = ECHO_CONFIG.DRIFT_REVERT_THRESHOLD;
export const DRIFT_REVIEW_THRESHOLD = ECHO_CONFIG.DRIFT_REVIEW_THRESHOLD;
export const MAX_CACHE_AGE_MS = ECHO_CONFIG.MAX_CACHE_AGE_MS;
export const VALIDATION_BATCH_SIZE = ECHO_CONFIG.VALIDATION_BATCH_SIZE;
export const FRESHNESS_RULES = ECHO_CONFIG.FRESHNESS_RULES;
export const EMBEDDING_MODEL = ECHO_CONFIG.EMBEDDING_MODEL;
export const EMBEDDING_DIMENSION = ECHO_CONFIG.EMBEDDING_DIMENSION;
export const SENTINEL_TIMEOUT_MS = ECHO_CONFIG.SENTINEL_TIMEOUT_MS;
export const SENTINEL_MAX_RETRIES = ECHO_CONFIG.SENTINEL_MAX_RETRIES;
export const DEFAULT_LOCALE = ECHO_CONFIG.DEFAULT_LOCALE;

// Similarity threshold for semantic matching
export const SIMILARITY_MIN = 0.85;

// Freshness tag type
export type FreshnessTag = keyof typeof ECHO_CONFIG.FRESHNESS_RULES;

/**
 * Infer freshness tag from domain/context
 */
export function inferFreshnessTag(domain?: string): FreshnessTag {
  if (!domain) return "general";

  const lowerDomain = domain.toLowerCase();

  if (lowerDomain.includes("news") || lowerDomain.includes("breaking")) {
    return "breaking-news";
  }
  if (lowerDomain.includes("medical") || lowerDomain.includes("health")) {
    return "medical";
  }
  if (lowerDomain.includes("legal") || lowerDomain.includes("law")) {
    return "legal";
  }
  if (lowerDomain.includes("scientific") || lowerDomain.includes("research")) {
    return "scientific";
  }
  if (lowerDomain.includes("historical") || lowerDomain.includes("history")) {
    return "historical";
  }

  return "general";
}

/**
 * Compute valid_until timestamp based on freshness tag
 */
export function computeValidUntil(freshnessTag: FreshnessTag): Date {
  const daysValid = FRESHNESS_RULES[freshnessTag];
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + daysValid);
  return validUntil;
}

