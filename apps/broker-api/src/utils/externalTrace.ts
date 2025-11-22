export interface ExternalTracePayload {
  provider: string;
  answer: string;
  toolTraces: unknown[];
  riskFlags: string[];
  meta?: Record<string, unknown>;
}

export async function attachExternalTrace(deliberationId: string, trace: ExternalTracePayload): Promise<void> {
  // TODO: Persist to a dedicated table or storage service.
  // For now, log so Sentinels and auditors can replay the evidence path.
  console.log(`[EXTERNAL_TRACE] ${deliberationId} ← ${trace.provider}`);
  console.log(`  answer_length=${trace.answer.length}`);
  console.log(`  tools=${trace.toolTraces
    .map((t: any) => t?.toolName ?? 'unknown')
    .filter(Boolean)
    .join(', ')}`);
  console.log(`  risk_flags=${trace.riskFlags.join(', ') || 'none'}`);
  if (trace.meta) {
    console.log(`  meta=${JSON.stringify(trace.meta).slice(0, 500)}`);
  }
}
