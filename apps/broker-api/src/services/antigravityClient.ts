import axios from 'axios';
import { config } from '../config';

export type RoutingMode = 'local' | 'antigravity-first' | 'antigravity-only';

export interface AntigravityLiftRequest {
  taskId: string;
  intent: string;
  context?: Record<string, unknown>;
  allowedTools?: string[];
  safetyLevel?: 'low' | 'medium' | 'high';
}

export interface AntigravityToolTrace {
  toolName: string;
  input: unknown;
  output: unknown;
  durationMs: number;
}

export interface AntigravityLiftResult {
  taskId: string;
  answer: string;
  toolTraces: AntigravityToolTrace[];
  riskFlags: string[];
  rawModelMeta?: Record<string, unknown>;
}

export async function callAntigravityLift(payload: AntigravityLiftRequest): Promise<AntigravityLiftResult> {
  if (!config.antigravity.enabled) {
    throw new Error('Antigravity integration is disabled');
  }

  const response = await axios.post<AntigravityLiftResult>(
    `${config.antigravity.url}/v1/antigravity/lift`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(config.antigravity.apiKey ? { Authorization: `Bearer ${config.antigravity.apiKey}` } : {})
      },
      timeout: 90_000
    }
  );

  return response.data;
}
