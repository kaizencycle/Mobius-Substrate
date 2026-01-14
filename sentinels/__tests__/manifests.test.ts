/**
 * @fileoverview Tests for Sentinel Manifests
 * @description Validates all sentinel manifest.json files
 */

import {
  discoverSentinels,
  loadManifest,
  validateManifest,
  REQUIRED_MANIFEST_FIELDS,
  type SentinelManifest,
} from './utils/test-utils';

describe('Sentinel Manifests', () => {
  const sentinels = discoverSentinels();

  describe('Manifest Discovery', () => {
    it('should discover at least 8 sentinels with manifests', () => {
      expect(sentinels.length).toBeGreaterThanOrEqual(8);
    });

    it('should include primary sentinels', () => {
      const primary = ['atlas', 'aurea', 'jade', 'eve', 'hermes', 'zeus', 'echo'];
      for (const sentinel of primary) {
        expect(sentinels).toContain(sentinel);
      }
    });
  });

  describe.each(sentinels)('Manifest: %s', (sentinelName) => {
    let manifest: SentinelManifest | null;

    beforeAll(() => {
      manifest = loadManifest(sentinelName);
    });

    it('should load manifest successfully', () => {
      expect(manifest).not.toBeNull();
    });

    it('should have required fields', () => {
      if (manifest) {
        for (const field of REQUIRED_MANIFEST_FIELDS) {
          expect(manifest).toHaveProperty(field);
        }
      }
    });

    it('should have valid agent name', () => {
      expect(manifest?.agent).toBeDefined();
      expect(typeof manifest?.agent).toBe('string');
      expect(manifest?.agent?.length).toBeGreaterThan(0);
    });

    it('should have valid role', () => {
      expect(manifest?.role).toBeDefined();
      expect(typeof manifest?.role).toBe('string');
      expect(manifest?.role?.length).toBeGreaterThan(0);
    });

    it('should have valid version', () => {
      expect(manifest?.version).toBeDefined();
      expect(manifest?.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should have valid status', () => {
      expect(manifest?.status).toBeDefined();
      expect(['active', 'inactive', 'pending', 'deprecated']).toContain(
        manifest?.status?.toLowerCase()
      );
    });

    it('should pass validation', () => {
      if (manifest) {
        const errors = validateManifest(manifest);
        expect(errors).toEqual([]);
      }
    });
  });

  describe('Temperament Validation', () => {
    const sentinelsWithTemperament = sentinels.filter((s) => {
      const manifest = loadManifest(s);
      return manifest?.temperament !== undefined;
    });

    it.each(sentinelsWithTemperament)(
      '%s should have valid temperament values',
      (sentinelName) => {
        const manifest = loadManifest(sentinelName);
        if (manifest?.temperament) {
          expect(manifest.temperament.rationality).toBeGreaterThanOrEqual(0);
          expect(manifest.temperament.rationality).toBeLessThanOrEqual(1);
          expect(manifest.temperament.empathy).toBeGreaterThanOrEqual(0);
          expect(manifest.temperament.empathy).toBeLessThanOrEqual(1);
        }
      }
    );
  });

  describe('Core Functions Validation', () => {
    const sentinelsWithFunctions = sentinels.filter((s) => {
      const manifest = loadManifest(s);
      return manifest?.core_functions !== undefined;
    });

    it.each(sentinelsWithFunctions)(
      '%s should have valid core functions',
      (sentinelName) => {
        const manifest = loadManifest(sentinelName);
        if (manifest?.core_functions) {
          expect(Array.isArray(manifest.core_functions)).toBe(true);
          expect(manifest.core_functions.length).toBeGreaterThan(0);
          for (const func of manifest.core_functions) {
            expect(typeof func).toBe('string');
            expect(func.length).toBeGreaterThan(0);
          }
        }
      }
    );
  });
});
