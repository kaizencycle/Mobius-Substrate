// Cycle Index API Routes
// Implements cycle attestation endpoints for MCP v1.0

import express, { Request, Response } from 'express';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const CycleAttestationSchema = z.object({
  cycle: z.string().regex(/^C-[0-9]+$/),
  timestamp: z.string().datetime(),
  author: z.string().min(1),
  pr_hash: z.string().regex(/^[a-f0-9]{40}$/),
  sentinel_signatures: z.array(z.enum(['ATLAS', 'AUREA', 'ECHO'])).length(3),
  gi_score: z.number().min(0.95).max(1.0),
  echo_score: z.number().min(0.95).max(1.0),
  intent: z.string().min(10),
  changes: z.array(z.object({
    file: z.string(),
    type: z.enum(['added', 'modified', 'deleted']),
    lines_added: z.number().int().optional(),
    lines_removed: z.number().int().optional(),
  })).optional(),
  attestation_hash: z.string().regex(/^sha256-[a-f0-9]{64}$/),
  mii_impact: z.object({
    before: z.number(),
    after: z.number(),
    delta: z.number(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

// In-memory store (replace with database in production)
const cycleAttestations: Array<z.infer<typeof CycleAttestationSchema> & { id: number; created_at: string }> = [];

/**
 * GET /cycles
 * List all cycle attestations
 */
router.get('/cycles', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, author, min_gi_score } = req.query;

    let filtered = [...cycleAttestations];

    // Filter by author if provided
    if (author) {
      filtered = filtered.filter(c => c.author === author);
    }

    // Filter by minimum GI score if provided
    if (min_gi_score) {
      const minScore = parseFloat(min_gi_score as string);
      filtered = filtered.filter(c => c.gi_score >= minScore);
    }

    // Sort by cycle number (descending)
    filtered.sort((a, b) => {
      const aNum = parseInt(a.cycle.replace('C-', ''));
      const bNum = parseInt(b.cycle.replace('C-', ''));
      return bNum - aNum;
    });

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      cycles: paginated.map(({ id, created_at, ...cycle }) => cycle),
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cycles',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cycles/:cycle
 * Get specific cycle attestation
 */
router.get('/cycles/:cycle', async (req: Request, res: Response) => {
  try {
    const { cycle } = req.params;

    if (!cycle.match(/^C-[0-9]+$/)) {
      return res.status(400).json({
        error: 'Invalid cycle format',
        message: 'Cycle must be in format C-XXX',
      });
    }

    const attestation = cycleAttestations.find(c => c.cycle === cycle);

    if (!attestation) {
      return res.status(404).json({
        error: 'Cycle not found',
        cycle,
      });
    }

    const { id, created_at, ...cycleData } = attestation;
    res.json(cycleData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch cycle',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /cycles/attest
 * Create new cycle attestation
 */
router.post('/cycles/attest', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = CycleAttestationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const attestation = validationResult.data;

    // Check for duplicate cycle
    const existing = cycleAttestations.find(c => c.cycle === attestation.cycle);
    if (existing) {
      return res.status(409).json({
        error: 'Cycle already attested',
        cycle: attestation.cycle,
        existing_hash: existing.attestation_hash,
      });
    }

    // Check for duplicate attestation hash
    const duplicateHash = cycleAttestations.find(
      c => c.attestation_hash === attestation.attestation_hash
    );
    if (duplicateHash) {
      return res.status(409).json({
        error: 'Attestation hash already exists',
        attestation_hash: attestation.attestation_hash,
      });
    }

    // Create ledger entry
    const ledgerEntry = {
      id: cycleAttestations.length + 1,
      ...attestation,
      created_at: new Date().toISOString(),
    };

    cycleAttestations.push(ledgerEntry);

    res.status(201).json({
      success: true,
      attestation_hash: attestation.attestation_hash,
      ledger_entry_id: ledgerEntry.id,
      cycle: attestation.cycle,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create attestation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /cycles/stats
 * Get cycle statistics
 */
router.get('/cycles/stats', async (req: Request, res: Response) => {
  try {
    if (cycleAttestations.length === 0) {
      return res.json({
        total_cycles: 0,
        average_gi_score: 0,
        average_echo_score: 0,
        highest_gi_score: 0,
        highest_echo_score: 0,
        authors: [],
      });
    }

    const giScores = cycleAttestations.map(c => c.gi_score);
    const echoScores = cycleAttestations.map(c => c.echo_score);
    const authors = [...new Set(cycleAttestations.map(c => c.author))];

    const avgGI = giScores.reduce((a, b) => a + b, 0) / giScores.length;
    const avgECHO = echoScores.reduce((a, b) => a + b, 0) / echoScores.length;
    const maxGI = Math.max(...giScores);
    const maxECHO = Math.max(...echoScores);

    res.json({
      total_cycles: cycleAttestations.length,
      average_gi_score: parseFloat(avgGI.toFixed(3)),
      average_echo_score: parseFloat(avgECHO.toFixed(3)),
      highest_gi_score: maxGI,
      highest_echo_score: maxECHO,
      authors: authors.sort(),
      latest_cycle: cycleAttestations[cycleAttestations.length - 1]?.cycle,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
