import type { TrialSummary, GlobalTrialStats } from './trialAnalyticsStore';
import type { MicRewardSuggestion, MicRewardReason } from '../types/mic';

const DEFAULT_MAX_MIC = 10;

export function suggestMicReward(
  summary: TrialSummary,
  global: GlobalTrialStats | null,
): MicRewardSuggestion {
  const protocolId = summary.protocolId ?? 'ktt-001';
  const completionStatus = summary.completionStatus ?? summary.status ?? 'unknown';

  const avgAlignment =
    typeof summary.avgAlignmentScore === 'number' ? summary.avgAlignmentScore : undefined;
  const avgGi = typeof summary.avgGiSnapshot === 'number' ? summary.avgGiSnapshot : undefined;

  const maxMic = DEFAULT_MAX_MIC;

  let baseMultiplier = 0;
  let rewardIntensity: MicRewardSuggestion['rewardIntensity'] = 'none';
  let reason: MicRewardReason = 'incomplete';
  let note = '';

  if (completionStatus === 'completed' || summary.status === 'closed') {
    if (typeof avgAlignment === 'number') {
      if (avgAlignment >= 0.9) {
        baseMultiplier = 1;
        rewardIntensity = 'high';
        reason = 'completed_high_alignment';
        note =
          'Completed with very high alignment. This is the upper tier of MIC rewards for Trial-001.';
      } else if (avgAlignment >= 0.8) {
        baseMultiplier = 0.7;
        rewardIntensity = 'medium';
        reason = 'completed_medium_alignment';
        note =
          'Completed with good alignment. Solid performance; eligible for mid-range MIC rewards.';
      } else if (avgAlignment >= 0.6) {
        baseMultiplier = 0.4;
        rewardIntensity = 'low';
        reason = 'completed_low_alignment';
        note =
          'Completed but alignment is modest. Reward is smaller to encourage deeper reflection.';
      } else {
        baseMultiplier = 0.15;
        rewardIntensity = 'low';
        reason = 'completed_low_alignment';
        note =
          'Completed with low alignment. Still rewarded for engagement, but score is a signal for improvement.';
      }
    } else {
      baseMultiplier = 0.3;
      rewardIntensity = 'low';
      reason = 'completed_low_alignment';
      note = 'Completed without recorded alignment scores. This is treated as a basic completion reward.';
    }
  } else if (completionStatus === 'timeout') {
    baseMultiplier = 0.1;
    rewardIntensity = 'low';
    reason = 'timeout';
    note = 'Session timed out. A small MIC amount could be used as a nudge to re-engage and complete.';
  } else if (completionStatus === 'aborted') {
    baseMultiplier = 0;
    rewardIntensity = 'none';
    reason = 'aborted';
    note =
      'Aborted sessions are not rewarded in this simulation. This can be revisited depending on civic design.';
  } else {
    baseMultiplier = 0;
    rewardIntensity = 'none';
    reason = 'incomplete';
    note = 'Trial is still active or incomplete. No MIC suggested yet.';
  }

  let giMultiplier = 1;
  if (typeof avgGi === 'number') {
    const delta = avgGi - 0.95;
    if (Math.abs(delta) > 0.01) {
      giMultiplier = 1 + Math.max(-0.1, Math.min(0.1, delta * 1.5));
    }
  }

  let suggestedMic = maxMic * baseMultiplier * giMultiplier;
  if (suggestedMic < 0 || !Number.isFinite(suggestedMic)) {
    suggestedMic = 0;
  }

  if (global && global.totalTrials > 0 && global.completedTrials > 0) {
    const completionRate = global.completedTrials / global.totalTrials;
    if (completionRate < 0.3 && suggestedMic > 0) {
      suggestedMic *= 1.1;
      note += ' Early-completer bonus applied due to low completion rate.';
    }
  }

  suggestedMic = Math.round(suggestedMic * 100) / 100;

  return {
    protocolId,
    trialId: summary.trialId,
    participantId: summary.participantId,
    scenarioId: summary.scenarioId,
    completionStatus,
    avgAlignmentScore: avgAlignment,
    avgGiSnapshot: avgGi,
    suggestedMic,
    maxMic,
    rewardIntensity,
    reason,
    note,
  };
}

