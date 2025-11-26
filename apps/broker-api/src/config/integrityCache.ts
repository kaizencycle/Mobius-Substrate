/**
 * ECHO Layer Configuration
 * Epistemically Cached Heuristic Outcomes - thresholds and policies for Mobius Systems
 */

export const GI_STRICT_THRESHOLD = 0.97;  // Exact cache reuse threshold
export const GI_BASELINE = 0.95;          // Minimum GI to write into cache
export const SIMILARITY_MIN = 0.90;       // Semantic reuse threshold (cosine similarity)
export const DEFAULT_LOCALE = "en-US";

export type FreshnessTag = "static" | "law" | "news" | "general";

export const FRESHNESS_RULES: Record<FreshnessTag, number> = {
  static: 365,   // days
  law: 30,
  news: 3,
  general: 90,
};

export const MAX_STALENESS_DAYS = 730; // Super-static facts can last up to 2 years

/**
 * Infer freshness tag from domain
 */
export function inferFreshnessTag(domain: string): FreshnessTag {
  if (domain === "law" || domain === "policy" || domain === "legal") {
    return "law";
  }
  if (domain === "news" || domain === "current_events") {
    return "news";
  }
  if (domain === "physics" || domain === "math" || domain === "science" || domain === "hive_lore") {
    return "static";
  }
  return "general";
}

/**
 * Compute valid_until timestamp based on freshness tag
 */
export function computeValidUntil(tag: FreshnessTag | null): Date | null {
  if (!tag) return null;
  const days = FRESHNESS_RULES[tag];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

