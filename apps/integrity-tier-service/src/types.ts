export type IntegrityTier = 'CIVIC' | 'STABLE' | 'CAUTION' | 'HAZARD';

export interface IntegrityInput {
  content: string;
  origin: {
    engine: string;
    routingMode: string;
    taskType?: string;
    sources?: string[];
  };
  metadata?: Record<string, unknown>;
}

export interface IntegrityAssessment {
  tier: IntegrityTier;
  giScore: number;
  provenanceId: string;
  signals: Record<string, number>;
  notes?: string[];
}
