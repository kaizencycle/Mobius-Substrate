import type { Request, Response } from 'express';
import { trialAnalyticsStore } from '../services/trialAnalyticsStore';
import { suggestMicReward } from '../services/micRewards';

export async function getMicSuggestionForTrialHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { trialId } = req.params;

  if (!trialId) {
    res.status(400).json({ error: 'trialId is required' });
    return;
  }

  const summary = trialAnalyticsStore.getSummary(trialId);
  if (!summary) {
    res.status(404).json({ error: 'Trial not found' });
    return;
  }

  const globalStats = trialAnalyticsStore.getGlobalStats();
  const suggestion = suggestMicReward(summary, globalStats);

  res.status(200).json({
    protocolId: suggestion.protocolId,
    trialId: suggestion.trialId,
    participantId: suggestion.participantId,
    scenarioId: suggestion.scenarioId,
    completionStatus: suggestion.completionStatus,
    avgAlignmentScore: suggestion.avgAlignmentScore,
    avgGiSnapshot: suggestion.avgGiSnapshot,
    suggestedMic: suggestion.suggestedMic,
    maxMic: suggestion.maxMic,
    rewardIntensity: suggestion.rewardIntensity,
    reason: suggestion.reason,
    note: suggestion.note,
    minting: false,
    mode: 'simulation_only',
  });
}

