import axios from 'axios';
import { config } from '../config';
import { LiftRequest, LiftResult } from '../types/antigravity';
import { BrokerLiftResultPayload, BrokerLiftStartPayload } from '../types/mobius';

const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
let cachedBrokerBase: URL | null = null;

function getBrokerBaseUrl(): URL {
  if (cachedBrokerBase) {
    return new URL(cachedBrokerBase.toString());
  }

  let parsed: URL;
  try {
    parsed = new URL(config.broker.url);
  } catch {
    throw new Error(`Invalid BROKER_API_URL provided: ${config.broker.url}`);
  }

  const hostnameAllowed = config.broker.allowedHosts?.includes(parsed.hostname);
  if (!hostnameAllowed) {
    throw new Error(`Broker host "${parsed.hostname}" is not in the allowed list.`);
  }

  const isLocalHost = LOCAL_HTTP_HOSTS.has(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(isLocalHost && parsed.protocol === 'http:')) {
    throw new Error('BROKER_API_URL must use https (http is only allowed for localhost).');
  }

  cachedBrokerBase = parsed;
  return new URL(parsed.toString());
}

function buildDeliberationUrl(taskId: string, suffix: string): string {
  if (!taskId) {
    throw new Error('taskId is required to build broker URL');
  }

  const base = getBrokerBaseUrl();
  base.pathname = `/v1/deliberations/${encodeURIComponent(taskId)}/${suffix}`;
  base.search = '';
  base.hash = '';
  return base.toString();
}

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

  const endpoint = buildDeliberationUrl(lift.taskId, 'antigravity-start');

  await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    timeout: 15_000
  });
}

export async function notifyBrokerResult(result: LiftResult): Promise<void> {
  if (!config.broker.enabled) return;

  const payload: BrokerLiftResultPayload = {
    answer: result.answer,
    toolTraces: result.toolTraces,
    riskFlags: result.riskFlags,
    meta: result.rawModelMeta
  };

  const endpoint = buildDeliberationUrl(result.taskId, 'antigravity-result');

  await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    timeout: 15_000
  });
}
