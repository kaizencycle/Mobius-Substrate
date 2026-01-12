/**
 * Local Provider Adapter
 * Connects to local LLM inference (Ollama/LMStudio)
 */

import type { CodexVote, CodexRequest } from '../../../types';

/**
 * Default configuration for Local provider
 */
const DEFAULT_CONFIG = {
  baseURL: 'http://localhost:11434',
  model: 'llama3.1:8b-instruct-q4_K_M',
  temperature: 0.7,
  timeout: 120000, // 120 seconds (local inference can be slower)
};

/**
 * Ollama Chat API request interface
 */
interface OllamaChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

/**
 * Ollama Chat API response interface
 */
interface OllamaChatResponse {
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Call local LLM inference via Ollama API
 * Also supports LMStudio and other OpenAI-compatible local servers
 */
export async function callLocal(prompt: string, req?: CodexRequest): Promise<CodexVote> {
  try {
    // Use base URL from env (supports Ollama, LMStudio, etc.)
    const baseURL = process.env.LOCAL_LLM_URL || process.env.OLLAMA_URL || DEFAULT_CONFIG.baseURL;
    const model = process.env.LOCAL_LLM_MODEL || process.env.OLLAMA_MODEL || DEFAULT_CONFIG.model;
    const temperature = req?.temperature ?? DEFAULT_CONFIG.temperature;
    const topP = req?.topP ?? 0.95;
    const maxTokens = req?.maxTokens;

    // Build request payload
    const requestBody: OllamaChatRequest = {
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: {
        temperature,
        top_p: topP,
        ...(maxTokens && { num_predict: maxTokens }),
      },
    };

    // Create timeout controller
    const controller = new AbortController();
    const timeout = req?.timeoutMs ?? DEFAULT_CONFIG.timeout;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Local LLM request failed: ${response.status} ${response.statusText}`);
      }

      const data: OllamaChatResponse = await response.json();

      // Extract content from response
      const content = data.message?.content || '';

      return {
        provider: 'local',
        output: content,
        usage: {
          prompt: data.prompt_eval_count ?? 0,
          completion: data.eval_count ?? 0,
        },
        meta: {
          model,
          baseURL,
          totalDuration: data.total_duration,
          loadDuration: data.load_duration,
          promptEvalDuration: data.prompt_eval_duration,
          evalDuration: data.eval_duration,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error('[Local] API call failed:', error);

    // Return error vote instead of throwing
    return {
      provider: 'local',
      output: `[ERROR: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      meta: {
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Ensure Ollama or LMStudio is running locally. Set LOCAL_LLM_URL env var if using custom endpoint.',
      },
    };
  }
}
