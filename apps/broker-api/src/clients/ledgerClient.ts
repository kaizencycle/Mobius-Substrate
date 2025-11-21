export interface LedgerClient {
  createTrialSession(payload: {
    trialId: string;
    participantId?: string;
    scenarioId?: string;
    protocolId: string;
  }): Promise<void>;
  recordTrialEvent(payload: {
    trialId: string;
    stepIndex: number;
    alignmentScore?: number;
    giSnapshot?: number;
  }): Promise<void>;
  closeTrialSession(payload: {
    trialId: string;
    completionStatus?: string;
    finalAlignmentScore?: number;
    finalGiScore?: number;
  }): Promise<void>;
}

class NoopLedgerClient implements LedgerClient {
  async createTrialSession(): Promise<void> {
    // No-op implementation; real ledger integration can be injected via env vars in the future.
  }

  async recordTrialEvent(): Promise<void> {
    // No-op implementation.
  }

  async closeTrialSession(): Promise<void> {
    // No-op implementation.
  }
}

let currentLedgerClient: LedgerClient = new NoopLedgerClient();

export const ledgerClient: LedgerClient = currentLedgerClient;

export function setLedgerClient(client: LedgerClient): void {
  currentLedgerClient = client;
}

if (typeof exports !== 'undefined') {
  Object.defineProperty(exports, 'ledgerClient', {
    enumerable: true,
    configurable: true,
    get() {
      return currentLedgerClient;
    },
  });
}

