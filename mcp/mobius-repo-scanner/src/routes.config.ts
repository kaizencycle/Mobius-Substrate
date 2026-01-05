/**
 * routes.config.ts
 * 
 * Routing + safety rules for @mobius/mcp-repo-scanner
 * 
 * This file implements the Repo Traversal Policy v1 defined in:
 * docs/03-GOVERNANCE-AND-POLICY/governance/REPO_TRAVERSAL_POLICY.epicon.md
 * 
 * Zone Model:
 * - HOT: Stable, high-signal, bulk traversal allowed
 * - WARM: Valuable but heavier, targeted traversal only
 * - COLD: Experimental & infra, explicit opt-in
 * - FROZEN: Historical memory, read-only
 * 
 * @author Michael Judan <kaizencycle>
 * @license MIT
 * @cycle C-178
 */

export type ZoneName = 'HOT' | 'WARM' | 'COLD' | 'FROZEN';

export interface RepoZoneRule {
  /** Zone classification */
  zone: ZoneName;
  /** Minimally expressive glob-like pattern */
  pattern: string;
  /** Maximum recursion depth from this path (0 = file only) */
  maxDepth: number;
  /** Hard ceiling on number of files to return per query */
  maxFiles: number;
  /** Whether this zone is included in "scan all" style calls */
  allowBulkScan: boolean;
  /** Human-readable description (for agents / logs) */
  description: string;
}

/**
 * Ordered from most specific to least specific.
 * First matching rule wins.
 */
export const REPO_ZONES: RepoZoneRule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 HOT — always safe, high-value entrypoints
  // ═══════════════════════════════════════════════════════════════════════════
  {
    zone: 'HOT',
    pattern: 'REPO_DIGEST.md',
    maxDepth: 0,
    maxFiles: 1,
    allowBulkScan: true,
    description: 'Repository digest / navigation entrypoint'
  },
  {
    zone: 'HOT',
    pattern: 'REPO_MAP_TREE.md',
    maxDepth: 0,
    maxFiles: 1,
    allowBulkScan: true,
    description: 'High-level file tree / map'
  },
  {
    zone: 'HOT',
    pattern: 'llm-manifest.json',
    maxDepth: 0,
    maxFiles: 1,
    allowBulkScan: true,
    description: 'Machine-readable agent navigation manifest'
  },
  {
    zone: 'HOT',
    pattern: '00-START-HERE/**',
    maxDepth: 3,
    maxFiles: 50,
    allowBulkScan: true,
    description: 'Onboarding + quickstart for humans and agents'
  },
  {
    zone: 'HOT',
    pattern: 'FOUNDATION/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: true,
    description: 'Foundation charter, governance, and policies'
  },
  {
    zone: 'HOT',
    pattern: 'GOVERNANCE/**',
    maxDepth: 3,
    maxFiles: 50,
    allowBulkScan: true,
    description: 'Participation framework, role definitions, and civic governance'
  },
  {
    zone: 'HOT',
    pattern: 'docs/03-GOVERNANCE-AND-POLICY/civic/**',
    maxDepth: 3,
    maxFiles: 50,
    allowBulkScan: true,
    description: 'Validator Charter, Attestor Oath, and civic covenants'
  },
  {
    zone: 'HOT',
    pattern: 'epicon/**',
    maxDepth: 6,
    maxFiles: 200,
    allowBulkScan: true,
    description: 'EPICON intent memory layer - semantic backbone'
  },
  {
    zone: 'HOT',
    pattern: 'apps/browser-shell/**',
    maxDepth: 6,
    maxFiles: 200,
    allowBulkScan: true,
    description: 'Mobius Browser Shell — citizen on-ramp'
  },
  {
    zone: 'HOT',
    pattern: 'apps/mobius-wallet/**',
    maxDepth: 6,
    maxFiles: 200,
    allowBulkScan: true,
    description: 'MIC wallet interface'
  },
  {
    zone: 'HOT',
    pattern: 'docs/04-TECHNICAL-ARCHITECTURE/overview/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: true,
    description: 'High-level architecture and roadmap'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌡️ WARM — useful, but constrain volume
  // ═══════════════════════════════════════════════════════════════════════════
  {
    zone: 'WARM',
    pattern: 'docs/00-START-HERE/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Documentation quick start guides'
  },
  {
    zone: 'WARM',
    pattern: 'docs/01-INTRODUCTION/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'System introduction documentation'
  },
  {
    zone: 'WARM',
    pattern: 'docs/02-THEORETICAL-FOUNDATIONS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Theoretical foundations and frameworks'
  },
  {
    zone: 'WARM',
    pattern: 'docs/03-GOVERNANCE-AND-POLICY/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Governance rules, PR policy, decision models'
  },
  {
    zone: 'WARM',
    pattern: 'docs/04-TECHNICAL-ARCHITECTURE/**',
    maxDepth: 5,
    maxFiles: 150,
    allowBulkScan: false,
    description: 'Technical architecture documentation'
  },
  {
    zone: 'WARM',
    pattern: 'docs/05-IMPLEMENTATION/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Implementation guides'
  },
  {
    zone: 'WARM',
    pattern: 'docs/06-OPERATIONS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Operations and runbooks'
  },
  {
    zone: 'WARM',
    pattern: 'docs/08-REFERENCE/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Reference documentation and glossary'
  },
  {
    zone: 'WARM',
    pattern: 'docs/epicon/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'EPICON guides, examples, and contribution rules'
  },
  {
    zone: 'WARM',
    pattern: 'packages/**',
    maxDepth: 5,
    maxFiles: 250,
    allowBulkScan: false,
    description: 'Shared libraries and SDKs; scan by package, not all at once'
  },
  {
    zone: 'WARM',
    pattern: 'sentinels/**',
    maxDepth: 5,
    maxFiles: 200,
    allowBulkScan: false,
    description: 'Sentinel agents - ATLAS, AUREA, ECHO, etc.'
  },
  {
    zone: 'WARM',
    pattern: 'services/**',
    maxDepth: 5,
    maxFiles: 200,
    allowBulkScan: false,
    description: 'Backend services and APIs'
  },
  {
    zone: 'WARM',
    pattern: 'specs/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Protocol and API specifications'
  },
  {
    zone: 'WARM',
    pattern: 'schemas/**',
    maxDepth: 3,
    maxFiles: 50,
    allowBulkScan: false,
    description: 'JSON schemas'
  },
  {
    zone: 'WARM',
    pattern: 'mcp/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'MCP tools and scanners'
  },
  {
    zone: 'WARM',
    pattern: 'FOR-ACADEMICS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Academic research path'
  },
  {
    zone: 'WARM',
    pattern: 'FOR-ECONOMISTS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Economic modeling path'
  },
  {
    zone: 'WARM',
    pattern: 'FOR-GOVERNMENTS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Policy implementation path'
  },
  {
    zone: 'WARM',
    pattern: 'FOR-PHILOSOPHERS/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Ethics and governance path'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ❄️ COLD — experimental / heavy zones; only on explicit intent
  // ═══════════════════════════════════════════════════════════════════════════
  {
    zone: 'COLD',
    pattern: 'labs/**',
    maxDepth: 5,
    maxFiles: 150,
    allowBulkScan: false,
    description: 'Labs and experiments; opt-in traversal only'
  },
  {
    zone: 'COLD',
    pattern: 'infra/**',
    maxDepth: 4,
    maxFiles: 150,
    allowBulkScan: false,
    description: 'CI/CD, deployment, infra; usually not needed for reasoning'
  },
  {
    zone: 'COLD',
    pattern: 'configs/**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Configuration files'
  },
  {
    zone: 'COLD',
    pattern: 'scripts/**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Build and deployment scripts'
  },
  {
    zone: 'COLD',
    pattern: 'tests/**',
    maxDepth: 4,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Test suites'
  },
  {
    zone: 'COLD',
    pattern: 'docs/07-RESEARCH-AND-PUBLICATIONS/**',
    maxDepth: 4,
    maxFiles: 150,
    allowBulkScan: false,
    description: 'Research archives; read selectively'
  },
  {
    zone: 'COLD',
    pattern: 'docs/09-APPENDICES/**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Appendices and supplementary material'
  },
  {
    zone: 'COLD',
    pattern: 'docs/11-SUPPLEMENTARY/**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Supplementary documentation'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧊 FROZEN — history & archives; read-only, never bulk scan
  // ═══════════════════════════════════════════════════════════════════════════
  {
    zone: 'FROZEN',
    pattern: 'docs/10-ARCHIVES/**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Sealed historical artifacts; read-only, targeted access only'
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Default catch-all (defensive)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    zone: 'COLD',
    pattern: '**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Default catch-all for uncategorized paths'
  }
];

/**
 * Minimal glob-ish matcher: supports:
 *  - "**" anywhere (match everything)
 *  - trailing "/**" (prefix match)
 *  - exact file matches
 */
export function matchesPattern(pattern: string, path: string): boolean {
  // Normalize path separators
  const normalizedPath = path.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Universal wildcard
  if (normalizedPattern === '**') return true;

  // Trailing "/**" → prefix match
  if (normalizedPattern.endsWith('/**')) {
    const prefix = normalizedPattern.slice(0, -3); // remove "/**"
    return normalizedPath === prefix || normalizedPath.startsWith(prefix + '/');
  }

  // Exact match
  return normalizedPattern === normalizedPath;
}

/**
 * Classify a repo path into a zone + rule.
 * Returns the first matching rule (most specific wins).
 */
export function classifyPath(path: string): RepoZoneRule {
  for (const rule of REPO_ZONES) {
    if (matchesPattern(rule.pattern, path)) {
      return rule;
    }
  }

  // Should never hit because of catch-all, but keep defensive
  return {
    zone: 'COLD',
    pattern: '**',
    maxDepth: 3,
    maxFiles: 100,
    allowBulkScan: false,
    description: 'Fallback classification'
  };
}

/**
 * Get all rules for a specific zone.
 */
export function getRulesForZone(zone: ZoneName): RepoZoneRule[] {
  return REPO_ZONES.filter(rule => rule.zone === zone);
}

/**
 * Check if a path is in a HOT zone (safe for bulk operations).
 */
export function isHotPath(path: string): boolean {
  const rule = classifyPath(path);
  return rule.zone === 'HOT';
}

/**
 * Check if bulk scanning is allowed for a path.
 */
export function allowsBulkScan(path: string): boolean {
  const rule = classifyPath(path);
  return rule.allowBulkScan;
}

/**
 * Get traversal limits for a path.
 */
export function getTraversalLimits(path: string): { maxDepth: number; maxFiles: number } {
  const rule = classifyPath(path);
  return {
    maxDepth: rule.maxDepth,
    maxFiles: rule.maxFiles
  };
}

/**
 * Validate a traversal request against zone rules.
 * Returns validation result with details.
 */
export interface TraversalValidation {
  allowed: boolean;
  zone: ZoneName;
  rule: RepoZoneRule;
  reason?: string;
}

export function validateTraversal(
  path: string,
  options: {
    recursive?: boolean;
    requestedDepth?: number;
    requestedFiles?: number;
  } = {}
): TraversalValidation {
  const rule = classifyPath(path);
  const { recursive = false, requestedDepth, requestedFiles } = options;

  // Check bulk scan restriction
  if (recursive && !rule.allowBulkScan) {
    return {
      allowed: false,
      zone: rule.zone,
      rule,
      reason: `Bulk scanning is not allowed for path "${path}" (zone=${rule.zone}). Use targeted queries instead.`
    };
  }

  // Check depth limit
  if (requestedDepth !== undefined && requestedDepth > rule.maxDepth) {
    return {
      allowed: false,
      zone: rule.zone,
      rule,
      reason: `Requested depth ${requestedDepth} exceeds maximum ${rule.maxDepth} for zone=${rule.zone}.`
    };
  }

  // Check file limit
  if (requestedFiles !== undefined && requestedFiles > rule.maxFiles) {
    return {
      allowed: false,
      zone: rule.zone,
      rule,
      reason: `Requested files ${requestedFiles} exceeds maximum ${rule.maxFiles} for zone=${rule.zone}.`
    };
  }

  return {
    allowed: true,
    zone: rule.zone,
    rule
  };
}

/**
 * Format zone info for logging/debugging.
 */
export function formatZoneInfo(path: string): string {
  const rule = classifyPath(path);
  return `[ZONE:${rule.zone}] path="${path}" depth<=${rule.maxDepth} files<=${rule.maxFiles} bulk=${rule.allowBulkScan}`;
}
