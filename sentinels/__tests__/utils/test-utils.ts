/**
 * @fileoverview Test utilities for Mobius Sentinels
 * @description Shared testing utilities, mocks, and helpers for sentinel testing
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface SentinelManifest {
  agent: string;
  role: string;
  governance_domain?: string;
  version: string;
  cycle?: string;
  temperament?: {
    rationality: number;
    empathy: number;
    morale_anchor?: string;
  };
  core_functions?: string[];
  protocols?: Record<string, unknown>;
  status: string;
}

export interface Permission {
  role: string;
  capabilities: string[];
  veto_authority: boolean;
  veto_scope?: string[];
  domains: string[];
}

export interface PermissionsConfig {
  version: number;
  cycle: string;
  permissions: Record<string, Permission>;
  consensus: {
    quorum: Record<string, string>;
    min_providers: number;
    mii_threshold: number;
  };
  veto_matrix: Record<string, string[]>;
  escalation_paths: Record<string, unknown>;
}

export interface SentinelHealth {
  agent: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: {
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency_ms?: number;
    last_check?: string;
  }[];
  metrics: {
    deliberations_total?: number;
    success_rate?: number;
    avg_latency_ms?: number;
    gi_score?: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

export const SENTINELS_ROOT = path.join(__dirname, '../..');

export const KNOWN_SENTINELS = [
  'atlas',
  'aurea',
  'jade',
  'eve',
  'hermes',
  'zeus',
  'echo',
  'daedalus',
  'uriel',
  'zenith',
  'zeus-coordinator',
  'zeus-sentinel',
] as const;

export const REQUIRED_MANIFEST_FIELDS = [
  'agent',
  'role',
  'version',
  'status',
] as const;

export const MII_THRESHOLD = 0.95;
export const GI_THRESHOLD = 0.95;

// ============================================================================
// File Utilities
// ============================================================================

/**
 * Load and parse a JSON file
 */
export function loadJsonFile<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Check if a file exists
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Get the path to a sentinel's directory
 */
export function getSentinelPath(sentinelName: string): string {
  return path.join(SENTINELS_ROOT, sentinelName);
}

/**
 * Get the path to a sentinel's manifest
 */
export function getManifestPath(sentinelName: string): string {
  return path.join(getSentinelPath(sentinelName), 'manifest.json');
}

/**
 * Get the path to a sentinel's CODEX
 */
export function getCodexPath(sentinelName: string): string {
  return path.join(getSentinelPath(sentinelName), 'CODEX.md');
}

/**
 * Load a sentinel's manifest
 */
export function loadManifest(sentinelName: string): SentinelManifest | null {
  return loadJsonFile<SentinelManifest>(getManifestPath(sentinelName));
}

/**
 * Load permissions configuration
 */
export function loadPermissions(): PermissionsConfig | null {
  return loadJsonFile<PermissionsConfig>(path.join(SENTINELS_ROOT, 'permissions.json'));
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate a sentinel manifest has required fields
 */
export function validateManifest(manifest: SentinelManifest): string[] {
  const errors: string[] = [];
  
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!(field in manifest) || !manifest[field as keyof SentinelManifest]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  if (manifest.temperament) {
    if (manifest.temperament.rationality < 0 || manifest.temperament.rationality > 1) {
      errors.push('Temperament rationality must be between 0 and 1');
    }
    if (manifest.temperament.empathy < 0 || manifest.temperament.empathy > 1) {
      errors.push('Temperament empathy must be between 0 and 1');
    }
  }
  
  return errors;
}

/**
 * Validate permissions configuration
 */
export function validatePermissions(permissions: PermissionsConfig): string[] {
  const errors: string[] = [];
  
  if (permissions.version < 1) {
    errors.push('Invalid permissions version');
  }
  
  if (!permissions.consensus?.mii_threshold || permissions.consensus.mii_threshold < MII_THRESHOLD) {
    errors.push(`MII threshold must be at least ${MII_THRESHOLD}`);
  }
  
  for (const [sentinel, perm] of Object.entries(permissions.permissions)) {
    if (!perm.capabilities || perm.capabilities.length === 0) {
      errors.push(`Sentinel ${sentinel} has no capabilities defined`);
    }
    if (!perm.domains || perm.domains.length === 0) {
      errors.push(`Sentinel ${sentinel} has no domains defined`);
    }
    if (perm.veto_authority && (!perm.veto_scope || perm.veto_scope.length === 0)) {
      errors.push(`Sentinel ${sentinel} has veto authority but no veto scope defined`);
    }
  }
  
  return errors;
}

// ============================================================================
// Mock Utilities
// ============================================================================

/**
 * Create a mock sentinel manifest
 */
export function createMockManifest(overrides: Partial<SentinelManifest> = {}): SentinelManifest {
  return {
    agent: 'MOCK_AGENT',
    role: 'Test Agent',
    version: '1.0.0',
    status: 'active',
    temperament: {
      rationality: 0.90,
      empathy: 0.70,
      morale_anchor: 'Test anchor',
    },
    core_functions: ['test_function'],
    ...overrides,
  };
}

/**
 * Create a mock health response
 */
export function createMockHealth(overrides: Partial<SentinelHealth> = {}): SentinelHealth {
  return {
    agent: 'MOCK_AGENT',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    components: [
      { name: 'core', status: 'up', latency_ms: 10 },
    ],
    metrics: {
      deliberations_total: 100,
      success_rate: 0.95,
      avg_latency_ms: 150,
      gi_score: 0.96,
    },
    ...overrides,
  };
}

/**
 * Create a mock permission
 */
export function createMockPermission(overrides: Partial<Permission> = {}): Permission {
  return {
    role: 'Test Role',
    capabilities: ['test_capability'],
    veto_authority: false,
    domains: ['test'],
    ...overrides,
  };
}

// ============================================================================
// Assertion Utilities
// ============================================================================

/**
 * Assert that a value is within GI threshold
 */
export function assertGIThreshold(value: number, context: string = ''): void {
  if (value < GI_THRESHOLD) {
    throw new Error(`GI score ${value} below threshold ${GI_THRESHOLD}${context ? ` (${context})` : ''}`);
  }
}

/**
 * Assert that a value is within MII threshold
 */
export function assertMIIThreshold(value: number, context: string = ''): void {
  if (value < MII_THRESHOLD) {
    throw new Error(`MII score ${value} below threshold ${MII_THRESHOLD}${context ? ` (${context})` : ''}`);
  }
}

// ============================================================================
// Discovery Utilities
// ============================================================================

/**
 * Discover all sentinels with manifest.json files
 */
export function discoverSentinels(): string[] {
  const sentinels: string[] = [];
  
  for (const sentinel of KNOWN_SENTINELS) {
    if (fileExists(getManifestPath(sentinel))) {
      sentinels.push(sentinel);
    }
  }
  
  return sentinels;
}

/**
 * Discover all sentinels with CODEX.md files
 */
export function discoverCodexes(): string[] {
  const sentinels: string[] = [];
  
  for (const sentinel of KNOWN_SENTINELS) {
    if (fileExists(getCodexPath(sentinel))) {
      sentinels.push(sentinel);
    }
  }
  
  return sentinels;
}

/**
 * Get all sentinels that are missing CODEX files
 */
export function getMissingCodexes(): string[] {
  const withManifest = discoverSentinels();
  const withCodex = discoverCodexes();
  
  return withManifest.filter(s => !withCodex.includes(s));
}
