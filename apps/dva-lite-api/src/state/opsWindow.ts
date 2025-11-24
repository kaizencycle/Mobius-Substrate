import type { AlertType, DecisionLabel, EngineId } from '../metrics';

type DecisionSummary = {
  ok: number;
  needsHumanReview: number;
  reject: number;
};

type OpsWindow = {
  alerts: number;
  avgLatencyMs: Record<EngineId, number>;
  decisions: DecisionSummary;
};

const ENGINE_IDS: EngineId[] = ['openai', 'claude', 'deepseek', 'gemini', 'local-sentinel', 'other'];

const windowState: OpsWindow = {
  alerts: 0,
  avgLatencyMs: ENGINE_IDS.reduce(
    (acc, engine) => ({ ...acc, [engine]: 0 }),
    {} as Record<EngineId, number>,
  ),
  decisions: {
    ok: 0,
    needsHumanReview: 0,
    reject: 0,
  },
};

const decisionKeyMap: Record<DecisionLabel, keyof DecisionSummary> = {
  ok: 'ok',
  needs_human_review: 'needsHumanReview',
  reject: 'reject',
};

export function incrementAlertTally(_type?: AlertType): void {
  windowState.alerts += 1;
}

export function incrementDecision(decision: DecisionLabel, count = 1): void {
  const key = decisionKeyMap[decision];
  windowState.decisions[key] += count;
}

export function updateEngineLatency(engine: EngineId, latencyMs: number): void {
  windowState.avgLatencyMs[engine] = latencyMs;
}

export function getOpsWindowSnapshot(): OpsWindow {
  return {
    alerts: windowState.alerts,
    avgLatencyMs: { ...windowState.avgLatencyMs },
    decisions: { ...windowState.decisions },
  };
}
