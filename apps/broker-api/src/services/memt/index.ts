/**
 * MEMT Services Index
 *
 * Exports all MEMT-related services for the Thought Broker.
 */

// Core MEMT routing
export {
  buildMemtRoutingPlan,
  normalizeTask,
  classifyTask,
  filterByEnabledEngines,
  getEngineProfile,
  getEnginesByMAQ,
  getEnginesByClass,
  calculateExpectedGI,
  ENGINE_PROFILES,
} from '../memtRouter';

// ECHO Layer integration
export {
  echoUpsertMemory,
  echoQueryMemory,
  echoBatchUpsert,
  echoInvalidateMemory,
} from './echoMemtClient';

// Civic Ledger integration
export {
  ledgerAttest,
  ledgerVerify,
  ledgerQueryHistory,
  buildLedgerPayload,
} from './ledgerMemtClient';

// Re-export types for convenience
export type {
  MemtEngineId,
  CognitiveClass,
  TaskKind,
  RiskLevel,
  PrecisionRequirement,
  DvaTier,
  EngineRole,
  NormalizedTask,
  NormalizedTaskContext,
  EngineCallPlan,
  MemtRoutingPlan,
  MemtEngineProfile,
  EngineCapabilities,
  TaskClassification,
  MemtEngineResponse,
  MemtConsensusResponse,
  MemtEchoPayload,
  MemtLedgerPayload,
  MemtRoutingStats,
} from '../../types/memt';
