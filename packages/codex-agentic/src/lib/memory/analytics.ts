/**
 * Learning Pattern Tracker and Analytics
 * Extracts patterns and insights from agent memory
 * Phase 2: Agent Memory & Learning Persistence
 */

import type {
  FoundingAgent,
  LearningPattern,
  AgentAnalytics,
  ProviderId,
  MemoryEntry,
} from '../../types';
import { getMemoryStorage } from './storage';
import { generateTraceId } from '../util/hash';

/**
 * Detect learning patterns from memory entries
 */
export async function detectPatterns(
  agent: FoundingAgent,
  periodDays: number = 30
): Promise<LearningPattern[]> {
  const storage = await getMemoryStorage();
  const startTime = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const result = await storage.query({
    agent,
    startTime,
  });

  const patterns: LearningPattern[] = [];

  // Pattern 1: Success patterns (high agreement + high GI)
  const successEntries = result.entries.filter(
    (e) => e.agreement >= 0.95 && e.giScore >= 0.98
  );
  if (successEntries.length >= 3) {
    patterns.push({
      patternId: generateTraceId({ agent, type: 'success', t: Date.now() }),
      agent,
      type: 'success',
      occurrences: successEntries.length,
      avgAgreement:
        successEntries.reduce((sum, e) => sum + e.agreement, 0) /
        successEntries.length,
      avgGI:
        successEntries.reduce((sum, e) => sum + e.giScore, 0) /
        successEntries.length,
      successRate: 1.0,
      exampleTraceIds: successEntries.slice(0, 5).map((e) => e.traceId),
      firstSeen: successEntries[successEntries.length - 1].timestamp,
      lastSeen: successEntries[0].timestamp,
    });
  }

  // Pattern 2: Failure patterns (low agreement or low GI)
  const failureEntries = result.entries.filter(
    (e) => e.agreement < 0.90 || e.giScore < 0.95
  );
  if (failureEntries.length >= 3) {
    patterns.push({
      patternId: generateTraceId({ agent, type: 'failure', t: Date.now() }),
      agent,
      type: 'failure',
      occurrences: failureEntries.length,
      avgAgreement:
        failureEntries.reduce((sum, e) => sum + e.agreement, 0) /
        failureEntries.length,
      avgGI:
        failureEntries.reduce((sum, e) => sum + e.giScore, 0) /
        failureEntries.length,
      successRate: 0,
      exampleTraceIds: failureEntries.slice(0, 5).map((e) => e.traceId),
      firstSeen: failureEntries[failureEntries.length - 1].timestamp,
      lastSeen: failureEntries[0].timestamp,
    });
  }

  // Pattern 3: Threshold breaches
  const thresholdBreaches = result.entries.filter((e) => e.belowThreshold);
  if (thresholdBreaches.length >= 2) {
    patterns.push({
      patternId: generateTraceId({
        agent,
        type: 'threshold_breach',
        t: Date.now(),
      }),
      agent,
      type: 'threshold_breach',
      occurrences: thresholdBreaches.length,
      avgAgreement:
        thresholdBreaches.reduce((sum, e) => sum + e.agreement, 0) /
        thresholdBreaches.length,
      avgGI:
        thresholdBreaches.reduce((sum, e) => sum + e.giScore, 0) /
        thresholdBreaches.length,
      successRate: 0,
      exampleTraceIds: thresholdBreaches.slice(0, 5).map((e) => e.traceId),
      firstSeen: thresholdBreaches[thresholdBreaches.length - 1].timestamp,
      lastSeen: thresholdBreaches[0].timestamp,
    });
  }

  // Pattern 4: High agreement patterns (agreement >= 0.95)
  const highAgreement = result.entries.filter((e) => e.agreement >= 0.95);
  if (highAgreement.length >= 5) {
    patterns.push({
      patternId: generateTraceId({
        agent,
        type: 'high_agreement',
        t: Date.now(),
      }),
      agent,
      type: 'high_agreement',
      occurrences: highAgreement.length,
      avgAgreement:
        highAgreement.reduce((sum, e) => sum + e.agreement, 0) /
        highAgreement.length,
      avgGI:
        highAgreement.reduce((sum, e) => sum + e.giScore, 0) /
        highAgreement.length,
      successRate: highAgreement.filter((e) => e.success).length / highAgreement.length,
      exampleTraceIds: highAgreement.slice(0, 5).map((e) => e.traceId),
      firstSeen: highAgreement[highAgreement.length - 1].timestamp,
      lastSeen: highAgreement[0].timestamp,
    });
  }

  // Pattern 5: Low agreement patterns (agreement < 0.80)
  const lowAgreement = result.entries.filter((e) => e.agreement < 0.80);
  if (lowAgreement.length >= 3) {
    patterns.push({
      patternId: generateTraceId({
        agent,
        type: 'low_agreement',
        t: Date.now(),
      }),
      agent,
      type: 'low_agreement',
      occurrences: lowAgreement.length,
      avgAgreement:
        lowAgreement.reduce((sum, e) => sum + e.agreement, 0) /
        lowAgreement.length,
      avgGI:
        lowAgreement.reduce((sum, e) => sum + e.giScore, 0) / lowAgreement.length,
      successRate: lowAgreement.filter((e) => e.success).length / lowAgreement.length,
      exampleTraceIds: lowAgreement.slice(0, 5).map((e) => e.traceId),
      firstSeen: lowAgreement[lowAgreement.length - 1].timestamp,
      lastSeen: lowAgreement[0].timestamp,
    });
  }

  return patterns;
}

/**
 * Generate analytics for an agent
 */
export async function generateAgentAnalytics(
  agent: FoundingAgent,
  periodDays: number = 30
): Promise<AgentAnalytics> {
  const storage = await getMemoryStorage();
  const endTime = new Date().toISOString();
  const startTime = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const result = await storage.query({
    agent,
    startTime,
    endTime,
  });

  const entries = result.entries;

  if (entries.length === 0) {
    // Return empty analytics
    return {
      agent,
      period: { start: startTime, end: endTime },
      totalDeliberations: 0,
      successfulDeliberations: 0,
      successRate: 0,
      avgAgreement: 0,
      minAgreement: 0,
      maxAgreement: 0,
      agreementTrend: 0,
      avgGI: 0,
      minGI: 0,
      maxGI: 0,
      giTrend: 0,
      providerStats: {} as any,
      topPatterns: [],
      totalSessions: 0,
      avgDeliberationsPerSession: 0,
    };
  }

  // Basic metrics
  const totalDeliberations = entries.length;
  const successfulDeliberations = entries.filter((e) => e.success).length;
  const successRate = successfulDeliberations / totalDeliberations;

  // Agreement metrics
  const agreements = entries.map((e) => e.agreement);
  const avgAgreement = agreements.reduce((sum, a) => sum + a, 0) / agreements.length;
  const minAgreement = Math.min(...agreements);
  const maxAgreement = Math.max(...agreements);

  // Calculate agreement trend (recent vs historical)
  const midpoint = new Date(
    (new Date(startTime).getTime() + new Date(endTime).getTime()) / 2
  ).toISOString();
  const recentEntries = entries.filter((e) => e.timestamp >= midpoint);
  const historicalEntries = entries.filter((e) => e.timestamp < midpoint);

  const recentAvgAgreement =
    recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.agreement, 0) /
        recentEntries.length
      : avgAgreement;
  const historicalAvgAgreement =
    historicalEntries.length > 0
      ? historicalEntries.reduce((sum, e) => sum + e.agreement, 0) /
        historicalEntries.length
      : avgAgreement;
  const agreementTrend = recentAvgAgreement - historicalAvgAgreement;

  // GI metrics
  const giScores = entries.map((e) => e.giScore);
  const avgGI = giScores.reduce((sum, g) => sum + g, 0) / giScores.length;
  const minGI = Math.min(...giScores);
  const maxGI = Math.max(...giScores);

  const recentAvgGI =
    recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.giScore, 0) / recentEntries.length
      : avgGI;
  const historicalAvgGI =
    historicalEntries.length > 0
      ? historicalEntries.reduce((sum, e) => sum + e.giScore, 0) /
        historicalEntries.length
      : avgGI;
  const giTrend = recentAvgGI - historicalAvgGI;

  // Provider statistics
  const providerStats: Record<
    ProviderId,
    {
      uses: number;
      avgAgreement: number;
      avgGI: number;
      errorRate: number;
    }
  > = {} as any;

  const allProviders: ProviderId[] = [
    'anthropic',
    'openai',
    'gemini',
    'deepseek',
    'local',
  ];

  for (const provider of allProviders) {
    const providerEntries = entries.filter((e) => e.providers.includes(provider));

    if (providerEntries.length === 0) {
      providerStats[provider] = {
        uses: 0,
        avgAgreement: 0,
        avgGI: 0,
        errorRate: 0,
      };
      continue;
    }

    const providerAgreement =
      providerEntries.reduce((sum, e) => sum + e.agreement, 0) /
      providerEntries.length;
    const providerGI =
      providerEntries.reduce((sum, e) => sum + e.giScore, 0) /
      providerEntries.length;
    const errorCount = providerEntries.reduce(
      (sum, e) => sum + (e.errorCount || 0),
      0
    );
    const errorRate = errorCount / providerEntries.length;

    providerStats[provider] = {
      uses: providerEntries.length,
      avgAgreement: providerAgreement,
      avgGI: providerGI,
      errorRate,
    };
  }

  // Session metrics
  const sessions = await storage.getAgentSessions(agent);
  const recentSessions = sessions.filter(
    (s) => s.startTime >= startTime && s.startTime <= endTime
  );
  const totalSessions = recentSessions.length;
  const avgDeliberationsPerSession =
    totalSessions > 0
      ? recentSessions.reduce((sum, s) => sum + s.deliberationCount, 0) /
        totalSessions
      : 0;

  // Detect patterns
  const topPatterns = await detectPatterns(agent, periodDays);

  return {
    agent,
    period: { start: startTime, end: endTime },
    totalDeliberations,
    successfulDeliberations,
    successRate,
    avgAgreement,
    minAgreement,
    maxAgreement,
    agreementTrend,
    avgGI,
    minGI,
    maxGI,
    giTrend,
    providerStats,
    topPatterns,
    totalSessions,
    avgDeliberationsPerSession,
  };
}

/**
 * Compare agent performance
 */
export async function compareAgents(
  agents: FoundingAgent[],
  periodDays: number = 30
): Promise<{
  agents: FoundingAgent[];
  analytics: Record<FoundingAgent, AgentAnalytics>;
  rankings: {
    byAgreement: FoundingAgent[];
    byGI: FoundingAgent[];
    bySuccessRate: FoundingAgent[];
  };
}> {
  const analytics: Record<string, AgentAnalytics> = {};

  for (const agent of agents) {
    analytics[agent] = await generateAgentAnalytics(agent, periodDays);
  }

  const rankings = {
    byAgreement: agents
      .slice()
      .sort((a, b) => analytics[b].avgAgreement - analytics[a].avgAgreement),
    byGI: agents.slice().sort((a, b) => analytics[b].avgGI - analytics[a].avgGI),
    bySuccessRate: agents
      .slice()
      .sort((a, b) => analytics[b].successRate - analytics[a].successRate),
  };

  return {
    agents,
    analytics: analytics as Record<FoundingAgent, AgentAnalytics>,
    rankings,
  };
}

/**
 * Get provider recommendations for an agent
 * Based on historical performance
 */
export async function getProviderRecommendations(
  agent: FoundingAgent,
  periodDays: number = 30
): Promise<{
  recommended: ProviderId[];
  avoid: ProviderId[];
  reasoning: string;
}> {
  const analytics = await generateAgentAnalytics(agent, periodDays);

  if (analytics.totalDeliberations === 0) {
    return {
      recommended: ['anthropic', 'openai'],
      avoid: [],
      reasoning: 'No historical data available. Using default recommendations.',
    };
  }

  // Sort providers by performance
  const providerPerformance = Object.entries(analytics.providerStats)
    .filter(([_, stats]) => stats.uses > 0)
    .map(([provider, stats]) => ({
      provider: provider as ProviderId,
      score: stats.avgAgreement * 0.4 + stats.avgGI * 0.4 + (1 - stats.errorRate) * 0.2,
      ...stats,
    }))
    .sort((a, b) => b.score - a.score);

  const recommended = providerPerformance.slice(0, 3).map((p) => p.provider);
  const avoid = providerPerformance
    .filter((p) => p.errorRate > 0.2 || p.avgAgreement < 0.85)
    .map((p) => p.provider);

  const reasoning = `Based on ${analytics.totalDeliberations} deliberations over ${periodDays} days. Top performers: ${recommended.join(', ')}.${avoid.length > 0 ? ` Avoid: ${avoid.join(', ')} (high error rate or low agreement).` : ''}`;

  return {
    recommended,
    avoid,
    reasoning,
  };
}

/**
 * Generate a performance report
 */
export function formatAnalyticsReport(analytics: AgentAnalytics): string {
  const lines = [
    `# Agent Analytics Report: ${analytics.agent}`,
    `Period: ${new Date(analytics.period.start).toLocaleDateString()} - ${new Date(analytics.period.end).toLocaleDateString()}`,
    '',
    '## Deliberation Metrics',
    `- Total Deliberations: ${analytics.totalDeliberations}`,
    `- Successful: ${analytics.successfulDeliberations} (${(analytics.successRate * 100).toFixed(1)}%)`,
    '',
    '## Agreement Metrics',
    `- Average: ${(analytics.avgAgreement * 100).toFixed(1)}%`,
    `- Range: ${(analytics.minAgreement * 100).toFixed(1)}% - ${(analytics.maxAgreement * 100).toFixed(1)}%`,
    `- Trend: ${analytics.agreementTrend >= 0 ? '↗' : '↘'} ${(Math.abs(analytics.agreementTrend) * 100).toFixed(1)}%`,
    '',
    '## GI Metrics',
    `- Average: ${analytics.avgGI.toFixed(3)}`,
    `- Range: ${analytics.minGI.toFixed(3)} - ${analytics.maxGI.toFixed(3)}`,
    `- Trend: ${analytics.giTrend >= 0 ? '↗' : '↘'} ${Math.abs(analytics.giTrend).toFixed(3)}`,
    '',
    '## Provider Performance',
  ];

  for (const [provider, stats] of Object.entries(analytics.providerStats)) {
    if (stats.uses > 0) {
      lines.push(
        `- ${provider}: ${stats.uses} uses, ${(stats.avgAgreement * 100).toFixed(1)}% agreement, ${stats.avgGI.toFixed(3)} GI, ${(stats.errorRate * 100).toFixed(1)}% errors`
      );
    }
  }

  lines.push('');
  lines.push('## Sessions');
  lines.push(`- Total: ${analytics.totalSessions}`);
  lines.push(
    `- Average deliberations per session: ${analytics.avgDeliberationsPerSession.toFixed(1)}`
  );

  if (analytics.topPatterns.length > 0) {
    lines.push('');
    lines.push('## Top Patterns');
    for (const pattern of analytics.topPatterns.slice(0, 3)) {
      lines.push(
        `- ${pattern.type}: ${pattern.occurrences} occurrences, ${(pattern.avgAgreement * 100).toFixed(1)}% agreement, ${pattern.avgGI.toFixed(3)} GI`
      );
    }
  }

  return lines.join('\n');
}
