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
