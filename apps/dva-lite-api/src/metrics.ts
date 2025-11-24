import type { Request, Response } from 'express';
import client from 'prom-client';
import type { GiSnapshot } from './services/giSnapshot';

export const registry = new client.Registry();

client.collectDefaultMetrics({
  register: registry,
});

const ENGINE_IDS = ['openai', 'claude', 'deepseek', 'gemini', 'local-sentinel', 'other'] as const;
const ROUTING_MODES = ['local', 'antigravity-first', 'antigravity-only', 'multi-engine'] as const;
const DECISION_LABELS = ['ok', 'needs_human_review', 'reject'] as const;
const ALERT_TYPES = ['gi_breach', 'engine_failure', 'latency_spike', 'config_change'] as const;
const ERROR_TYPES = ['timeout', 'http_error', 'parse_error', 'other'] as const;
const TREND_TO_VALUE = {
  up: 1,
  flat: 0,
  down: -1,
} as const;

export type EngineId = (typeof ENGINE_IDS)[number];
export type RoutingMode = (typeof ROUTING_MODES)[number];
export type DecisionLabel = (typeof DECISION_LABELS)[number];
export type AlertType = (typeof ALERT_TYPES)[number];
export type ErrorType = (typeof ERROR_TYPES)[number];
export type ThresholdSeverity = 'warning' | 'critical';

const baseOptions = {
  registers: [registry],
};

export const miiCurrent = new client.Gauge({
  ...baseOptions,
  name: 'mobius_mii_current',
  help: 'Current Mobius Integrity Index (MII)',
});

export const miiTrend = new client.Gauge({
  ...baseOptions,
  name: 'mobius_mii_trend',
  help: 'Trend of MII: -1 down, 0 flat, 1 up, labeled by direction',
  labelNames: ['direction'] as const,
});

export const miiThreshold = new client.Gauge({
  ...baseOptions,
  name: 'mobius_mii_threshold',
  help: 'Configured MII threshold for safe operation',
});

export const miiThresholdBreach = new client.Counter({
  ...baseOptions,
  name: 'mobius_mii_threshold_breach_total',
  help: 'Number of times the configured MII threshold was breached',
  labelNames: ['severity'] as const,
});

export const deliberationTotal = new client.Counter({
  ...baseOptions,
  name: 'mobius_deliberation_total',
  help: 'Total deliberations handled by the broker',
  labelNames: ['routing_mode', 'decision'] as const,
});

export const deliberationGiScore = new client.Histogram({
  ...baseOptions,
  name: 'mobius_deliberation_gi_score',
  help: 'GI score distribution for deliberations',
  labelNames: ['routing_mode'] as const,
  buckets: [0.0, 0.8, 0.9, 0.95, 0.98, 1.0],
});

export const engineRequestTotal = new client.Counter({
  ...baseOptions,
  name: 'mobius_engine_request_total',
  help: 'Engine request volume by routing mode',
  labelNames: ['engine_id', 'routing_mode'] as const,
});

export const engineErrorTotal = new client.Counter({
  ...baseOptions,
  name: 'mobius_engine_error_total',
  help: 'Engine-level errors (timeouts, 5xx, parse failures)',
  labelNames: ['engine_id', 'error_type'] as const,
});

export const engineLatencyMs = new client.Histogram({
  ...baseOptions,
  name: 'mobius_engine_latency_ms',
  help: 'Latency distribution per engine (milliseconds)',
  labelNames: ['engine_id'] as const,
  buckets: [50, 100, 250, 500, 1_000, 2_000, 5_000],
});

export const alertTotal = new client.Counter({
  ...baseOptions,
  name: 'mobius_alert_total',
  help: 'Alerts fired by DVA.LITE',
  labelNames: ['alert_type'] as const,
});

export const safeModeEnabled = new client.Gauge({
  ...baseOptions,
  name: 'mobius_safe_mode_enabled',
  help: 'Safe mode flag (0=off, 1=on)',
});

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set('Content-Type', registry.contentType);
  res.send(await registry.metrics());
}

export function recordIntegritySnapshot(snapshot: GiSnapshot, threshold: number): void {
  miiCurrent.set(snapshot.mii);
  miiThreshold.set(threshold);

  (Object.keys(TREND_TO_VALUE) as Array<keyof typeof TREND_TO_VALUE>).forEach((direction) => {
    const value = snapshot.trend === direction ? TREND_TO_VALUE[direction] : 0;
    miiTrend.labels(direction).set(value);
  });
}

export function recordSafeMode(enabled: boolean): void {
  safeModeEnabled.set(enabled ? 1 : 0);
}

export function recordThresholdBreach(severity: ThresholdSeverity): void {
  miiThresholdBreach.labels(severity).inc();
}

export function recordAlert(alertType: AlertType): void {
  alertTotal.labels(alertType).inc();
}
