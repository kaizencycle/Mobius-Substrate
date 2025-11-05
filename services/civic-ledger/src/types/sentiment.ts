export type TopicScore = { topic: string; score: number }; // -1..+1

export interface SentimentIngest {
  source: 'bettafish';
  epoch: number;
  window_start: string; // ISO
  window_end: string;   // ISO
  avg_sentiment: number;   // -1..+1
  polarization: number;    // 0..1 (higher = more polarized)
  volume: number;          // docs/messages counted
  topics?: TopicScore[];   // optional per-topic scores
}

export interface SentimentSummary {
  epoch: number;
  imi: number;            // Integrity Mood Index 0..1  (remapped from -1..+1)
  polarization: number;   // 0..1
  volume: number;
  updated_at: string;
  topics?: TopicScore[];
}

export function moodToIMI(avg: number): number {
  // map -1..+1 -> 0..1
  return Math.max(0, Math.min(1, (avg + 1) / 2));
}
