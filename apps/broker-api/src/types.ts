/**
 * @fileoverview Core Types for Mobius Thought Broker
 * Defines the deliberation protocol, consensus mechanisms, and MII integration
 */
import { z } from 'zod';

// ============================================================================
// SENTINEL AGENT TYPES
// ============================================================================

export enum SentinelRole {
  ATLAS = 'ATLAS',   // Logic & Architecture (Anthropic Claude)
  AUREA = 'AUREA',   // Ethics & Integrity (OpenAI GPT)
  HERMES = 'HERMES', // Communication & Translation
  EVE = 'EVE',       // Evolution & Adaptation
  JADE = 'JADE',     // Justice & Balance
  ZEUS = 'ZEUS'      // Authority & Coordination
}

export interface Sentinel {
  role: SentinelRole;
  model: string;
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek';
  active: boolean;
}

// ============================================================================
// DELIBERATION REQUEST/RESPONSE
// ============================================================================

export const DeliberationRequestSchema = z.object({
  prompt: z.string().min(10).max(10000),
  context: z.record(z.unknown()).optional(),
  requester: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  requiredSentinels: z.array(z.nativeEnum(SentinelRole)).optional(),
  maxRounds: z.number().min(1).max(10).default(5),
  consensusThreshold: z.number().min(0.5).max(1.0).default(0.75)
});

export type DeliberationRequest = z.infer<typeof DeliberationRequestSchema>;

export interface DeliberationResponse {
  id: string;
  status: DeliberationStatus;
  request: DeliberationRequest;
  rounds: DeliberationRound[];
  consensus?: Consensus;
  deliberationProof?: DeliberationProof;
  miiScore?: number;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// DELIBERATION LIFECYCLE
// ============================================================================

export enum DeliberationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONSENSUS_REACHED = 'CONSENSUS_REACHED',
  CONSENSUS_FAILED = 'CONSENSUS_FAILED',
  MII_REJECTED = 'MII_REJECTED',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface DeliberationRound {
  roundNumber: number;
  sentinelResponses: SentinelResponse[];
  convergence: number; // 0-1, how close to consensus
  timestamp: Date;
}

export interface SentinelResponse {
  sentinel: SentinelRole;
  position: string;
  reasoning: string;
  integrityScore: number; // Self-assessed impact on MII
  vote: 'approve' | 'reject' | 'abstain';
  concerns: string[];
  timestamp: Date;
}

// ============================================================================
// CONSENSUS PROTOCOL
// ============================================================================

export interface Consensus {
  achieved: boolean;
  finalPosition: string;
  voteTally: {
    approve: number;
    reject: number;
    abstain: number;
  };
  convergenceScore: number; // 0-1
  dissentingViews: string[];
  synthesisReasoning: string;
}

// ============================================================================
// DELIBERATION PROOF (Cryptographic Attestation)
// ============================================================================

export interface DeliberationProof {
  deliberationId: string;
  proofType: 'DeliberationProof-v1';
  timestamp: Date;
  participants: SentinelRole[];
  rounds: number;
  consensus: {
    achieved: boolean;
    threshold: number;
    finalScore: number;
  };
  miiScore: number;
  merkleRoot: string; // Hash of all sentinel responses
  signature?: string; // Ed25519 signature (future)
}

// ============================================================================
// MII (Mobius Integrity Index) INTEGRATION
// ============================================================================

export interface MIIGradeRequest {
  action: string;
  context: Record<string, unknown>;
  proposedBy: string;
  deliberationId?: string;
}

export interface MIIGradeResponse {
  score: number; // 0-1
  passed: boolean; // score >= threshold
  threshold: number;
  breakdown: {
    transparency: number;
    accountability: number;
    safety: number;
    equity: number;
    sustainability: number;
  };
  reasoning: string;
  warnings: string[];
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: Date;
}

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export enum WSEventType {
  DELIBERATION_STARTED = 'deliberation:started',
  ROUND_COMPLETED = 'round:completed',
  SENTINEL_RESPONDED = 'sentinel:responded',
  CONSENSUS_REACHED = 'consensus:reached',
  CONSENSUS_FAILED = 'consensus:failed',
  MII_GRADED = 'mii:graded',
  DELIBERATION_COMPLETED = 'deliberation:completed',
  ERROR = 'error'
}

export interface WSEvent {
  type: WSEventType;
  deliberationId: string;
  payload: unknown;
  timestamp: Date;
}

