import { describe, it, expect } from 'vitest';
import {
  giMultiplier,
  consensusMultiplier,
  noveltyMultiplier,
  antiDriftMultiplier
} from '../src/multipliers';

describe('multipliers', () => {
  it('giMultiplier scales linearly above 0.9 GI', () => {
    expect(giMultiplier(0.9)).toEqual(0);
    expect(giMultiplier(0.95)).toBeCloseTo(0.5);
    expect(giMultiplier(0.99)).toBeCloseTo(0.9);
  });

  it('consensusMultiplier rewards more sentinels', () => {
    expect(consensusMultiplier(1)).toEqual(1);
    expect(consensusMultiplier(2)).toEqual(1.5);
    expect(consensusMultiplier(4)).toEqual(2);
  });

  it('noveltyMultiplier toggles at 1.4x', () => {
    expect(noveltyMultiplier(false)).toEqual(1);
    expect(noveltyMultiplier(true)).toEqual(1.4);
  });

  it('antiDriftMultiplier spikes on corrections', () => {
    expect(antiDriftMultiplier(false)).toEqual(1);
    expect(antiDriftMultiplier(true)).toEqual(3);
  });
});
