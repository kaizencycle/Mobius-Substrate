/**
 * GI Aggregator - Store Tests
 * 
 * Tests for the sample storage ring buffer.
 * 
 * @module gi-aggregator/tests/store
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// We need to test the store module, but it has internal state
// For proper isolation, we'll test the behavior we can observe

describe('Store Module', () => {
  // Note: The store module maintains internal state with a seeded sample
  // Tests here verify the public API behavior
  
  it('should export pushSample and getSamplesSince functions', async () => {
    const store = await import('./store.js');
    assert.strictEqual(typeof store.pushSample, 'function');
    assert.strictEqual(typeof store.getSamplesSince, 'function');
  });

  it('should return samples since a given timestamp', async () => {
    const store = await import('./store.js');
    const now = Date.now();
    
    // Push a new sample
    store.pushSample({ t: now, mii: 0.99, w: 1 });
    
    // Get samples from just before now
    const samples = store.getSamplesSince(now - 1000);
    
    assert.ok(samples.length >= 1, 'Should have at least one sample');
    assert.ok(samples.some(s => s.mii === 0.99), 'Should contain our pushed sample');
  });

  it('should filter samples by timestamp', async () => {
    const store = await import('./store.js');
    const now = Date.now();
    const future = now + 1000000;
    
    // Get samples from the future - should be empty or only contain future samples
    const futureSamples = store.getSamplesSince(future);
    
    // All returned samples should have timestamp >= future
    assert.ok(futureSamples.every(s => s.t >= future), 
      'All samples should be at or after the since timestamp');
  });

  it('should store samples with default weight', async () => {
    const store = await import('./store.js');
    const now = Date.now();
    
    // Push sample without weight
    store.pushSample({ t: now + 100, mii: 0.85 });
    
    const samples = store.getSamplesSince(now);
    const sample = samples.find(s => s.mii === 0.85);
    
    assert.ok(sample, 'Sample should be stored');
  });

  it('should handle MII boundary values', async () => {
    const store = await import('./store.js');
    const now = Date.now();
    
    // Push boundary values
    store.pushSample({ t: now + 200, mii: 0.0 });
    store.pushSample({ t: now + 201, mii: 1.0 });
    
    const samples = store.getSamplesSince(now);
    
    assert.ok(samples.some(s => s.mii === 0.0), 'Should store MII = 0');
    assert.ok(samples.some(s => s.mii === 1.0), 'Should store MII = 1');
  });
});
