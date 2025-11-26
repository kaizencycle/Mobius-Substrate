/**
 * MEMT Router Service
 *
 * The "brainstem" of Mobius multi-engine routing. This service:
 * - Classifies incoming tasks by type and risk
 * - Builds optimal engine call plans based on MEMT taxonomy
 * - Determines GI thresholds and consensus requirements
 * - Maps to DVA tiers for deployment context
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

import {
  MemtEngineId,
  CognitiveClass,
  TaskKind,
  RiskLevel,
  PrecisionRequirement,
  DvaTier,
  NormalizedTask,
  EngineCallPlan,
  MemtRoutingPlan,
  MemtEngineProfile,
  EngineCapabilities,
  TaskClassification,
} from '../types/memt';

// =============================================================================
// ENGINE PROFILES - MEMT Capability Database
// =============================================================================

/**
 * Calculate Mobius Alignment Quotient (MAQ) from capabilities
 * Weights: CSF=0.20, IDR=0.20, HSS=0.15, CCR=0.15, MACS=0.10, TEC=0.10, MIS=0.10
 */
function calculateMAQ(cap: EngineCapabilities): number {
  return (
    cap.csf * 0.20 +
    cap.idr * 0.20 +
    cap.hss * 0.15 +
    cap.ccr * 0.15 +
    cap.macs * 0.10 +
    cap.tec * 0.10 +
    cap.mis * 0.10
  );
}

/**
 * MEMT Engine Profiles Database
 * Contains capability scores and metadata for each engine type
 */
export const ENGINE_PROFILES: Record<MemtEngineId, MemtEngineProfile> = {
  openai: {
    id: 'openai',
    cognitiveClass: 'ACI',
    sentinelRole: 'AUREA',
    capabilities: {
      csf: 0.97,
      idr: 0.91,
      hss: 0.89,
      ccr: 0.96,
      macs: 0.93,
      tec: 0.81,
      mis: 0.98,
    },
    maq: 0.93,
    failureModes: ['Overgeneralization', 'Narrative illusions', 'Overconfidence'],
    bestFor: ['Architecture design', 'Multi-domain synthesis', 'Strategic planning'],
  },
  claude: {
    id: 'claude',
    cognitiveClass: 'ENI',
    sentinelRole: 'ATLAS',
    capabilities: {
      csf: 0.92,
      idr: 0.96,
      hss: 0.95,
      ccr: 0.94,
      macs: 0.90,
      tec: 0.82,
      mis: 0.90,
    },
    maq: 0.92,
    failureModes: ['Over-cautious logic', 'Rigid reasoning', 'Misses novel patterns'],
    bestFor: ['Code generation', 'Algorithm implementation', 'Verification'],
  },
  antigravity: {
    id: 'antigravity',
    cognitiveClass: 'SXI',
    sentinelRole: 'HERMES',
    capabilities: {
      csf: 0.89,
      idr: 0.82,
      hss: 0.78,
      ccr: 0.85,
      macs: 0.88,
      tec: 0.97,
      mis: 0.88,
    },
    maq: 0.87,
    failureModes: ['Tool hallucination', 'Agentic loops', 'Modality drift'],
    bestFor: ['UI generation', 'Tool orchestration', 'Multimodal tasks'],
  },
  deepseek: {
    id: 'deepseek',
    cognitiveClass: 'OEI',
    sentinelRole: 'ZEUS',
    capabilities: {
      csf: 0.88,
      idr: 0.72,
      hss: 0.73,
      ccr: 0.80,
      macs: 0.85,
      tec: 0.92,
      mis: 0.85,
    },
    maq: 0.82,
    failureModes: ['Literalism', 'Poor natural language', 'Context loss'],
    bestFor: ['Mathematical optimization', 'Performance tuning', 'Batch processing'],
  },
  echo: {
    id: 'echo',
    cognitiveClass: 'MSI',
    sentinelRole: 'ECHO',
    capabilities: {
      csf: 0.75,
      idr: 0.88,
      hss: 0.74,
      ccr: 0.86,
      macs: 0.80,
      tec: 0.72,
      mis: 0.90,
    },
    maq: 0.81,
    failureModes: ['Stale memory', 'Overfitting', 'Limited synthesis'],
    bestFor: ['Memory caching', 'High-integrity recall', 'Session persistence'],
  },
};

// =============================================================================
// GI THRESHOLD CALCULATION
// =============================================================================

/**
 * Base GI threshold by risk level
 */
function baseGiForRisk(risk: RiskLevel): number {
  switch (risk) {
    case 'CRITICAL':
      return 0.98;
    case 'HIGH':
      return 0.95;
    case 'MEDIUM':
      return 0.93;
    case 'LOW':
    default:
      return 0.90;
  }
}

/**
 * Precision boost for GI threshold
 */
function boostForPrecision(required: PrecisionRequirement): number {
  switch (required) {
    case 'VERY_HIGH':
      return 0.03;
    case 'HIGH':
      return 0.02;
    case 'NORMAL':
    default:
      return 0.0;
  }
}

// =============================================================================
// TASK CLASSIFICATION
// =============================================================================

/**
 * Keywords and patterns for task classification
 */
const TASK_PATTERNS: Record<TaskKind, RegExp[]> = {
  ARCHITECTURE: [
    /\b(design|architect|system|infrastructure|blueprint|framework|platform)\b/i,
    /\b(plan|strategy|roadmap|structure|topology)\b/i,
  ],
  ENGINEERING: [
    /\b(code|implement|function|class|algorithm|debug|fix|refactor)\b/i,
    /\b(typescript|javascript|python|rust|programming|compile|build)\b/i,
  ],
  FRONTEND: [
    /\b(ui|ux|interface|component|react|vue|css|html|layout|design)\b/i,
    /\b(button|form|modal|page|screen|visual|style)\b/i,
  ],
  MATH_OPTIMIZATION: [
    /\b(optimize|performance|math|calculate|algorithm|efficiency)\b/i,
    /\b(benchmark|speed|latency|throughput|complexity)\b/i,
  ],
  MEMORY_RECALL: [
    /\b(remember|recall|previous|history|what did|earlier|before)\b/i,
    /\b(context|session|cache|stored|saved)\b/i,
  ],
  CIVIC_POLICY: [
    /\b(policy|governance|ethics|regulation|compliance|legal|civic)\b/i,
    /\b(constitution|charter|rights|duty|citizen|public)\b/i,
  ],
  CRITICAL_DECISION: [
    /\b(critical|emergency|urgent|life|death|safety|security)\b/i,
    /\b(evacuate|shutdown|alert|crisis|disaster)\b/i,
  ],
  GENERAL: [],
};

/**
 * Risk signal patterns
 */
const RISK_SIGNALS: { pattern: RegExp; risk: RiskLevel }[] = [
  { pattern: /\b(emergency|critical|urgent|life|death|safety)\b/i, risk: 'CRITICAL' },
  { pattern: /\b(security|financial|legal|compliance|audit)\b/i, risk: 'HIGH' },
  { pattern: /\b(production|deploy|release|customer|public)\b/i, risk: 'MEDIUM' },
];

/**
 * Classify a task based on prompt content
 */
export function classifyTask(prompt: string): TaskClassification {
  const signals: string[] = [];
  let kind: TaskKind = 'GENERAL';
  let maxMatches = 0;
  let confidence = 0.5;

  // Find best matching task kind
  for (const [taskKind, patterns] of Object.entries(TASK_PATTERNS)) {
    const matches = patterns.filter(p => p.test(prompt)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      kind = taskKind as TaskKind;
      confidence = Math.min(0.95, 0.5 + matches * 0.15);
    }
  }

  if (maxMatches > 0) {
    signals.push(`Matched ${maxMatches} patterns for ${kind}`);
  }

  // Determine risk level
  let risk: RiskLevel = 'MEDIUM';
  for (const signal of RISK_SIGNALS) {
    if (signal.pattern.test(prompt)) {
      if (
        signal.risk === 'CRITICAL' ||
        (signal.risk === 'HIGH' && risk !== 'CRITICAL')
      ) {
        risk = signal.risk;
        signals.push(`Risk signal: ${signal.pattern.source}`);
      }
    }
  }

  return { kind, risk, confidence, signals };
}

// =============================================================================
// DVA TIER INFERENCE
// =============================================================================

/**
 * Infer DVA tier from task characteristics
 */
function inferDvaTier(task: NormalizedTask): DvaTier {
  // Explicit tier from context
  if (task.context?.dvaTier) {
    return task.context.dvaTier;
  }

  // Infer from task characteristics
  if (task.risk === 'CRITICAL' || task.kind === 'CRITICAL_DECISION') {
    return 'HIVE';
  }

  if (task.kind === 'CIVIC_POLICY' || task.risk === 'HIGH') {
    return 'FULL';
  }

  if (task.kind === 'MEMORY_RECALL' || task.kind === 'MATH_OPTIMIZATION') {
    return 'LITE';
  }

  return 'ONE';
}

// =============================================================================
// CORE ROUTING LOGIC
// =============================================================================

/**
 * Build the optimal MEMT routing plan for a normalized task
 *
 * This is the core routing logic that maps tasks to engine call plans
 * based on the MEMT taxonomy and DVA tier requirements.
 */
export function buildMemtRoutingPlan(task: NormalizedTask): MemtRoutingPlan {
  const engines: EngineCallPlan[] = [];
  const dvaTier = inferDvaTier(task);

  switch (task.kind) {
    case 'ARCHITECTURE':
      // ACI primary (GPT), ENI verify (Claude), MSI memory
      engines.push(
        { engine: 'openai', role: 'PRIMARY' },
        { engine: 'claude', role: 'VERIFIER' },
        { engine: 'echo', role: 'MEMORY' }
      );
      break;

    case 'ENGINEERING':
      // ENI primary (Claude), OEI optimize (DeepSeek), MSI memory
      engines.push(
        { engine: 'claude', role: 'PRIMARY' },
        { engine: 'deepseek', role: 'OPTIMIZER' },
        { engine: 'echo', role: 'MEMORY' }
      );
      break;

    case 'FRONTEND':
      // SXI primary (Gemini/Antigravity), ACI verify (GPT), MSI memory
      engines.push(
        { engine: 'antigravity', role: 'PRIMARY' },
        { engine: 'openai', role: 'VERIFIER' },
        { engine: 'echo', role: 'MEMORY' }
      );
      break;

    case 'MATH_OPTIMIZATION':
      // OEI primary (DeepSeek), ENI verify (Claude)
      engines.push(
        { engine: 'deepseek', role: 'PRIMARY' },
        { engine: 'claude', role: 'VERIFIER' }
      );
      break;

    case 'MEMORY_RECALL':
      // MSI primary (ECHO), ACI verify (GPT)
      engines.push(
        { engine: 'echo', role: 'PRIMARY' },
        { engine: 'openai', role: 'VERIFIER' }
      );
      break;

    case 'CIVIC_POLICY':
      // Broader coverage: ENI primary + ACI + SXI verifiers + MSI memory
      engines.push(
        { engine: 'claude', role: 'PRIMARY' },
        { engine: 'openai', role: 'VERIFIER' },
        { engine: 'antigravity', role: 'VERIFIER' },
        { engine: 'echo', role: 'MEMORY' }
      );
      break;

    case 'CRITICAL_DECISION':
      // All engines with full consensus
      engines.push(
        { engine: 'claude', role: 'PRIMARY' },
        { engine: 'openai', role: 'VERIFIER' },
        { engine: 'antigravity', role: 'VERIFIER' },
        { engine: 'deepseek', role: 'OPTIMIZER' },
        { engine: 'echo', role: 'MEMORY' }
      );
      break;

    case 'GENERAL':
    default:
      // Default: ACI + ENI
      engines.push(
        { engine: 'openai', role: 'PRIMARY' },
        { engine: 'claude', role: 'VERIFIER' }
      );
      break;
  }

  // Calculate GI threshold
  const baseGi = baseGiForRisk(task.risk);
  const boost = boostForPrecision(task.requiredPrecision);
  let giThreshold = baseGi + boost;
  if (giThreshold > 0.99) giThreshold = 0.99;

  // Determine consensus requirement
  const requireConsensus = task.risk === 'HIGH' || task.risk === 'CRITICAL';

  return {
    task,
    engines,
    requireConsensus,
    giThreshold,
    dvaTier,
  };
}

/**
 * Normalize a raw request into a NormalizedTask structure
 */
export function normalizeTask(params: {
  prompt: string;
  kind?: TaskKind;
  risk?: RiskLevel;
  requiredPrecision?: PrecisionRequirement;
  context?: Record<string, unknown>;
}): NormalizedTask {
  // Auto-classify if kind/risk not provided
  const classification = classifyTask(params.prompt);

  return {
    prompt: params.prompt,
    kind: params.kind ?? classification.kind,
    risk: params.risk ?? classification.risk,
    requiredPrecision: params.requiredPrecision ?? 'NORMAL',
    context: {
      userId: params.context?.userId as string | undefined,
      jurisdictionId: params.context?.jurisdictionId as string | undefined,
      dvaTier: params.context?.dvaTier as DvaTier | undefined,
      domain: params.context?.domain as string | undefined,
      locale: params.context?.locale as string | undefined,
      data: params.context,
    },
  };
}

/**
 * Filter routing plan by enabled engines
 */
export function filterByEnabledEngines(
  plan: MemtRoutingPlan,
  enabledEngines: Set<MemtEngineId>
): MemtRoutingPlan {
  return {
    ...plan,
    engines: plan.engines.filter(e => enabledEngines.has(e.engine)),
  };
}

/**
 * Get engine profile by ID
 */
export function getEngineProfile(engineId: MemtEngineId): MemtEngineProfile {
  return ENGINE_PROFILES[engineId];
}

/**
 * Get all engine profiles sorted by MAQ
 */
export function getEnginesByMAQ(): MemtEngineProfile[] {
  return Object.values(ENGINE_PROFILES).sort((a, b) => b.maq - a.maq);
}

/**
 * Get engines by cognitive class
 */
export function getEnginesByClass(cognitiveClass: CognitiveClass): MemtEngineProfile[] {
  return Object.values(ENGINE_PROFILES).filter(e => e.cognitiveClass === cognitiveClass);
}

/**
 * Calculate expected GI for an engine combination
 */
export function calculateExpectedGI(engines: MemtEngineId[]): number {
  if (engines.length === 0) return 0;

  const totalMAQ = engines.reduce((sum, id) => {
    return sum + (ENGINE_PROFILES[id]?.maq ?? 0);
  }, 0);

  return totalMAQ / engines.length;
}
