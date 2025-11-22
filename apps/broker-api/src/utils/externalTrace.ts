import type { AntigravityLiftResponse } from '../services/antigravityClient';

export interface ExternalTrace {
  deliberationId: string;
  provider: string;
  answerPreview: string;
  toolTraces: AntigravityLiftResponse['toolTraces'];
  riskFlags: string[];
  createdAt: string;
  meta?: Record<string, unknown>;
}

export async function attachExternalTrace(
  deliberationId: string,
  response: AntigravityLiftResponse,
  meta?: Record<string, unknown>
): Promise<ExternalTrace> {
  const trace: ExternalTrace = {
    deliberationId,
    provider: response.provider,
    answerPreview: response.answer.slice(0, 200),
    toolTraces: response.toolTraces,
    riskFlags: response.riskFlags,
    createdAt: new Date().toISOString(),
    meta
  };

  // TODO: persist to DB when schema ready. For now, keep it as an audit log.
  // eslint-disable-next-line no-console
  console.log('[EXTERNAL_TRACE]', JSON.stringify(trace, null, 2));

  return trace;
}
