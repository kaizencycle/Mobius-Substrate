export type MicRewardReason =
  | 'completed_high_alignment'
  | 'completed_medium_alignment'
  | 'completed_low_alignment'
  | 'incomplete'
  | 'timeout'
  | 'aborted';

export interface MicRewardSuggestion {
  protocolId: string;
  trialId: string;
  participantId?: string;
  scenarioId?: string;
  completionStatus?: string;
  avgAlignmentScore?: number;
  avgGiSnapshot?: number;
  suggestedMic: number;
  maxMic: number;
  rewardIntensity: 'none' | 'low' | 'medium' | 'high';
  reason: MicRewardReason;
  note?: string;
}

