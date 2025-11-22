import type { RoutingMode } from '../services/antigravityClient';

export interface CreateDeliberationBody {
  prompt: string;
  context?: Record<string, unknown>;
  requiredSentinels?: string[];
  consensusThreshold?: number;
  webhookUrl?: string;
  routingMode?: RoutingMode;
  allowedTools?: string[];
  safetyLevel?: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}
