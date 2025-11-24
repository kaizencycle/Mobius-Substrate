import { EngineId, RoutingMode } from '../types/routing';

export interface EngineConfig {
  id: EngineId;
  enabled: boolean;
  baseUrl?: string;
  apiKeyEnv?: string;
  defaultTools?: string[];
  maxTokens?: number;
}

export const ENGINE_CONFIG: EngineConfig[] = [
  { id: 'local', enabled: true },
  {
    id: 'antigravity',
    enabled: process.env.ANTIGRAVITY_ENABLED === 'true',
    baseUrl: process.env.ANTIGRAVITY_URL,
    apiKeyEnv: 'ANTIGRAVITY_API_KEY',
    defaultTools: ['web-search', 'code-exec'],
  },
  {
    id: 'openai',
    enabled: !!process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  {
    id: 'claude',
    enabled: !!process.env.CLAUDE_API_KEY,
    baseUrl: process.env.CLAUDE_BASE_URL ?? 'https://api.anthropic.com',
    apiKeyEnv: 'CLAUDE_API_KEY',
  },
  {
    id: 'deepseek',
    enabled: !!process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
    apiKeyEnv: 'DEEPSEEK_API_KEY',
  },
];

export const DEFAULT_ROUTING_MODE: RoutingMode = 'local';
