/**
 * Unified Provider Interface and Factory
 * Provides a clean abstraction over all LLM providers
 */

import type { ProviderId, CodexVote, CodexRequest } from '../../../types';
import { callAnthropic } from './anthropic';
import { callOpenAI } from './openai';
import { callGemini } from './gemini';
import { callDeepSeek } from './deepseek';
import { callLocal } from './local';

/**
 * Provider dispatch table
 * Maps provider IDs to their implementation functions
 */
export const PROVIDER_DISPATCH: Record<
  ProviderId,
  (prompt: string, req?: CodexRequest) => Promise<CodexVote>
> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  gemini: callGemini,
  deepseek: callDeepSeek,
  local: callLocal,
};

/**
 * Provider metadata and capabilities
 */
export interface ProviderMetadata {
  id: ProviderId;
  name: string;
  description: string;
  defaultModel: string;
  requiresApiKey: boolean;
  supportsStreaming?: boolean;
  maxTokens: number;
  contextWindow: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
}

/**
 * Provider metadata registry
 */
export const PROVIDER_METADATA: Record<ProviderId, ProviderMetadata> = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude models by Anthropic - excellent for reasoning, code, and long contexts',
    defaultModel: 'claude-sonnet-4-20250514',
    requiresApiKey: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 200000,
    costTier: 'high',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    description: 'GPT models by OpenAI - versatile for all tasks',
    defaultModel: 'gpt-4o',
    requiresApiKey: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
    costTier: 'high',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini models by Google - strong multimodal capabilities',
    defaultModel: 'gemini-1.5-pro',
    requiresApiKey: true,
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 1000000,
    costTier: 'medium',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek models - specialized in code and reasoning',
    defaultModel: 'deepseek-chat',
    requiresApiKey: true,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 64000,
    costTier: 'low',
  },
  local: {
    id: 'local',
    name: 'Local LLM',
    description: 'Local inference via Ollama or LMStudio - free and private',
    defaultModel: 'llama3.1:8b-instruct-q4_K_M',
    requiresApiKey: false,
    supportsStreaming: true,
    maxTokens: 4096,
    contextWindow: 128000,
    costTier: 'free',
  },
};

/**
 * Call a specific provider by ID
 */
export async function callProvider(
  providerId: ProviderId,
  prompt: string,
  req?: CodexRequest
): Promise<CodexVote> {
  const providerFn = PROVIDER_DISPATCH[providerId];
  if (!providerFn) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return providerFn(prompt, req);
}

/**
 * Call multiple providers in parallel for consensus
 */
export async function callProviders(
  providerIds: ProviderId[],
  prompt: string,
  req?: CodexRequest
): Promise<CodexVote[]> {
  return Promise.all(
    providerIds.map((providerId) =>
      callProvider(providerId, prompt, req).catch((error) => {
        console.error(`[Unified] Provider ${providerId} failed:`, error);
        // Return error vote instead of failing
        return {
          provider: providerId,
          output: `[ERROR: ${error.message}]`,
          meta: { error: true },
        } as CodexVote;
      })
    )
  );
}

/**
 * Get available providers (those with API keys configured)
 */
export function getAvailableProviders(): ProviderId[] {
  const available: ProviderId[] = [];

  // Check each provider's requirements
  if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
  if (process.env.OPENAI_API_KEY) available.push('openai');
  if (process.env.GEMINI_API_KEY) available.push('gemini');
  if (process.env.DEEPSEEK_API_KEY) available.push('deepseek');

  // Local is always available (assumes Ollama/LMStudio might be running)
  available.push('local');

  return available;
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(providerId: ProviderId): boolean {
  const metadata = PROVIDER_METADATA[providerId];
  if (!metadata) return false;

  if (!metadata.requiresApiKey) return true;

  // Check for API key based on provider
  switch (providerId) {
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'gemini':
      return !!process.env.GEMINI_API_KEY;
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY;
    case 'local':
      return true;
    default:
      return false;
  }
}

/**
 * Get provider metadata
 */
export function getProviderMetadata(providerId: ProviderId): ProviderMetadata {
  const metadata = PROVIDER_METADATA[providerId];
  if (!metadata) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  return metadata;
}

/**
 * Get all provider metadata
 */
export function getAllProviderMetadata(): ProviderMetadata[] {
  return Object.values(PROVIDER_METADATA);
}
