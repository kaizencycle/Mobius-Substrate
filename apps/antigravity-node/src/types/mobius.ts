export interface BrokerLiftStartPayload {
  intent: string;
  safetyLevel: string;
}

export interface BrokerLiftResultPayload {
  answer: string;
  toolTraces: unknown[];
  riskFlags: string[];
  meta?: Record<string, unknown>;
}
