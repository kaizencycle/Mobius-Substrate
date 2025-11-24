export const config = {
  port: Number(process.env.PORT ?? 8088),
  ledgerBaseUrl: process.env.LEDGER_BASE_URL ?? 'http://localhost:4006',
  brokerMetricsUrl: process.env.BROKER_METRICS_URL,
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL,
  metricsRefreshMs: Number(process.env.METRICS_REFRESH_MS ?? 30_000),
  miiThreshold: Number(process.env.MII_THRESHOLD ?? 0.95),
  safeModeDefault: process.env.SAFE_MODE_ENABLED === 'true',
};
