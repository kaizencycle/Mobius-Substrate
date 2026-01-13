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

// ============================================================================
// Phase 3: Enhanced Deliberation & Consensus Modes
// ============================================================================

/**
 * Consensus mode determines how agreement is calculated and winner selected
 */
export type ConsensusMode =
  | 'simple'           // Default: Largest agreement group (simple majority)
  | 'unanimous'        // All providers must agree (100%)
  | 'supermajority'    // Configurable threshold (e.g., 66%, 75%)
  | 'weighted'         // Weight by provider historical performance
  | 'quorum'           // Minimum participation threshold
  | 'ranked'           // Ranked-choice voting
  | 'veto';            // Any provider can veto (require consensus)

/**
 * Deliberation strategy determines how providers are invoked
 */
export type DeliberationStrategy =
  | 'parallel'         // Default: All providers simultaneously
  | 'sequential'       // One at a time, building context
  | 'debate'           // Providers critique each other
  | 'multi-round'      // Multiple iterations for refinement
  | 'cascade'          // Fallback chain with early exit
  | 'tournament';      // Pairwise elimination

/**
 * Consensus configuration
 */
export interface ConsensusConfig {
  mode: ConsensusMode;

  // Supermajority threshold (0-1), e.g., 0.66 for 2/3 majority
  threshold?: number;

  // Minimum quorum (0-1), e.g., 0.5 for 50% participation
  quorum?: number;

  // Enable weighted voting based on historical performance
  useWeights?: boolean;

  // Weight factors for weighted mode
  weights?: {
    agreement: number;    // Weight by past agreement (default: 0.4)
    giScore: number;      // Weight by past GI (default: 0.4)
    errorRate: number;    // Weight by error rate (default: 0.2)
  };

  // Allow tie-breaking
  allowTieBreak?: boolean;
  tieBreakStrategy?: 'random' | 'highest-gi' | 'lowest-cost' | 'fastest';
}

/**
 * Deliberation configuration
 */
export interface DeliberationConfig {
  strategy: DeliberationStrategy;

  // Max rounds for multi-round deliberation
  maxRounds?: number;

  // Early exit if agreement threshold met
  earlyExitThreshold?: number;

  // Include previous round outputs in next round
  includePreviousRounds?: boolean;

  // Debate configuration
  debateConfig?: {
    rounds: number;                    // Number of debate rounds
    includeCounterArguments: boolean;  // Providers critique each other
    requireSynthesis: boolean;         // Final synthesis round
  };

  // Cascade configuration
  cascadeConfig?: {
    providers: ProviderId[];           // Order of providers to try
    stopOnSuccess?: boolean;           // Stop when first succeeds
    combineBest?: number;              // Combine best N results
  };
}

/**
 * Decision quality metrics
 */
export interface DecisionQuality {
  // Confidence in the decision (0-1)
  confidence: number;

  // Uncertainty metrics
  uncertainty: {
    spread: number;          // How diverse were the outputs?
    ambiguity: number;       // How ambiguous is the winner?
    volatility: number;      // How stable is the consensus?
  };

  // Minority report (dissenting views)
  minorityReports?: {
    provider: ProviderId;
    output: string;
    supportPercentage: number;
    reasoning?: string;
  }[];

  // Reasoning transparency
  reasoning: {
    agreementCalculation: string;
    winnerSelection: string;
    keyFactors: string[];
    warnings?: string[];
  };
}

/**
 * Provider performance weights for weighted voting
 */
export interface ProviderWeights {
  provider: ProviderId;
  weight: number;           // 0-1, higher = more trust
  basedOn: {
    agreement: number;
    giScore: number;
    errorRate: number;
    sampleSize: number;     // Number of past deliberations
  };
}

/**
 * Extended CodexRequest with Phase 3 options
 */
export interface EnhancedCodexRequest extends CodexRequest {
  // Consensus mode configuration
  consensus?: ConsensusConfig;

  // Deliberation strategy configuration
  deliberation?: DeliberationConfig;

  // Enable decision quality analysis
  analyzeQuality?: boolean;

  // Use adaptive routing (select providers based on memory)
  adaptiveRouting?: boolean;

  // Cost constraints
  maxCost?: number;          // Maximum cost in USD

  // Latency constraints
  maxLatency?: number;       // Maximum latency in ms
}

/**
 * Enhanced DelibProof with Phase 3 metadata
 */
export interface EnhancedDelibProof extends DelibProof {
  // Decision quality metrics
  quality?: DecisionQuality;

  // Consensus mode used
  consensusMode?: ConsensusMode;

  // Deliberation strategy used
  deliberationStrategy?: DeliberationStrategy;

  // Provider weights (if weighted voting)
  providerWeights?: ProviderWeights[];

  // Cost and latency tracking
  metrics?: {
    totalCost: number;       // Total cost in USD
    totalLatency: number;    // Total latency in ms
    providerMetrics: {
      provider: ProviderId;
      cost: number;
      latency: number;
      success: boolean;
    }[];
  };

  // Rounds (for multi-round deliberation)
  rounds?: {
    roundNumber: number;
    votes: CodexVote[];
    agreement: number;
  }[];
}
