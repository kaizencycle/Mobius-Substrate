export const antigravityConfig = {
  enabled: process.env.ANTIGRAVITY_ENABLED === 'true',
  url: process.env.ANTIGRAVITY_URL ?? '',
  apiKey: process.env.ANTIGRAVITY_API_KEY ?? '',
  timeoutMs: Number(process.env.ANTIGRAVITY_TIMEOUT_MS ?? 20_000)
} as const;

export const INTEGRITY_TIER_ENABLED = process.env.INTEGRITY_TIER_ENABLED === 'true';
export const INTEGRITY_TIER_URL =
  process.env.INTEGRITY_TIER_URL || 'http://integrity-tier-service:4600';

export const config = {
  port: Number(process.env.PORT ?? 4005),
  giMin: Number(process.env.GI_MIN ?? 0.95),
  antigravity: antigravityConfig
} as const;
