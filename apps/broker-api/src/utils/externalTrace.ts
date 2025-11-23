export interface ExternalTracePayload {
  provider: string;
  answer: string;
  toolTraces: any[];
  riskFlags: string[];
  meta?: Record<string, unknown>;
}

export async function attachExternalTrace(
  deliberationId: string,
  trace: ExternalTracePayload
): Promise<void> {
  // TODO: persist to DB when audit schema is available.
  console.log(
    `[EXTERNAL_TRACE] deliberation=${deliberationId} provider=${trace.provider} risk=${
      trace.riskFlags.length ? trace.riskFlags.join(',') : 'none'
    }`
  );
}
