/**
 * Memory System - Phase 2: Agent Memory & Learning Persistence
 * Exports for all memory-related functionality
 */

// Storage
export {
  MemoryStorage,
  getMemoryStorage,
  shutdownMemoryStorage,
} from './storage';

// Retrieval
export {
  enrichMemoryEntry,
  findSimilarDeliberations,
  getRelevantContext,
  formatContextForPrompt,
  calculateSuccessRate,
  getPerformanceTrend,
  inferDomain,
} from './retrieval';

// Analytics
export {
  detectPatterns,
  generateAgentAnalytics,
  compareAgents,
  getProviderRecommendations,
  formatAnalyticsReport,
} from './analytics';

// Session Management
export {
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
} from './session';

// Query API
export { queryMemory, getMemoryEntry, getRecentDeliberations } from './query';
