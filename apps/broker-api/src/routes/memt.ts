/**
 * MEMT Routes - Multi-Engine Model Taxonomy Routing Endpoints
 *
 * Provides the `/v1/memt/deliberate` endpoint that uses MEMT routing
 * to intelligently delegate tasks to the appropriate AI engines.
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

import * as crypto from 'node:crypto';
import { Router, Request, Response } from 'express';

import { callOpenAI } from '../services/openaiClient';
import { callClaude } from '../services/claudeClient';
import { callDeepseek } from '../services/deepseekClient';
import { callAntigravity } from '../services/antigravityClient';
import { ENGINE_CONFIG } from '../config/engines';
import { EngineResult } from '../types/routing';

import {
  buildMemtRoutingPlan,
  normalizeTask,
  classifyTask,
  getEngineProfile,
  getEnginesByMAQ,
  ENGINE_PROFILES,
} from '../services/memtRouter';

import {
  MemtEngineId,
  TaskKind,
  RiskLevel,
  PrecisionRequirement,
  DvaTier,
  MemtRoutingPlan,
  MemtEngineResponse,
} from '../types/memt';

import { echoUpsertMemory, echoQueryMemory } from '../services/memt/echoMemtClient';
import { ledgerAttest, buildLedgerPayload } from '../services/memt/ledgerMemtClient';
import { requestSentinelConsensus, RawEngineOutput } from '../services/memt/sentinelConsensus';

const router = Router();

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

interface MemtDeliberateRequest {
  prompt: string;
  kind?: TaskKind;
  risk?: RiskLevel;
  requiredPrecision?: PrecisionRequirement;
  dvaTier?: DvaTier;
  context?: Record<string, unknown>;
  overrideEngines?: MemtEngineId[];
  metadata?: Record<string, unknown>;
  skipCache?: boolean;
  skipLedger?: boolean;
}

interface MemtDeliberateResponse {
  taskId: string;
  status: 'ok' | 'needs_human_review' | 'rejected';
  prompt: string;
  kind: TaskKind;
  risk: RiskLevel;
  dvaTier: DvaTier;
  giScore: number;
  giThreshold: number;
  requireConsensus: boolean;
  decision: string;
  consensusSummary: string;
  needsHumanReview: boolean;
  engines: {
    id: MemtEngineId;
    role: string;
    latencyMs?: number;
  }[];
  answer: string;
  cacheHit?: boolean;
  ledgerTxId?: string;
  durationMs: number;
}

// =============================================================================
// ENGINE INVOCATION
// =============================================================================

/**
 * Check if an engine is enabled
 */
function isEngineEnabled(engineId: MemtEngineId): boolean {
  // Map MEMT engine IDs to routing engine IDs
  const mappedId = engineId === 'antigravity' ? 'antigravity' : engineId;
  const config = ENGINE_CONFIG.find(e => e.id === mappedId);
  return Boolean(config?.enabled);
}

/**
 * Invoke an engine based on MEMT routing
 */
async function invokeEngine(
  engineId: MemtEngineId,
  opts: { deliberationId: string; prompt: string }
): Promise<EngineResult> {
  switch (engineId) {
    case 'openai':
      return callOpenAI(opts);
    case 'claude':
      return callClaude(opts);
    case 'deepseek':
      return callDeepseek(opts);
    case 'antigravity':
      return callAntigravity({
        deliberationId: opts.deliberationId,
        prompt: opts.prompt,
        allowedTools: [],
        safetyLevel: 'high',
      });
    case 'echo':
      // ECHO is memory-only, return stub
      return {
        engineId: 'local',
        answer: '',
        riskFlags: [],
        latencyMs: 0,
        meta: { type: 'echo_memory' },
      };
    default:
      throw new Error(`Unknown MEMT engine: ${engineId}`);
  }
}

/**
 * Invoke all engines in the routing plan
 */
async function invokeRoutingPlan(
  plan: MemtRoutingPlan,
  taskId: string
): Promise<RawEngineOutput[]> {
  const results: RawEngineOutput[] = [];

  // Filter to enabled engines (excluding echo which is memory-only)
  const invocableEngines = plan.engines.filter(
    e => e.engine !== 'echo' && isEngineEnabled(e.engine)
  );

  // Invoke engines in parallel
  const promises = invocableEngines.map(async enginePlan => {
    try {
      const result = await invokeEngine(enginePlan.engine, {
        deliberationId: taskId,
        prompt: plan.task.prompt,
      });

      return {
        engineId: enginePlan.engine,
        role: enginePlan.role,
        answer: result.answer,
        latencyMs: result.latencyMs,
        riskFlags: result.riskFlags,
        meta: result.meta,
      };
    } catch (err) {
      console.warn(`[MEMT] Engine ${enginePlan.engine} failed:`, (err as Error).message);
      return null;
    }
  });

  const settled = await Promise.all(promises);
  for (const result of settled) {
    if (result) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Select the best answer from engine outputs
 */
function selectBestAnswer(outputs: RawEngineOutput[]): string {
  // Prefer PRIMARY role, then VERIFIER, then any
  const primary = outputs.find(o => o.role === 'PRIMARY');
  if (primary?.answer) return primary.answer;

  const verifier = outputs.find(o => o.role === 'VERIFIER');
  if (verifier?.answer) return verifier.answer;

  return outputs[0]?.answer ?? '';
}

// =============================================================================
// MAIN ROUTE: /v1/memt/deliberate
// =============================================================================

router.post('/deliberate', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const body = req.body as MemtDeliberateRequest;

  // Validate required fields
  if (!body.prompt || typeof body.prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const taskId = `memt_${crypto.randomUUID()}`;

  try {
    // 1. Normalize the task
    const normalizedTask = normalizeTask({
      prompt: body.prompt,
      kind: body.kind,
      risk: body.risk,
      requiredPrecision: body.requiredPrecision,
      context: {
        ...body.context,
        dvaTier: body.dvaTier,
      },
    });

    // 2. Check ECHO cache (if not skipped)
    if (!body.skipCache) {
      const cached = await echoQueryMemory({
        prompt: normalizedTask.prompt,
        kind: normalizedTask.kind,
        minGiScore: 0.95,
      });

      if (cached?.hit && cached.answer) {
        return res.json({
          taskId,
          status: 'ok',
          prompt: normalizedTask.prompt,
          kind: normalizedTask.kind,
          risk: normalizedTask.risk,
          dvaTier: 'LITE',
          giScore: cached.giScore ?? 0.95,
          giThreshold: 0.95,
          requireConsensus: false,
          decision: 'ok',
          consensusSummary: 'ECHO cache hit',
          needsHumanReview: false,
          engines: [{ id: 'echo', role: 'MEMORY' }],
          answer: cached.answer,
          cacheHit: true,
          durationMs: Date.now() - startTime,
        } as MemtDeliberateResponse);
      }
    }

    // 3. Build MEMT routing plan
    let routingPlan = buildMemtRoutingPlan(normalizedTask);

    // Apply engine overrides if provided
    if (Array.isArray(body.overrideEngines) && body.overrideEngines.length > 0) {
      routingPlan = {
        ...routingPlan,
        engines: routingPlan.engines.filter(e =>
          body.overrideEngines!.includes(e.engine)
        ),
      };
    }

    // 4. Invoke engines
    const engineOutputs = await invokeRoutingPlan(routingPlan, taskId);

    if (engineOutputs.length === 0) {
      return res.status(503).json({
        error: 'No engines available for MEMT routing',
        taskId,
        kind: normalizedTask.kind,
        risk: normalizedTask.risk,
      });
    }

    // 5. Request Sentinel consensus
    const consensus = await requestSentinelConsensus({
      taskId,
      prompt: normalizedTask.prompt,
      routingPlan,
      engineOutputs,
      metadata: body.metadata,
    });

    // 6. Select best answer
    const answer = selectBestAnswer(engineOutputs);

    // 7. Store in ECHO (async, non-blocking)
    if (consensus.giScore >= 0.95) {
      void echoUpsertMemory({
        taskId,
        prompt: normalizedTask.prompt,
        kind: normalizedTask.kind,
        enginesUsed: engineOutputs.map(e => e.engineId),
        consensusSummary: consensus.consensusSummary,
        finalAnswer: answer,
        giScore: consensus.giScore,
        metadata: {
          risk: normalizedTask.risk,
          dvaTier: routingPlan.dvaTier,
        },
      });
    }

    // 8. Attest to Ledger (wait for tx id so caller gets reference)
    let ledgerTxId: string | undefined;
    if (!body.skipLedger && consensus.giScore >= routingPlan.giThreshold) {
      const ledgerPayload = buildLedgerPayload({
        taskId,
        giScore: consensus.giScore,
        decision: consensus.decision,
        consensusRationale: consensus.consensusSummary,
        engines: engineOutputs.map(e => ({
          id: e.engineId,
          role: e.role,
        })),
        risk: normalizedTask.risk,
        kind: normalizedTask.kind,
        dvaTier: routingPlan.dvaTier,
        jurisdictionId: normalizedTask.context?.jurisdictionId,
        metadata: body.metadata,
      });

      try {
        const ledgerResult = await ledgerAttest(ledgerPayload);
        ledgerTxId = ledgerResult.ledgerTxId;
      } catch (ledgerErr) {
        console.warn('[MEMT] Ledger attestation failed:', (ledgerErr as Error).message);
      }
    }

    // 9. Build response
    const status: MemtDeliberateResponse['status'] =
      consensus.decision === 'reject'
        ? 'rejected'
        : consensus.needsHumanReview
        ? 'needs_human_review'
        : 'ok';

    const needsHumanReview = status !== 'ok';

    const response: MemtDeliberateResponse = {
      taskId,
      status,
      prompt: normalizedTask.prompt,
      kind: normalizedTask.kind,
      risk: normalizedTask.risk,
      dvaTier: routingPlan.dvaTier,
      giScore: consensus.giScore,
      giThreshold: routingPlan.giThreshold,
      requireConsensus: routingPlan.requireConsensus,
      decision: consensus.decision,
      consensusSummary: consensus.consensusSummary,
      needsHumanReview,
      engines: engineOutputs.map(e => ({
        id: e.engineId,
        role: e.role,
        latencyMs: e.latencyMs,
      })),
      answer,
      cacheHit: false,
      ledgerTxId,
      durationMs: Date.now() - startTime,
    };

    return res.json(response);
  } catch (err) {
    console.error('[MEMT] Deliberation failed:', err);
    return res.status(500).json({
      error: 'MEMT deliberation failed',
      message: (err as Error).message,
      taskId,
    });
  }
});

// =============================================================================
// UTILITY ROUTES
// =============================================================================

/**
 * GET /v1/memt/classify - Classify a prompt without routing
 */
router.post('/classify', (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const classification = classifyTask(prompt);
  const normalizedTask = normalizeTask({ prompt });
  const routingPlan = buildMemtRoutingPlan(normalizedTask);

  return res.json({
    classification,
    task: normalizedTask,
    routingPlan: {
      engines: routingPlan.engines.map(e => ({
        engine: e.engine,
        role: e.role,
        profile: getEngineProfile(e.engine),
      })),
      giThreshold: routingPlan.giThreshold,
      requireConsensus: routingPlan.requireConsensus,
      dvaTier: routingPlan.dvaTier,
    },
  });
});

/**
 * GET /v1/memt/engines - List all engine profiles
 */
router.get('/engines', (_req: Request, res: Response) => {
  const engines = getEnginesByMAQ();

  return res.json({
    engines: engines.map(e => ({
      id: e.id,
      cognitiveClass: e.cognitiveClass,
      sentinelRole: e.sentinelRole,
      maq: e.maq,
      enabled: isEngineEnabled(e.id),
      bestFor: e.bestFor,
      failureModes: e.failureModes,
    })),
    taxonomy: {
      ACI: 'Architect-Class Intelligence (GPT)',
      ENI: 'Engineer-Class Intelligence (Claude)',
      SXI: 'Software Operator Intelligence (Gemini)',
      OEI: 'Optimization Engine Intelligence (DeepSeek)',
      MSI: 'Memory-State Intelligence (ECHO)',
    },
  });
});

/**
 * GET /v1/memt/engine/:id - Get specific engine profile
 */
router.get('/engine/:id', (req: Request, res: Response) => {
  const engineId = req.params.id as MemtEngineId;

  if (!ENGINE_PROFILES[engineId]) {
    return res.status(404).json({ error: `Unknown engine: ${engineId}` });
  }

  const profile = getEngineProfile(engineId);

  return res.json({
    ...profile,
    enabled: isEngineEnabled(engineId),
  });
});

/**
 * GET /v1/memt/health - MEMT routing health check
 */
router.get('/health', (_req: Request, res: Response) => {
  const enabledEngines = Object.keys(ENGINE_PROFILES).filter(id =>
    isEngineEnabled(id as MemtEngineId)
  );

  return res.json({
    status: enabledEngines.length >= 2 ? 'healthy' : 'degraded',
    enabledEngines,
    totalEngines: Object.keys(ENGINE_PROFILES).length,
    version: '1.0.0',
  });
});

export default router;
