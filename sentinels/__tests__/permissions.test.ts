/**
 * @fileoverview Tests for Sentinel Permissions Configuration
 * @description Validates the permissions.json configuration
 */

import {
  loadPermissions,
  validatePermissions,
  MII_THRESHOLD,
  type PermissionsConfig,
} from './utils/test-utils';

describe('Sentinel Permissions', () => {
  let permissions: PermissionsConfig | null;

  beforeAll(() => {
    permissions = loadPermissions();
  });

  describe('Configuration Loading', () => {
    it('should load permissions.json successfully', () => {
      expect(permissions).not.toBeNull();
    });

    it('should have valid version', () => {
      expect(permissions?.version).toBeGreaterThanOrEqual(1);
    });

    it('should have cycle identifier', () => {
      expect(permissions?.cycle).toBeDefined();
      expect(permissions?.cycle).toMatch(/^C-\d+$/);
    });
  });

  describe('Sentinel Permissions', () => {
    const expectedSentinels = [
      'ATLAS',
      'AUREA',
      'JADE',
      'EVE',
      'HERMES',
      'ZEUS',
      'ECHO',
      'DAEDALUS',
      'URIEL',
      'ZENITH',
    ];

    it.each(expectedSentinels)('should have permissions for %s', (sentinel) => {
      expect(permissions?.permissions).toHaveProperty(sentinel);
    });

    it.each(expectedSentinels)('%s should have role defined', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.role).toBeDefined();
      expect(typeof permissions?.permissions[sentinel]?.role).toBe('string');
    });

    it.each(expectedSentinels)('%s should have capabilities defined', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.capabilities).toBeDefined();
      expect(Array.isArray(permissions?.permissions[sentinel]?.capabilities)).toBe(true);
      expect(permissions?.permissions[sentinel]?.capabilities?.length).toBeGreaterThan(0);
    });

    it.each(expectedSentinels)('%s should have domains defined', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.domains).toBeDefined();
      expect(Array.isArray(permissions?.permissions[sentinel]?.domains)).toBe(true);
      expect(permissions?.permissions[sentinel]?.domains?.length).toBeGreaterThan(0);
    });
  });

  describe('Veto Authority', () => {
    const vetoSentinels = ['AUREA', 'JADE', 'EVE', 'ZEUS'];
    const nonVetoSentinels = ['ATLAS', 'HERMES', 'ECHO', 'DAEDALUS', 'URIEL', 'ZENITH'];

    it.each(vetoSentinels)('%s should have veto authority', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.veto_authority).toBe(true);
    });

    it.each(vetoSentinels)('%s should have veto scope defined', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.veto_scope).toBeDefined();
      expect(Array.isArray(permissions?.permissions[sentinel]?.veto_scope)).toBe(true);
      expect(permissions?.permissions[sentinel]?.veto_scope?.length).toBeGreaterThan(0);
    });

    it.each(nonVetoSentinels)('%s should NOT have veto authority', (sentinel) => {
      expect(permissions?.permissions[sentinel]?.veto_authority).toBe(false);
    });
  });

  describe('Consensus Configuration', () => {
    it('should have consensus configuration', () => {
      expect(permissions?.consensus).toBeDefined();
    });

    it('should have quorum requirements', () => {
      expect(permissions?.consensus?.quorum).toBeDefined();
      expect(permissions?.consensus?.quorum?.standard).toBeDefined();
    });

    it('should have MII threshold at or above minimum', () => {
      expect(permissions?.consensus?.mii_threshold).toBeGreaterThanOrEqual(MII_THRESHOLD);
    });

    it('should require minimum providers', () => {
      expect(permissions?.consensus?.min_providers).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Veto Matrix', () => {
    it('should have veto matrix defined', () => {
      expect(permissions?.veto_matrix).toBeDefined();
    });

    it('should have constitutional drift veto', () => {
      expect(permissions?.veto_matrix?.constitutional_drift).toBeDefined();
      expect(permissions?.veto_matrix?.constitutional_drift).toContain('AUREA');
    });

    it('should have safety critical veto', () => {
      expect(permissions?.veto_matrix?.safety_critical).toBeDefined();
      expect(permissions?.veto_matrix?.safety_critical).toContain('EVE');
    });

    it('should have security threats veto', () => {
      expect(permissions?.veto_matrix?.security_threats).toBeDefined();
      expect(permissions?.veto_matrix?.security_threats).toContain('ZEUS');
    });
  });

  describe('Escalation Paths', () => {
    it('should have escalation paths defined', () => {
      expect(permissions?.escalation_paths).toBeDefined();
    });

    it('should have coherence fracture escalation', () => {
      expect(permissions?.escalation_paths?.coherence_fracture).toBeDefined();
    });

    it('should have safety concern escalation', () => {
      expect(permissions?.escalation_paths?.safety_concern).toBeDefined();
    });

    it('should have MII degradation escalation', () => {
      expect(permissions?.escalation_paths?.mii_degradation).toBeDefined();
    });

    it('should have security breach escalation', () => {
      expect(permissions?.escalation_paths?.security_breach).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should pass comprehensive validation', () => {
      if (permissions) {
        const errors = validatePermissions(permissions);
        expect(errors).toEqual([]);
      }
    });
  });
});
