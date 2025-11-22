import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { gradeResponse } from '../mii/grader';
import { healthMonitor } from '../monitoring/health';
import { signDeliberation } from '../crypto/attestation';
import { saveDeliberation, saveSentinelResponse, saveAttestation, getDeliberation } from '../services/persistence';
import { notifyWebhook } from '../services/webhook';
import { callAntigravityLift, AntigravityLiftResult, RoutingMode } from '../services/antigravityClient';
import { attachExternalTrace } from '../utils/externalTrace';
import { CreateDeliberationBody } from '../types/deliberation';
import { config } from '../config';

const router = Router();

router.post('/', async (req, res) => {
  const body = req.body as CreateDeliberationBody;
  const {
    prompt,
    context,
    requiredSentinels,
    consensusThreshold = 0.75,
    webhookUrl,
    allowedTools,
    metadata
  } = body;
  const routingMode: RoutingMode = body.routingMode ?? 'local';
  const safetyLevel: 'low' | 'medium' | 'high' = body.safetyLevel ?? 'medium';

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if ((routingMode === 'local' || routingMode === 'antigravity-first') &&
    (!requiredSentinels || !Array.isArray(requiredSentinels) || requiredSentinels.length === 0)) {
    return res.status(400).json({ error: 'requiredSentinels array is required' });
  }

  if ((routingMode === 'antigravity-first' || routingMode === 'antigravity-only') && !config.antigravity.enabled) {
    return res.status(503).json({ error: 'ANTIGRAVITY_DISABLED' });
  }

  const id = uuid();
  const processInput: ProcessInput = {
    id,
    prompt,
    context,
    sentinels: requiredSentinels ?? [],
    threshold: consensusThreshold,
    routingMode,
    allowedTools,
    safetyLevel,
    metadata
  };

  if (webhookUrl) {
    res.json({ id, status: 'pending', message: 'Deliberation started, will notify webhook on completion' });
    processAsync(processInput, webhookUrl);
    return;
  }

  try {
    const result = await processDeliberation(processInput);
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

interface ProcessInput {
  id: string;
  prompt: string;
  context: any;
  sentinels: string[];
  threshold: number;
  routingMode: RoutingMode;
  allowedTools?: string[];
  safetyLevel: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

async function processDeliberation(input: ProcessInput) {
  const { id, prompt, context, sentinels, threshold, routingMode, allowedTools, safetyLevel, metadata } = input;
  const start = Date.now();
  const contextEnvelope = buildContextEnvelope(context, { routingMode, allowedTools, safetyLevel, metadata });

  await saveDeliberation({
    id,
    prompt,
    context: contextEnvelope,
    status: 'processing',
    createdAt: start,
    requester: 'api'
  });

  let antigravityResult: AntigravityLiftResult | null = null;
  if (routingMode === 'antigravity-first' || routingMode === 'antigravity-only') {
    try {
      antigravityResult = await callAntigravityLift({
        taskId: id,
        intent: prompt,
        context: { ...(context ?? {}), metadata },
        allowedTools,
        safetyLevel
      });

      await attachExternalTrace(id, {
        provider: 'antigravity',
        answer: antigravityResult.answer,
        toolTraces: antigravityResult.toolTraces,
        riskFlags: antigravityResult.riskFlags,
        meta: antigravityResult.rawModelMeta
      });
    } catch (error) {
      if (routingMode === 'antigravity-only') {
        throw error;
      }
      console.warn('Antigravity lift failed, continuing with local consensus:', error);
    }
  }

  if (routingMode === 'antigravity-only' && antigravityResult) {
    await saveDeliberation({
      id,
      prompt,
      context: contextEnvelope,
      status: 'complete',
      consensusAchieved: null,
      finalMII: null,
      createdAt: start,
      completedAt: Date.now(),
      requester: 'api'
    });

    return {
      id,
      mode: routingMode,
      antigravity: antigravityResult,
      duration: Date.now() - start
    };
  }

  const responses = await Promise.all(
    sentinels.map(async (s) => {
      const t = Date.now();
      try {
        const resp = await callSentinel(s, prompt, { ...(context ?? {}), antigravity: antigravityResult });
        const mii = gradeResponse(resp);
        healthMonitor.record(s, true, Date.now() - t);
        await saveSentinelResponse(id, s, 1, { response: resp, miiScore: mii });
        return { sentinel: s, response: resp, miiScore: mii };
      } catch (error) {
        healthMonitor.record(s, false, Date.now() - t);
        throw error;
      }
    })
  );

  const avgMII = responses.reduce((s, r) => s + r.miiScore, 0) / responses.length;
  const consensus = avgMII >= threshold;

  const attestation = await signDeliberation(id, { consensus, mii: avgMII });
  await saveAttestation(id, attestation);

  await saveDeliberation({
    id,
    prompt,
    context: contextEnvelope,
    status: 'complete',
    consensusAchieved: consensus,
    finalMII: avgMII,
    createdAt: start,
    completedAt: Date.now(),
    requester: 'api'
  });

  return {
    id,
    mode: routingMode,
    consensus: { achieved: consensus, confidence: avgMII },
    miiScore: avgMII,
    responses: responses.map(r => ({ sentinel: r.sentinel, miiScore: r.miiScore })),
    antigravity: antigravityResult,
    attestation: {
      signature: attestation.signature,
      publicKey: attestation.publicKey
    },
    duration: Date.now() - start
  };
}

async function processAsync(input: ProcessInput, webhook: string) {
  try {
    const result = await processDeliberation(input);
    await notifyWebhook(webhook, { ...result, status: 'complete' });
  } catch (error) {
    await saveDeliberation({
      id: input.id,
      prompt: input.prompt,
      context: buildContextEnvelope(input.context, {
        routingMode: input.routingMode,
        allowedTools: input.allowedTools,
        safetyLevel: input.safetyLevel,
        metadata: input.metadata
      }),
      status: 'failed',
      createdAt: Date.now(),
      requester: 'api'
    });
    await notifyWebhook(webhook, { id: input.id, status: 'failed', error: String(error) });
  }
}

function buildContextEnvelope(
  baseContext: any,
  options: Pick<ProcessInput, 'routingMode' | 'allowedTools' | 'safetyLevel' | 'metadata'>
) {
  return {
    ...(baseContext ?? {}),
    _antigravity: {
      routingMode: options.routingMode,
      allowedTools: options.allowedTools ?? [],
      safetyLevel: options.safetyLevel,
      metadata: options.metadata
    }
  };
}

async function callSentinel(name: string, prompt: string, context: any): Promise<string> {
  // Mock implementation for now - will be replaced with actual Sentinel calls
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  return `${name} analyzed: "${prompt}". ${context ? `Context considered: ${JSON.stringify(context)}. ` : ''}Recommendation based on integrity principles.`;
}

export default router;
