import axios from 'axios';
import { EngineResult, SafetyLevel } from '../types/routing';
import { attachExternalTrace } from '../utils/externalTrace';

export type AntigravitySafetyLevel = SafetyLevel;

export async function callAntigravity(opts: {
  deliberationId: string;
  prompt: string;
  allowedTools?: string[];
  safetyLevel?: SafetyLevel;
}): Promise<EngineResult> {
  if (process.env.ANTIGRAVITY_ENABLED !== 'true') {
    throw new Error('Antigravity integration is disabled');
  }

  const baseUrl = process.env.ANTIGRAVITY_URL;
  const apiKey = process.env.ANTIGRAVITY_API_KEY;

  if (!baseUrl) {
    throw new Error('ANTIGRAVITY_URL is not configured');
  }
  if (!apiKey) {
    throw new Error('ANTIGRAVITY_API_KEY is not configured');
  }

  const started = Date.now();
  const url = `${baseUrl.replace(/\/$/, '')}/v1/antigravity/lift`;

  const res = await axios.post(
    url,
    {
      prompt: opts.prompt,
      tools: opts.allowedTools && opts.allowedTools.length > 0 ? opts.allowedTools : ['web-search'],
      safety_level: opts.safetyLevel ?? 'high',
      metadata: {
        deliberationId: opts.deliberationId,
      },
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: Number(process.env.ANTIGRAVITY_TIMEOUT_MS ?? 20_000),
    },
  );

  const data = res.data as {
    answer?: string;
    tool_traces?: any[];
    risk_flags?: string[];
    meta?: Record<string, unknown>;
  };

  const result: EngineResult = {
    engineId: 'antigravity',
    answer: data.answer ?? '',
    toolTraces: Array.isArray(data.tool_traces) ? data.tool_traces : [],
    riskFlags: Array.isArray(data.risk_flags) ? data.risk_flags : [],
    latencyMs: Date.now() - started,
    meta: data.meta,
  };

  await attachExternalTrace(opts.deliberationId, {
    provider: 'antigravity',
    answer: result.answer,
    toolTraces: result.toolTraces ?? [],
    riskFlags: result.riskFlags,
    meta: { latencyMs: result.latencyMs, ...(data.meta ?? {}) },
  });

  return result;
}
