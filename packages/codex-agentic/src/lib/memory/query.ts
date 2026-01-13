/**
 * Memory Query API
 * High-level query functions for memory retrieval
 * Phase 2: Agent Memory & Learning Persistence
 */

import type {
  FoundingAgent,
  MemoryEntry,
  MemoryQuery,
  MemoryRetrievalResult,
} from '../../types';
import { getMemoryStorage } from './storage';

/**
 * Query memory with filters
 * Wrapper around storage.query with better defaults
 */
export async function queryMemory(
  query: MemoryQuery
): Promise<MemoryRetrievalResult> {
  const storage = await getMemoryStorage();
  return storage.query(query);
}

/**
 * Get a specific memory entry by traceId
 */
export async function getMemoryEntry(
  traceId: string
): Promise<MemoryEntry | undefined> {
  const storage = await getMemoryStorage();
  return storage.getEntry(traceId);
}

/**
 * Get recent deliberations for an agent
 */
export async function getRecentDeliberations(
  agent: FoundingAgent,
  limit: number = 10
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit,
  });
  return result.entries;
}

/**
 * Get successful deliberations (above thresholds)
 */
export async function getSuccessfulDeliberations(
  agent: FoundingAgent,
  limit: number = 10
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    successOnly: true,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit,
  });
  return result.entries;
}

/**
 * Get failed deliberations (below thresholds)
 */
export async function getFailedDeliberations(
  agent: FoundingAgent,
  limit: number = 10
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const allResult = await storage.query({
    agent,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit: 100,
  });

  return allResult.entries.filter((e) => !e.success).slice(0, limit);
}

/**
 * Get high-agreement deliberations
 */
export async function getHighAgreementDeliberations(
  agent: FoundingAgent,
  minAgreement: number = 0.95,
  limit: number = 10
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    minAgreement,
    sortBy: 'agreement',
    sortOrder: 'desc',
    limit,
  });
  return result.entries;
}

/**
 * Get low-agreement deliberations (for analysis)
 */
export async function getLowAgreementDeliberations(
  agent: FoundingAgent,
  maxAgreement: number = 0.80,
  limit: number = 10
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    maxAgreement,
    sortBy: 'agreement',
    sortOrder: 'asc',
    limit,
  });
  return result.entries;
}

/**
 * Get deliberations by tag
 */
export async function getDeliberationsByTag(
  tags: string[],
  agent?: FoundingAgent,
  limit: number = 20
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    tags,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit,
  });
  return result.entries;
}

/**
 * Get deliberations in a time range
 */
export async function getDeliberationsByTimeRange(
  startTime: string,
  endTime: string,
  agent?: FoundingAgent,
  limit: number = 100
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    startTime,
    endTime,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit,
  });
  return result.entries;
}

/**
 * Get today's deliberations
 */
export async function getTodayDeliberations(
  agent?: FoundingAgent
): Promise<MemoryEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startTime = today.toISOString();

  return getDeliberationsByTimeRange(startTime, new Date().toISOString(), agent);
}

/**
 * Search deliberations by input text (simple substring match)
 */
export async function searchDeliberationsByInput(
  searchText: string,
  agent?: FoundingAgent,
  limit: number = 20
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();
  const result = await storage.query({
    agent,
    limit: 1000, // Get more to search through
  });

  const searchLower = searchText.toLowerCase();
  return result.entries
    .filter((e) => e.input.toLowerCase().includes(searchLower))
    .slice(0, limit);
}

/**
 * Get memory statistics
 */
export async function getMemoryStatistics(): Promise<{
  totalEntries: number;
  totalSessions: number;
  entriesByAgent: Record<FoundingAgent, number>;
  oldestEntry?: string;
  newestEntry?: string;
}> {
  const storage = await getMemoryStorage();
  const stats = storage.getStats();

  // Get entries by agent
  const agents: FoundingAgent[] = [
    'ATLAS',
    'AUREA',
    'ZENITH',
    'SOLARA',
    'JADE',
    'EVE',
    'ZEUS',
    'HERMES',
    'KAIZEN',
  ];

  const entriesByAgent: Record<string, number> = {};
  for (const agent of agents) {
    const result = await storage.query({ agent, limit: 1 });
    entriesByAgent[agent] = result.total;
  }

  // Get oldest and newest entries
  const oldestResult = await storage.query({
    sortBy: 'timestamp',
    sortOrder: 'asc',
    limit: 1,
  });
  const newestResult = await storage.query({
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit: 1,
  });

  return {
    totalEntries: stats.totalEntries,
    totalSessions: stats.totalSessions,
    entriesByAgent: entriesByAgent as Record<FoundingAgent, number>,
    oldestEntry: oldestResult.entries[0]?.timestamp,
    newestEntry: newestResult.entries[0]?.timestamp,
  };
}
