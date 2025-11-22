export type SafetyLevel = 'low' | 'medium' | 'high';

export interface LiftRequest {
  taskId: string;
  intent: string;
  context?: Record<string, unknown>;
  allowedTools?: string[];
  safetyLevel?: SafetyLevel;
}

export interface ToolTrace {
  toolName: string;
  input: unknown;
  output: unknown;
  durationMs: number;
}

export interface LiftResult {
  taskId: string;
  answer: string;
  toolTraces: ToolTrace[];
  riskFlags: string[];
  rawModelMeta?: Record<string, unknown>;
}

export interface LiftErrorPayload {
  error: string;
  issues?: string[];
}
