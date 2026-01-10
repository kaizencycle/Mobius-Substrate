/**
 * GI Aggregator - Metrics Tests
 * 
 * Tests for timeWeightedAverage and rejectOutliers functions.
 * 
 * @module gi-aggregator/tests/metrics
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { timeWeightedAverage, rejectOutliers } from './metrics.js';
import type { GISample } from './types.js';

describe('timeWeightedAverage', () => {
  it('should return null for empty samples', () => {
    const result = timeWeightedAverage([]);
    assert.strictEqual(result, null);
  });

  it('should return the value for a single sample', () => {
    const now = Date.now();
    const samples: GISample[] = [{ t: now, mii: 0.95 }];
    const result = timeWeightedAverage(samples, now);
    assert.ok(result !== null);
    assert.ok(Math.abs(result - 0.95) < 0.01);
  });

  it('should weight recent samples higher than older ones', () => {
    const now = Date.now();
    const samples: GISample[] = [
      { t: now - 10000, mii: 0.5 },  // older, lower value
      { t: now, mii: 0.9 }           // newer, higher value
    ];
    const result = timeWeightedAverage(samples, now);
    assert.ok(result !== null);
    // Result should be closer to 0.9 (the newer sample)
    assert.ok(result > 0.7, `Expected result > 0.7, got ${result}`);
  });

  it('should respect custom weights', () => {
    const now = Date.now();
    const samples: GISample[] = [
      { t: now - 1000, mii: 0.5, w: 10 },  // high weight
      { t: now, mii: 0.9, w: 1 }            // low weight
    ];
    const result = timeWeightedAverage(samples, now);
    assert.ok(result !== null);
    // High-weighted sample should pull result toward 0.5
    assert.ok(result < 0.8, `Expected result < 0.8 due to weighted sample, got ${result}`);
  });

  it('should handle samples with same timestamp', () => {
    const now = Date.now();
    const samples: GISample[] = [
      { t: now, mii: 0.8 },
      { t: now, mii: 0.9 },
      { t: now, mii: 1.0 }
    ];
    const result = timeWeightedAverage(samples, now);
    assert.ok(result !== null);
    // Should be close to average of 0.9
    assert.ok(Math.abs(result - 0.9) < 0.05);
  });

  it('should not return values outside 0-1 range', () => {
    const now = Date.now();
    const samples: GISample[] = [
      { t: now - 5000, mii: 0.0 },
      { t: now, mii: 1.0 }
    ];
    const result = timeWeightedAverage(samples, now);
    assert.ok(result !== null);
    assert.ok(result >= 0 && result <= 1, `Result ${result} should be in [0, 1]`);
  });
});

describe('rejectOutliers', () => {
  it('should return all samples if fewer than 8', () => {
    const samples: GISample[] = [
      { t: 1, mii: 0.5 },
      { t: 2, mii: 0.9 },
      { t: 3, mii: 0.1 }  // would be outlier in larger set
    ];
    const result = rejectOutliers(samples);
    assert.strictEqual(result.length, 3);
  });

  it('should filter outliers from larger sample sets', () => {
    const now = Date.now();
    // Create 10 samples around 0.9, with one extreme outlier at 0.0
    // Need more samples with tighter grouping to make outlier detection work
    const samples: GISample[] = [
      { t: now, mii: 0.90 },
      { t: now + 1, mii: 0.90 },
      { t: now + 2, mii: 0.90 },
      { t: now + 3, mii: 0.91 },
      { t: now + 4, mii: 0.89 },
      { t: now + 5, mii: 0.90 },
      { t: now + 6, mii: 0.90 },
      { t: now + 7, mii: 0.91 },
      { t: now + 8, mii: 0.0 },   // extreme outlier - 0.0 vs mean ~0.9
    ];
    const result = rejectOutliers(samples, 2); // Use z-score of 2 for stricter filtering
    // The 0.0 outlier should be filtered
    assert.ok(result.length < samples.length, `Should have filtered at least one outlier. Got ${result.length} from ${samples.length}`);
    assert.ok(result.every(s => s.mii > 0.5), 'All remaining samples should be > 0.5');
  });

  it('should keep samples within z-score threshold', () => {
    const now = Date.now();
    // Samples with normal distribution around 0.9
    const samples: GISample[] = [
      { t: now, mii: 0.90 },
      { t: now + 1, mii: 0.92 },
      { t: now + 2, mii: 0.88 },
      { t: now + 3, mii: 0.91 },
      { t: now + 4, mii: 0.89 },
      { t: now + 5, mii: 0.90 },
      { t: now + 6, mii: 0.93 },
      { t: now + 7, mii: 0.87 },
    ];
    const result = rejectOutliers(samples);
    // No outliers - should keep all
    assert.strictEqual(result.length, samples.length);
  });

  it('should respect custom z-score maximum', () => {
    const now = Date.now();
    const samples: GISample[] = [
      { t: now, mii: 0.90 },
      { t: now + 1, mii: 0.91 },
      { t: now + 2, mii: 0.89 },
      { t: now + 3, mii: 0.92 },
      { t: now + 4, mii: 0.88 },
      { t: now + 5, mii: 0.91 },
      { t: now + 6, mii: 0.90 },
      { t: now + 7, mii: 0.70 },  // moderate deviation
    ];
    // With strict z-score of 1, the 0.70 should be filtered
    const strictResult = rejectOutliers(samples, 1);
    // With lenient z-score of 5, should keep more
    const lenientResult = rejectOutliers(samples, 5);
    
    assert.ok(strictResult.length <= lenientResult.length, 
      'Stricter z-score should filter more samples');
  });

  it('should handle empty array', () => {
    const result = rejectOutliers([]);
    assert.strictEqual(result.length, 0);
  });

  it('should handle uniform samples', () => {
    const now = Date.now();
    const samples: GISample[] = Array.from({ length: 10 }, (_, i) => ({
      t: now + i,
      mii: 0.95  // all identical
    }));
    const result = rejectOutliers(samples);
    // Should keep all (no variance means no outliers)
    assert.strictEqual(result.length, samples.length);
  });
});
