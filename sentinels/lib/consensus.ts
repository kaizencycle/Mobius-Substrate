/**
 * @fileoverview Sentinel Consensus Utilities
 * @description Provides utilities for multi-sentinel voting and consensus
 */

// ============================================================================
// Types
// ============================================================================

export type VoteDecision = 'approve' | 'reject' | 'abstain';
export type ConsensusMode = 'standard' | 'constitutional' | 'safety_critical' | 'canon_change' | 'security';

export interface Vote {
  agent: string;
  decision: VoteDecision;
  reasoning?: string;
  gi_score?: number;
  timestamp: string;
  signature?: string;
}

export interface ConsensusRequest {
  id: string;
  type: ConsensusMode;
  title: string;
  description: string;
  proposer: string;
  affected_domains?: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}

export interface ConsensusResult {
  request_id: string;
  outcome: 'approved' | 'rejected' | 'no_quorum' | 'vetoed';
  votes: Vote[];
  total_votes: number;
  approve_votes: number;
  reject_votes: number;
  abstain_votes: number;
  quorum_met: boolean;
  veto_exercised?: {
    agent: string;
    reason: string;
  };
  timestamp: string;
}

export interface QuorumConfig {
  standard: string;
  constitutional: string;
  safety_critical: string;
  canon_change: string;
  security: string;
}

// ============================================================================
// Default Quorum Configuration
// ============================================================================

export const DEFAULT_QUORUM: QuorumConfig = {
  standard: '3-of-10',
  constitutional: '5-of-10',
  safety_critical: '4-of-10',
  canon_change: '4-of-10',
  security: '4-of-10',
};

// ============================================================================
// Consensus Functions
// ============================================================================

/**
 * Parse quorum string (e.g., "3-of-10") into numbers
 */
export function parseQuorum(quorum: string): { required: number; total: number } {
  const match = quorum.match(/^(\d+)-of-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid quorum format: ${quorum}`);
  }
  return {
    required: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
  };
}

/**
 * Check if quorum is met
 */
export function checkQuorum(
  votes: Vote[],
  quorum: string,
  excludeAbstains: boolean = false
): boolean {
  const { required } = parseQuorum(quorum);
  const countableVotes = excludeAbstains
    ? votes.filter(v => v.decision !== 'abstain')
    : votes;
  return countableVotes.length >= required;
}

/**
 * Calculate consensus outcome
 */
export function calculateConsensus(
  request: ConsensusRequest,
  votes: Vote[],
  quorumConfig: QuorumConfig = DEFAULT_QUORUM,
  vetoAgents?: Record<string, string[]>
): ConsensusResult {
  const quorum = quorumConfig[request.type];
  const { required } = parseQuorum(quorum);
  
  // Count votes
  const approveVotes = votes.filter(v => v.decision === 'approve');
  const rejectVotes = votes.filter(v => v.decision === 'reject');
  const abstainVotes = votes.filter(v => v.decision === 'abstain');
  
  // Check for veto
  let vetoExercised: ConsensusResult['veto_exercised'] = undefined;
  if (vetoAgents) {
    const applicableVetoAgents = Object.entries(vetoAgents)
      .filter(([domain]) => request.affected_domains?.includes(domain))
      .flatMap(([, agents]) => agents);
    
    const vetoVote = rejectVotes.find(v => applicableVetoAgents.includes(v.agent));
    if (vetoVote) {
      vetoExercised = {
        agent: vetoVote.agent,
        reason: vetoVote.reasoning || 'Veto authority exercised',
      };
    }
  }
  
  // Determine outcome
  let outcome: ConsensusResult['outcome'];
  const quorumMet = votes.length >= required;
  
  if (vetoExercised) {
    outcome = 'vetoed';
  } else if (!quorumMet) {
    outcome = 'no_quorum';
  } else if (approveVotes.length >= required) {
    outcome = 'approved';
  } else {
    outcome = 'rejected';
  }
  
  return {
    request_id: request.id,
    outcome,
    votes,
    total_votes: votes.length,
    approve_votes: approveVotes.length,
    reject_votes: rejectVotes.length,
    abstain_votes: abstainVotes.length,
    quorum_met: quorumMet,
    veto_exercised: vetoExercised,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get veto authority for a domain
 */
export function getVetoAuthority(domain: string, vetoMatrix: Record<string, string[]>): string[] {
  return vetoMatrix[domain] || [];
}

/**
 * Check if a sentinel can veto for given domains
 */
export function canVeto(
  agent: string,
  domains: string[],
  vetoMatrix: Record<string, string[]>
): boolean {
  for (const domain of domains) {
    if (vetoMatrix[domain]?.includes(agent)) {
      return true;
    }
  }
  return false;
}

/**
 * Calculate agreement percentage
 */
export function calculateAgreement(votes: Vote[]): number {
  if (votes.length === 0) return 0;
  
  const nonAbstain = votes.filter(v => v.decision !== 'abstain');
  if (nonAbstain.length === 0) return 0;
  
  const majorityDecision = nonAbstain.filter(v => v.decision === 'approve').length >
    nonAbstain.filter(v => v.decision === 'reject').length ? 'approve' : 'reject';
  
  const agreeing = nonAbstain.filter(v => v.decision === majorityDecision).length;
  return agreeing / nonAbstain.length;
}

/**
 * Get minimum required votes for consensus mode
 */
export function getRequiredVotes(mode: ConsensusMode, config: QuorumConfig = DEFAULT_QUORUM): number {
  const { required } = parseQuorum(config[mode]);
  return required;
}

// ============================================================================
// Vote Helpers
// ============================================================================

/**
 * Create a vote
 */
export function createVote(
  agent: string,
  decision: VoteDecision,
  reasoning?: string,
  gi_score?: number
): Vote {
  return {
    agent,
    decision,
    reasoning,
    gi_score,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate a vote
 */
export function validateVote(vote: Vote): string[] {
  const errors: string[] = [];
  
  if (!vote.agent) errors.push('Vote missing agent');
  if (!['approve', 'reject', 'abstain'].includes(vote.decision)) {
    errors.push('Invalid vote decision');
  }
  if (!vote.timestamp) errors.push('Vote missing timestamp');
  
  return errors;
}

/**
 * Get vote summary
 */
export function getVoteSummary(votes: Vote[]): {
  total: number;
  approve: number;
  reject: number;
  abstain: number;
  agreement: number;
} {
  return {
    total: votes.length,
    approve: votes.filter(v => v.decision === 'approve').length,
    reject: votes.filter(v => v.decision === 'reject').length,
    abstain: votes.filter(v => v.decision === 'abstain').length,
    agreement: calculateAgreement(votes),
  };
}
