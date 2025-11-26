export interface NodeActivity {
  nodeId: string;
  gi: number; // Global Integrity score for the node at activity time
  integrityWork: number; // I(x)
  humanIntent: number; // H(x)
  coordinationValue: number; // C(x)
  resilienceWork: number; // R(x)
  timestamp: string;
  sentinelCount?: number;
  isNewKnowledge?: boolean;
  correctedDrift?: boolean;
}

export interface RewardOptions {
  sentinelCount?: number;
  isNewKnowledge?: boolean;
  correctedDrift?: boolean;
}

export interface RewardResult {
  nodeId: string;
  mic: number;
  breakdown: {
    integrity: number;
    humanIntent: number;
    coordination: number;
    resilience: number;
    multipliers: {
      giMultiplier: number;
      consensusMultiplier: number;
      noveltyMultiplier: number;
      antiDriftMultiplier: number;
    };
  };
  timestamp: string;
}
