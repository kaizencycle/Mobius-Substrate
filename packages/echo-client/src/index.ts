// packages/echo-client/src/index.ts
// ECHO Layer Client SDK
// One-line save/load for any AI agent

import axios, { AxiosInstance } from "axios";

export interface EchoClientConfig {
  baseURL: string;
  apiKey?: string;
  agentName: string;
  defaultDomain?: string;
}

export interface SaveStateOptions {
  domain?: string;
  locale?: string;
  jurisdiction?: string;
  cacheable?: boolean;
}

export interface LoadStateOptions {
  similarityThreshold?: number;
  domain?: string;
  locale?: string;
}

export interface EchoAnswer {
  answer: string;
  giScore: number;
  source: "cache" | "echo" | "fresh";
  cacheHit?: "exact" | "semantic" | null;
  ledgerTx?: string | null;
  requiresReview?: boolean;
}

/**
 * ECHO Layer Client SDK
 * 
 * Usage:
 * ```typescript
 * const echo = new EchoClient({
 *   baseURL: "https://api.mobius.systems",
 *   apiKey: "your-api-key",
 *   agentName: "my-custom-agent"
 * });
 * 
 * // Load a verified answer (checks cache first)
 * const answer = await echo.loadState("What is the capital of Mongolia?");
 * 
 * // Save a new verified answer (runs ECHO review automatically)
 * await echo.saveState("What is the capital of Mongolia?", "Ulaanbaatar", {
 *   domain: "geography"
 * });
 * ```
 */
export class EchoClient {
  private client: AxiosInstance;
  private config: EchoClientConfig;

  constructor(config: EchoClientConfig) {
    this.config = config;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-Echo-Agent": config.agentName,
        ...(config.apiKey && { "Authorization": `Bearer ${config.apiKey}` })
      },
      timeout: 60000 // 60 seconds
    });
  }

  /**
   * Loads a verified answer from the ECHO Layer
   * Checks cache first, runs ECHO review if needed
   */
  async loadState(
    query: string,
    options: LoadStateOptions = {}
  ): Promise<EchoAnswer> {
    const response = await this.client.post<EchoAnswer>("/v1/deliberate", {
      query,
      domain: options.domain || this.config.defaultDomain || "general",
      locale: options.locale,
      cacheable: true,
      bypassCache: false
    });

    return response.data;
  }

  /**
   * Saves a new verified answer to the ECHO Layer
   * Automatically runs tri-sentinel review and GI scoring
   */
  async saveState(
    query: string,
    proposedAnswer: string,
    options: SaveStateOptions = {}
  ): Promise<{
    answer: string;
    giScore: number;
    cached: boolean;
    cacheId?: string;
  }> {
    const response = await this.client.post("/v1/echo/review", {
      query,
      proposedAnswer,
      domain: options.domain || this.config.defaultDomain,
      locale: options.locale,
      jurisdiction: options.jurisdiction,
      cacheable: options.cacheable !== false
    });

    return response.data;
  }

  /**
   * Checks if an answer exists in cache (fast lookup)
   */
  async checkCache(
    query: string,
    options: { domain?: string } = {}
  ): Promise<{
    exists: boolean;
    cacheHit?: "exact" | "semantic";
    giScore?: number;
    answer?: string;
  }> {
    const response = await this.client.get("/v1/echo/cache/check", {
      params: {
        q: query,
        domain: options.domain
      }
    });

    return response.data;
  }

  /**
   * Invalidates a cached answer (requires admin key)
   */
  async invalidate(
    canonicalKey: string,
    reason: string
  ): Promise<{ success: boolean }> {
    const response = await this.client.delete("/v1/echo/cache/invalidate", {
      data: { canonicalKey, reason }
    });

    return response.data;
  }

  /**
   * Gets cache statistics
   */
  async getStats(domain?: string): Promise<{
    hitRate: number;
    totalEntries: number;
    avgGIScore: number;
    domainBreakdown: Record<string, { hitRate: number; count: number }>;
  }> {
    const response = await this.client.get("/v1/echo/stats", {
      params: domain ? { domain } : undefined
    });

    return response.data;
  }
}

/**
 * Hook for LangChain/LlamaIndex integration
 */
export function createEchoLoader(config: EchoClientConfig) {
  const echo = new EchoClient(config);
  return {
    async load(query: string) {
      const result = await echo.loadState(query);
      return {
        content: result.answer,
        metadata: {
          giScore: result.giScore,
          source: result.source,
          ledgerTx: result.ledgerTx
        }
      };
    }
  };
}

