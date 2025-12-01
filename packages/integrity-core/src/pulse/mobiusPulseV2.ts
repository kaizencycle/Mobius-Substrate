/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║ Mobius Pulse v2.0                                                 ║
 * ║ TypeScript types and Zod schemas for Sentinel-ready repo pulses  ║
 * ║                                                                   ║
 * ║ This version includes GI/MII scores and integrity metrics       ║
 * ║                                                                   ║
 * ║ Usage:                                                           ║
 * ║   import { MobiusPulseSchema, type MobiusPulse } from '...';     ║
 * ║   const result = MobiusPulseSchema.safeParse(pulseData);         ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import { z } from "zod";

export const MobiusPulseVersion = z.literal("1.0");

export const MobiusPulseCommitSchema = z.object({
  sha: z.string().min(7),
  author: z.string(),
  message: z.string(),
});

export const MobiusPulseTreeSchema = z.object({
  apps: z.array(z.string()).default([]),
  packages: z.array(z.string()).default([]),
  workflows: z.array(z.string()).default([]),
});

export const MobiusPulseLanguagesSchema = z.record(
  z.string(), // language name
  z.number().min(0).max(1) // proportion of LOC
);

export const MobiusPulseStatsSchema = z.object({
  totalFiles: z.number().int().nonnegative(),
  totalLines: z.number().int().nonnegative(),
  languages: MobiusPulseLanguagesSchema,
});

export const MobiusPulseMicTestnetSchema = z.object({
  totalMinted: z.number().int().nonnegative().default(0),
  totalBurned: z.number().int().nonnegative().default(0),
});

export const MobiusPulseIntegritySchema = z.object({
  giScore: z.number().min(0).max(1),
  miiScore: z.number().min(0).max(1),
  micTestnet: MobiusPulseMicTestnetSchema.optional(),
});

export const MobiusPulseSentinelStatusSchema = z.object({
  status: z.enum(["online", "offline", "unknown"]).default("unknown"),
  lastReview: z.string().datetime().optional(),
});

export const MobiusPulseSentinelsSchema = z.record(
  z.string(), // sentinel name (atlas, aurea, echo, etc.)
  MobiusPulseSentinelStatusSchema
);

export const MobiusPulseSchema = z.object({
  id: z.string().optional(), // optional UUID/hash assigned at ingest
  version: MobiusPulseVersion,
  generatedAt: z.string().datetime(),
  cycle: z.string().min(1),
  branch: z.string().min(1),

  commit: MobiusPulseCommitSchema,
  tree: MobiusPulseTreeSchema,
  stats: MobiusPulseStatsSchema,
  integrity: MobiusPulseIntegritySchema,
  sentinels: MobiusPulseSentinelsSchema.optional(),

  notes: z.string().optional(),
});

export type MobiusPulse = z.infer<typeof MobiusPulseSchema>;

export const parseMobiusPulse = (data: unknown): MobiusPulse =>
  MobiusPulseSchema.parse(data);

/**
 * Summary type for dashboard API responses
 */
export const MobiusPulseSummarySchema = MobiusPulseSchema.pick({
  id: true,
  generatedAt: true,
  cycle: true,
  stats: true,
  integrity: true,
}).extend({
  appsCount: z.number().int().nonnegative(),
  packagesCount: z.number().int().nonnegative(),
  workflowsCount: z.number().int().nonnegative(),
});

export type MobiusPulseSummary = z.infer<typeof MobiusPulseSummarySchema>;
