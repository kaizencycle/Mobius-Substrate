/**
 * Sentinel Consensus Service for MEMT
 *
 * Coordinates multi-engine consensus evaluation using the Sentinel system.
 * Implements AUREA + ATLAS consensus protocol for GI scoring.
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

import axios from 'axios';
import {
  MemtEngineId,
  EngineRole,
  TaskKind,
  RiskLevel,
  MemtEngineResponse,
  MemtConsensusResponse,
  MemtRoutingPlan,
} from '../../types/memt';

const SENTINEL_CONSENSUS_URL = process.env.SENTINEL_CONSENSUS_URL || '';
const SENTINEL_TIMEOUT_MS = Number(process.env.SENTINEL_CONSENSUS_TIMEOUT_MS ?? 30000);

/**
 * Engine response from raw invocation
 */
export interface RawEngineOutput {
  engineId: MemtEngineId;
  role: EngineRole;
  answer: string;
  latencyMs: number;
  riskFlags: string[];
  meta?: Record<string, unknown>;
}

/**
 * Request Sentinel consensus evaluation for MEMT-routed results
 */
export async function requestSentinelConsensus(params: {
  taskId: string;
  prompt: string;
  routingPlan: MemtRoutingPlan;
  engineOutputs: RawEngineOutput[];
  metadata?: Record<string, unknown>;
}): Promise<MemtConsensusResponse> {
  const { taskId, prompt, routingPlan, engineOutputs, metadata } = params;

  // If no consensus URL, use local evaluation
  if (!SENTINEL_CONSENSUS_URL) {
    return evaluateLocalConsensus({
      taskId,
      prompt,
      routingPlan,
      engineOutputs,
    });
  }

  try {
    const response = await axios.post(
      SENTINEL_CONSENSUS_URL,
      {
        task_id: taskId,
        prompt,
        routing_plan: {
          kind: routingPlan.task.kind,
          risk: routingPlan.task.risk,
          gi_threshold: routingPlan.giThreshold,
          require_consensus: routingPlan.requireConsensus,
          dva_tier: routingPlan.dvaTier,
        },
        engine_outputs: engineOutputs.map(e => ({
          engine_id: e.engineId,
          role: e.role,
          answer: e.answer,
          latency_ms: e.latencyMs,
          risk_flags: e.riskFlags,
          meta: e.meta,
        })),
        metadata,
        source: 'memt_router',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: SENTINEL_TIMEOUT_MS,
      }
    );

    const data = response.data as any;

    return {
      taskId,
      giScore: data.gi_score ?? 0,
      decision: mapDecision(data.decision),
      consensusSummary: data.consensus_summary ?? '',
      needsHumanReview: data.needs_human_review ?? false,
      engines: engineOutputs.map(e => ({
        engine: e.engineId,
        role: e.role,
        output: e.answer,
        latencyMs: e.latencyMs,
        meta: e.meta,
        giContribution: data.engine_contributions?.[e.engineId],
      })),
    };
  } catch (err) {
    console.warn('[SENTINEL-MEMT] Remote consensus failed, using local evaluation:', (err as Error).message);
    return evaluateLocalConsensus({
      taskId,
      prompt,
      routingPlan,
      engineOutputs,
    });
  }
}

/**
 * Local consensus evaluation when remote Sentinel unavailable
 */
function evaluateLocalConsensus(params: {
  taskId: string;
  prompt: string;
  routingPlan: MemtRoutingPlan;
  engineOutputs: RawEngineOutput[];
}): MemtConsensusResponse {
  const { taskId, routingPlan, engineOutputs } = params;

  // Simple heuristic-based GI calculation
  let giScore = 0.85; // Base score

  // Boost for multiple engines
  if (engineOutputs.length >= 2) giScore += 0.05;
  if (engineOutputs.length >= 3) giScore += 0.03;

  // Boost for low risk flags
  const totalRiskFlags = engineOutputs.reduce((sum, e) => sum + e.riskFlags.length, 0);
  if (totalRiskFlags === 0) giScore += 0.05;

  // Boost for consistent outputs (basic check)
  const primaryOutput = engineOutputs.find(e => e.role === 'PRIMARY');
  const verifierOutputs = engineOutputs.filter(e => e.role === 'VERIFIER');

  if (primaryOutput && verifierOutputs.length > 0) {
    // Simple consistency check: if verifiers don't flag risks, boost GI
    const verifierRisks = verifierOutputs.reduce((sum, e) => sum + e.riskFlags.length, 0);
    if (verifierRisks === 0) giScore += 0.02;
  }

  // Cap at 0.99
  giScore = Math.min(0.99, giScore);

  // Determine decision based on GI threshold
  const meetsThreshold = giScore >= routingPlan.giThreshold;
  const needsHumanReview =
    !meetsThreshold ||
    routingPlan.task.risk === 'CRITICAL' ||
    totalRiskFlags > 2;

  return {
    taskId,
    giScore,
    decision: meetsThreshold && !needsHumanReview ? 'ok' : 'needs_human_review',
    consensusSummary: buildConsensusSummary(engineOutputs, giScore, routingPlan),
    needsHumanReview,
    engines: engineOutputs.map(e => ({
      engine: e.engineId,
      role: e.role,
      output: e.answer,
      latencyMs: e.latencyMs,
      meta: e.meta,
    })),
  };
}

/**
 * Build human-readable consensus summary
 */
function buildConsensusSummary(
  engineOutputs: RawEngineOutput[],
  giScore: number,
  routingPlan: MemtRoutingPlan
): string {
  const engineList = engineOutputs.map(e => `${e.engineId}(${e.role})`).join(', ');
  const threshold = routingPlan.giThreshold;
  const status = giScore >= threshold ? 'PASSED' : 'BELOW_THRESHOLD';

  return `MEMT consensus: ${engineList}. GI=${giScore.toFixed(3)} (threshold=${threshold}). Status: ${status}. DVA Tier: ${routingPlan.dvaTier}.`;
}

/**
 * Map decision string to typed decision
 */
function mapDecision(decision: string): 'ok' | 'needs_human_review' | 'reject' {
  switch (decision?.toLowerCase()) {
    case 'ok':
    case 'approved':
    case 'pass':
      return 'ok';
    case 'reject':
    case 'rejected':
    case 'fail':
      return 'reject';
    default:
      return 'needs_human_review';
  }
}

/**
 * Calculate weighted GI score from engine contributions
 */
export function calculateWeightedGI(
  engineOutputs: RawEngineOutput[],
  weights?: Record<MemtEngineId, number>
): number {
  const defaultWeights: Record<MemtEngineId, number> = {
    openai: 0.25,
    claude: 0.30,
    antigravity: 0.15,
    deepseek: 0.15,
    echo: 0.15,
  };

  const effectiveWeights = weights ?? defaultWeights;
  let totalWeight = 0;
  let weightedSum = 0;

  for (const output of engineOutputs) {
    const weight = effectiveWeights[output.engineId] ?? 0.1;
    const engineGI = output.riskFlags.length === 0 ? 0.95 : 0.85 - output.riskFlags.length * 0.05;

    weightedSum += weight * Math.max(0, engineGI);
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
