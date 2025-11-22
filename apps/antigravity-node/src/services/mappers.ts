import { config } from '../config';
import { LiftRequest, LiftResult, ToolTrace } from '../types/antigravity';

interface GeminiToolCall {
  name: string;
  input: unknown;
  output: unknown;
  durationMs: number;
}

interface GeminiResponse {
  answer: string;
  toolCalls?: GeminiToolCall[];
  meta?: Record<string, unknown>;
}

export function mapLiftToGeminiPayload(lift: LiftRequest) {
  return {
    model: config.gemini.modelId,
    intent: lift.intent,
    context: lift.context ?? {},
    tools: lift.allowedTools ?? [],
    safety_level: lift.safetyLevel ?? 'medium'
  };
}

export function mapGeminiResponseToResult(lift: LiftRequest, response: GeminiResponse): LiftResult {
  const traces: ToolTrace[] =
    response.toolCalls?.map(call => ({
      toolName: call.name,
      input: call.input,
      output: call.output,
      durationMs: call.durationMs
    })) ?? [];

  return {
    taskId: lift.taskId,
    answer: response.answer,
    toolTraces: traces,
    riskFlags: [],
    rawModelMeta: {
      ...response.meta,
      provider: 'gemini',
      modelId: config.gemini.modelId
    }
  };
}
