/**
 * @fileoverview Tests for ZEUS_COORDINATOR
 * @description Unit tests for drift detection, load analysis, and stabilizer coordination
 */

import {
  detectDrift,
  analyzeLoad,
  coordinateStabilizerLoop,
  generateEscalation,
  AGENT_ID,
  TIER,
  DRIFT_THRESHOLD,
  LOAD_THRESHOLD,
  ESCALATION_THRESHOLD,
  type DriftEvent,
  type LoadMetrics,
  type StabilizerRecommendation,
} from './index';

describe('ZEUS_COORDINATOR', () => {
  describe('Constants', () => {
    it('should have correct AGENT_ID', () => {
      expect(AGENT_ID).toBe('ZEUS_COORDINATOR');
    });

    it('should have correct TIER', () => {
      expect(TIER).toBe(2);
    });

    it('should have reasonable thresholds', () => {
      expect(DRIFT_THRESHOLD).toBeGreaterThan(0);
      expect(LOAD_THRESHOLD).toBeGreaterThan(0);
      expect(ESCALATION_THRESHOLD).toBeGreaterThan(LOAD_THRESHOLD);
    });
  });

  describe('detectDrift', () => {
    it('should return null when drift is below threshold', () => {
      const result = detectDrift(0.1, 0.05, 'source', 'target');
      expect(result).toBeNull();
    });

    it('should detect drift when above threshold', () => {
      const result = detectDrift(0.3, 0.1, 'source', 'target');
      expect(result).not.toBeNull();
      expect(result?.driftScore).toBeCloseTo(0.2, 5);
      expect(result?.source).toBe('source');
      expect(result?.target).toBe('target');
      expect(result?.type).toBe('INTEGRITY');
    });

    it('should detect drift in reverse direction', () => {
      const result = detectDrift(0.1, 0.3, 'source', 'target');
      expect(result).not.toBeNull();
      expect(result?.driftScore).toBeCloseTo(0.2, 5);
    });

    it('should use custom drift type', () => {
      const result = detectDrift(0.3, 0.1, 'source', 'target', 'LOAD');
      expect(result?.type).toBe('LOAD');
    });
  });

  describe('analyzeLoad', () => {
    it('should return null for normal load', () => {
      const metrics: LoadMetrics = {
        cpu: 0.5,
        memory: 0.5,
        activeAgents: 10,
        pendingRequests: 50,
        averageLatencyMs: 100,
      };
      const result = analyzeLoad(metrics);
      expect(result).toBeNull();
    });

    it('should recommend ESCALATE for critical load', () => {
      const metrics: LoadMetrics = {
        cpu: 0.95,
        memory: 0.95,
        activeAgents: 100,
        pendingRequests: 500,
        averageLatencyMs: 1000,
      };
      const result = analyzeLoad(metrics);
      expect(result).not.toBeNull();
      expect(result?.action).toBe('ESCALATE');
      expect(result?.priority).toBe('CRITICAL');
      expect(result?.affectedAgents).toEqual(['ALL']);
    });

    it('should recommend DAMPEN for high load', () => {
      const metrics: LoadMetrics = {
        cpu: 0.9,
        memory: 0.9,
        activeAgents: 50,
        pendingRequests: 200,
        averageLatencyMs: 500,
      };
      const result = analyzeLoad(metrics);
      expect(result).not.toBeNull();
      expect(result?.action).toBe('DAMPEN');
      expect(result?.priority).toBe('HIGH');
    });

    it('should recommend REDISTRIBUTE for high pending requests', () => {
      const metrics: LoadMetrics = {
        cpu: 0.5,
        memory: 0.5,
        activeAgents: 10,
        pendingRequests: 150,
        averageLatencyMs: 100,
      };
      const result = analyzeLoad(metrics);
      expect(result).not.toBeNull();
      expect(result?.action).toBe('REDISTRIBUTE');
      expect(result?.priority).toBe('MEDIUM');
    });
  });

  describe('coordinateStabilizerLoop', () => {
    it('should return HOLD for normal load', async () => {
      const metrics: LoadMetrics = {
        cpu: 0.5,
        memory: 0.5,
        activeAgents: 10,
        pendingRequests: 50,
        averageLatencyMs: 100,
      };
      const result = await coordinateStabilizerLoop(
        'http://echo:8080',
        'http://aurea:8081',
        metrics
      );
      expect(result.success).toBe(true);
      expect(result.action).toBe('HOLD');
    });

    it('should initiate stabilizer loop for high load', async () => {
      const metrics: LoadMetrics = {
        cpu: 0.9,
        memory: 0.9,
        activeAgents: 50,
        pendingRequests: 200,
        averageLatencyMs: 500,
      };
      const result = await coordinateStabilizerLoop(
        'http://echo:8080',
        'http://aurea:8081',
        metrics
      );
      expect(result.success).toBe(true);
      expect(result.action).toBe('DAMPEN');
    });
  });

  describe('generateEscalation', () => {
    it('should return HOLD for normal conditions', () => {
      const driftEvents: DriftEvent[] = [];
      const loadMetrics: LoadMetrics = {
        cpu: 0.5,
        memory: 0.5,
        activeAgents: 10,
        pendingRequests: 50,
        averageLatencyMs: 100,
      };
      const result = generateEscalation(driftEvents, loadMetrics);
      expect(result.action).toBe('HOLD');
      expect(result.priority).toBe('LOW');
    });

    it('should escalate for critical drift events', () => {
      const driftEvents: DriftEvent[] = [
        {
          source: 'agent1',
          target: 'agent2',
          driftScore: 0.35,
          timestamp: new Date().toISOString(),
          type: 'INTEGRITY',
        },
      ];
      const loadMetrics: LoadMetrics = {
        cpu: 0.5,
        memory: 0.5,
        activeAgents: 10,
        pendingRequests: 50,
        averageLatencyMs: 100,
      };
      const result = generateEscalation(driftEvents, loadMetrics);
      expect(result.action).toBe('ESCALATE');
      expect(result.priority).toBe('CRITICAL');
      expect(result.affectedAgents).toContain('agent1');
    });

    it('should escalate for critical load', () => {
      const driftEvents: DriftEvent[] = [];
      const loadMetrics: LoadMetrics = {
        cpu: 0.95,
        memory: 0.95,
        activeAgents: 100,
        pendingRequests: 500,
        averageLatencyMs: 1000,
      };
      const result = generateEscalation(driftEvents, loadMetrics);
      expect(result.action).toBe('ESCALATE');
      expect(result.priority).toBe('CRITICAL');
    });
  });
});
