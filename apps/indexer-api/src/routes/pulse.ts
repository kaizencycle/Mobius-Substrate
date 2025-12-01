/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║ Mobius Pulse API Routes                                          ║
 * ║ Sentinel-ready repository heartbeat ingestion endpoint           ║
 * ║                                                                   ║
 * ║ Endpoints:                                                       ║
 * ║   POST /v1/pulse/ingest   - Accept and store a pulse            ║
 * ║   GET  /v1/pulse/latest   - Get the most recent pulse           ║
 * ║   GET  /v1/pulse/:id      - Get a specific pulse by ID          ║
 * ║   GET  /v1/pulse/history  - List recent pulses                  ║
 * ║   GET  /v1/pulse/stats    - Get pulse statistics                ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import express, { Request, Response, Router } from "express";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────
// Pulse Schema (mirrors packages/integrity-core/src/pulse/mobiusPulse.ts)
// ─────────────────────────────────────────────────────────────────────

const MobiusPulseRepoSchema = z.object({
  root: z.string(),
  name: z.string().optional(),
  head: z.string(),
  branch: z.string().optional(),
  remoteUrl: z.string().optional(),
  trackedFiles: z.number(),
  branchesCount: z.number(),
  packagesCount: z.number().optional(),
  appsCount: z.number().optional(),
  latestTag: z.string().optional(),
  tagsCount: z.number().optional(),
});

const MobiusPulseMetaSchema = z.object({
  timestamp: z.string().datetime().or(z.string()),
  sentinelHint: z.string().optional(),
  cycleLabel: z.string().nullable().optional(),
  miiEstimate: z.string().nullable().optional(),
  sourceTag: z.string().optional(),
});

const MobiusPulseCommitSchema = z.object({
  hash: z.string().optional(),
  short: z.string().optional(),
  date: z.string().optional(),
  subject: z.any().optional(),
});

const MobiusPulseGitSchema = z.object({
  head: z.string(),
  branch: z.string().optional(),
  recentCommits: z.array(MobiusPulseCommitSchema).default([]),
  changedFiles: z.array(z.string()).default([]),
  stagedFiles: z.array(z.string()).default([]),
});

const MobiusPulseStructureSchema = z.object({
  dirTree: z.any(),
  workflows: z.array(z.string()).default([]),
  sentinelFiles: z.array(z.string()).default([]),
});

const MobiusPulseBuildGraphSchema = z.object({
  turboDryRun: z.any(),
});

const MobiusPulseSchema = z.object({
  pulseVersion: z.string().default("1.0"),
  repo: MobiusPulseRepoSchema,
  meta: MobiusPulseMetaSchema,
  git: MobiusPulseGitSchema,
  structure: MobiusPulseStructureSchema,
  buildGraph: MobiusPulseBuildGraphSchema,
});

type MobiusPulse = z.infer<typeof MobiusPulseSchema>;

// Query parameters for ingest
const IngestQueryParamsSchema = z.object({
  source: z.string().default("manual"),
});

// ─────────────────────────────────────────────────────────────────────
// In-Memory Store (replace with database in production)
// ─────────────────────────────────────────────────────────────────────

interface StoredPulse {
  id: string;
  receivedAt: string;
  cycleLabel: string | null;
  miiEstimate: number | null;
  headCommit: string;
  branchName: string | null;
  repoRoot: string;
  repoName: string;
  pulseVersion: string;
  sourceTag: string;
  trackedFilesCount: number;
  changedFilesCount: number;
  recentCommitsCount: number;
  workflowsCount: number;
  payload: MobiusPulse;
}

const pulseStore: StoredPulse[] = [];
let pulseIdCounter = 1;

function generatePulseId(): string {
  return `pulse_${Date.now()}_${pulseIdCounter++}`;
}

// ─────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────

const router: Router = express.Router();

/**
 * POST /v1/pulse/ingest
 * Accept and store a Mobius pulse
 */
router.post("/v1/pulse/ingest", async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const queryParse = IngestQueryParamsSchema.safeParse(req.query);
    if (!queryParse.success) {
      res.status(400).json({
        error: "Invalid query params",
        details: queryParse.error.format(),
      });
      return;
    }
    const { source } = queryParse.data;

    // Validate pulse payload
    const parsed = MobiusPulseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid Mobius pulse payload",
        details: parsed.error.format(),
      });
      return;
    }

    const pulse = parsed.data;

    // Sanity check
    if (!pulse.repo?.head) {
      res.status(400).json({
        error: "Missing repo.head in pulse",
      });
      return;
    }

    // Parse MII estimate
    const miiEstimate = pulse.meta.miiEstimate
      ? parseFloat(pulse.meta.miiEstimate)
      : null;

    // Create stored pulse entry
    const storedPulse: StoredPulse = {
      id: generatePulseId(),
      receivedAt: new Date().toISOString(),
      cycleLabel: pulse.meta.cycleLabel ?? null,
      miiEstimate: miiEstimate,
      headCommit: pulse.git?.head ?? pulse.repo.head,
      branchName: pulse.repo.branch ?? pulse.git.branch ?? null,
      repoRoot: pulse.repo.root,
      repoName: pulse.repo.name ?? "unknown",
      pulseVersion: pulse.pulseVersion ?? "1.0",
      sourceTag: source,
      trackedFilesCount: pulse.repo.trackedFiles,
      changedFilesCount: pulse.git.changedFiles.length,
      recentCommitsCount: pulse.git.recentCommits.length,
      workflowsCount: pulse.structure.workflows.length,
      payload: pulse,
    };

    pulseStore.push(storedPulse);

    // Keep only last 1000 pulses in memory
    if (pulseStore.length > 1000) {
      pulseStore.shift();
    }

    console.log(`[mobius-pulse] Ingested pulse ${storedPulse.id} from ${source}`);

    res.status(201).json({
      status: "ok",
      message: "Pulse ingested successfully",
      pulseId: storedPulse.id,
      head: storedPulse.headCommit.substring(0, 8),
      cycleLabel: storedPulse.cycleLabel,
      miiEstimate: storedPulse.miiEstimate,
      source: storedPulse.sourceTag,
      receivedAt: storedPulse.receivedAt,
    });
  } catch (err) {
    console.error("[mobius-pulse] Unexpected error during ingest:", err);
    res.status(500).json({
      error: "Internal error while ingesting pulse",
    });
  }
});

/**
 * GET /v1/pulse/latest
 * Get the most recent pulse
 */
router.get("/v1/pulse/latest", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (pulseStore.length === 0) {
      res.status(404).json({
        error: "No pulses found",
        message: "No pulses have been ingested yet",
      });
      return;
    }

    const latestPulse = pulseStore[pulseStore.length - 1];

    res.json({
      id: latestPulse.id,
      receivedAt: latestPulse.receivedAt,
      cycleLabel: latestPulse.cycleLabel,
      miiEstimate: latestPulse.miiEstimate,
      headCommit: latestPulse.headCommit,
      branchName: latestPulse.branchName,
      pulseVersion: latestPulse.pulseVersion,
      sourceTag: latestPulse.sourceTag,
      summary: {
        trackedFiles: latestPulse.trackedFilesCount,
        changedFiles: latestPulse.changedFilesCount,
        recentCommits: latestPulse.recentCommitsCount,
        workflows: latestPulse.workflowsCount,
      },
      payload: latestPulse.payload,
    });
  } catch (err) {
    console.error("[mobius-pulse] Error fetching latest pulse:", err);
    res.status(500).json({
      error: "Failed to fetch latest pulse",
    });
  }
});

/**
 * GET /v1/pulse/:id
 * Get a specific pulse by ID
 */
router.get("/v1/pulse/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pulse = pulseStore.find((p) => p.id === id);

    if (!pulse) {
      res.status(404).json({
        error: "Pulse not found",
        id,
      });
      return;
    }

    res.json({
      id: pulse.id,
      receivedAt: pulse.receivedAt,
      cycleLabel: pulse.cycleLabel,
      miiEstimate: pulse.miiEstimate,
      headCommit: pulse.headCommit,
      branchName: pulse.branchName,
      pulseVersion: pulse.pulseVersion,
      sourceTag: pulse.sourceTag,
      summary: {
        trackedFiles: pulse.trackedFilesCount,
        changedFiles: pulse.changedFilesCount,
        recentCommits: pulse.recentCommitsCount,
        workflows: pulse.workflowsCount,
      },
      payload: pulse.payload,
    });
  } catch (err) {
    console.error("[mobius-pulse] Error fetching pulse:", err);
    res.status(500).json({
      error: "Failed to fetch pulse",
    });
  }
});

/**
 * GET /v1/pulse/history
 * List recent pulses with pagination
 */
router.get("/v1/pulse/history", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const source = req.query.source as string | undefined;
    const cycle = req.query.cycle as string | undefined;

    let filtered = [...pulseStore].reverse(); // Most recent first

    // Filter by source if provided
    if (source) {
      filtered = filtered.filter((p) => p.sourceTag === source);
    }

    // Filter by cycle if provided
    if (cycle) {
      filtered = filtered.filter((p) => p.cycleLabel === cycle);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      pulses: paginated.map((p) => ({
        id: p.id,
        receivedAt: p.receivedAt,
        cycleLabel: p.cycleLabel,
        miiEstimate: p.miiEstimate,
        headCommit: p.headCommit.substring(0, 8),
        branchName: p.branchName,
        sourceTag: p.sourceTag,
        summary: {
          trackedFiles: p.trackedFilesCount,
          changedFiles: p.changedFilesCount,
          recentCommits: p.recentCommitsCount,
          workflows: p.workflowsCount,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err) {
    console.error("[mobius-pulse] Error fetching pulse history:", err);
    res.status(500).json({
      error: "Failed to fetch pulse history",
    });
  }
});

/**
 * GET /v1/pulse/stats
 * Get aggregate pulse statistics
 */
router.get("/v1/pulse/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    if (pulseStore.length === 0) {
      res.json({
        totalPulses: 0,
        latestCycle: null,
        averageMii: null,
        sourceBreakdown: {},
        cycleBreakdown: {},
      });
      return;
    }

    // Calculate statistics
    const miiValues = pulseStore
      .map((p) => p.miiEstimate)
      .filter((m): m is number => m !== null);

    const avgMii =
      miiValues.length > 0
        ? miiValues.reduce((a, b) => a + b, 0) / miiValues.length
        : null;

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {};
    pulseStore.forEach((p) => {
      sourceBreakdown[p.sourceTag] = (sourceBreakdown[p.sourceTag] || 0) + 1;
    });

    // Cycle breakdown (last 10 unique cycles)
    const cycleBreakdown: Record<string, number> = {};
    const uniqueCycles = new Set<string>();
    [...pulseStore].reverse().forEach((p) => {
      if (p.cycleLabel && !uniqueCycles.has(p.cycleLabel)) {
        uniqueCycles.add(p.cycleLabel);
        cycleBreakdown[p.cycleLabel] = 1;
      } else if (p.cycleLabel) {
        cycleBreakdown[p.cycleLabel]++;
      }
    });

    const latestPulse = pulseStore[pulseStore.length - 1];

    res.json({
      totalPulses: pulseStore.length,
      latestCycle: latestPulse.cycleLabel,
      latestHead: latestPulse.headCommit.substring(0, 8),
      latestReceivedAt: latestPulse.receivedAt,
      averageMii: avgMii !== null ? parseFloat(avgMii.toFixed(4)) : null,
      minMii: miiValues.length > 0 ? Math.min(...miiValues) : null,
      maxMii: miiValues.length > 0 ? Math.max(...miiValues) : null,
      sourceBreakdown,
      uniqueCycles: uniqueCycles.size,
      cycleBreakdown: Object.fromEntries(
        Object.entries(cycleBreakdown).slice(0, 10)
      ),
    });
  } catch (err) {
    console.error("[mobius-pulse] Error computing pulse stats:", err);
    res.status(500).json({
      error: "Failed to compute pulse statistics",
    });
  }
});

/**
 * GET /v1/pulse/by-commit/:commit
 * Find pulse(s) by commit hash
 */
router.get("/v1/pulse/by-commit/:commit", async (req: Request, res: Response): Promise<void> => {
  try {
    const { commit } = req.params;

    // Support both full and short commit hashes
    const matches = pulseStore.filter((p) =>
      p.headCommit.startsWith(commit) || p.headCommit === commit
    );

    if (matches.length === 0) {
      res.status(404).json({
        error: "No pulses found for commit",
        commit,
      });
      return;
    }

    res.json({
      commit,
      pulses: matches.map((p) => ({
        id: p.id,
        receivedAt: p.receivedAt,
        cycleLabel: p.cycleLabel,
        miiEstimate: p.miiEstimate,
        headCommit: p.headCommit,
        branchName: p.branchName,
        sourceTag: p.sourceTag,
      })),
    });
  } catch (err) {
    console.error("[mobius-pulse] Error finding pulse by commit:", err);
    res.status(500).json({
      error: "Failed to find pulse by commit",
    });
  }
});

export default router;
