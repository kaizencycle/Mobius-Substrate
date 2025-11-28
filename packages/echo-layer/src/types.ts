export interface SentinelAnswer {
  answer: string;
  sources?: string[];
}

export interface EchoEntry {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  consensusLevel: number;
  giScore: number;
  timestamp: string;
}

// C-148 • Strange Metamorphosis Loop
export interface DailyReflection {
  id?: string;
  userId: string;
  reflectionDate: string; // ISO date YYYY-MM-DD
  worldviewText?: string;
  worldviewSentiment?: string;
  moodLabel?: string;
  moodIntensity?: number;
  intentText?: string;
  intentCategory?: string;
  intentConfidence?: number;
  echoScore?: number;
  giScore?: number;
  echoReviewStatus?: "pending" | "verified" | "flagged";
  ledgerAttestationId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}
