export interface SentinelDefinition {
  id: string;
  role: string;
  domain: string[];
  consumes?: string[];
  produces?: string[];
  output_schema: Record<string, string>;
  escalation?: Record<string, string>;
  mii_contribution: {
    weight: number;
  };
}

export interface MKM {
  version: string;
  description: string;
  sentinels: Record<string, SentinelDefinition>;
  routing: {
    canonical_sequence: string[];
    task_map: Record<string, string[]>;
  };
  consensus: {
    voting_weights: Record<string, number>;
    quorum_requirement: number;
    mii_threshold: number;
    conflict_policy: string;
  };
  integrity: {
    mii_formula: string;
    entropy_sources: string[];
  };
  files: {
    output_root: string;
  };
  metadata: {
    created_by: string;
    status: string;
  };
}

export type SentinelInputs = Record<string, unknown>;

export type SentinelOutputs = Record<string, unknown> & {
  integrity_score?: number;
};

export interface ConsensusPacket {
  timestamp: string;
  mii: number;
  outputs: Record<string, SentinelOutputs>;
}
