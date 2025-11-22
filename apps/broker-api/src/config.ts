export const config = {
  port: Number(process.env.PORT ?? 4005),
  giMin: Number(process.env.GI_MIN ?? 0.95),
  antigravity: {
    enabled: process.env.ANTIGRAVITY_ENABLED === 'true',
    url: process.env.ANTIGRAVITY_URL ?? 'http://localhost:12000',
    apiKey: process.env.ANTIGRAVITY_API_KEY ?? ''
  }
} as const;
