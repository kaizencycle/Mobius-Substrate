/**
 * Mobius Multi-Engine Model Taxonomy (MEMT) Types
 *
 * This module defines the type system for MEMT, which classifies AI engines
 * by their cognitive specializations and determines optimal routing strategies.
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

/**
 * Extended Engine ID including MEMT classifications
 * Maps to cognitive specialization classes:
 * - gpt (openai): ACI - Architect-Class Intelligence
 * - claude: ENI - Engineer-Class Intelligence
 * - gemini (antigravity): SXI - Software Operator Intelligence
 * - deepseek: OEI - Optimization Engine Intelligence
 * - echo: MSI - Memory-State Intelligence
 */
export type MemtEngineId =
  | 'openai'      // ACI - Architect-Class Intelligence (GPT)
  | 'claude'      // ENI - Engineer-Class Intelligence
  | 'antigravity' // SXI - Software Operator Intelligence (Gemini)
  | 'deepseek'    // OEI - Optimization Engine Intelligence
  | 'echo';       // MSI - Memory-State Intelligence

/**
 * MEMT Cognitive Class identifiers
 */
export type CognitiveClass = 'ACI' | 'ENI' | 'SXI' | 'OEI' | 'MSI';

/**
 * Task classification for MEMT routing
 * Determines which engines should be invoked based on task nature
 */
export type TaskKind =
  | 'ARCHITECTURE'       // System design, planning, synthesis → ACI primary
  | 'ENGINEERING'        // Code, algorithms, debugging → ENI primary
  | 'FRONTEND'           // UI/UX, visual, multimodal → SXI primary
  | 'MATH_OPTIMIZATION'  // Math, performance, compute → OEI primary
  | 'MEMORY_RECALL'      // Cached knowledge, history → MSI primary
  | 'CIVIC_POLICY'       // Governance, ethics, policy → ENI + ACI + consensus
  | 'CRITICAL_DECISION'  // High-stakes decisions → All engines + human
  | 'GENERAL';           // Default fallback → ACI + ENI

/**
 * Risk level classification for GI threshold determination
 */
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Precision requirement for output quality
 */
export type PrecisionRequirement = 'NORMAL' | 'HIGH' | 'VERY_HIGH';

/**
 * Role of an engine in the routing plan
 */
export type EngineRole = 'PRIMARY' | 'VERIFIER' | 'MEMORY' | 'OPTIMIZER';

/**
 * DVA tier for deployment context
 */
export type DvaTier = 'LITE' | 'ONE' | 'FULL' | 'HIVE';

/**
 * Normalized task context for MEMT routing
 */
export interface NormalizedTaskContext {
  /** User ID if authenticated */
  userId?: string;
  /** Jurisdiction for policy context */
  jurisdictionId?: string;
  /** DVA tier context */
  dvaTier?: DvaTier;
  /** Domain-specific context */
  domain?: string;
  /** Locale for localization */
  locale?: string;
  /** Additional metadata */
  data?: Record<string, unknown>;
}

/**
 * Normalized task structure for MEMT processing
 */
export interface NormalizedTask {
  /** The actual prompt/query */
  prompt: string;
  /** Classified task type */
  kind: TaskKind;
  /** Risk level assessment */
  risk: RiskLevel;
  /** Required output precision */
  requiredPrecision: PrecisionRequirement;
  /** Task context */
  context?: NormalizedTaskContext;
}

/**
 * Engine call plan specifying which engine to invoke and its role
 */
export interface EngineCallPlan {
  /** Which engine to call */
  engine: MemtEngineId;
  /** Role in the routing plan */
  role: EngineRole;
  /** Engine-specific options (temperature, max_tokens, etc.) */
  options?: Record<string, unknown>;
}

/**
 * Complete MEMT routing plan for a task
 */
export interface MemtRoutingPlan {
  /** The normalized task being routed */
  task: NormalizedTask;
  /** Ordered list of engine calls to make */
  engines: EngineCallPlan[];
  /** Whether multi-engine consensus is required */
  requireConsensus: boolean;
  /** GI threshold for auto-approval */
  giThreshold: number;
  /** Inferred DVA tier */
  dvaTier: DvaTier;
}

/**
 * Engine capability scores for MAQ calculation
 */
export interface EngineCapabilities {
  /** Cognitive Specialization Fit (0-1) */
  csf: number;
  /** Integrity Drift Risk (0-1, higher = better) */
  idr: number;
  /** Hallucination Suppression Score (0-1) */
  hss: number;
  /** Constitutional Compliance Reliability (0-1) */
  ccr: number;
  /** Multi-Agent Cooperation Stability (0-1) */
  macs: number;
  /** Tool Execution Competence (0-1) */
  tec: number;
  /** Mobius Integration Suitability (0-1) */
  mis: number;
}

/**
 * MEMT engine profile with full capability data
 */
export interface MemtEngineProfile {
  id: MemtEngineId;
  cognitiveClass: CognitiveClass;
  sentinelRole: string;
  capabilities: EngineCapabilities;
  /** Mobius Alignment Quotient (calculated) */
  maq: number;
  /** Known failure modes for this engine */
  failureModes: string[];
  /** Best use cases */
  bestFor: string[];
}

/**
 * Task classification result from the classifier
 */
export interface TaskClassification {
  kind: TaskKind;
  risk: RiskLevel;
  confidence: number;
  signals: string[];
}

/**
 * Engine response with MEMT metadata
 */
export interface MemtEngineResponse {
  engine: MemtEngineId;
  role: EngineRole;
  output: string;
  latencyMs: number;
  meta?: Record<string, unknown>;
  /** Per-engine GI contribution */
  giContribution?: number;
}

/**
 * Sentinel consensus response after MEMT routing
 */
export interface MemtConsensusResponse {
  taskId: string;
  giScore: number;
  decision: 'ok' | 'needs_human_review' | 'reject';
  consensusSummary: string;
  needsHumanReview: boolean;
  engines: MemtEngineResponse[];
}

/**
 * ECHO layer upsert payload for MEMT-routed tasks
 */
export interface MemtEchoPayload {
  taskId: string;
  prompt: string;
  kind: TaskKind;
  enginesUsed: MemtEngineId[];
  consensusSummary?: string;
  finalAnswer?: string;
  giScore?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Ledger attestation payload for MEMT-routed tasks
 */
export interface MemtLedgerPayload {
  taskId: string;
  jurisdictionId?: string;
  giScore: number;
  decision: string;
  engines: {
    id: MemtEngineId;
    role: EngineRole;
    giContribution?: number;
  }[];
  consensusRationale: string;
  risk: RiskLevel;
  kind: TaskKind;
  dvaTier: DvaTier;
  metadata?: Record<string, unknown>;
}

/**
 * MEMT routing statistics for monitoring
 */
export interface MemtRoutingStats {
  totalRouted: number;
  byKind: Record<TaskKind, number>;
  byRisk: Record<RiskLevel, number>;
  byDvaTier: Record<DvaTier, number>;
  avgGiScore: number;
  consensusRate: number;
  humanReviewRate: number;
}
