/**
 * Context Retrieval System
 * Retrieves relevant memories for agent deliberation
 * Phase 2: Agent Memory & Learning Persistence
 */

import type { MemoryEntry, FoundingAgent, MemoryQuery } from '../../types';
import { getMemoryStorage } from './storage';

/**
 * Simple keyword extraction from text
 * Extracts meaningful words (4+ chars, non-stopwords)
 */
function extractKeywords(text: string): string[] {
  const stopwords = new Set([
    'this',
    'that',
    'with',
    'from',
    'have',
    'been',
    'were',
    'what',
    'when',
    'where',
    'which',
    'their',
    'there',
    'these',
    'those',
    'will',
    'would',
    'could',
    'should',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopwords.has(w));

  // Count frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Return top keywords by frequency
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map((e) => e[0]);
}

/**
 * Calculate text similarity using Jaccard index on keywords
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1));
  const keywords2 = new Set(extractKeywords(text2));

  const intersection = new Set(
    Array.from(keywords1).filter((k) => keywords2.has(k))
  );
  const union = new Set([...keywords1, ...keywords2]);

  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Simple domain inference from input text
 */
export function inferDomain(input: string): string {
  const domains = {
    security: [
      'security',
      'vulnerability',
      'attack',
      'threat',
      'authentication',
      'authorization',
      'encryption',
    ],
    governance: [
      'governance',
      'policy',
      'decision',
      'consensus',
      'voting',
      'quorum',
    ],
    technical: [
      'code',
      'implementation',
      'algorithm',
      'function',
      'class',
      'method',
      'performance',
    ],
    ethics: [
      'ethics',
      'moral',
      'fairness',
      'justice',
      'privacy',
      'rights',
      'values',
    ],
    economics: [
      'economics',
      'market',
      'price',
      'value',
      'trade',
      'currency',
      'tokens',
    ],
  };

  const inputLower = input.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [domain, keywords] of Object.entries(domains)) {
    scores[domain] = keywords.filter((kw) => inputLower.includes(kw)).length;
  }

  const topDomain = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  return topDomain && topDomain[1] > 0 ? topDomain[0] : 'general';
}

/**
 * Enrich memory entry with retrieval metadata
 */
export function enrichMemoryEntry(entry: MemoryEntry): MemoryEntry {
  return {
    ...entry,
    keywords: extractKeywords(entry.input),
    domain: inferDomain(entry.input),
  };
}

/**
 * Find similar past deliberations
 */
export async function findSimilarDeliberations(
  input: string,
  agent: FoundingAgent,
  limit: number = 5
): Promise<MemoryEntry[]> {
  const storage = await getMemoryStorage();

  // Query recent successful deliberations for this agent
  const result = await storage.query({
    agent,
    successOnly: true,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    limit: 100, // Get recent 100 to search from
  });

  // Calculate similarity scores
  const scored = result.entries.map((entry) => ({
    entry,
    similarity: calculateTextSimilarity(input, entry.input),
  }));

  // Sort by similarity and return top matches
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .filter((s) => s.similarity > 0.1) // Only return if some similarity
    .map((s) => s.entry);
}

/**
 * Get relevant context for a new deliberation
 * Returns past deliberations that might inform the current one
 */
export async function getRelevantContext(
  input: string,
  agent: FoundingAgent,
  options?: {
    includeSimilar?: boolean;
    includeRecent?: boolean;
    includeDomain?: boolean;
    maxEntries?: number;
  }
): Promise<{
  similar: MemoryEntry[];
  recent: MemoryEntry[];
  domain: MemoryEntry[];
  all: MemoryEntry[];
}> {
  const storage = await getMemoryStorage();
  const opts = {
    includeSimilar: true,
    includeRecent: true,
    includeDomain: true,
    maxEntries: 10,
    ...options,
  };

  const context = {
    similar: [] as MemoryEntry[],
    recent: [] as MemoryEntry[],
    domain: [] as MemoryEntry[],
    all: [] as MemoryEntry[],
  };

  // Get similar deliberations
  if (opts.includeSimilar) {
    context.similar = await findSimilarDeliberations(
      input,
      agent,
      Math.ceil(opts.maxEntries / 3)
    );
  }

  // Get recent successful deliberations
  if (opts.includeRecent) {
    const recentResult = await storage.query({
      agent,
      successOnly: true,
      sortBy: 'timestamp',
      sortOrder: 'desc',
      limit: Math.ceil(opts.maxEntries / 3),
    });
    context.recent = recentResult.entries;
  }

  // Get domain-specific deliberations
  if (opts.includeDomain) {
    const domain = inferDomain(input);
    const allEntries = await storage.query({
      agent,
      successOnly: true,
      limit: 100,
    });

    context.domain = allEntries.entries
      .filter((e) => e.domain === domain)
      .slice(0, Math.ceil(opts.maxEntries / 3));
  }

  // Combine and deduplicate
  const seen = new Set<string>();
  const all: MemoryEntry[] = [];

  for (const entry of [
    ...context.similar,
    ...context.recent,
    ...context.domain,
  ]) {
    if (!seen.has(entry.traceId)) {
      seen.add(entry.traceId);
      all.push(entry);
    }
  }

  context.all = all.slice(0, opts.maxEntries);

  return context;
}

/**
 * Format context for prompt injection
 * Creates a concise summary of relevant past deliberations
 */
export function formatContextForPrompt(context: MemoryEntry[]): string {
  if (context.length === 0) {
    return 'No relevant past deliberations found.';
  }

  const summaries = context.map((entry, idx) => {
    return `${idx + 1}. [${new Date(entry.timestamp).toLocaleDateString()}] Input: "${entry.input.slice(0, 100)}${entry.input.length > 100 ? '...' : ''}"
   Output: "${entry.output.slice(0, 150)}${entry.output.length > 150 ? '...' : ''}"
   Agreement: ${(entry.agreement * 100).toFixed(0)}%, GI: ${entry.giScore.toFixed(3)}`;
  });

  return `Relevant past deliberations (${context.length}):
${summaries.join('\n\n')}`;
}

/**
 * Calculate success rate for an agent
 */
export async function calculateSuccessRate(
  agent: FoundingAgent,
  periodDays: number = 30
): Promise<number> {
  const storage = await getMemoryStorage();
  const startTime = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const allResult = await storage.query({
    agent,
    startTime,
  });

  const successResult = await storage.query({
    agent,
    startTime,
    successOnly: true,
  });

  if (allResult.total === 0) return 0;

  return successResult.total / allResult.total;
}

/**
 * Get performance trend (improving, stable, declining)
 */
export async function getPerformanceTrend(
  agent: FoundingAgent,
  metric: 'agreement' | 'giScore' = 'agreement'
): Promise<{
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  recent: number;
  historical: number;
}> {
  const storage = await getMemoryStorage();

  // Get recent deliberations (last 7 days)
  const recentStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentResult = await storage.query({
    agent,
    startTime: recentStart,
    successOnly: true,
  });

  // Get historical deliberations (8-30 days ago)
  const historicalEnd = recentStart;
  const historicalStart = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const historicalResult = await storage.query({
    agent,
    startTime: historicalStart,
    endTime: historicalEnd,
    successOnly: true,
  });

  // Calculate averages
  const recentAvg =
    recentResult.entries.length > 0
      ? recentResult.entries.reduce((sum, e) => sum + e[metric], 0) /
        recentResult.entries.length
      : 0;

  const historicalAvg =
    historicalResult.entries.length > 0
      ? historicalResult.entries.reduce((sum, e) => sum + e[metric], 0) /
        historicalResult.entries.length
      : 0;

  const change = recentAvg - historicalAvg;

  let trend: 'improving' | 'stable' | 'declining';
  if (Math.abs(change) < 0.02) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'improving';
  } else {
    trend = 'declining';
  }

  return {
    trend,
    change,
    recent: recentAvg,
    historical: historicalAvg,
  };
}
