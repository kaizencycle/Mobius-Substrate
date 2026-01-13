/**
 * Consensus Module - Phase 3: Enhanced Deliberation & Consensus Modes
 * Exports for all consensus-related functionality
 */

// Consensus modes
export {
  calculateConsensus,
  resolveTie,
  type ConsensusResult,
} from './modes';

// Deliberation strategies
export {
  executeDeliberation,
  type DeliberationResult,
} from './strategies';

// Decision quality
export {
  analyzeDecisionQuality,
  assessDecisionRisk,
  summarizeQuality,
} from './quality';

// Adaptive routing
export {
  selectProvidersAdaptively,
  estimateDeliberationCost,
  estimateDeliberationLatency,
  recommendStrategy,
  type ProviderSelection,
} from './adaptive';
