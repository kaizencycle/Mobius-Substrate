import { v4 as uuidv4 } from 'uuid';
import { computeHeuristicSignals } from './heuristicSignals';
import { performCrossCheck } from './llmCrossCheck';
import type { IntegrityAssessment, IntegrityInput, IntegrityTier } from './types';

function mapScoreToTier(score: number): IntegrityTier {
  if (score >= 0.97) return 'CIVIC';
  if (score >= 0.95) return 'STABLE';
  if (score >= 0.9) return 'CAUTION';
  return 'HAZARD';
}

export async function evaluateIntegrity(input: IntegrityInput): Promise<IntegrityAssessment> {
  const signals = computeHeuristicSignals(input);
  const cross = await performCrossCheck(input);

  const giScore = Math.min(
    1,
    Math.max(
      0,
      0.6 * signals.length_normalized +
        0.1 * (1 - signals.url_density) +
        0.1 * (1 - signals.shoutiness) +
        0.2 * cross.confidence,
    ),
  );

  const tier = mapScoreToTier(giScore);
  const provenanceId = `CPB-${uuidv4()}`;

  const notes: string[] = [];
  if (tier === 'CAUTION') notes.push('Borderline GI score — review advised.');
  if (tier === 'HAZARD') notes.push('Below GI threshold — human review required.');

  return {
    tier,
    giScore,
    provenanceId,
    signals,
    notes,
  };
}
