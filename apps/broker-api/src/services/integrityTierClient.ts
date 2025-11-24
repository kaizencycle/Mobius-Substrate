import axios from 'axios';
import { INTEGRITY_TIER_URL } from '../config';

export type IntegrityTierLevel = 'CIVIC' | 'STABLE' | 'CAUTION' | 'HAZARD';

export interface IntegrityTierResponse {
  tier: IntegrityTierLevel;
  giScore: number;
  provenanceId: string;
  signals: Record<string, number>;
  notes?: string[];
}

export interface IntegrityTierRequest {
  content: string;
  engine: string;
  routingMode: string;
  taskType?: string;
  sources?: string[];
  metadata?: Record<string, unknown>;
}

export async function evaluateWithIntegrityTier(params: IntegrityTierRequest): Promise<IntegrityTierResponse> {
  const res = await axios.post<IntegrityTierResponse>(
    `${INTEGRITY_TIER_URL}/v1/integrity/evaluate`,
    {
      content: params.content,
      origin: {
        engine: params.engine,
        routingMode: params.routingMode,
        taskType: params.taskType,
        sources: params.sources,
      },
      metadata: params.metadata,
    },
    {
      timeout: 10_000,
    },
  );

  return res.data;
}
