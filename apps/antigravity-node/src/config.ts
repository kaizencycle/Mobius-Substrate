export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 12000),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    modelId: process.env.GEMINI_MODEL_ID ?? 'gemini-3.0-antigravity',
    endpoint: process.env.GEMINI_ENDPOINT ?? 'https://generativelanguage.googleapis.com/v1beta/antigravity:lift'
  },
  broker: {
    url: process.env.BROKER_API_URL ?? 'http://localhost:4005',
    apiKey: process.env.BROKER_API_KEY ?? '',
    enabled: process.env.BROKER_NOTIFICATIONS !== 'false'
  }
} as const;

export function ensureConfig() {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }
}
