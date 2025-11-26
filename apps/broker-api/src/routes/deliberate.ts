import crypto from 'node:crypto';
import axios from 'axios';
import { Router } from 'express';
import { callAntigravity } from '../services/antigravityClient';
import { callOpenAI } from '../services/openaiClient';
import { callClaude } from '../services/claudeClient';
import { callDeepseek } from '../services/deepseekClient';
import { ENGINE_CONFIG, DEFAULT_ROUTING_MODE } from '../config/engines';
import { EngineId, EngineResult, RoutingMode, SafetyLevel } from '../types/routing';
import { DeliberateRequestBody } from '../types/deliberation';
import { config } from '../config';
import { gradeResponse } from '../mii/grader';
import { healthMonitor } from '../monitoring/health';
import { signDeliberation } from '../crypto/attestation';
import { saveDeliberation, saveSentinelResponse, saveAttestation, getDeliberation } from '../services/persistence';
import { notifyWebhook } from '../services/webhook';
import { evaluateWithIntegrityTier, IntegrityTierResponse } from '../services/integrityTierClient';
import { INTEGRITY_TIER_ENABLED } from '../config';
import { answerWithEcho } from '../services/answerWithEcho';

const router = Router();
const ROUTING_MODES: RoutingMode[] = ['local', 'antigravity-first', 'antigravity-only', 'multi-engine'];
const ROUTING_MODE_SET = new Set<RoutingMode>(ROUTING_MODES);
const ENGINE_ID_SET = new Set<EngineId>(['local', 'antigravity', 'openai', 'claude', 'deepseek']);
const GI_THRESHOLD = config.giMin ?? 0.95;

interface SentinelDecision {
  source: 'remote' | 'local';
  answer: string;
  giScore: number;
  decision: 'ok' | 'needs_human_review' | 'human_required' | 'reject';
  flags: string[];
  meta?: Record<string, unknown>;
  attestation?: Record<string, unknown>;
  responses?: Array<{ sentinel: string; miiScore: number }>;
}

router.post('/', async (req, res) => {
  const body = req.body as DeliberateRequestBody;
  const routingMode: RoutingMode = ROUTING_MODE_SET.has(body.routingMode as RoutingMode)
    ? (body.routingMode as RoutingMode)
    : DEFAULT_ROUTING_MODE;
  const safetyLevel: SafetyLevel = body.safetyLevel ?? 'high';
  const allowedTools = Array.isArray(body.allowedTools)
    ? body.allowedTools.filter((tool): tool is string => typeof tool === 'string')
    : [];
  const requestedEngines = Array.isArray(body.engines)
    ? (body.engines.filter((engine): engine is EngineId => ENGINE_ID_SET.has(engine as EngineId)) as EngineId[])
    : undefined;

  if (!body.prompt || typeof body.prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const requiresSentinels = !process.env.SENTINEL_CONSENSUS_URL;
  if (
    requiresSentinels &&
    (!Array.isArray(body.requiredSentinels) || body.requiredSentinels.length === 0)
  ) {
    return res.status(400).json({ error: 'requiredSentinels array is required when Sentinel consensus API is unavailable' });
  }

  if ((routingMode === 'antigravity-first' || routingMode === 'antigravity-only') && process.env.ANTIGRAVITY_ENABLED !== 'true') {
    return res.status(503).json({ error: 'ANTIGRAVITY_DISABLED' });
  }

  const deliberationId = crypto.randomUUID();

  if (body.webhookUrl) {
    res.json({
      deliberationId,
      status: 'pending',
      message: 'Deliberation started, will notify webhook on completion',
    });
    processAsync(
      deliberationId,
      body,
      routingMode,
      safetyLevel,
      allowedTools,
      requestedEngines,
      body.webhookUrl,
      (req as any).id,
    );
    return;
  }

  try {
    const result = await orchestrateDeliberation(
      deliberationId,
      body,
      routingMode,
      safetyLevel,
      allowedTools,
      requestedEngines,
      (req as any).id,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Deliberation failed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const deliberation = await getDeliberation(req.params.id);
    if (!deliberation) {
      return res.status(404).json({ error: 'Deliberation not found' });
    }
    res.json(deliberation);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch deliberation' });
  }
});

async function orchestrateDeliberation(
  deliberationId: string,
  body: DeliberateRequestBody,
  routingMode: RoutingMode,
  safetyLevel: SafetyLevel,
  allowedTools: string[],
  requestedEngines?: EngineId[],
  requestId?: string,
) {
  const startTime = Date.now();
  const metadata = body.metadata ?? {};
  
  // ECHO Layer: Check cache first (if enabled)
  const echoLayerEnabled = process.env.ECHO_LAYER_ENABLED !== 'false';
  let cacheHit = false;
  let cacheResult: { answer: string; gi: number; cacheHit: 'exact' | 'semantic' | null; similarity?: number; ledgerTx: string | null } | null = null;

  if (echoLayerEnabled && body.prompt) {
    try {
      // Check cache but don't run deliberation yet if cache misses
      // We'll run deliberation below if needed
      const { getExactFromEchoCache, getSimilarFromEchoCache } = await import('../services/echo/cache');
      const { canonicalizeKey } = await import('../utils/textCanonicalization');
      const { GI_STRICT_THRESHOLD, GI_BASELINE } = await import('../config/integrityCache');

      const canonicalKey = canonicalizeKey(body.prompt);
      const domain = body.metadata?.domain as string | undefined;
      const locale = body.metadata?.locale as string | undefined;

      // Tier 0: Exact hit
      const exact = await getExactFromEchoCache(canonicalKey);
      if (exact && exact.gi_score >= GI_STRICT_THRESHOLD && (!exact.valid_until || new Date(exact.valid_until) > new Date())) {
        cacheHit = true;
        cacheResult = {
          answer: exact.answer_text,
          gi: Number(exact.gi_score),
          cacheHit: 'exact',
          ledgerTx: exact.ledger_tx_id,
        };
      } else {
        // Tier 1: Semantic hit (would need embedding - skip for now)
        // Could implement semantic search here if embeddings are available
      }
    } catch (error) {
      // If cache check fails, continue with normal deliberation
      console.warn('[BROKER] Integrity Cache check failed, continuing with deliberation:', error);
    }
  }

  // If cache hit, return early
  if (cacheHit && cacheResult) {
    return {
      status: 'ok',
      decision: 'ok' as const,
      gi_score: cacheResult.gi,
      answer: cacheResult.answer,
      deliberation_id: deliberationId,
      deliberationId,
      routing_mode: routingMode,
      routingMode,
      engines: [],
      flags: [],
          consensus_source: 'echo_layer' as const,
      consensus_meta: {
        cacheHit: cacheResult.cacheHit,
        similarity: cacheResult.similarity,
      },
      provenance: null,
      duration_ms: Date.now() - startTime,
      remote_consensus: false,
    };
  }

  const enginePlan = resolveEnginePlan(routingMode, requestedEngines);

  const engineResults =
    routingMode === 'local'
      ? []
      : await invokeEnginePlan(enginePlan, {
          deliberationId,
          prompt: body.prompt,
          allowedTools,
          safetyLevel,
        });

  const contextEnvelope = buildContextEnvelope(body.context, {
    routingMode,
    allowedTools,
    safetyLevel,
    metadata,
    engineEvidence: engineResults,
    externalEvidence: body.externalEvidence,
  });

  let decision: SentinelDecision | null = null;
  let usedRemoteConsensus = false;

  if (process.env.SENTINEL_CONSENSUS_URL) {
    try {
      await saveDeliberation({
        id: deliberationId,
        prompt: body.prompt,
        context: contextEnvelope,
        status: 'processing',
        createdAt: startTime,
        requester: 'api',
      });

      decision = await runRemoteConsensus({
        deliberationId,
        prompt: body.prompt,
        routingMode,
        engineResults,
        metadata,
      });

      await saveDeliberation({
        id: deliberationId,
        prompt: body.prompt,
        context: contextEnvelope,
        status: 'complete',
        consensusAchieved: decision.decision === 'ok',
        finalMII: decision.giScore,
        createdAt: startTime,
        completedAt: Date.now(),
        requester: 'api',
      });
      usedRemoteConsensus = true;
    } catch (error) {
      console.warn('[BROKER] Remote Sentinel consensus failed, falling back to local pipeline:', error);
      decision = null;
    }
  }

  if (!decision) {
    if (!Array.isArray(body.requiredSentinels) || body.requiredSentinels.length === 0) {
      throw new Error('Sentinel consensus unavailable and no requiredSentinels provided for fallback.');
    }

    const localResult = await runLocalDeliberation(deliberationId, body, {
      startTime,
      routingMode,
      allowedTools,
      safetyLevel,
      metadata,
      engineEvidence: engineResults,
      externalEvidence: body.externalEvidence,
    });

    decision = {
      source: 'local',
      answer: resolveFinalAnswer(engineResults, body.prompt),
      giScore: localResult.miiScore,
      decision: localResult.consensus.achieved ? 'ok' : 'needs_human_review',
      flags: [],
      meta: { consensus: localResult.consensus },
      attestation: localResult.attestation,
      responses: localResult.responses,
    };
  }

  const integrityAssessment = await runIntegrityAssessment({
    enabled: INTEGRITY_TIER_ENABLED,
    answer: decision.answer,
    engineResults,
    routingMode,
    deliberationId,
    requestId: requestId ?? deliberationId,
  });

  if (integrityAssessment && integrityAssessment.giScore < 0.95) {
    return res.status(409).json({
      status: 'blocked_low_integrity',
      reason: 'GI score below threshold',
      assessment: integrityAssessment,
    });
  }

  await emitLedgerAttestation({
    deliberationId,
    decision,
    engineResults,
    provenance: integrityAssessment,
  });

  // ECHO Layer: Cache the result if GI >= baseline
  if (echoLayerEnabled && decision.giScore >= 0.95) {
    try {
      const { writeToEchoCache } = await import('../services/echo/cache');
      const { canonicalizeKey: getCanonicalKey } = await import('../utils/textCanonicalization');
      const { inferFreshnessTag } = await import('../config/integrityCache');
      await storeEntry({
        questionRaw: body.prompt,
        answerText: decision.answer,
        giScore: decision.giScore,
        sources: [], // Extract from engineResults if available
        sentinels: decision.responses || {},
        ledgerTxId: null, // Extract from attestation if available
        ledgerHash: null,
        domain: body.metadata?.domain as string | undefined,
        locale: body.metadata?.locale as string | undefined,
        jurisdiction: body.metadata?.jurisdiction as string | undefined,
        embedding: [], // Would need to compute embedding
      });
    } catch (error) {
      console.warn('[BROKER] Failed to cache deliberation result:', error);
      // Don't fail the request if caching fails
    }
  }

  const status = deriveStatus(decision);

  return {
    status,
    decision: decision.decision,
    gi_score: decision.giScore,
    answer: decision.answer,
    deliberation_id: deliberationId,
    deliberationId,
    routing_mode: routingMode,
    routingMode,
    engines: engineResults,
    flags: decision.flags,
    consensus_source: decision.source,
    consensus_meta: decision.meta,
    provenance: integrityAssessment,
    duration_ms: Date.now() - startTime,
    remote_consensus: usedRemoteConsensus,
  };
}

interface EngineInvocationOptions {
  deliberationId: string;
  prompt: string;
  allowedTools?: string[];
  safetyLevel?: SafetyLevel;
}

async function invokeEnginePlan(engineIds: EngineId[], opts: EngineInvocationOptions): Promise<EngineResult[]> {
  if (!engineIds.length) {
    return [];
  }

  const tasks = engineIds.map(engineId =>
    runExternalEngine(engineId, opts).then(
      result => ({ status: 'fulfilled' as const, result }),
      error => ({ status: 'rejected' as const, error }),
    ),
  );

  const settled = await Promise.all(tasks);
  const successful: EngineResult[] = [];

  settled.forEach((entry, index) => {
    if (entry.status === 'fulfilled') {
      successful.push(entry.result);
    } else {
      console.warn(`[BROKER] Engine ${engineIds[index]} failed:`, entry.error);
    }
  });

  return successful;
}

async function runExternalEngine(engineId: EngineId, opts: EngineInvocationOptions): Promise<EngineResult> {
  if (!isEngineEnabled(engineId)) {
    throw new Error(`Engine ${engineId} is disabled`);
  }

  switch (engineId) {
    case 'antigravity':
      return callAntigravity({
        deliberationId: opts.deliberationId,
        prompt: opts.prompt,
        allowedTools: opts.allowedTools,
        safetyLevel: opts.safetyLevel,
      });
    case 'openai':
      return callOpenAI({ deliberationId: opts.deliberationId, prompt: opts.prompt });
    case 'claude':
      return callClaude({ deliberationId: opts.deliberationId, prompt: opts.prompt });
    case 'deepseek':
      return callDeepseek({ deliberationId: opts.deliberationId, prompt: opts.prompt });
    default:
      throw new Error(`Unsupported engine ${engineId}`);
  }
}

function resolveEnginePlan(routingMode: RoutingMode, requested?: EngineId[]): EngineId[] {
  const unique = (requested ?? []).filter(engine => engine !== 'local');
  if (unique.length > 0) {
    return dedupe(unique).filter(isEngineEnabled);
  }

  if (routingMode === 'multi-engine') {
    return filterEnabled(['antigravity', 'openai', 'claude']);
  }

  if (routingMode === 'antigravity-first' || routingMode === 'antigravity-only') {
    return filterEnabled(['antigravity']);
  }

  return [];
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function filterEnabled(engineIds: EngineId[]): EngineId[] {
  return engineIds.filter(isEngineEnabled);
}

function isEngineEnabled(engineId: EngineId): boolean {
  const configEntry = ENGINE_CONFIG.find(engine => engine.id === engineId);
  return Boolean(configEntry?.enabled);
}

async function runRemoteConsensus(opts: {
  deliberationId: string;
  prompt: string;
  routingMode: RoutingMode;
  engineResults: EngineResult[];
  metadata: Record<string, unknown>;
}): Promise<SentinelDecision> {
  const url = process.env.SENTINEL_CONSENSUS_URL;
  if (!url) {
    throw new Error('SENTINEL_CONSENSUS_URL is not configured');
  }

  const response = await axios.post(
    url,
    {
      deliberationId: opts.deliberationId,
      prompt: opts.prompt,
      routingMode: opts.routingMode,
      candidates: opts.engineResults,
      metadata: opts.metadata,
    },
    { timeout: Number(process.env.SENTINEL_CONSENSUS_TIMEOUT_MS ?? 30_000) },
  );

  const data = response.data as {
    final_answer?: string;
    gi_score?: number;
    decision?: SentinelDecision['decision'];
    flags?: string[];
    meta?: Record<string, unknown>;
  };

  return {
    source: 'remote',
    answer: data.final_answer ?? resolveFinalAnswer(opts.engineResults, opts.prompt),
    giScore: Number(data.gi_score ?? 0),
    decision: data.decision ?? 'needs_human_review',
    flags: Array.isArray(data.flags) ? data.flags : [],
    meta: data.meta,
  };
}

async function emitLedgerAttestation(params: {
  deliberationId: string;
  decision: SentinelDecision;
  engineResults: EngineResult[];
  provenance?: IntegrityTierResponse | null;
}): Promise<void> {
  const ledgerUrl = process.env.LEDGER_ATTEST_URL;
  if (!ledgerUrl) {
    return;
  }

  try {
    await axios.post(
      ledgerUrl,
      {
        deliberation_id: params.deliberationId,
        gi_score: params.decision.giScore,
        decision: params.decision.decision,
        flags: params.decision.flags,
        engines: params.engineResults.map(engine => ({
          engineId: engine.engineId,
          latencyMs: engine.latencyMs,
          riskFlags: engine.riskFlags,
        })),
        provenance: params.provenance
          ? {
              id: params.provenance.provenanceId,
              tier: params.provenance.tier,
              giScore: params.provenance.giScore,
              signals: params.provenance.signals,
              notes: params.provenance.notes,
              timestamp: Date.now(),
            }
          : undefined,
      },
      { timeout: Number(process.env.LEDGER_ATTEST_TIMEOUT_MS ?? 15_000) },
    );
  } catch (error) {
    console.warn('[BROKER] Failed to write Civic Ledger attestation:', error);
  }
}

function deriveStatus(decision: SentinelDecision): string {
  if (decision.decision === 'ok' && decision.giScore >= GI_THRESHOLD) {
    return 'ok';
  }
  if (decision.decision === 'human_required' || decision.decision === 'needs_human_review') {
    return 'needs_human_review';
  }
  return 'pending_review';
}

interface RunLocalDeliberationOptions {
  startTime: number;
  routingMode: RoutingMode;
  allowedTools?: string[];
  safetyLevel: SafetyLevel;
  metadata?: Record<string, unknown>;
  engineEvidence?: EngineResult[];
  externalEvidence?: Record<string, unknown>;
}

async function runLocalDeliberation(
  deliberationId: string,
  body: DeliberateRequestBody,
  options: RunLocalDeliberationOptions,
) {
  const sentinels = body.requiredSentinels ?? [];
  if (sentinels.length === 0) {
    throw new Error('requiredSentinels array is required for local deliberation');
  }

  const threshold = body.consensusThreshold ?? 0.75;
  const start = options.startTime ?? Date.now();

  const contextEnvelope = buildContextEnvelope(body.context, {
    routingMode: options.routingMode,
    allowedTools: options.allowedTools,
    safetyLevel: options.safetyLevel,
    metadata: options.metadata,
    engineEvidence: options.engineEvidence,
    externalEvidence: options.externalEvidence,
  });

  await saveDeliberation({
    id: deliberationId,
    prompt: body.prompt,
    context: contextEnvelope,
    status: 'processing',
    createdAt: start,
    requester: 'api',
  });

  const responses = await Promise.all(
    sentinels.map(async sentinel => {
      const t = Date.now();
      try {
        const sentinelContext = {
          ...(body.context ?? {}),
          ...(options.engineEvidence && options.engineEvidence.length
            ? { engineEvidence: options.engineEvidence }
            : {}),
          ...(options.externalEvidence ?? {}),
        };

        const resp = await callSentinel(sentinel, body.prompt, sentinelContext);
        const mii = gradeResponse(resp);
        healthMonitor.record(sentinel, true, Date.now() - t);
        await saveSentinelResponse(deliberationId, sentinel, 1, { response: resp, miiScore: mii });
        return { sentinel, miiScore: mii };
      } catch (error) {
        healthMonitor.record(sentinel, false, Date.now() - t);
        throw error;
      }
    }),
  );

  const avgMII = responses.reduce((sum, item) => sum + item.miiScore, 0) / responses.length;
  const consensus = avgMII >= threshold;

  const attestation = await signDeliberation(deliberationId, { consensus, mii: avgMII });
  await saveAttestation(deliberationId, attestation);

  await saveDeliberation({
    id: deliberationId,
    prompt: body.prompt,
    context: contextEnvelope,
    status: 'complete',
    consensusAchieved: consensus,
    finalMII: avgMII,
    createdAt: start,
    completedAt: Date.now(),
    requester: 'api',
  });

  return {
    id: deliberationId,
    consensus: { achieved: consensus, confidence: avgMII },
    miiScore: avgMII,
    responses,
    attestation: {
      signature: attestation.signature,
      publicKey: attestation.publicKey,
    },
    duration: Date.now() - start,
  };
}

async function processAsync(
  deliberationId: string,
  body: DeliberateRequestBody,
  routingMode: RoutingMode,
  safetyLevel: SafetyLevel,
  allowedTools: string[],
  requestedEngines: EngineId[] | undefined,
  webhook: string,
  requestId?: string,
) {
  try {
    const result = await orchestrateDeliberation(
      deliberationId,
      body,
      routingMode,
      safetyLevel,
      allowedTools,
      requestedEngines,
      requestId,
    );
    await notifyWebhook(webhook, { ...result, status: 'complete' });
  } catch (error) {
    await saveDeliberation({
      id: deliberationId,
      prompt: body.prompt,
      context: buildContextEnvelope(body.context, {
        routingMode,
        allowedTools,
        safetyLevel,
        metadata: body.metadata,
        externalEvidence: body.externalEvidence,
      }),
      status: 'failed',
      createdAt: Date.now(),
      requester: 'api',
    });
    await notifyWebhook(webhook, { deliberationId, status: 'failed', error: error instanceof Error ? error.message : String(error) });
  }
}

interface ContextEnvelopeOptions {
  routingMode: RoutingMode;
  allowedTools?: string[];
  safetyLevel: SafetyLevel;
  metadata?: Record<string, unknown>;
  engineEvidence?: EngineResult[];
  externalEvidence?: Record<string, unknown>;
}

function buildContextEnvelope(baseContext: any, options: ContextEnvelopeOptions) {
  return {
    ...(baseContext ?? {}),
    _routing: {
      routingMode: options.routingMode,
      allowedTools: options.allowedTools ?? [],
      safetyLevel: options.safetyLevel,
      metadata: options.metadata,
    },
    ...(options.engineEvidence && options.engineEvidence.length
      ? { engineEvidence: options.engineEvidence }
      : {}),
    ...(options.externalEvidence ? { externalEvidence: options.externalEvidence } : {}),
  };
}

function resolveFinalAnswer(engineResults: EngineResult[], prompt: string): string {
  if (engineResults.length === 0) {
    return `Sentinel consensus completed for prompt: ${prompt}`;
  }

  const prioritized =
    engineResults.find(engine => engine.engineId === 'antigravity') ?? engineResults[0];
  return prioritized.answer;
}

async function runIntegrityAssessment(params: {
  enabled: boolean;
  answer: string;
  engineResults: EngineResult[];
  routingMode: RoutingMode;
  deliberationId: string;
  requestId: string;
}): Promise<IntegrityTierResponse | null> {
  if (!params.enabled || !params.answer?.trim()) {
    return null;
  }

  const primaryEngine =
    params.engineResults.find(engine => engine.engineId === 'antigravity') ??
    params.engineResults[0];

  try {
    return await evaluateWithIntegrityTier({
      content: params.answer,
      engine: primaryEngine?.engineId ?? 'unknown-engine',
      routingMode: params.routingMode ?? 'unknown-routing',
      metadata: {
        deliberationId: params.deliberationId,
        requestId: params.requestId,
        engineEvidenceCount: params.engineResults.length,
      },
    });
  } catch (error) {
    console.error('[broker] IntegrityTier evaluation failed', error);
    return null;
  }
}

async function callSentinel(name: string, prompt: string, context: any): Promise<string> {
  // Mock implementation for now - will be replaced with actual Sentinel calls
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  return `${name} analyzed: "${prompt}". ${
    context ? `Context considered: ${JSON.stringify(context)}. ` : ''
  }Recommendation based on integrity principles.`;
}

export default router;
