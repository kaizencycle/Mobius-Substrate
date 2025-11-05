import type { SentimentIngest, SentimentSummary } from '../types/sentiment.js';
import { moodToIMI } from '../types/sentiment.js';

let latest: SentimentSummary | null = null; // TODO: replace with Redis/DB

export function saveSentiment(payload: SentimentIngest): SentimentSummary {
  latest = {
    epoch: payload.epoch,
    imi: moodToIMI(payload.avg_sentiment),
    polarization: payload.polarization,
    volume: payload.volume,
    updated_at: new Date().toISOString(),
    topics: payload.topics,
  };
  return latest;
}

export function getSentiment(): SentimentSummary | null {
  return latest;
}
