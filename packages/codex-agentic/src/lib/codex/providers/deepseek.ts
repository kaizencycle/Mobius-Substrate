/**
 * DeepSeek Provider Adapter
 * Connects to DeepSeek's API for code and reasoning models
 * Uses OpenAI-compatible API interface
 */

import OpenAI from 'openai';
import type { CodexVote, CodexRequest } from '../../../types';

/**
 * Default configuration for DeepSeek provider
 */
const DEFAULT_CONFIG = {
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
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
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }
    const baseURL = process.env.DEEPSEEK_BASE_URL || DEFAULT_CONFIG.baseURL;
    client = new OpenAI({ apiKey, baseURL });
  }
  return client;
}

/**
 * Call DeepSeek's models with the given prompt
 * DeepSeek offers specialized reasoning models (DeepSeek-R1)
 */
export async function callDeepSeek(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  try {
    const deepseek = getClient();

    // Use model override from env or request, fallback to default
    const model = process.env.DEEPSEEK_MODEL || DEFAULT_CONFIG.model;
    const maxTokens = req?.maxTokens ?? DEFAULT_CONFIG.maxTokens;
    const temperature = req?.temperature ?? DEFAULT_CONFIG.temperature;
    const topP = req?.topP ?? DEFAULT_CONFIG.topP;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = req?.timeoutMs ?? DEFAULT_CONFIG.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await deepseek.chat.completions.create({
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
        provider: 'deepseek',
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
    console.error('[DeepSeek] API call failed:', error);

    // Return error vote instead of throwing
    return {
      provider: 'deepseek',
      output: `[ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      meta: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
