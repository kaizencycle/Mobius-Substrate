import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { gradeResponse } from '../mii/grader';
import { healthMonitor } from '../monitoring/health';
import { signDeliberation } from '../crypto/attestation';
import { saveDeliberation, saveSentinelResponse, saveAttestation, getDeliberation } from '../services/persistence';
import { notifyWebhook } from '../services/webhook';
import { antigravityClient, AntigravityLiftResponse, AntigravitySafetyLevel } from '../services/antigravityClient';
import { attachExternalTrace, ExternalTrace } from '../utils/externalTrace';
import { DeliberateRequestBody, RoutingMode } from '../types/deliberation';
import { config } from '../config';

const router = Router();

router.post('/', async (req, res) => {
  const body = req.body as DeliberateRequestBody;
  const routingMode: RoutingMode = body.routingMode ?? 'local';
  const safetyLevel: AntigravitySafetyLevel = body.safetyLevel ?? 'medium';

  if (!body.prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (
    (routingMode === 'local' || routingMode === 'antigravity-first') &&
    (!Array.isArray(body.requiredSentinels) || body.requiredSentinels.length === 0)
  ) {
    return res.status(400).json({ error: 'requiredSentinels array is required' });
  }

  if ((routingMode === 'antigravity-first' || routingMode === 'antigravity-only') && !config.antigravity.enabled) {
    return res.status(503).json({ error: 'ANTIGRAVITY_DISABLED' });
  }

  const deliberationId = uuid();

  if (body.webhookUrl) {
    res.json({
      deliberationId,
      status: 'pending',
      message: 'Deliberation started, will notify webhook on completion'
    });
    processAsync(deliberationId, body, routingMode, safetyLevel, body.webhookUrl);
    return;
  }

  try {
    const result = await orchestrateDeliberation(deliberationId, body, routingMode, safetyLevel);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
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
    res.status(500).json({ error: String(error) });
  }
});

async function orchestrateDeliberation(
  deliberationId: string,
  body: DeliberateRequestBody,
  routingMode: RoutingMode,
  safetyLevel: AntigravitySafetyLevel
) {
  const startTime = Date.now();
  const allowedTools = body.allowedTools ?? [];
  const metadata = body.metadata;

  if (routingMode === 'antigravity-only') {
    const antigravity = await antigravityClient.lift({
      prompt: body.prompt,
      allowedTools,
      safetyLevel,
      metadata: {
        deliberationId,
        mode: routingMode,
        ...(metadata ?? {})
      }
    });

    const trace: ExternalTrace = await attachExternalTrace(
      deliberationId,
      antigravity,
      {
        routingMode,
        allowedTools,
        safetyLevel
      }
    );

    const contextEnvelope = buildContextEnvelope(body.context, {
      routingMode,
      allowedTools,
      safetyLevel,
      metadata
    });

    await saveDeliberation({
      id: deliberationId,
      prompt: body.prompt,
      context: contextEnvelope,
      status: 'processing',
      createdAt: startTime,
      requester: 'api'
    });

    await saveDeliberation({
      id: deliberationId,
      prompt: body.prompt,
      context: contextEnvelope,
      status: 'complete',
      consensusAchieved: null,
      finalMII: null,
      createdAt: startTime,
      completedAt: Date.now(),
      requester: 'api'
    });

    return {
      mode: routingMode,
      deliberationId,
      id: deliberationId,
      antigravity: {
        answer: antigravity.answer,
        toolTraces: antigravity.toolTraces,
        riskFlags: antigravity.riskFlags,
        trace
      },
      duration: Date.now() - startTime
    };
  }

  if (routingMode === 'antigravity-first') {
    try {
      const antigravity = await antigravityClient.lift({
        prompt: body.prompt,
        allowedTools,
        safetyLevel,
        metadata: {
          deliberationId,
          mode: routingMode,
          ...(metadata ?? {})
        }
      });

      const trace: ExternalTrace = await attachExternalTrace(
        deliberationId,
        antigravity,
        {
          routingMode,
          allowedTools,
          safetyLevel
        }
      );

      const externalEvidence = {
        prompt: body.prompt,
        externalAnswer: antigravity.answer,
        externalToolTraces: antigravity.toolTraces,
        externalRiskFlags: antigravity.riskFlags,
        deliberationId
      };

      const consensusResult = await runLocalDeliberation(deliberationId, body, {
        startTime,
        routingMode,
        allowedTools,
        safetyLevel,
        metadata,
        antigravityResponse: antigravity,
        externalEvidence
      });

      return {
        mode: routingMode,
        deliberationId,
        id: deliberationId,
        antigravity: {
          answer: antigravity.answer,
          toolTraces: antigravity.toolTraces,
          riskFlags: antigravity.riskFlags,
          trace
        },
        consensus: consensusResult,
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.warn('Antigravity lift failed, continuing with local consensus:', error);
      const fallback = await runLocalDeliberation(deliberationId, body, {
        startTime,
        routingMode: 'local',
        allowedTools,
        safetyLevel,
        metadata
      });
      return {
        mode: 'local',
        deliberationId,
        ...fallback
      };
    }
  }

  const localResult = await runLocalDeliberation(deliberationId, body, {
    startTime,
    routingMode,
    allowedTools,
    safetyLevel,
    metadata
  });

  return {
    mode: routingMode,
    deliberationId,
    ...localResult
  };
}

interface RunLocalDeliberationOptions {
  startTime: number;
  routingMode: RoutingMode;
  allowedTools?: string[];
  safetyLevel: AntigravitySafetyLevel;
  metadata?: Record<string, unknown>;
  antigravityResponse?: AntigravityLiftResponse | null;
  externalEvidence?: Record<string, unknown>;
}

async function runLocalDeliberation(
  deliberationId: string,
  body: DeliberateRequestBody,
  options: RunLocalDeliberationOptions
) {
  const sentinels = body.requiredSentinels ?? [];
  const threshold = body.consensusThreshold ?? 0.75;
  const start = options.startTime ?? Date.now();

  const contextEnvelope = buildContextEnvelope(body.context, {
    routingMode: options.routingMode,
    allowedTools: options.allowedTools,
    safetyLevel: options.safetyLevel,
    metadata: options.metadata,
    externalEvidence: options.externalEvidence
  });

  await saveDeliberation({
    id: deliberationId,
    prompt: body.prompt,
    context: contextEnvelope,
    status: 'processing',
    createdAt: start,
    requester: 'api'
  });

  const responses = await Promise.all(
    sentinels.map(async (sentinel) => {
      const t = Date.now();
      try {
        const sentinelContext = {
          ...(body.context ?? {}),
          ...(options.antigravityResponse ? { antigravity: options.antigravityResponse } : {}),
          ...(options.externalEvidence ? { externalEvidence: options.externalEvidence } : {})
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
    })
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
    requester: 'api'
  });

  return {
    id: deliberationId,
    consensus: { achieved: consensus, confidence: avgMII },
    miiScore: avgMII,
    responses,
    antigravity: options.antigravityResponse ?? null,
    attestation: {
      signature: attestation.signature,
      publicKey: attestation.publicKey
    },
    duration: Date.now() - start
  };
}

async function processAsync(
  deliberationId: string,
  body: DeliberateRequestBody,
  routingMode: RoutingMode,
  safetyLevel: AntigravitySafetyLevel,
  webhook: string
) {
  try {
    const result = await orchestrateDeliberation(deliberationId, body, routingMode, safetyLevel);
    await notifyWebhook(webhook, { ...result, status: 'complete' });
  } catch (error) {
    await saveDeliberation({
      id: deliberationId,
      prompt: body.prompt,
      context: buildContextEnvelope(body.context, {
        routingMode,
        allowedTools: body.allowedTools,
        safetyLevel,
        metadata: body.metadata
      }),
      status: 'failed',
      createdAt: Date.now(),
      requester: 'api'
    });
    await notifyWebhook(webhook, { deliberationId, status: 'failed', error: String(error) });
  }
}

interface ContextEnvelopeOptions {
  routingMode: RoutingMode;
  allowedTools?: string[];
  safetyLevel: AntigravitySafetyLevel;
  metadata?: Record<string, unknown>;
  externalEvidence?: Record<string, unknown>;
}

function buildContextEnvelope(baseContext: any, options: ContextEnvelopeOptions) {
  return {
    ...(baseContext ?? {}),
    _antigravity: {
      routingMode: options.routingMode,
      allowedTools: options.allowedTools ?? [],
      safetyLevel: options.safetyLevel,
      metadata: options.metadata
    },
    ...(options.externalEvidence ? { externalEvidence: options.externalEvidence } : {})
  };
}

async function callSentinel(name: string, prompt: string, context: any): Promise<string> {
  // Mock implementation for now - will be replaced with actual Sentinel calls
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  return `${name} analyzed: "${prompt}". ${context ? `Context considered: ${JSON.stringify(context)}. ` : ''}Recommendation based on integrity principles.`;
}

export default router;
