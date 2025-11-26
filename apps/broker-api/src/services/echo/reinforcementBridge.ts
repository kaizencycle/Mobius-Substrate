import { reinforce, EchoEntry, SentinelAnswer } from '@mobius/echo-layer';
import { EngineResult } from '../../types/routing';

function extractSources(meta?: Record<string, unknown>): string[] {
  if (!meta) {
    return [];
  }

  const candidate = (meta.sources ?? meta.source ?? meta.references) as unknown;
  if (!candidate) {
    return [];
  }

  if (Array.isArray(candidate)) {
    return candidate
      .map(item => (typeof item === 'string' ? item : ''))
      .filter(source => Boolean(source?.trim()))
      .map(source => source.trim());
  }

  if (typeof candidate === 'string') {
    return [candidate.trim()];
  }

  return [];
}

function toSentinelAnswer(result: EngineResult): SentinelAnswer | null {
  if (!result?.answer?.trim()) {
    return null;
  }

  return {
    answer: result.answer,
    sources: extractSources(result.meta),
  };
}

export function tryReinforceWithEcho(question: string | undefined, engineResults: EngineResult[]): EchoEntry | null {
  if (!question?.trim() || engineResults.length < 2) {
    return null;
  }

  const [first, second] = engineResults;
  const a1 = toSentinelAnswer(first);
  const a2 = toSentinelAnswer(second);

  if (!a1 || !a2) {
    return null;
  }

  return reinforce(a1, a2, question);
}
