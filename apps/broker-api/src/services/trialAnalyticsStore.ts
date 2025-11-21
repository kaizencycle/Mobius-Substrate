import { nanoid } from 'nanoid';

export type TrialStatus = 'active' | 'closed';
export type TrialCompletionStatus = 'completed' | 'aborted' | 'timeout' | 'error' | 'unknown';

export interface TrialEvent {
  trialId: string;
  stepIndex: number;
  prompt?: string;
  userChoice?: string;
  modelChoice?: string;
  alignmentScore?: number;
  giSnapshot?: number;
  tags?: string[];
  createdAt: string;
}

export interface TrialSummary {
  trialId: string;
  protocolId: string;
  participantId?: string;
  scenarioId?: string;
  status: TrialStatus;
  completionStatus?: TrialCompletionStatus | string;
  steps?: number;
  createdAt?: string;
  closedAt?: string;
  avgAlignmentScore?: number;
  avgGiSnapshot?: number;
}

export interface GlobalTrialStats {
  protocolId: string;
  totalTrials: number;
  activeTrials: number;
  completedTrials: number;
  abortedTrials: number;
  timeoutTrials: number;
  avgAlignmentScore?: number;
  avgGiSnapshot?: number;
}

export interface CreateTrialSessionInput {
  participantId?: string;
  scenarioId?: string;
  trialId?: string;
  protocolId?: string;
  createdAt?: string;
}

export interface RecordTrialEventInput {
  trialId: string;
  stepIndex: number;
  prompt?: string;
  userChoice?: string;
  modelChoice?: string;
  alignmentScore?: number;
  giSnapshot?: number;
  tags?: string[];
  createdAt?: string;
}

export interface CloseTrialSessionInput {
  trialId: string;
  steps?: number;
  completionStatus?: TrialCompletionStatus | string;
  finalAlignmentScore?: number;
  finalGiScore?: number;
  closedAt?: string;
}

interface InternalTrialAnalytics {
  trialId: string;
  protocolId: string;
  participantId?: string;
  scenarioId?: string;
  status: TrialStatus;
  completionStatus?: TrialCompletionStatus | string;
  steps?: number;
  createdAt: string;
  closedAt?: string;
  sumAlignmentScore: number;
  countAlignmentScore: number;
  sumGiSnapshot: number;
  countGiSnapshot: number;
  events: TrialEvent[];
}

const DEFAULT_PROTOCOL_ID = 'ktt-001';

export class InMemoryTrialAnalyticsStore {
  private trials = new Map<string, InternalTrialAnalytics>();

  createTrialSession(input: CreateTrialSessionInput = {}): string {
    const trialId = input.trialId ?? nanoid();
    const createdAt = input.createdAt ?? new Date().toISOString();

    if (this.trials.has(trialId)) {
      throw new Error(`Trial ${trialId} already exists`);
    }

    const record: InternalTrialAnalytics = {
      trialId,
      protocolId: input.protocolId ?? DEFAULT_PROTOCOL_ID,
      participantId: input.participantId,
      scenarioId: input.scenarioId,
      status: 'active',
      createdAt,
      sumAlignmentScore: 0,
      countAlignmentScore: 0,
      sumGiSnapshot: 0,
      countGiSnapshot: 0,
      events: [],
    };

    this.trials.set(trialId, record);
    return trialId;
  }

  recordTrialEvent(input: RecordTrialEventInput): void {
    const trial = this.trials.get(input.trialId);
    if (!trial) {
      throw new Error(`Trial ${input.trialId} not found`);
    }

    const createdAt = input.createdAt ?? new Date().toISOString();
    const event: TrialEvent = {
      trialId: input.trialId,
      stepIndex: input.stepIndex,
      prompt: input.prompt,
      userChoice: input.userChoice,
      modelChoice: input.modelChoice,
      alignmentScore: input.alignmentScore,
      giSnapshot: input.giSnapshot,
      tags: input.tags,
      createdAt,
    };

    trial.events.push(event);

    if (typeof input.alignmentScore === 'number') {
      trial.sumAlignmentScore += input.alignmentScore;
      trial.countAlignmentScore += 1;
    }

    if (typeof input.giSnapshot === 'number') {
      trial.sumGiSnapshot += input.giSnapshot;
      trial.countGiSnapshot += 1;
    }

    if (typeof input.stepIndex === 'number') {
      trial.steps = Math.max(trial.steps ?? 0, input.stepIndex);
    }
  }

  closeTrialSession(input: CloseTrialSessionInput): void {
    const trial = this.trials.get(input.trialId);
    if (!trial) {
      throw new Error(`Trial ${input.trialId} not found`);
    }

    trial.status = 'closed';
    trial.completionStatus = input.completionStatus;
    if (typeof input.steps === 'number') {
      trial.steps = input.steps;
    }
    if (typeof input.finalAlignmentScore === 'number') {
      trial.sumAlignmentScore += input.finalAlignmentScore;
      trial.countAlignmentScore += 1;
    }
    if (typeof input.finalGiScore === 'number') {
      trial.sumGiSnapshot += input.finalGiScore;
      trial.countGiSnapshot += 1;
    }
    trial.closedAt = input.closedAt ?? new Date().toISOString();
  }

  getSummary(trialId: string): TrialSummary | undefined {
    const trial = this.trials.get(trialId);
    if (!trial) {
      return undefined;
    }
    return this.toSummary(trial);
  }

  getEvents(trialId: string): TrialEvent[] | undefined {
    const trial = this.trials.get(trialId);
    if (!trial) {
      return undefined;
    }
    // Return a copy to prevent mutation outside the store
    return trial.events.slice();
  }

  listSummaries(): TrialSummary[] {
    return Array.from(this.trials.values()).map((t) => this.toSummary(t));
  }

  getGlobalStats(): GlobalTrialStats {
    const totalTrials = this.trials.size;
    let activeTrials = 0;
    let completedTrials = 0;
    let abortedTrials = 0;
    let timeoutTrials = 0;
    let totalAlignment = 0;
    let totalAlignmentCount = 0;
    let totalGi = 0;
    let totalGiCount = 0;

    this.trials.forEach((trial) => {
      if (trial.status === 'active') {
        activeTrials += 1;
      }
      if (trial.completionStatus === 'completed') {
        completedTrials += 1;
      }
      if (trial.completionStatus === 'aborted') {
        abortedTrials += 1;
      }
      if (trial.completionStatus === 'timeout') {
        timeoutTrials += 1;
      }
      totalAlignment += trial.sumAlignmentScore;
      totalAlignmentCount += trial.countAlignmentScore;
      totalGi += trial.sumGiSnapshot;
      totalGiCount += trial.countGiSnapshot;
    });

    const avgAlignmentScore =
      totalAlignmentCount > 0 ? totalAlignment / totalAlignmentCount : undefined;
    const avgGiSnapshot = totalGiCount > 0 ? totalGi / totalGiCount : undefined;

    return {
      protocolId: DEFAULT_PROTOCOL_ID,
      totalTrials,
      activeTrials,
      completedTrials,
      abortedTrials,
      timeoutTrials,
      avgAlignmentScore,
      avgGiSnapshot,
    };
  }

  reset(): void {
    this.trials.clear();
  }

  private toSummary(trial: InternalTrialAnalytics): TrialSummary {
    return {
      trialId: trial.trialId,
      protocolId: trial.protocolId,
      participantId: trial.participantId,
      scenarioId: trial.scenarioId,
      status: trial.status,
      completionStatus: trial.completionStatus,
      steps: trial.steps,
      createdAt: trial.createdAt,
      closedAt: trial.closedAt,
      avgAlignmentScore:
        trial.countAlignmentScore > 0
          ? trial.sumAlignmentScore / trial.countAlignmentScore
          : undefined,
      avgGiSnapshot:
        trial.countGiSnapshot > 0 ? trial.sumGiSnapshot / trial.countGiSnapshot : undefined,
    };
  }
}

export const trialAnalyticsStore = new InMemoryTrialAnalyticsStore();

