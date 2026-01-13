/**
 * OpenAI Provider Adapter
 * Connects to OpenAI's API for GPT models
 */

import OpenAI from 'openai';
import type { CodexVote, CodexRequest } from '../../../types';

/**
 * Default configuration for OpenAI provider
 */
const DEFAULT_CONFIG = {
  model: 'gpt-4o',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.95,
  timeout: 60000, // 60 seconds
};

/**
 * Singleton client instance (reused across calls)
 */
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

/**
 * Call OpenAI's GPT models with the given prompt
 */
export async function callOpenAI(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  try {
    const openai = getClient();

    // Use model override from env or request, fallback to default
    const model = process.env.OPENAI_MODEL || DEFAULT_CONFIG.model;
    const maxTokens = req?.maxTokens ?? DEFAULT_CONFIG.maxTokens;
    const temperature = req?.temperature ?? DEFAULT_CONFIG.temperature;
    const topP = req?.topP ?? DEFAULT_CONFIG.topP;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = req?.timeoutMs ?? DEFAULT_CONFIG.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
      }, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Extract message content
      const content = response.choices[0]?.message?.content || '';

      return {
        provider: 'openai',
        output: content,
        usage: {
          prompt: response.usage?.prompt_tokens ?? 0,
          completion: response.usage?.completion_tokens ?? 0,
        },
        meta: {
          model,
          finishReason: response.choices[0]?.finish_reason,
          id: response.id,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('[OpenAI] API call failed:', error);

    // Return error vote instead of throwing
    return {
      provider: 'openai',
      output: `[ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      meta: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
