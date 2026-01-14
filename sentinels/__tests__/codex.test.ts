/**
 * @fileoverview Tests for Sentinel CODEX Documentation
 * @description Validates that all sentinels have proper CODEX documentation
 */

import * as fs from 'fs';
import {
  discoverSentinels,
  discoverCodexes,
  getCodexPath,
  getMissingCodexes,
  KNOWN_SENTINELS,
} from './utils/test-utils';

describe('Sentinel CODEX Documentation', () => {
  const sentinelsWithManifest = discoverSentinels();
  const sentinelsWithCodex = discoverCodexes();

  describe('CODEX Discovery', () => {
    it('should have CODEX files for core sentinels', () => {
      const coreSentinels = ['atlas', 'aurea', 'jade', 'eve', 'hermes', 'zeus', 'echo', 'daedalus'];
      for (const sentinel of coreSentinels) {
        expect(sentinelsWithCodex).toContain(sentinel);
      }
    });

    it('should have CODEX for at least 80% of sentinels with manifests', () => {
      const coverage = sentinelsWithCodex.length / sentinelsWithManifest.length;
      expect(coverage).toBeGreaterThanOrEqual(0.8);
    });
  });

  describe.each(sentinelsWithCodex)('CODEX: %s', (sentinelName) => {
    let codexContent: string;

    beforeAll(() => {
      codexContent = fs.readFileSync(getCodexPath(sentinelName), 'utf-8');
    });

    it('should have non-empty CODEX file', () => {
      expect(codexContent.length).toBeGreaterThan(100);
    });

    it('should have a title heading', () => {
      expect(codexContent).toMatch(/^#\s+.+/m);
    });

    it('should have Core Functions or Core Identity section', () => {
      expect(codexContent).toMatch(/##\s+(Core\s+(Functions|Identity)|Identity\s+&\s+Temperament)/i);
    });

    it('should have agent name mentioned', () => {
      const agentName = sentinelName.toUpperCase();
      expect(codexContent.toUpperCase()).toContain(agentName);
    });

    it('should have a quote or motto', () => {
      expect(codexContent).toMatch(/>\s*\*?"[^"]+"\*?/);
    });
  });

  describe('CODEX Content Quality', () => {
    const detailedCodexes = ['atlas', 'aurea', 'jade', 'eve', 'zeus', 'hermes', 'echo', 'daedalus'];

    it.each(detailedCodexes)('%s CODEX should have MII assessment', (sentinelName) => {
      if (sentinelsWithCodex.includes(sentinelName)) {
        const codexContent = fs.readFileSync(getCodexPath(sentinelName), 'utf-8');
        expect(codexContent).toMatch(/MII|GI\s+Score|Self-Assessment/i);
      }
    });

    it.each(detailedCodexes)('%s CODEX should have Oath or Principles', (sentinelName) => {
      if (sentinelsWithCodex.includes(sentinelName)) {
        const codexContent = fs.readFileSync(getCodexPath(sentinelName), 'utf-8');
        expect(codexContent).toMatch(/##\s+(Key\s+Principles|Oath)/i);
      }
    });

    it.each(detailedCodexes)('%s CODEX should have Collaboration Matrix', (sentinelName) => {
      if (sentinelsWithCodex.includes(sentinelName)) {
        const codexContent = fs.readFileSync(getCodexPath(sentinelName), 'utf-8');
        expect(codexContent).toMatch(/Collaboration|Matrix|Integration/i);
      }
    });
  });

  describe('Missing CODEX Report', () => {
    it('should report any sentinels missing CODEX files', () => {
      const missing = getMissingCodexes();
      if (missing.length > 0) {
        console.log('Sentinels missing CODEX files:', missing.join(', '));
      }
      // Not a failure, just informational
      expect(true).toBe(true);
    });
  });
});
