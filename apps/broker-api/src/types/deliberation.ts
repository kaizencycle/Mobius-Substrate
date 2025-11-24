import { EngineId, RoutingMode, SafetyLevel } from './routing';

export interface DeliberateRequestBody {
  prompt: string;
  context?: Record<string, unknown>;
  requiredSentinels?: string[];
  consensusThreshold?: number;
  webhookUrl?: string;
  routingMode?: RoutingMode;
  engines?: EngineId[];
  allowedTools?: string[];
  safetyLevel?: SafetyLevel;
  metadata?: Record<string, unknown>;
  externalEvidence?: Record<string, unknown>;
  [key: string]: unknown;
}
