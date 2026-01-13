/**
 * Gemini Provider Adapter
 * Connects to Google's Gemini API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CodexVote, CodexRequest } from '../../../types';

/**
 * Default configuration for Gemini provider
 */
const DEFAULT_CONFIG = {
  model: 'gemini-1.5-pro',
  maxTokens: 4096,
  temperature: 0.7,
  topP: 0.95,
  timeout: 60000, // 60 seconds
};

/**
 * Singleton client instance (reused across calls)
 */
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Call Google's Gemini models with the given prompt
 */
export async function callGemini(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  try {
    const client = getClient();

    // Use model override from env or request, fallback to default
    const modelName = process.env.GEMINI_MODEL || DEFAULT_CONFIG.model;
    const temperature = req?.temperature ?? DEFAULT_CONFIG.temperature;
    const topP = req?.topP ?? DEFAULT_CONFIG.topP;
    const maxTokens = req?.maxTokens ?? DEFAULT_CONFIG.maxTokens;

    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature,
        topP,
        maxOutputTokens: maxTokens,
      },
    });

    // Create timeout promise
    const timeout = req?.timeoutMs ?? DEFAULT_CONFIG.timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    // Race between generation and timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const response = result.response;
    const text = response.text();

    // Type assertion for usage metadata (not all versions of the SDK expose this)
    const usage = (response as any).usageMetadata || {};

    return {
      provider: 'gemini',
      output: text,
      usage: {
        prompt: usage.promptTokenCount ?? 0,
        completion: usage.candidatesTokenCount ?? 0,
      },
      meta: {
        model: modelName,
        finishReason: response.candidates?.[0]?.finishReason,
        safetyRatings: response.candidates?.[0]?.safetyRatings,
      },
    };
  } catch (error) {
    console.error('[Gemini] API call failed:', error);

    // Return error vote instead of throwing
    return {
      provider: 'gemini',
      output: `[ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      meta: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}
