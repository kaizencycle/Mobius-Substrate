/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║ Mobius Pulse API Routes v2 (C-151)                               ║
 * ║ Sentinel-ready repository heartbeat ingestion endpoint           ║
 * ║                                                                   ║
 * ║ Endpoints:                                                       ║
 * ║   POST /v1/pulse/ingest   - Accept and store a pulse            ║
 * ║   GET  /v1/pulse/latest   - Get the most recent pulse           ║
 * ║   GET  /v1/pulse/:id      - Get a specific pulse by ID          ║
 * ║   GET  /v1/pulse/history  - List recent pulses                  ║
 * ║   GET  /v1/pulse/badge    - Get badge JSON (Shields.io)         ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import express, { Request, Response, Router } from "express";
import crypto from "crypto";
import {
  MobiusPulseSchema,
  MobiusPulseSummarySchema,
  type MobiusPulse,
} from "@civic/integrity-core/src/pulse/mobiusPulseV2";

// ─────────────────────────────────────────────────────────────────────
// In-Memory Store (replace with database in production)
// ─────────────────────────────────────────────────────────────────────

interface StoredPulse {
  id: string;
  hash: string;
  generatedAt: string;
  cycle: string;
  branch: string;
  commitSha: string;
  commitAuthor: string;
  commitMessage: string;
  giScore: number;
  miiScore: number;
  totalFiles: number;
  totalLines: number;
  appsCount: number;
  packagesCount: number;
  workflowsCount: number;
  rawJson: MobiusPulse;
  createdAt: string;
}

const pulseStore: StoredPulse[] = [];
let pulseIdCounter = 1;

function generatePulseId(): string {
  return `pulse_${Date.now()}_${pulseIdCounter++}`;
}

function computeHash(pulse: MobiusPulse): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(pulse))
    .digest("hex");
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

    // Compute hash
    const hash = computeHash(pulse);

    // Check for duplicate
    const existing = pulseStore.find((p) => p.hash === hash);
    if (existing) {
      res.status(200).json({
        status: "ok",
        message: "Pulse already exists",
        pulseId: existing.id,
        hash: existing.hash,
      });
      return;
    }

    // Derive counts
    const appsCount = pulse.tree.apps.length;
    const packagesCount = pulse.tree.packages.length;
    const workflowsCount = pulse.tree.workflows.length;

    // Create stored pulse entry
    const storedPulse: StoredPulse = {
      id: generatePulseId(),
      hash,
      generatedAt: pulse.generatedAt,
      cycle: pulse.cycle,
      branch: pulse.branch,
      commitSha: pulse.commit.sha,
      commitAuthor: pulse.commit.author,
      commitMessage: pulse.commit.message,
      giScore: pulse.integrity.giScore,
      miiScore: pulse.integrity.miiScore,
      totalFiles: pulse.stats.totalFiles,
      totalLines: pulse.stats.totalLines,
      appsCount,
      packagesCount,
      workflowsCount,
      rawJson: pulse,
      createdAt: new Date().toISOString(),
    };

    pulseStore.push(storedPulse);

    // Keep only last 1000 pulses in memory
    if (pulseStore.length > 1000) {
      pulseStore.shift();
    }

    console.log(`[mobius-pulse] Ingested pulse ${storedPulse.id} (cycle ${storedPulse.cycle})`);

    res.status(201).json({
      status: "ok",
      message: "Pulse ingested successfully",
      id: storedPulse.id,
      hash: storedPulse.hash,
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
router.get("/v1/pulse/latest", async (req: Request, res: Response): Promise<void> => {
  try {
    const { cycle, includeRaw } = req.query;

    const where = cycle
      ? (p: StoredPulse) => p.cycle === String(cycle)
      : () => true;

    const filtered = pulseStore.filter(where);
    if (filtered.length === 0) {
      res.status(404).json({
        error: "NO_PULSE_FOUND",
        message: cycle
          ? `No Mobius pulse found for cycle '${cycle}'`
          : "No Mobius pulses have been ingested yet.",
      });
      return;
    }

    const latest = filtered[filtered.length - 1];

    const summary = MobiusPulseSummarySchema.parse({
      ...latest.rawJson,
      appsCount: latest.appsCount,
      packagesCount: latest.packagesCount,
      workflowsCount: latest.workflowsCount,
    });

    const payload: any = {
      id: latest.id,
      hash: latest.hash,
      cycle: latest.cycle,
      branch: latest.branch,
      generatedAt: latest.generatedAt,
      giScore: latest.giScore,
      miiScore: latest.miiScore,
      stats: {
        totalFiles: latest.totalFiles,
        totalLines: latest.totalLines,
        appsCount: latest.appsCount,
        packagesCount: latest.packagesCount,
        workflowsCount: latest.workflowsCount,
      },
      summary,
    };

    if (includeRaw === "true") {
      payload.raw = latest.rawJson;
    }

    res.json(payload);
  } catch (err) {
    console.error("[mobius-pulse] Error fetching latest pulse:", err);
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to load latest Mobius pulse.",
    });
  }
});

/**
 * GET /v1/pulse/history
 * List recent pulses
 */
router.get("/v1/pulse/history", async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(
      Number(req.query.limit ?? 90) || 90,
      365
    );

    const data = [...pulseStore]
      .reverse()
      .slice(0, limit)
      .map((row) => ({
        id: row.id,
        cycle: row.cycle,
        branch: row.branch,
        giScore: row.giScore,
        miiScore: row.miiScore,
        hash: row.hash,
        stats: {
          totalFiles: row.totalFiles,
          totalLines: row.totalLines,
          appsCount: row.appsCount,
          packagesCount: row.packagesCount,
          workflowsCount: row.workflowsCount,
        },
        generatedAt: row.generatedAt,
      }));

    res.json({
      count: data.length,
      items: data,
    });
  } catch (err) {
    console.error("[pulseHistory] error:", err);
    res.status(500).json({ error: "Failed to load pulse history" });
  }
});

/**
 * GET /v1/pulse/badge
 * Get badge JSON (Shields.io compatible)
 */
router.get("/v1/pulse/badge", async (req: Request, res: Response): Promise<void> => {
  try {
    if (pulseStore.length === 0) {
      return res.json({
        schemaVersion: 1,
        label: "Mobius",
        message: "no data",
        color: "lightgrey",
      });
    }

    const latest = pulseStore[pulseStore.length - 1];
    const gi = latest.giScore;
    const mii = latest.miiScore;

    const giPct = (gi * 100).toFixed(1);
    const miiPct = (mii * 100).toFixed(1);

    let color = "red";
    if (gi >= 0.98 && mii >= 0.98) color = "brightgreen";
    else if (gi >= 0.95 && mii >= 0.95) color = "yellowgreen";
    else if (gi >= 0.9 && mii >= 0.9) color = "yellow";

    res.json({
      schemaVersion: 1,
      label: "Mobius GI/MII",
      message: `${giPct}% / ${miiPct}%`,
      color,
    });
  } catch (err) {
    console.error("[pulseBadge] error:", err);
    res.status(500).json({
      schemaVersion: 1,
      label: "Mobius",
      message: "error",
      color: "red",
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
      hash: pulse.hash,
      cycle: pulse.cycle,
      branch: pulse.branch,
      generatedAt: pulse.generatedAt,
      giScore: pulse.giScore,
      miiScore: pulse.miiScore,
      stats: {
        totalFiles: pulse.totalFiles,
        totalLines: pulse.totalLines,
        appsCount: pulse.appsCount,
        packagesCount: pulse.packagesCount,
        workflowsCount: pulse.workflowsCount,
      },
      raw: pulse.rawJson,
    });
  } catch (err) {
    console.error("[mobius-pulse] Error fetching pulse:", err);
    res.status(500).json({
      error: "Failed to fetch pulse",
    });
  }
});

export default router;
