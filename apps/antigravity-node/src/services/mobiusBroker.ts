import axios from 'axios';
import { config } from '../config';
import { LiftRequest, LiftResult } from '../types/antigravity';
import { BrokerLiftResultPayload, BrokerLiftStartPayload } from '../types/mobius';

function authHeaders() {
  if (!config.broker.apiKey) {
    return {};
  }
  return { 'X-API-Key': config.broker.apiKey };
}

export async function notifyBrokerStart(lift: LiftRequest): Promise<void> {
  if (!config.broker.enabled) return;

  const payload: BrokerLiftStartPayload = {
    intent: lift.intent,
    safetyLevel: lift.safetyLevel ?? 'medium'
  };

  await axios.post(
    `${config.broker.url}/v1/deliberations/${lift.taskId}/antigravity-start`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      timeout: 15_000
    }
  );
}

export async function notifyBrokerResult(result: LiftResult): Promise<void> {
  if (!config.broker.enabled) return;

  const payload: BrokerLiftResultPayload = {
    answer: result.answer,
    toolTraces: result.toolTraces,
    riskFlags: result.riskFlags,
    meta: result.rawModelMeta
  };

  await axios.post(
    `${config.broker.url}/v1/deliberations/${result.taskId}/antigravity-result`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      timeout: 15_000
    }
  );
}
