import { randomUUID } from 'crypto';
import { memoryStore } from './memoryStore';
import { EchoEntry, SentinelAnswer } from './types';

function mergeSources(a: SentinelAnswer, b: SentinelAnswer): string[] {
  const combined = [...(a.sources ?? []), ...(b.sources ?? [])]
    .map(source => source?.trim())
    .filter((source): source is string => Boolean(source));

  return Array.from(new Set(combined));
}

function determineConsensusLevel(a: SentinelAnswer, b: SentinelAnswer): number {
  if (!a.answer?.trim() || !b.answer?.trim()) {
    return 0;
  }

  const normalizedA = a.answer.trim().toLowerCase();
  const normalizedB = b.answer.trim().toLowerCase();

  if (normalizedA === normalizedB) {
    return 0.95;
  }

  // Penalize partial agreement when answers differ
  return 0.6;
}

function computeGiScore(consensusLevel: number): number {
  const base = 0.8;
  const bonus = consensusLevel * 0.15;
  const score = Math.min(1, base + bonus);
  return Number(score.toFixed(2));
}

function pickWinningAnswer(a: SentinelAnswer, b: SentinelAnswer): string {
  if (a.answer?.trim()) {
    return a.answer;
  }
  return b.answer;
}

export function reinforce(a1: SentinelAnswer, a2: SentinelAnswer, question: string): EchoEntry {
  if (!question?.trim()) {
    throw new Error('question is required for ECHO reinforcement');
  }
  if (!a1?.answer?.trim() || !a2?.answer?.trim()) {
    throw new Error('both sentinel answers are required for reinforcement');
  }

  const consensusLevel = determineConsensusLevel(a1, a2);
  const giScore = computeGiScore(consensusLevel);
  const sources = mergeSources(a1, a2);

  const entry: EchoEntry = {
    id: `echo_${randomUUID()}`,
    question,
    answer: pickWinningAnswer(a1, a2),
    sources,
    consensusLevel: Number(consensusLevel.toFixed(2)),
    giScore,
    timestamp: new Date().toISOString(),
  };

  memoryStore.save(entry);
  return entry;
}
