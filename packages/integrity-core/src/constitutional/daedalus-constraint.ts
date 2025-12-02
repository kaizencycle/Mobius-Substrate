/**
 * @fileoverview DAEDALUS Constitutional Constraint Enforcement
 * @description Implements Amendment C-001: DAEDALUS Executor Constraint
 * @author Mobius Systems Foundation
 * @version 1.1.2
 * @cycle C-152
 * 
 * CONSTITUTIONAL REFERENCE:
 * ========================
 * Amendment C-001 - DAEDALUS Executor Constraint
 * Ratified: 2025-12-02 (Cycle C-152)
 * 
 * "DAEDALUS (Quorum & Consensus Mediator) cannot trigger execution engines.
 *  Mediator produces DelibProofs; Architects approve execution."
 * 
 * This constraint is HARDCODED and cannot be overridden by manifest changes.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ConstitutionalViolation {
  amendment: string;
  title: string;
  agent: string;
  attemptedAction: string;
  timestamp: string;
  blocked: boolean;
  reason: string;
}

export interface DaedalusAction {
  type: 'MEDIATE' | 'DELIBERATE' | 'AGGREGATE' | 'TRIGGER_EXECUTOR';
  payload: Record<string, unknown>;
  requestedBy: string;
  timestamp: string;
}

export interface DelibProof {
  sessionId: string;
  participants: string[];
  votes: Record<string, { approve: boolean; confidence: number }>;
  consensus: 'APPROVED' | 'BLOCKED' | 'ESCALATED';
  giScore: number;
  timestamp: string;
  hash: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DAEDALUS agent identifier
 */
export const DAEDALUS_AGENT_ID = 'DAEDALUS';

/**
 * DAEDALUS alias (per manifest)
 */
export const DAEDALUS_ALIAS = 'ARCHON';

/**
 * Constitutional amendment reference
 */
export const DAEDALUS_CONSTRAINT_AMENDMENT = 'C-001';

/**
 * Actions DAEDALUS is permitted to perform
 */
export const DAEDALUS_PERMITTED_ACTIONS = [
  'MEDIATE',
  'DELIBERATE',
  'AGGREGATE',
  'PRODUCE_DELIB_PROOF',
  'ESCALATE_TO_DVA',
  'UPDATE_CANON_DOCS',
] as const;

/**
 * Actions DAEDALUS is explicitly blocked from performing
 */
export const DAEDALUS_BLOCKED_ACTIONS = [
  'TRIGGER_EXECUTOR',
  'EXECUTE_CODE',
  'EDIT_REPO',
  'DEPLOY',
  'PUSH_TO_MAIN',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRAINT ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if an agent is DAEDALUS (including alias check)
 */
export function isDaedalus(agentId: string): boolean {
  return agentId === DAEDALUS_AGENT_ID || agentId === DAEDALUS_ALIAS;
}

/**
 * Check if an action is executor-related (blocked for DAEDALUS)
 */
export function isExecutorAction(actionType: string): boolean {
  const normalized = actionType.toUpperCase().replace(/[^A-Z_]/g, '_');
  return DAEDALUS_BLOCKED_ACTIONS.some(
    (blocked) => normalized.includes(blocked) || blocked.includes(normalized)
  );
}

/**
 * Validate that DAEDALUS is not attempting to trigger executors.
 * 
 * This is the core constitutional enforcement function.
 * 
 * @param agentId - The agent attempting the action
 * @param actionType - The type of action being attempted
 * @returns true if action is permitted, throws if blocked
 * @throws {Error} ConstitutionalViolation if DAEDALUS attempts executor action
 */
export function validateDaedalusConstraint(
  agentId: string,
  actionType: string
): boolean {
  // Not DAEDALUS? Not our concern.
  if (!isDaedalus(agentId)) {
    return true;
  }

  // DAEDALUS attempting executor action?
  if (isExecutorAction(actionType)) {
    const violation: ConstitutionalViolation = {
      amendment: DAEDALUS_CONSTRAINT_AMENDMENT,
      title: 'DAEDALUS Executor Constraint',
      agent: agentId,
      attemptedAction: actionType,
      timestamp: new Date().toISOString(),
      blocked: true,
      reason:
        'DAEDALUS cannot trigger executors per Constitutional Amendment C-001. ' +
        'Mediator produces DelibProofs; Architects approve execution.',
    };

    console.error('🚫 CONSTITUTIONAL VIOLATION:', violation);
    
    throw new Error(
      `Constitutional Violation (${DAEDALUS_CONSTRAINT_AMENDMENT}): ` +
      `Agent ${agentId} cannot perform action "${actionType}". ` +
      violation.reason
    );
  }

  return true;
}

/**
 * Middleware for Express/Fastify to enforce DAEDALUS constraint at API layer
 */
export function daedalusConstraintMiddleware() {
  return (req: any, res: any, next: any) => {
    const agentId = req.headers['x-agent-id'] || req.body?.agent_id;
    const actionType = req.body?.action_type || req.body?.type;

    if (!agentId || !actionType) {
      return next();
    }

    try {
      validateDaedalusConstraint(agentId, actionType);
      next();
    } catch (error: any) {
      res.status(403).json({
        error: 'ConstitutionalViolation',
        amendment: DAEDALUS_CONSTRAINT_AMENDMENT,
        message: error.message,
        blocked: true,
      });
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DELIB PROOF GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a DelibProof from a DAEDALUS mediation session.
 * 
 * This is what DAEDALUS CAN do - produce proofs of deliberation.
 */
export function generateDelibProof(
  sessionId: string,
  participants: string[],
  votes: Record<string, { approve: boolean; confidence: number }>
): DelibProof {
  // Calculate consensus
  const approvals = Object.values(votes).filter((v) => v.approve);
  const avgConfidence =
    approvals.reduce((sum, v) => sum + v.confidence, 0) / approvals.length || 0;

  let consensus: 'APPROVED' | 'BLOCKED' | 'ESCALATED';
  if (approvals.length >= participants.length * 0.66 && avgConfidence >= 0.8) {
    consensus = 'APPROVED';
  } else if (avgConfidence < 0.5) {
    consensus = 'BLOCKED';
  } else {
    consensus = 'ESCALATED';
  }

  const proof: DelibProof = {
    sessionId,
    participants,
    votes,
    consensus,
    giScore: avgConfidence,
    timestamp: new Date().toISOString(),
    hash: '', // Will be calculated
  };

  // Generate hash (simplified - in production use crypto)
  proof.hash = Buffer.from(JSON.stringify(proof)).toString('base64').slice(0, 64);

  return proof;
}

/**
 * Validate that a DelibProof was properly generated (not tampered)
 */
export function validateDelibProof(proof: DelibProof): boolean {
  // Verify consensus calculation
  const votes = Object.values(proof.votes);
  const approvals = votes.filter((v) => v.approve);
  const expectedConfidence =
    approvals.reduce((sum, v) => sum + v.confidence, 0) / approvals.length || 0;

  // Allow small floating point variance
  if (Math.abs(proof.giScore - expectedConfidence) > 0.001) {
    console.error('DelibProof validation failed: GI score mismatch');
    return false;
  }

  // Verify consensus matches votes
  const approvalRatio = approvals.length / proof.participants.length;
  if (proof.consensus === 'APPROVED' && (approvalRatio < 0.66 || expectedConfidence < 0.8)) {
    console.error('DelibProof validation failed: Invalid APPROVED consensus');
    return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default {
  validateDaedalusConstraint,
  daedalusConstraintMiddleware,
  generateDelibProof,
  validateDelibProof,
  isDaedalus,
  isExecutorAction,
  DAEDALUS_AGENT_ID,
  DAEDALUS_CONSTRAINT_AMENDMENT,
  DAEDALUS_PERMITTED_ACTIONS,
  DAEDALUS_BLOCKED_ACTIONS,
};
