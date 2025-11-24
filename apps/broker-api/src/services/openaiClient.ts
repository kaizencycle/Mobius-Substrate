import axios from 'axios';
import { EngineResult } from '../types/routing';
import { attachExternalTrace } from '../utils/externalTrace';

const DEFAULT_MODEL = process.env.OPENAI_ROUTER_MODEL ?? 'o4-mini';

export async function callOpenAI(opts: {
  deliberationId: string;
  prompt: string;
}): Promise<EngineResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const baseUrl = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com').replace(/\/$/, '');
  const started = Date.now();

  const res = await axios.post(
    `${baseUrl}/v1/chat/completions`,
    {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are part of the Mobius Thought Broker. Provide grounded, constitutional answers and flag any policy risks.',
        },
        { role: 'user', content: opts.prompt },
      ],
      temperature: Number(process.env.OPENAI_TEMPERATURE ?? 0.2),
      max_tokens: Number(process.env.OPENAI_MAX_TOKENS ?? 1024),
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: Number(process.env.OPENAI_TIMEOUT_MS ?? 25_000),
    },
  );

  const data = res.data as any;
  const choice = data?.choices?.[0];
  const answer = choice?.message?.content?.trim() ?? '';

  const result: EngineResult = {
    engineId: 'openai',
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
    provider: 'openai',
    answer: result.answer,
    toolTraces: [],
    riskFlags: result.riskFlags,
    meta: result.meta,
  });

  return result;
}
