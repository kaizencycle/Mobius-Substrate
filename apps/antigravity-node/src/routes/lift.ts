import { Router } from 'express';
import { LiftErrorPayload, LiftRequest } from '../types/antigravity';
import { validateLiftRequest, applyIntegrityGuards } from '../services/guards';
import { notifyBrokerStart, notifyBrokerResult } from '../services/mobiusBroker';
import { callGeminiAntigravity } from '../services/geminiClient';

const router = Router();

router.post('/', async (req, res) => {
  const lift = req.body as LiftRequest;
  const issues = validateLiftRequest(lift);

  if (issues.length > 0) {
    const payload: LiftErrorPayload = { error: 'INVALID_REQUEST', issues };
    return res.status(400).json(payload);
  }

  try {
    await notifyBrokerStart(lift);
    const rawResult = await callGeminiAntigravity(lift);
    const guarded = applyIntegrityGuards(rawResult);
    await notifyBrokerResult(guarded);

    res.json(guarded);
  } catch (error) {
    console.error('Lift execution failed', error);
    const payload: LiftErrorPayload = { error: 'LIFT_FAILED' };
    res.status(500).json(payload);
  }
});

export default router;
