/**
 * routes.config.test.ts
 * 
 * Tests for the zone-based traversal routing configuration.
 * Ensures that the Repo Traversal Policy v1 is correctly implemented.
 * 
 * @cycle C-178
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  classifyPath,
  matchesPattern,
  validateTraversal,
  isHotPath,
  allowsBulkScan,
  getTraversalLimits,
  getRulesForZone,
  formatZoneInfo,
  type ZoneName,
} from '../src/routes.config.js';

describe('Zone Classification Tests', () => {
  describe('HOT Zone Paths', () => {
    it('should classify REPO_DIGEST.md as HOT', () => {
      const rule = classifyPath('REPO_DIGEST.md');
      assert.strictEqual(rule.zone, 'HOT');
      assert.strictEqual(rule.allowBulkScan, true);
    });

    it('should classify REPO_MAP_TREE.md as HOT', () => {
      const rule = classifyPath('REPO_MAP_TREE.md');
      assert.strictEqual(rule.zone, 'HOT');
    });

    it('should classify llm-manifest.json as HOT', () => {
      const rule = classifyPath('llm-manifest.json');
      assert.strictEqual(rule.zone, 'HOT');
    });

    it('should classify 00-START-HERE/README.md as HOT', () => {
      const rule = classifyPath('00-START-HERE/README.md');
      assert.strictEqual(rule.zone, 'HOT');
      assert.strictEqual(rule.allowBulkScan, true);
    });

    it('should classify FOUNDATION/CHARTER.md as HOT', () => {
      const rule = classifyPath('FOUNDATION/CHARTER.md');
      assert.strictEqual(rule.zone, 'HOT');
    });

    it('should classify epicon/README.md as HOT', () => {
      const rule = classifyPath('epicon/README.md');
      assert.strictEqual(rule.zone, 'HOT');
    });

    it('should classify apps/browser-shell/app/page.tsx as HOT', () => {
      const rule = classifyPath('apps/browser-shell/app/page.tsx');
      assert.strictEqual(rule.zone, 'HOT');
    });
  });

  describe('WARM Zone Paths', () => {
    it('should classify packages/core/index.ts as WARM', () => {
      const rule = classifyPath('packages/core/index.ts');
      assert.strictEqual(rule.zone, 'WARM');
      assert.strictEqual(rule.allowBulkScan, false);
    });

    it('should classify sentinels/atlas/README.md as WARM', () => {
      const rule = classifyPath('sentinels/atlas/README.md');
      assert.strictEqual(rule.zone, 'WARM');
    });

    it('should classify docs/03-GOVERNANCE-AND-POLICY/governance/README.md as WARM', () => {
      const rule = classifyPath('docs/03-GOVERNANCE-AND-POLICY/governance/README.md');
      assert.strictEqual(rule.zone, 'WARM');
    });

    it('should classify FOR-ACADEMICS/README.md as WARM', () => {
      const rule = classifyPath('FOR-ACADEMICS/README.md');
      assert.strictEqual(rule.zone, 'WARM');
    });
  });

  describe('COLD Zone Paths', () => {
    it('should classify labs/experiments/test.py as COLD', () => {
      const rule = classifyPath('labs/experiments/test.py');
      assert.strictEqual(rule.zone, 'COLD');
      assert.strictEqual(rule.allowBulkScan, false);
    });

    it('should classify infra/docker/compose.yml as COLD', () => {
      const rule = classifyPath('infra/docker/compose.yml');
      assert.strictEqual(rule.zone, 'COLD');
    });

    it('should classify scripts/build.sh as COLD', () => {
      const rule = classifyPath('scripts/build.sh');
      assert.strictEqual(rule.zone, 'COLD');
    });
  });

  describe('FROZEN Zone Paths', () => {
    it('should classify docs/10-ARCHIVES/old-design.md as FROZEN', () => {
      const rule = classifyPath('docs/10-ARCHIVES/old-design.md');
      assert.strictEqual(rule.zone, 'FROZEN');
      assert.strictEqual(rule.allowBulkScan, false);
    });
  });

  describe('Catch-all Behavior', () => {
    it('should classify unknown paths as COLD', () => {
      const rule = classifyPath('some/random/unknown/path.txt');
      assert.strictEqual(rule.zone, 'COLD');
    });
  });
});

describe('Pattern Matching Tests', () => {
  it('should match exact file patterns', () => {
    assert.strictEqual(matchesPattern('REPO_DIGEST.md', 'REPO_DIGEST.md'), true);
    assert.strictEqual(matchesPattern('REPO_DIGEST.md', 'OTHER.md'), false);
  });

  it('should match wildcard patterns', () => {
    assert.strictEqual(matchesPattern('**', 'anything/goes/here'), true);
  });

  it('should match prefix patterns with /**', () => {
    assert.strictEqual(matchesPattern('epicon/**', 'epicon/README.md'), true);
    assert.strictEqual(matchesPattern('epicon/**', 'epicon/C-178/doc.md'), true);
    assert.strictEqual(matchesPattern('epicon/**', 'epicon'), true);
    assert.strictEqual(matchesPattern('epicon/**', 'not-epicon/file.md'), false);
  });

  it('should normalize path separators', () => {
    assert.strictEqual(matchesPattern('epicon/**', 'epicon\\windows\\path'), true);
  });
});

describe('Traversal Validation Tests', () => {
  it('should allow bulk scan for HOT zones', () => {
    const result = validateTraversal('REPO_DIGEST.md', { recursive: true });
    assert.strictEqual(result.allowed, true);
    assert.strictEqual(result.zone, 'HOT');
  });

  it('should allow recursive traversal within depth limits', () => {
    const result = validateTraversal('epicon/README.md', { 
      recursive: true, 
      requestedDepth: 3 
    });
    assert.strictEqual(result.allowed, true);
  });

  it('should reject depth exceeding zone limits', () => {
    const result = validateTraversal('00-START-HERE/README.md', { 
      requestedDepth: 10 
    });
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('exceeds maximum'));
  });

  it('should reject file count exceeding zone limits', () => {
    const result = validateTraversal('REPO_DIGEST.md', { 
      requestedFiles: 500 
    });
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('exceeds maximum'));
  });
});

describe('Helper Function Tests', () => {
  it('isHotPath should return true for HOT paths', () => {
    assert.strictEqual(isHotPath('REPO_DIGEST.md'), true);
    assert.strictEqual(isHotPath('labs/test.py'), false);
  });

  it('allowsBulkScan should return correct value', () => {
    assert.strictEqual(allowsBulkScan('00-START-HERE/README.md'), true);
    assert.strictEqual(allowsBulkScan('packages/core/index.ts'), false);
  });

  it('getTraversalLimits should return limits', () => {
    const limits = getTraversalLimits('epicon/README.md');
    assert.ok(limits.maxDepth > 0);
    assert.ok(limits.maxFiles > 0);
  });

  it('getRulesForZone should return rules for zone', () => {
    const hotRules = getRulesForZone('HOT');
    assert.ok(hotRules.length > 0);
    assert.ok(hotRules.every(r => r.zone === 'HOT'));
  });

  it('formatZoneInfo should return formatted string', () => {
    const info = formatZoneInfo('REPO_DIGEST.md');
    assert.ok(info.includes('ZONE:HOT'));
    assert.ok(info.includes('REPO_DIGEST.md'));
  });
});

describe('Zone Coverage Tests', () => {
  it('should have rules for all four zones', () => {
    const zones: ZoneName[] = ['HOT', 'WARM', 'COLD', 'FROZEN'];
    for (const zone of zones) {
      const rules = getRulesForZone(zone);
      assert.ok(rules.length > 0, `Zone ${zone} should have at least one rule`);
    }
  });

  it('HOT zones should all allow bulk scan', () => {
    const hotRules = getRulesForZone('HOT');
    for (const rule of hotRules) {
      assert.strictEqual(rule.allowBulkScan, true, 
        `HOT rule for ${rule.pattern} should allow bulk scan`);
    }
  });

  it('FROZEN zones should not allow bulk scan', () => {
    const frozenRules = getRulesForZone('FROZEN');
    for (const rule of frozenRules) {
      assert.strictEqual(rule.allowBulkScan, false, 
        `FROZEN rule for ${rule.pattern} should not allow bulk scan`);
    }
  });
});
