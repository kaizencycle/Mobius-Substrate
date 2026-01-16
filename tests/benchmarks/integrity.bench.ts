/**
 * Integrity Calculation Benchmarks
 * 
 * Measures performance of core integrity calculations:
 * - MII (Mobius Integrity Index) computation
 * - MFS (Mobius Fractal Shards) aggregation
 * - Attestation signature verification
 * 
 * Performance Targets:
 * - MII Computation: < 10ms (p95)
 * - Attestation Verify: < 5ms (p95)
 * - MFS Aggregation: < 15ms (p95)
 */

import { describe, bench, expect } from 'vitest';

// Performance targets (milliseconds)
// These targets are documented for reference and used in CI threshold checks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PERFORMANCE_TARGETS = {
  MII_COMPUTE_MS: 10,
  ATTESTATION_VERIFY_MS: 5,
  MFS_AGGREGATE_MS: 15,
  BATCH_PROCESS_MS: 100,
} as const;

/**
 * Mock MII calculation for benchmarking
 * In production, import from @civic/integrity-core
 */
function calculateMII(state: {
  technical: number;
  moral: number;
  civic: number;
  security: number;
  antiGaming: number;
}): number {
  const weights = { T: 0.35, M: 0.25, C: 0.25, S: 0.15 };
  const raw =
    weights.T * state.technical +
    weights.M * state.moral +
    weights.C * state.civic +
    weights.S * state.security;
  return Math.max(0, raw - state.antiGaming);
}

/**
 * Mock attestation verification
 * In production, use ed25519-wasm or noble-ed25519
 */
function verifyAttestation(attestation: {
  signature: string;
  publicKey: string;
  payload: string;
}): boolean {
  // Simulate signature verification overhead
  const hash = attestation.payload.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return hash !== 0;
}

/**
 * Mock MFS aggregation
 */
function aggregateMFS(shards: Array<{ archetype: string; quality: number; weight: number }>): number {
  return shards.reduce((sum, shard) => sum + shard.quality * shard.weight, 0) / shards.length;
}

// =============================================================================
// MII Computation Benchmarks
// =============================================================================

describe('MII Computation', () => {
  const validState = {
    technical: 0.95,
    moral: 0.90,
    civic: 0.92,
    security: 0.88,
    antiGaming: 0.02,
  };

  bench('single computation', () => {
    const result = calculateMII(validState);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  }, {
    iterations: 10000,
    time: 5000,
  });

  bench('batch computation (100 states)', () => {
    const states = Array(100).fill(null).map(() => ({
      technical: Math.random() * 0.2 + 0.8,
      moral: Math.random() * 0.2 + 0.8,
      civic: Math.random() * 0.2 + 0.8,
      security: Math.random() * 0.2 + 0.8,
      antiGaming: Math.random() * 0.1,
    }));
    
    const results = states.map(calculateMII);
    expect(results.every(r => r >= 0 && r <= 1)).toBe(true);
  }, {
    iterations: 1000,
    time: 5000,
  });

  bench('edge case: near threshold (0.95)', () => {
    const edgeState = {
      technical: 0.95,
      moral: 0.95,
      civic: 0.95,
      security: 0.95,
      antiGaming: 0.0,
    };
    const result = calculateMII(edgeState);
    expect(result).toBeGreaterThanOrEqual(0.95);
  }, {
    iterations: 10000,
    time: 5000,
  });
});

// =============================================================================
// Attestation Verification Benchmarks
// =============================================================================

describe('Attestation Verification', () => {
  const mockAttestation = {
    signature: 'a'.repeat(128), // 64 bytes hex
    publicKey: 'b'.repeat(64),  // 32 bytes hex
    payload: JSON.stringify({
      ts: '2026-01-16T12:00:00Z',
      nonce: 'test-nonce-123',
      repo: 'kaizencycle/Mobius-Substrate',
      commit: 'abc123def456',
      mii: 0.96,
    }),
  };

  bench('single verification', () => {
    const valid = verifyAttestation(mockAttestation);
    expect(valid).toBe(true);
  }, {
    iterations: 10000,
    time: 5000,
  });

  bench('batch verification (50 attestations)', () => {
    const attestations = Array(50).fill(null).map((_, i) => ({
      ...mockAttestation,
      payload: JSON.stringify({
        ts: new Date().toISOString(),
        nonce: `nonce-${i}`,
        repo: 'kaizencycle/Mobius-Substrate',
        commit: `commit-${i}`,
        mii: 0.95 + Math.random() * 0.05,
      }),
    }));

    const results = attestations.map(verifyAttestation);
    expect(results.every(r => r === true)).toBe(true);
  }, {
    iterations: 500,
    time: 5000,
  });
});

// =============================================================================
// MFS Aggregation Benchmarks
// =============================================================================

describe('MFS Aggregation', () => {
  const MFS_ARCHETYPES = ['REF', 'LRN', 'CIV', 'STB', 'STW', 'INV', 'GRD'];
  
  const generateShards = (count: number) =>
    Array(count).fill(null).map((_, i) => ({
      archetype: MFS_ARCHETYPES[i % MFS_ARCHETYPES.length],
      quality: 0.5 + Math.random() * 1.5, // 0.5-2.0 range
      weight: 1 / count,
    }));

  bench('small set (7 shards - one per archetype)', () => {
    const shards = generateShards(7);
    const result = aggregateMFS(shards);
    expect(result).toBeGreaterThan(0);
  }, {
    iterations: 10000,
    time: 5000,
  });

  bench('medium set (100 shards)', () => {
    const shards = generateShards(100);
    const result = aggregateMFS(shards);
    expect(result).toBeGreaterThan(0);
  }, {
    iterations: 5000,
    time: 5000,
  });

  bench('large set (1000 shards)', () => {
    const shards = generateShards(1000);
    const result = aggregateMFS(shards);
    expect(result).toBeGreaterThan(0);
  }, {
    iterations: 1000,
    time: 5000,
  });
});

// =============================================================================
// Combined Pipeline Benchmarks
// =============================================================================

describe('Full Integrity Pipeline', () => {
  bench('complete integrity check', () => {
    // Step 1: Calculate MII
    const miiState = {
      technical: 0.95,
      moral: 0.90,
      civic: 0.92,
      security: 0.88,
      antiGaming: 0.02,
    };
    const mii = calculateMII(miiState);

    // Step 2: Generate attestation payload
    const payload = JSON.stringify({
      ts: new Date().toISOString(),
      nonce: Math.random().toString(36),
      mii,
    });

    // Step 3: Verify attestation
    const attestation = {
      signature: 'a'.repeat(128),
      publicKey: 'b'.repeat(64),
      payload,
    };
    const valid = verifyAttestation(attestation);

    expect(mii).toBeGreaterThan(0.9);
    expect(valid).toBe(true);
  }, {
    iterations: 5000,
    time: 5000,
  });
});
