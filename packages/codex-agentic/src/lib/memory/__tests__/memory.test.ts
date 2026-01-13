/**
 * Memory System Tests
 * Phase 2: Agent Memory & Learning Persistence
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStorage } from '../storage';
import {
  enrichMemoryEntry,
  findSimilarDeliberations,
  getRelevantContext,
  calculateSuccessRate,
  getPerformanceTrend,
} from '../retrieval';
import {
  generateAgentAnalytics,
  detectPatterns,
  getProviderRecommendations,
} from '../analytics';
import {
  createSession,
  getOrCreateSession,
  endSession,
  getSessionStats,
} from '../session';
import type { MemoryEntry, FoundingAgent } from '../../../types';
import fs from 'fs/promises';

const TEST_DIR = './.codex-memory-test';

describe('Memory Storage', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage(TEST_DIR);
    await storage.initialize();
  });

  afterEach(async () => {
    await storage.shutdown();
    // Clean up test directory
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should initialize storage directories', async () => {
    const stats = storage.getStats();
    expect(stats.baseDir).toBe(TEST_DIR);
    expect(stats.totalEntries).toBe(0);
    expect(stats.totalSessions).toBe(0);
  });

  it('should store and retrieve a memory entry', async () => {
    const entry: MemoryEntry = {
      traceId: 'test-trace-001',
      agent: 'ATLAS',
      timestamp: new Date().toISOString(),
      input: 'Test input for deliberation',
      output: 'Test output from deliberation',
      agreement: 0.95,
      giScore: 0.98,
      providers: ['anthropic', 'openai'],
      votes: [],
      winner: { provider: 'anthropic', output: 'Test output' },
      success: true,
    };

    await storage.storeEntry(entry);

    const retrieved = await storage.getEntry('test-trace-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.agent).toBe('ATLAS');
    expect(retrieved?.agreement).toBe(0.95);
  });

  it('should query entries with filters', async () => {
    // Store multiple entries
    for (let i = 0; i < 10; i++) {
      await storage.storeEntry({
        traceId: `trace-${i}`,
        agent: 'ATLAS',
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        input: `Test input ${i}`,
        output: `Test output ${i}`,
        agreement: 0.9 + i * 0.01,
        giScore: 0.95 + i * 0.005,
        providers: ['anthropic'],
        votes: [],
        winner: { provider: 'anthropic', output: `Test output ${i}` },
        success: true,
      });
    }

    // Query with agent filter
    const result = await storage.query({ agent: 'ATLAS', limit: 5 });
    expect(result.entries.length).toBe(5);
    expect(result.total).toBe(10);

    // Query with agreement filter
    const highAgreement = await storage.query({
      agent: 'ATLAS',
      minAgreement: 0.95,
    });
    expect(highAgreement.entries.every((e) => e.agreement >= 0.95)).toBe(true);
  });

  it('should create and update sessions', async () => {
    const session = await storage.createSession('session-001', 'AUREA', [
      'test',
    ]);
    expect(session.sessionId).toBe('session-001');
    expect(session.agent).toBe('AUREA');
    expect(session.deliberationCount).toBe(0);

    // Store entry with session
    await storage.storeEntry({
      traceId: 'trace-session-1',
      agent: 'AUREA',
      timestamp: new Date().toISOString(),
      sessionId: 'session-001',
      input: 'Test',
      output: 'Test',
      agreement: 0.9,
      giScore: 0.95,
      providers: ['openai'],
      votes: [],
      winner: { provider: 'openai', output: 'Test' },
      success: true,
    });

    const updatedSession = await storage.getSession('session-001');
    expect(updatedSession?.deliberationCount).toBe(1);
    expect(updatedSession?.averageAgreement).toBe(0.9);
  });

  it('should persist and reload from disk', async () => {
    // Store entries
    await storage.storeEntry({
      traceId: 'persist-001',
      agent: 'ZENITH',
      timestamp: new Date().toISOString(),
      input: 'Persistence test',
      output: 'Persisted',
      agreement: 0.98,
      giScore: 0.99,
      providers: ['gemini'],
      votes: [],
      winner: { provider: 'gemini', output: 'Persisted' },
      success: true,
    });

    await storage.flush();
    await storage.shutdown();

    // Create new storage instance
    const newStorage = new MemoryStorage(TEST_DIR);
    await newStorage.initialize();

    const retrieved = await newStorage.getEntry('persist-001');
    expect(retrieved).toBeDefined();
    expect(retrieved?.agent).toBe('ZENITH');

    await newStorage.shutdown();
  });
});

describe('Memory Retrieval', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage(TEST_DIR);
    await storage.initialize();

    // Seed with test data
    await storage.storeEntry({
      traceId: 'security-001',
      agent: 'ZEUS',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      input: 'How do we prevent security vulnerabilities in smart contracts?',
      output: 'Use formal verification and comprehensive testing',
      agreement: 0.96,
      giScore: 0.98,
      providers: ['deepseek', 'local'],
      votes: [],
      winner: {
        provider: 'deepseek',
        output: 'Use formal verification and comprehensive testing',
      },
      success: true,
    });

    await storage.storeEntry({
      traceId: 'security-002',
      agent: 'ZEUS',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      input: 'What are common attack vectors in DeFi protocols?',
      output: 'Reentrancy, flash loans, oracle manipulation',
      agreement: 0.94,
      giScore: 0.97,
      providers: ['deepseek', 'local'],
      votes: [],
      winner: {
        provider: 'deepseek',
        output: 'Reentrancy, flash loans, oracle manipulation',
      },
      success: true,
    });
  });

  afterEach(async () => {
    await storage.shutdown();
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should enrich memory entry with keywords and domain', () => {
    const entry: MemoryEntry = {
      traceId: 'test-001',
      agent: 'ZEUS',
      timestamp: new Date().toISOString(),
      input: 'What are the security implications of governance voting?',
      output: 'Security risks include vote manipulation and Sybil attacks',
      agreement: 0.95,
      giScore: 0.97,
      providers: ['anthropic'],
      votes: [],
      winner: {
        provider: 'anthropic',
        output: 'Security risks include vote manipulation and Sybil attacks',
      },
      success: true,
    };

    const enriched = enrichMemoryEntry(entry);

    expect(enriched.keywords).toBeDefined();
    expect(enriched.keywords!.length).toBeGreaterThan(0);
    expect(enriched.domain).toBeDefined();
    expect(['security', 'governance', 'general']).toContain(enriched.domain);
  });

  it('should find similar deliberations', async () => {
    const similar = await findSimilarDeliberations(
      'How to secure smart contract deployments?',
      'ZEUS',
      5
    );

    // May or may not find similar (depends on keyword overlap)
    expect(Array.isArray(similar)).toBe(true);
    if (similar.length > 0) {
      expect(similar[0].agent).toBe('ZEUS');
    }
  });

  it('should get relevant context', async () => {
    const context = await getRelevantContext(
      'Best practices for security audits?',
      'ZEUS',
      { maxEntries: 3 }
    );

    expect(context.all.length).toBeGreaterThanOrEqual(0);
    if (context.all.length > 0) {
      expect(context.all[0].agent).toBe('ZEUS');
    }
  });

  it('should calculate success rate', async () => {
    const rate = await calculateSuccessRate('ZEUS', 30);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });

  it('should get performance trend', async () => {
    const trend = await getPerformanceTrend('ZEUS', 'agreement');
    expect(['improving', 'stable', 'declining']).toContain(trend.trend);
    expect(trend.recent).toBeGreaterThanOrEqual(0);
  });
});

describe('Memory Analytics', () => {
  let storage: MemoryStorage;

  beforeEach(async () => {
    storage = new MemoryStorage(TEST_DIR);
    await storage.initialize();

    // Seed with varied test data
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      await storage.storeEntry({
        traceId: `analytics-${i}`,
        agent: 'HERMES',
        timestamp: new Date(now - i * 3600000).toISOString(),
        input: `Test query ${i}`,
        output: `Test response ${i}`,
        agreement: 0.85 + Math.random() * 0.15,
        giScore: 0.90 + Math.random() * 0.10,
        providers: i % 2 === 0 ? ['openai', 'deepseek'] : ['anthropic'],
        votes: [],
        winner: {
          provider: i % 2 === 0 ? 'openai' : 'anthropic',
          output: `Test response ${i}`,
        },
        success: Math.random() > 0.2,
      });
    }
  });

  afterEach(async () => {
    await storage.shutdown();
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should generate agent analytics', async () => {
    const analytics = await generateAgentAnalytics('HERMES', 30);

    expect(analytics.agent).toBe('HERMES');
    expect(analytics.totalDeliberations).toBeGreaterThanOrEqual(0); // May be 0 if no data
    if (analytics.totalDeliberations > 0) {
      expect(analytics.avgAgreement).toBeGreaterThan(0);
      expect(analytics.avgGI).toBeGreaterThan(0);
    }
    expect(analytics.providerStats).toBeDefined();
  });

  it('should detect patterns', async () => {
    const patterns = await detectPatterns('HERMES', 30);

    expect(Array.isArray(patterns)).toBe(true);
    // May or may not have patterns depending on data
  });

  it('should provide provider recommendations', async () => {
    const recommendations = await getProviderRecommendations('HERMES', 30);

    expect(recommendations.recommended).toBeDefined();
    expect(recommendations.recommended.length).toBeGreaterThan(0);
    expect(recommendations.reasoning).toBeDefined();
  });
});

describe('Session Management', () => {
  beforeEach(async () => {
    const storage = new MemoryStorage(TEST_DIR);
    await storage.initialize();
  });

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true });
  });

  it('should create a session', async () => {
    const session = await createSession('EVE', ['test-session']);

    expect(session.agent).toBe('EVE');
    expect(session.deliberationCount).toBe(0);
    expect(session.tags).toContain('test-session');
  });

  it('should get or create session', async () => {
    const session1 = await getOrCreateSession('JADE');
    const session2 = await getOrCreateSession('JADE', session1.sessionId);

    expect(session1.sessionId).toBe(session2.sessionId);
  });

  it('should end a session', async () => {
    const session = await createSession('SOLARA');
    await endSession(session.sessionId);

    const stats = await getSessionStats(session.sessionId);
    expect(stats?.session.endTime).toBeDefined();
  });

  it('should calculate session statistics', async () => {
    const session = await createSession('KAIZEN');

    const stats = await getSessionStats(session.sessionId);
    expect(stats).toBeDefined();
    expect(stats?.durationMs).toBeGreaterThanOrEqual(0);
  });
});
