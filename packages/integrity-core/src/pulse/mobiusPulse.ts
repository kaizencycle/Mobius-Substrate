/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║ Mobius Pulse v1.0                                                 ║
 * ║ TypeScript types and Zod schemas for Sentinel-ready repo pulses  ║
 * ║                                                                   ║
 * ║ Mirrors output from: scripts/mobius_pulse_json.sh                ║
 * ║                                                                   ║
 * ║ Usage:                                                           ║
 * ║   import { MobiusPulseSchema, type MobiusPulse } from '...';     ║
 * ║   const result = MobiusPulseSchema.safeParse(pulseData);         ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────
// Repository Information
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseRepoSchema = z.object({
  /** Absolute path to repository root */
  root: z.string(),
  /** Repository name (basename of root) */
  name: z.string().optional(),
  /** Current HEAD commit hash */
  head: z.string(),
  /** Current branch name */
  branch: z.string().optional(),
  /** Git remote URL (origin) */
  remoteUrl: z.string().optional(),
  /** Total number of tracked files */
  trackedFiles: z.number(),
  /** Number of branches (local + remote) */
  branchesCount: z.number(),
  /** Number of packages in monorepo */
  packagesCount: z.number().optional(),
  /** Number of apps in monorepo */
  appsCount: z.number().optional(),
  /** Latest git tag */
  latestTag: z.string().optional(),
  /** Total number of tags */
  tagsCount: z.number().optional(),
});

export type MobiusPulseRepo = z.infer<typeof MobiusPulseRepoSchema>;

// ─────────────────────────────────────────────────────────────────────
// Pulse Metadata
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseMetaSchema = z.object({
  /** ISO 8601 timestamp when pulse was generated */
  timestamp: z.string().datetime().or(z.string()),
  /** Hint for which sentinels should process this pulse */
  sentinelHint: z.string().optional(),
  /** Mobius cycle label (e.g., "C-150") */
  cycleLabel: z.string().nullable().optional(),
  /** Estimated MII score for current state */
  miiEstimate: z.string().nullable().optional(),
  /** Source of the pulse: "manual", "nightly", "pr", etc. */
  sourceTag: z.string().optional(),
});

export type MobiusPulseMeta = z.infer<typeof MobiusPulseMetaSchema>;

// ─────────────────────────────────────────────────────────────────────
// Git Information
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseCommitSchema = z.object({
  /** Full commit hash */
  hash: z.string().optional(),
  /** Short commit hash */
  short: z.string().optional(),
  /** Commit date (ISO format) */
  date: z.string().optional(),
  /** Commit subject/message */
  subject: z.any().optional(),
});

export type MobiusPulseCommit = z.infer<typeof MobiusPulseCommitSchema>;

export const MobiusPulseGitSchema = z.object({
  /** Current HEAD commit hash */
  head: z.string(),
  /** Current branch name */
  branch: z.string().optional(),
  /** Array of recent commits (usually last 10) */
  recentCommits: z.array(MobiusPulseCommitSchema).default([]),
  /** Files changed in last commit */
  changedFiles: z.array(z.string()).default([]),
  /** Files currently staged but not committed */
  stagedFiles: z.array(z.string()).default([]),
});

export type MobiusPulseGit = z.infer<typeof MobiusPulseGitSchema>;

// ─────────────────────────────────────────────────────────────────────
// Repository Structure
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseStructureSchema = z.object({
  /** Directory tree visualization (string or parsed object) */
  dirTree: z.any(),
  /** List of GitHub workflow names */
  workflows: z.array(z.string()).default([]),
  /** List of sentinel configuration files */
  sentinelFiles: z.array(z.string()).default([]),
});

export type MobiusPulseStructure = z.infer<typeof MobiusPulseStructureSchema>;

// ─────────────────────────────────────────────────────────────────────
// Build Graph
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseBuildGraphSchema = z.object({
  /** Turborepo dry-run output (string or parsed object) */
  turboDryRun: z.any(),
});

export type MobiusPulseBuildGraph = z.infer<typeof MobiusPulseBuildGraphSchema>;

// ─────────────────────────────────────────────────────────────────────
// Complete Pulse Schema
// ─────────────────────────────────────────────────────────────────────

export const MobiusPulseSchema = z.object({
  /** Pulse format version */
  pulseVersion: z.string().default("1.0"),
  /** Repository information */
  repo: MobiusPulseRepoSchema,
  /** Pulse metadata */
  meta: MobiusPulseMetaSchema,
  /** Git state information */
  git: MobiusPulseGitSchema,
  /** Repository structure */
  structure: MobiusPulseStructureSchema,
  /** Build graph from Turborepo */
  buildGraph: MobiusPulseBuildGraphSchema,
});

export type MobiusPulse = z.infer<typeof MobiusPulseSchema>;

// ─────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────

/**
 * Validate a pulse object against the schema
 */
export function validatePulse(data: unknown): {
  success: boolean;
  data?: MobiusPulse;
  error?: z.ZodError;
} {
  const result = MobiusPulseSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Extract a summary from a pulse for quick inspection
 */
export function extractPulseSummary(pulse: MobiusPulse): {
  head: string;
  branch: string;
  timestamp: string;
  cycleLabel: string | null;
  miiEstimate: string | null;
  changedFilesCount: number;
  recentCommitsCount: number;
  workflowsCount: number;
} {
  return {
    head: pulse.repo.head.substring(0, 8),
    branch: pulse.repo.branch ?? pulse.git.branch ?? "unknown",
    timestamp: pulse.meta.timestamp,
    cycleLabel: pulse.meta.cycleLabel ?? null,
    miiEstimate: pulse.meta.miiEstimate ?? null,
    changedFilesCount: pulse.git.changedFiles.length,
    recentCommitsCount: pulse.git.recentCommits.length,
    workflowsCount: pulse.structure.workflows.length,
  };
}

/**
 * Sentinel hint parser - returns array of sentinel names
 */
export function parseSentinelHint(hint: string | undefined): string[] {
  if (!hint) return [];
  return hint.split("|").map((s) => s.trim()).filter(Boolean);
}

/**
 * Check if a pulse is stale (older than specified hours)
 */
export function isPulseStale(pulse: MobiusPulse, maxAgeHours: number = 24): boolean {
  const pulseTime = new Date(pulse.meta.timestamp).getTime();
  const now = Date.now();
  const ageMs = now - pulseTime;
  const ageHours = ageMs / (1000 * 60 * 60);
  return ageHours > maxAgeHours;
}
