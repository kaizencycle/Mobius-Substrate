/**
 * Provider Configuration Management
 * Centralized configuration for all LLM providers
 */

import type { ProviderId } from '../../types';

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeout?: number;
}

/**
 * Complete configuration for all providers
 */
export interface CodexConfig {
  providers: Record<ProviderId, ProviderConfig>;
  defaultProvider?: ProviderId;
  fallbackProviders?: ProviderId[];
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Environment variable mapping
 */
const ENV_KEYS = {
  anthropic: {
    apiKey: 'ANTHROPIC_API_KEY',
    model: 'ANTHROPIC_MODEL',
    maxTokens: 'ANTHROPIC_MAX_TOKENS',
    temperature: 'ANTHROPIC_TEMPERATURE',
    timeout: 'ANTHROPIC_TIMEOUT',
  },
  openai: {
    apiKey: 'OPENAI_API_KEY',
    model: 'OPENAI_MODEL',
    maxTokens: 'OPENAI_MAX_TOKENS',
    temperature: 'OPENAI_TEMPERATURE',
    timeout: 'OPENAI_TIMEOUT',
  },
  gemini: {
    apiKey: 'GEMINI_API_KEY',
    model: 'GEMINI_MODEL',
    maxTokens: 'GEMINI_MAX_TOKENS',
    temperature: 'GEMINI_TEMPERATURE',
    timeout: 'GEMINI_TIMEOUT',
  },
  deepseek: {
    apiKey: 'DEEPSEEK_API_KEY',
    baseURL: 'DEEPSEEK_BASE_URL',
    model: 'DEEPSEEK_MODEL',
    maxTokens: 'DEEPSEEK_MAX_TOKENS',
    temperature: 'DEEPSEEK_TEMPERATURE',
    timeout: 'DEEPSEEK_TIMEOUT',
  },
  local: {
    baseURL: 'LOCAL_LLM_URL',
    model: 'LOCAL_LLM_MODEL',
    maxTokens: 'LOCAL_LLM_MAX_TOKENS',
    temperature: 'LOCAL_LLM_TEMPERATURE',
    timeout: 'LOCAL_LLM_TIMEOUT',
  },
};

/**
 * Default provider configurations
 */
const DEFAULT_CONFIGS: Record<ProviderId, ProviderConfig> = {
  anthropic: {
    enabled: true,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
    timeout: 60000,
  },
  openai: {
    enabled: true,
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
    timeout: 60000,
  },
  gemini: {
    enabled: true,
    model: 'gemini-1.5-pro',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
    timeout: 60000,
  },
  deepseek: {
    enabled: true,
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
    timeout: 60000,
  },
  local: {
    enabled: true,
    baseURL: 'http://localhost:11434',
    model: 'llama3.1:8b-instruct-q4_K_M',
    maxTokens: 4096,
    temperature: 0.7,
    topP: 0.95,
    timeout: 120000,
  },
};

/**
 * Load provider configuration from environment variables
 */
function loadProviderConfig(providerId: ProviderId): ProviderConfig {
  const defaultConfig = DEFAULT_CONFIGS[providerId];
  const envKeys = ENV_KEYS[providerId];

  const config: ProviderConfig = {
    ...defaultConfig,
    model: process.env[envKeys.model] || defaultConfig.model,
  };

  // Handle apiKey (not all providers have it)
  if ('apiKey' in envKeys) {
    config.apiKey = process.env[envKeys.apiKey];
  }

  // Handle baseURL (only some providers have it)
  if ('baseURL' in envKeys && envKeys.baseURL) {
    config.baseURL = process.env[envKeys.baseURL] || defaultConfig.baseURL;
  }

  // Handle maxTokens
  const maxTokensStr = process.env[envKeys.maxTokens];
  if (maxTokensStr) {
    config.maxTokens = parseInt(maxTokensStr, 10);
  }

  // Handle temperature
  const temperatureStr = process.env[envKeys.temperature];
  if (temperatureStr) {
    config.temperature = parseFloat(temperatureStr);
  }

  // Handle timeout
  const timeoutStr = process.env[envKeys.timeout];
  if (timeoutStr) {
    config.timeout = parseInt(timeoutStr, 10);
  }

  return config;
}

/**
 * Load complete configuration from environment
 */
export function loadConfig(): CodexConfig {
  return {
    providers: {
      anthropic: loadProviderConfig('anthropic'),
      openai: loadProviderConfig('openai'),
      gemini: loadProviderConfig('gemini'),
      deepseek: loadProviderConfig('deepseek'),
      local: loadProviderConfig('local'),
    },
    defaultProvider: (process.env.DEFAULT_LLM_PROVIDER as ProviderId) || 'anthropic',
    fallbackProviders: process.env.FALLBACK_LLM_PROVIDERS
      ? (process.env.FALLBACK_LLM_PROVIDERS.split(',') as ProviderId[])
      : ['openai', 'gemini', 'deepseek'],
    retryAttempts: process.env.LLM_RETRY_ATTEMPTS ? parseInt(process.env.LLM_RETRY_ATTEMPTS, 10) : 3,
    retryDelay: process.env.LLM_RETRY_DELAY ? parseInt(process.env.LLM_RETRY_DELAY, 10) : 1000,
  };
}

/**
 * Singleton config instance
 */
let configInstance: CodexConfig | null = null;

/**
 * Get the global configuration (singleton)
 */
export function getConfig(): CodexConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reset configuration (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}

/**
 * Get configuration for a specific provider
 */
export function getProviderConfig(providerId: ProviderId): ProviderConfig {
  const config = getConfig();
  return config.providers[providerId];
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(providerId: ProviderId): {
  valid: boolean;
  errors: string[];
} {
  const config = getProviderConfig(providerId);
  const errors: string[] = [];

  // Check if provider is enabled
  if (!config.enabled) {
    errors.push(`Provider ${providerId} is disabled`);
  }

  // Check API key requirements
  const requiresApiKey = ['anthropic', 'openai', 'gemini', 'deepseek'].includes(providerId);
  if (requiresApiKey && !config.apiKey) {
    const envKeys = ENV_KEYS[providerId];
    const apiKeyEnv = 'apiKey' in envKeys ? envKeys.apiKey : 'API_KEY';
    errors.push(`Missing API key for ${providerId}. Set ${apiKeyEnv} environment variable.`);
  }

  // Validate numeric ranges
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push(`Invalid temperature for ${providerId}: ${config.temperature} (must be 0-2)`);
  }

  if (config.topP !== undefined && (config.topP < 0 || config.topP > 1)) {
    errors.push(`Invalid topP for ${providerId}: ${config.topP} (must be 0-1)`);
  }

  if (config.maxTokens !== undefined && config.maxTokens < 1) {
    errors.push(`Invalid maxTokens for ${providerId}: ${config.maxTokens} (must be > 0)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all provider configurations
 */
export function validateAllConfigs(): Record<ProviderId, { valid: boolean; errors: string[] }> {
  const providers: ProviderId[] = ['anthropic', 'openai', 'gemini', 'deepseek', 'local'];
  const results: Record<string, { valid: boolean; errors: string[] }> = {};

  for (const providerId of providers) {
    results[providerId] = validateProviderConfig(providerId);
  }

  return results as Record<ProviderId, { valid: boolean; errors: string[] }>;
}

/**
 * Get list of properly configured providers
 */
export function getConfiguredProviders(): ProviderId[] {
  const allResults = validateAllConfigs();
  return Object.entries(allResults)
    .filter(([_, result]) => result.valid)
    .map(([providerId]) => providerId as ProviderId);
}
