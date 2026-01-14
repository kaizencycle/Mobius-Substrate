/**
 * @fileoverview Sentinel Library - Core Utilities
 * @description Main entry point for sentinel orchestration utilities
 */

// Registry
export {
  SentinelRegistry,
  getSentinelRegistry,
  initializeRegistry,
  type SentinelInfo,
  type RegistryConfig,
} from './registry';

// Health
export {
  calculateOverallStatus,
  createHealthResponse,
  isHealthy,
  hasIssues,
  getFailedComponents,
  getDegradedComponents,
  isGIHealthy,
  isMIIHealthy,
  isSuccessRateHealthy,
  generateWarnings,
  aggregateHealth,
  type HealthStatus,
  type ComponentStatus,
  type ComponentHealth,
  type HealthMetrics,
  type DependencyHealth,
  type HealthWarning,
  type HealthCheckResponse,
  type HealthCheckConfig,
  type AggregatedHealth,
} from './health';

// Consensus
export {
  parseQuorum,
  checkQuorum,
  calculateConsensus,
  getVetoAuthority,
  canVeto,
  calculateAgreement,
  getRequiredVotes,
  createVote,
  validateVote,
  getVoteSummary,
  DEFAULT_QUORUM,
  type VoteDecision,
  type ConsensusMode,
  type Vote,
  type ConsensusRequest,
  type ConsensusResult,
  type QuorumConfig,
} from './consensus';
