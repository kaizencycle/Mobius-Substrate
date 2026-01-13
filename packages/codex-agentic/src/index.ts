/**
 * Codex-Agentic Federation
 * Multi-LLM routing and consensus system for Kaizen OS Founding Agents
 *
 * @packageDocumentation
 */

// Core types
export * from './types';

// Stability anchors
export { STABILITY_ANCHORS, getAnchor, getActiveAnchors, getAnchorsByProvider } from './agents/anchors';

// Main router
export { codexDeliberate, councilDeliberate } from './lib/codex/router';

// Provider adapters (for advanced usage)
export { callOpenAI } from './lib/codex/providers/openai';
export { callAnthropic } from './lib/codex/providers/anthropic';
export { callGemini } from './lib/codex/providers/gemini';
export { callDeepSeek } from './lib/codex/providers/deepseek';
export { callLocal } from './lib/codex/providers/local';

// GI metrics
export { giScoreFor, calculateAgreement, groupByTextSimilarity } from './lib/gi/metrics';

// Ledger attestation
export { attestToLedger, batchAttest } from './lib/gi/ledger';

// OAA discourse
export { oaaLearn, oaaQuery, hasOAAConsent } from './lib/discourse/oaa';

// Utilities
export { stableHash, generateTraceId } from './lib/util/hash';
export { mustEnv, optionalEnv, hasEnv } from './lib/util/env';

// Phase 2: Memory & Learning
export {
  getMemoryStorage,
  shutdownMemoryStorage,
  enrichMemoryEntry,
  findSimilarDeliberations,
  getRelevantContext,
  formatContextForPrompt,
  calculateSuccessRate,
  getPerformanceTrend,
  detectPatterns,
  generateAgentAnalytics,
  compareAgents,
  getProviderRecommendations,
  formatAnalyticsReport,
  createSession,
  getOrCreateSession,
  endSession,
  endAgentSessions,
  getSessionStats,
  linkSessions,
  getLinkedSessions,
  cleanupOldSessions,
  getActiveSessions,
  getActiveAgentSessions,
  queryMemory,
  getMemoryEntry,
  getRecentDeliberations,
} from './lib/memory';

// Phase 3: Enhanced Deliberation & Consensus Modes
export { enhancedCodexDeliberate } from './lib/codex/enhanced-router';
export {
  calculateConsensus,
  resolveTie,
  executeDeliberation,
  analyzeDecisionQuality,
  assessDecisionRisk,
  summarizeQuality,
  selectProvidersAdaptively,
  estimateDeliberationCost,
  estimateDeliberationLatency,
  recommendStrategy,
} from './lib/consensus';
