import axios from 'axios';
import { EngineResult } from '../types/routing';
import { attachExternalTrace } from '../utils/externalTrace';

const DEFAULT_MODEL = process.env.DEEPSEEK_ROUTER_MODEL ?? 'deepseek-coder';

export async function callDeepseek(opts: {
  deliberationId: string;
  prompt: string;
}): Promise<EngineResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const baseUrl = (process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com').replace(/\/$/, '');
  const started = Date.now();

  const res = await axios.post(
    `${baseUrl}/v1/chat/completions`,
    {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are the DeepSeek reasoning engine for Mobius Broker. Provide executable insights and flag any policy concerns.',
        },
        { role: 'user', content: opts.prompt },
      ],
      temperature: Number(process.env.DEEPSEEK_TEMPERATURE ?? 0.15),
      max_tokens: Number(process.env.DEEPSEEK_MAX_TOKENS ?? 1024),
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: Number(process.env.DEEPSEEK_TIMEOUT_MS ?? 25_000),
    },
  );

  const data = res.data as any;
  const choice = data?.choices?.[0];
  const answer = choice?.message?.content?.trim() ?? '';

  const result: EngineResult = {
    engineId: 'deepseek',
    answer,
    toolTraces: [],
    riskFlags: [],
    latencyMs: Date.now() - started,
    meta: {
      model: DEFAULT_MODEL,
      usage: data?.usage,
    },
  };

  await attachExternalTrace(opts.deliberationId, {
    provider: 'deepseek',
    answer: result.answer,
    toolTraces: [],
    riskFlags: result.riskFlags,
    meta: result.meta,
  });

  return result;
}
