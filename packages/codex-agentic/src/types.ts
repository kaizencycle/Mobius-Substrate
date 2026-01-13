/**
 * Core types for the Codex-Agentic Federation
 * Multi-LLM routing and consensus system for Kaizen OS
 */

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'local';

export type FoundingAgent =
  | 'AUREA'   // Integrity & Reasoning
  | 'ATLAS'   // Systems & Policy
  | 'ZENITH'  // Research & Ethics
  | 'SOLARA'  // Computation & Optimization
  | 'JADE'    // Morale & Astro-ethics
  | 'EVE'     // Governance & Wisdom
  | 'ZEUS'    // Security & Defense
  | 'HERMES'  // Markets & Information
  | 'KAIZEN'; // Core Constitution (Dormant)

export interface StabilityAnchor {
  agent: FoundingAgent;
  domainFocus: string;
  defaultRoute: ProviderId[];
  minAgreement: number;           // e.g., 0.90 (90% agreement threshold)
  giTarget: number;               // e.g., 0.99 (target GI score)
  ledgerNamespace: string;        // e.g., "consensus:aurea"
  website: string;                // e.g., "aurea.gic"
  learnWebhook?: string;          // OAA Hub webhook URL
  active: boolean;                // Agent is active and can participate
}

export interface CodexRequest {
  agent: FoundingAgent;
  input: string;
  context?: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
  tags?: string[];                // e.g., ["consensus", "oaa", "eval"]
}

export interface CodexVote {
  provider: ProviderId;
  output: string;
  usage?: {
    prompt: number;
    completion: number;
  };
  meta?: Record<string, unknown>;
}

export interface DelibProof {
  agreement: number;              // 0..1 (proportion of votes in agreement)
  votes: CodexVote[];
  winner: CodexVote;              // The winning vote/output
  traceId: string;                // Unique identifier for ledger attestation
  giScore: number;                // 0..1 (Governance Integrity score)
  timestamp: string;              // ISO timestamp
}

export interface ProviderAdapter {
  name: ProviderId;
  chat(req: CodexRequest, signal?: AbortSignal): Promise<CodexVote>;
}

export interface LedgerAttestation {
  namespace: string;
  traceId: string;
  agent: string;
  agreement: number;
  giScore: number;
  providers: string[];
  timestamp?: string;
}

export interface OAALearnPayload {
  agent: string;
  traceId: string;
  input: string;
  output: string;
  agreement: number;
  giScore: number;
  timestamp?: string;
}

// ============================================================================
// Phase 2: Agent Memory & Learning Persistence
// ============================================================================

/**
 * Memory entry for a single deliberation
 * Stores complete context for learning and retrieval
 */
export interface MemoryEntry {
  // Core identification
  traceId: string;
  agent: FoundingAgent;
  timestamp: string;
  sessionId?: string;              // Link related deliberations

  // Request context
  input: string;
  inputContext?: Record<string, unknown>;
  tags?: string[];

  // Response data
  output: string;
  agreement: number;
  giScore: number;
  providers: ProviderId[];

  // Complete deliberation data
  votes: CodexVote[];
  winner: CodexVote;

  // Learning metadata
  success: boolean;                // Did it meet thresholds?
  belowThreshold?: boolean;        // Agreement below minimum?
  errorCount?: number;             // Number of provider failures

  // Retrieval metadata
  embedding?: number[];            // For semantic search (future)
  keywords?: string[];             // Extracted keywords
  domain?: string;                 // Inferred domain
}

/**
 * Session tracking for related deliberations
 */
export interface MemorySession {
  sessionId: string;
  agent: FoundingAgent;
  startTime: string;
  endTime?: string;
  deliberationCount: number;
  averageAgreement: number;
  averageGI: number;
  tags?: string[];
}

/**
 * Learning pattern extracted from memory
 */
export interface LearningPattern {
  patternId: string;
  agent: FoundingAgent;
  type: 'success' | 'failure' | 'threshold_breach' | 'high_agreement' | 'low_agreement';

  // Pattern criteria
  inputPattern?: string;           // Regex or keywords
  domainFocus?: string;
  providerCombination?: ProviderId[];

  // Performance metrics
  occurrences: number;
  avgAgreement: number;
  avgGI: number;
  successRate: number;

  // Examples
  exampleTraceIds: string[];

  // Timestamps
  firstSeen: string;
  lastSeen: string;
}

/**
 * Memory query filter options
 */
export interface MemoryQuery {
  agent?: FoundingAgent;
  sessionId?: string;
  tags?: string[];
  minAgreement?: number;
  maxAgreement?: number;
  minGI?: number;
  maxGI?: number;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
  successOnly?: boolean;
  sortBy?: 'timestamp' | 'agreement' | 'giScore';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Memory retrieval result with context
 */
export interface MemoryRetrievalResult {
  entries: MemoryEntry[];
  total: number;
  query: MemoryQuery;
}

/**
 * Agent performance analytics
 */
export interface AgentAnalytics {
  agent: FoundingAgent;
  period: {
    start: string;
    end: string;
  };

  // Deliberation metrics
  totalDeliberations: number;
  successfulDeliberations: number;
  successRate: number;

  // Agreement metrics
  avgAgreement: number;
  minAgreement: number;
  maxAgreement: number;
  agreementTrend: number;          // Positive = improving

  // GI metrics
  avgGI: number;
  minGI: number;
  maxGI: number;
  giTrend: number;                 // Positive = improving

  // Provider performance
  providerStats: Record<ProviderId, {
    uses: number;
    avgAgreement: number;
    avgGI: number;
    errorRate: number;
  }>;

  // Pattern insights
  topPatterns: LearningPattern[];

  // Sessions
  totalSessions: number;
  avgDeliberationsPerSession: number;
}
