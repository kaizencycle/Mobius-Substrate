/**
 * Anthropic Provider Adapter
 * Connects to Anthropic's API for Claude models
 */

import Anthropic from '@anthropic-ai/sdk';
import type { CodexVote, CodexRequest } from '../../../types';

/**
 * Default configuration for Anthropic provider
 */
const DEFAULT_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.95,
  timeout: 60000, // 60 seconds
};

/**
 * Singleton client instance (reused across calls)
 */
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Call Anthropic's Claude models with the given prompt
 */
export async function callAnthropic(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  try {
    const anthropic = getClient();

    // Use model override from env or request, fallback to default
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_CONFIG.model;
    const maxTokens = req?.maxTokens ?? DEFAULT_CONFIG.maxTokens;
    const temperature = req?.temperature ?? DEFAULT_CONFIG.temperature;
    const topP = req?.topP ?? DEFAULT_CONFIG.topP;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeout = req?.timeoutMs ?? DEFAULT_CONFIG.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        messages: [{ role: 'user', content: prompt }],
      }, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Extract text content from response
      const textContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      return {
        provider: 'anthropic',
        output: textContent,
        usage: {
          prompt: response.usage.input_tokens,
          completion: response.usage.output_tokens,
        },
        meta: {
          model,
          stopReason: response.stop_reason,
          id: response.id,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('[Anthropic] API call failed:', error);

    // Return error vote instead of throwing
    return {
      provider: 'anthropic',
      output: `[ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      meta: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
