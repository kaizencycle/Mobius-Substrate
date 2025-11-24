import type { IntegrityInput } from './types';

export function computeHeuristicSignals(input: IntegrityInput): Record<string, number> {
  const signals: Record<string, number> = {};

  const len = input.content.length;
  signals.length_normalized = len === 0 ? 0 : Math.min(1, Math.log10(len + 1) / 5);

  const urlCount = (input.content.match(/https?:\/\//g) || []).length;
  signals.url_density = Math.min(1, urlCount / 10);

  const hasAllCaps = /[A-Z]{8,}/.test(input.content);
  signals.shoutiness = hasAllCaps ? 0.3 : 0.0;

  const hasQuestionMarks = input.content.includes('?');
  signals.reflectiveness_hint = hasQuestionMarks ? 0.4 : 0.1;

  return signals;
}
