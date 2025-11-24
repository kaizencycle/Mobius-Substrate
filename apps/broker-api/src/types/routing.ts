export type EngineId =
  | 'local'
  | 'antigravity'
  | 'openai'
  | 'claude'
  | 'deepseek';

export type RoutingMode =
  | 'local'
  | 'antigravity-first'
  | 'antigravity-only'
  | 'multi-engine';

export type SafetyLevel = 'low' | 'medium' | 'high';

export interface EngineResult {
  engineId: EngineId;
  answer: string;
  toolTraces?: any[];
  riskFlags: string[];
  latencyMs: number;
  meta?: Record<string, unknown>;
}
