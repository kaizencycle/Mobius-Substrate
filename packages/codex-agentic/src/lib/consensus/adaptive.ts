/**
 * Adaptive Routing
 * Phase 3: Enhanced Deliberation & Consensus Modes
 * Uses memory analytics to select best providers for each task
 */

import type { FoundingAgent, ProviderId } from '../../types';
import { generateAgentAnalytics } from '../memory/analytics';
import { getProviderRecommendations } from '../memory/analytics';
import { inferDomain } from '../memory/retrieval';

/**
 * Provider selection result
 */
export interface ProviderSelection {
  providers: ProviderId[];
  reasoning: string;
  confidence: number;
  basedOn: 'default' | 'performance' | 'domain' | 'cost' | 'latency';
}

/**
 * Select best providers adaptively based on context
 */
export async function selectProvidersAdaptively(
  agent: FoundingAgent,
  input: string,
  defaultProviders: ProviderId[],
  options?: {
    maxCost?: number;
    maxLatency?: number;
    preferPerformance?: boolean;
    domainAware?: boolean;
  }
): Promise<ProviderSelection> {
  const opts = {
    preferPerformance: true,
    domainAware: true,
    ...options,
  };

  // Get historical performance
  const recommendations = await getProviderRecommendations(agent, 30);

  // If no historical data, use defaults
  if (!recommendations.recommended || recommendations.recommended.length === 0) {
    return {
      providers: defaultProviders,
      reasoning: 'No historical data available, using default provider route',
      confidence: 0.5,
      basedOn: 'default',
    };
  }

  // Domain-aware routing
  if (opts.domainAware) {
    const domain = inferDomain(input);
    const domainProviders = selectByDomain(domain, defaultProviders);

    if (domainProviders.length > 0) {
      return {
        providers: domainProviders,
        reasoning: `Domain-aware selection for '${domain}': ${domainProviders.join(', ')}`,
        confidence: 0.75,
        basedOn: 'domain',
      };
    }
  }

  // Performance-based routing
  if (opts.preferPerformance) {
    // Combine recommendations with defaults
    const topProviders = recommendations.recommended.slice(0, 3);
    const combinedProviders = [
      ...topProviders,
      ...defaultProviders.filter((p) => !topProviders.includes(p)),
    ].slice(0, defaultProviders.length);

    // Filter out providers to avoid (if any)
    const filteredProviders = combinedProviders.filter(
      (p) => !recommendations.avoid.includes(p)
    );

    return {
      providers: filteredProviders.length > 0 ? filteredProviders : defaultProviders,
      reasoning: `Performance-based: Top performers are ${topProviders.join(', ')}${recommendations.avoid.length > 0 ? `, avoiding ${recommendations.avoid.join(', ')}` : ''}`,
      confidence: 0.85,
      basedOn: 'performance',
    };
  }

  // Cost-constrained routing
  if (opts.maxCost !== undefined) {
    const costEffectiveProviders = selectByCost(
      recommendations.recommended,
      opts.maxCost
    );

    if (costEffectiveProviders.length > 0) {
      return {
        providers: costEffectiveProviders,
        reasoning: `Cost-constrained: Selected providers within $${opts.maxCost} budget`,
        confidence: 0.7,
        basedOn: 'cost',
      };
    }
  }

  // Latency-constrained routing
  if (opts.maxLatency !== undefined) {
    const fastProviders = selectByLatency(
      recommendations.recommended,
      opts.maxLatency
    );

    if (fastProviders.length > 0) {
      return {
        providers: fastProviders,
        reasoning: `Latency-constrained: Selected providers under ${opts.maxLatency}ms`,
        confidence: 0.7,
        basedOn: 'latency',
      };
    }
  }

  // Fallback to defaults
  return {
    providers: defaultProviders,
    reasoning: 'Using default provider route after filtering',
    confidence: 0.6,
    basedOn: 'default',
  };
}

/**
 * Select providers by domain
 */
function selectByDomain(
  domain: string,
  defaultProviders: ProviderId[]
): ProviderId[] {
  // Domain-specific provider preferences
  const domainPreferences: Record<string, ProviderId[]> = {
    security: ['deepseek', 'anthropic', 'local'],
    governance: ['anthropic', 'openai', 'gemini'],
    technical: ['deepseek', 'openai', 'local'],
    ethics: ['anthropic', 'gemini', 'openai'],
    economics: ['openai', 'deepseek', 'anthropic'],
    general: defaultProviders,
  };

  const preferred = domainPreferences[domain] || domainPreferences.general;

  // Intersect with defaults to maintain some original routing
  return preferred.filter((p) => defaultProviders.includes(p)).slice(0, defaultProviders.length);
}

/**
 * Select providers by cost constraint
 */
function selectByCost(
  providers: ProviderId[],
  maxCost: number
): ProviderId[] {
  // Estimated cost per 1K tokens (USD)
  const providerCosts: Record<ProviderId, number> = {
    anthropic: 0.003, // Claude Sonnet 4
    openai: 0.0025,   // GPT-4o
    gemini: 0.00125,  // Gemini 1.5 Pro
    deepseek: 0.00027, // DeepSeek
    local: 0,         // Local/Ollama (free)
  };

  // Estimate cost for a typical deliberation (~2K tokens)
  const avgTokens = 2000;

  return providers.filter((p) => {
    const estimatedCost = (providerCosts[p] || 0.003) * (avgTokens / 1000);
    return estimatedCost <= maxCost;
  });
}

/**
 * Select providers by latency constraint
 */
function selectByLatency(
  providers: ProviderId[],
  maxLatency: number
): ProviderId[] {
  // Estimated average latency (ms)
  const providerLatencies: Record<ProviderId, number> = {
    anthropic: 2000,  // ~2s
    openai: 1500,     // ~1.5s
    gemini: 3000,     // ~3s
    deepseek: 2500,   // ~2.5s
    local: 5000,      // ~5s (depends on hardware)
  };

  return providers.filter((p) => {
    const estimatedLatency = providerLatencies[p] || 2000;
    return estimatedLatency <= maxLatency;
  });
}

/**
 * Estimate total cost for a deliberation
 */
export function estimateDeliberationCost(
  providers: ProviderId[],
  estimatedTokens: number = 2000
): number {
  const providerCosts: Record<ProviderId, number> = {
    anthropic: 0.003,
    openai: 0.0025,
    gemini: 0.00125,
    deepseek: 0.00027,
    local: 0,
  };

  return providers.reduce((total, provider) => {
    const costPer1K = providerCosts[provider] || 0.003;
    return total + (costPer1K * estimatedTokens) / 1000;
  }, 0);
}

/**
 * Estimate total latency for a deliberation
 */
export function estimateDeliberationLatency(
  providers: ProviderId[],
  parallel: boolean = true
): number {
  const providerLatencies: Record<ProviderId, number> = {
    anthropic: 2000,
    openai: 1500,
    gemini: 3000,
    deepseek: 2500,
    local: 5000,
  };

  if (parallel) {
    // Parallel: max of all latencies
    return Math.max(...providers.map((p) => providerLatencies[p] || 2000));
  } else {
    // Sequential: sum of all latencies
    return providers.reduce(
      (total, provider) => total + (providerLatencies[provider] || 2000),
      0
    );
  }
}

/**
 * Recommend optimal deliberation strategy based on constraints
 */
export function recommendStrategy(options: {
  maxCost?: number;
  maxLatency?: number;
  minAgreement?: number;
}): {
  consensus: 'simple' | 'supermajority' | 'weighted';
  deliberation: 'parallel' | 'sequential' | 'cascade';
  reasoning: string;
} {
  const { maxCost, maxLatency, minAgreement } = options;

  // Cost-constrained: use cascade to minimize provider calls
  if (maxCost !== undefined && maxCost < 0.01) {
    return {
      consensus: 'simple',
      deliberation: 'cascade',
      reasoning: 'Cost-constrained: Using cascade to minimize provider calls',
    };
  }

  // Latency-constrained: use parallel for speed
  if (maxLatency !== undefined && maxLatency < 3000) {
    return {
      consensus: 'simple',
      deliberation: 'parallel',
      reasoning: 'Latency-constrained: Using parallel for fastest results',
    };
  }

  // High agreement required: use weighted with multi-round
  if (minAgreement !== undefined && minAgreement >= 0.95) {
    return {
      consensus: 'weighted',
      deliberation: 'parallel',
      reasoning: 'High agreement required: Using weighted consensus for quality',
    };
  }

  // Default: balanced approach
  return {
    consensus: 'simple',
    deliberation: 'parallel',
    reasoning: 'Balanced approach: Parallel deliberation with simple consensus',
  };
}
