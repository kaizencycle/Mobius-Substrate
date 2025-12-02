/**
 * @fileoverview Constitutional Enforcement Layer
 * @description Exports all constitutional constraints and validators
 * @version 1.1.2
 * @cycle C-152
 * 
 * This module contains HARDCODED constitutional constraints that cannot
 * be overridden by manifest changes. These represent the fundamental
 * separation of powers in the Mobius Agent Stack.
 * 
 * Constitutional Amendments (v1.1.2):
 * - C-001: DAEDALUS Executor Constraint
 * - C-002: ZEUS Split Codification
 * - C-003: MIC Terminology Standardization
 * - C-004: HERMES System Agent Classification
 * - C-005: Tier-Based Permission Enforcement
 */

export * from './daedalus-constraint';

// Re-export default as named for convenience
export { default as DaedalusConstraint } from './daedalus-constraint';

/**
 * Constitutional amendment references
 */
export const CONSTITUTIONAL_AMENDMENTS = {
  'C-001': {
    title: 'DAEDALUS Executor Constraint',
    enforcement: 'HARDCODED',
    description: 'DAEDALUS cannot trigger executors',
  },
  'C-002': {
    title: 'ZEUS Split Codification',
    enforcement: 'MANIFEST',
    description: 'ZEUS split into Coordinator (T2) and Sentinel (T4)',
  },
  'C-003': {
    title: 'MIC Terminology Standardization',
    enforcement: 'MANIFEST',
    description: 'GIC → MIC migration (legacy alias preserved)',
  },
  'C-004': {
    title: 'HERMES System Agent Classification',
    enforcement: 'MANIFEST',
    description: 'HERMES classified as System Agent (not LLM)',
  },
  'C-005': {
    title: 'Tier-Based Permission Enforcement',
    enforcement: 'HARDCODED',
    description: 'Only Tier 3 can modify code',
  },
} as const;

/**
 * Validate all constitutional constraints for an agent action
 */
export function validateConstitutionalConstraints(
  agentId: string,
  actionType: string,
  agentTier?: number
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];

  // C-001: DAEDALUS constraint
  try {
    const { validateDaedalusConstraint } = require('./daedalus-constraint');
    validateDaedalusConstraint(agentId, actionType);
  } catch (error: any) {
    violations.push(`C-001: ${error.message}`);
  }

  // C-005: Tier-based permission (if tier provided)
  if (agentTier !== undefined) {
    const isCodeAction = ['EDIT_CODE', 'EXECUTE_CODE', 'EDIT_REPO'].includes(
      actionType.toUpperCase()
    );
    if (isCodeAction && agentTier !== 3) {
      violations.push(
        `C-005: Tier ${agentTier} agent cannot perform code modifications (Tier 3 exclusive)`
      );
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
