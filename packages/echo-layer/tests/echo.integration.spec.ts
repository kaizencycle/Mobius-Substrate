import { memoryStore } from '../src/memoryStore';
import { reinforce } from '../src/reinforcementLoop';

describe('ECHO reinforcement integration', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  it('saves an entry into memoryStore and returns GI and consensus', () => {
    const sentinelA = {
      answer: 'Paris',
      sources: ['https://france.fr', 'https://example.com'],
    };
    const sentinelB = {
      answer: 'Paris',
      sources: ['https://france.fr'],
    };
    const question = 'What is the capital of France?';

    const entry = reinforce(sentinelA, sentinelB, question);

    expect(entry.id).toBeDefined();
    expect(entry.question).toBe(question);
    expect(entry.answer).toBe('Paris');
    expect(entry.sources.length).toBeGreaterThanOrEqual(1);
    expect(entry.consensusLevel).toBeGreaterThan(0);
    expect(entry.giScore).toBeGreaterThan(0);

    const stored = memoryStore.get(question);
    expect(stored).not.toBeNull();
    expect(stored?.id).toBe(entry.id);
  });

  it('returns different entries for different questions', () => {
    const answer = { answer: 'A', sources: [] };

    const entryOne = reinforce(answer, answer, 'Q1?');
    const entryTwo = reinforce(answer, answer, 'Q2?');

    expect(entryOne.id).not.toBe(entryTwo.id);
    expect(entryOne.question).not.toBe(entryTwo.question);
  });
});
