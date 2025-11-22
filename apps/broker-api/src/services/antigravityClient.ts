import axios from 'axios';
import { antigravityConfig } from '../config';

export type AntigravitySafetyLevel = 'low' | 'medium' | 'high';

export interface AntigravityToolTrace {
  toolName: string;
  input: unknown;
  output: unknown;
  startedAt: string;
  finishedAt: string;
  latencyMs?: number;
}

export interface AntigravityLiftRequest {
  prompt: string;
  allowedTools?: string[];
  safetyLevel?: AntigravitySafetyLevel;
  metadata?: Record<string, unknown>;
}

export interface AntigravityLiftResponse {
  provider: 'antigravity';
  answer: string;
  toolTraces: AntigravityToolTrace[];
  riskFlags: string[];
  raw?: unknown;
}

export class AntigravityDisabledError extends Error {
  constructor() {
    super('Antigravity integration is disabled');
    this.name = 'AntigravityDisabledError';
  }
}

export class AntigravityClient {
  async lift(req: AntigravityLiftRequest): Promise<AntigravityLiftResponse> {
    if (!antigravityConfig.enabled) {
      throw new AntigravityDisabledError();
    }

    if (!antigravityConfig.url) {
      throw new Error('ANTIGRAVITY_URL is not configured');
    }

    const url = `${antigravityConfig.url.replace(/\/$/, '')}/v1/antigravity/lift`;

    const payload = {
      prompt: req.prompt,
      allowedTools: req.allowedTools ?? [],
      safetyLevel: req.safetyLevel ?? 'medium',
      metadata: req.metadata ?? {}
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (antigravityConfig.apiKey) {
      headers.Authorization = `Bearer ${antigravityConfig.apiKey}`;
    }

    const response = await axios.post(url, payload, {
      headers,
      timeout: antigravityConfig.timeoutMs
    });

    const data = response.data as any;

    return {
      provider: 'antigravity',
      answer: String(data.answer ?? ''),
      toolTraces: Array.isArray(data.toolTraces) ? data.toolTraces : [],
      riskFlags: Array.isArray(data.riskFlags) ? data.riskFlags : [],
      raw: data
    };
  }
}

export const antigravityClient = new AntigravityClient();
