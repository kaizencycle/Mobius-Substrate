export type RoutingMode = 'local' | 'antigravity-first' | 'antigravity-only';

export interface DeliberateRequestBody {
  prompt: string;
  context?: Record<string, unknown>;
  requiredSentinels?: string[];
  consensusThreshold?: number;
  webhookUrl?: string;
  routingMode?: RoutingMode;
  allowedTools?: string[];
  safetyLevel?: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
  externalEvidence?: Record<string, unknown>;
  [key: string]: unknown;
}
