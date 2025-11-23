import axios from 'axios';
import { EngineResult } from '../types/routing';
import { attachExternalTrace } from '../utils/externalTrace';

const CLAUDE_MODEL = process.env.CLAUDE_ROUTER_MODEL ?? 'claude-3-opus-20240229';

export async function callClaude(opts: {
  deliberationId: string;
  prompt: string;
}): Promise<EngineResult> {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY is not configured');
  }

  const baseUrl = (process.env.CLAUDE_BASE_URL ?? 'https://api.anthropic.com').replace(/\/$/, '');
  const started = Date.now();

  const res = await axios.post(
    `${baseUrl}/v1/messages`,
    {
      model: CLAUDE_MODEL,
      max_tokens: Number(process.env.CLAUDE_MAX_TOKENS ?? 1024),
      temperature: Number(process.env.CLAUDE_TEMPERATURE ?? 0.2),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a constitutional co-pilot for the Mobius Broker.\nPrompt: ${opts.prompt}`,
            },
          ],
        },
      ],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      timeout: Number(process.env.CLAUDE_TIMEOUT_MS ?? 25_000),
    },
  );

  const data = res.data as any;
  const answer = Array.isArray(data?.content)
    ? data.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('\n')
        .trim()
    : '';

  const result: EngineResult = {
    engineId: 'claude',
    answer,
    toolTraces: [],
    riskFlags: [],
    latencyMs: Date.now() - started,
    meta: {
      model: CLAUDE_MODEL,
      usage: data?.usage,
    },
  };

  await attachExternalTrace(opts.deliberationId, {
    provider: 'claude',
    answer: result.answer,
    toolTraces: [],
    riskFlags: result.riskFlags,
    meta: result.meta,
  });

  return result;
}
