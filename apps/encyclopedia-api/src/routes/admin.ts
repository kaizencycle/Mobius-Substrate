import { Request, Response, Router } from "express";
import { EncyclopediaRepo } from "../db/encyclopediaRepo";
import { EntryStatus, ReviewDecisionPayload } from "../types";
import { requireAdminAuth } from "../utils/auth";
import { parseNumberParam } from "../utils/validation";

interface AdminRouterOptions {
  adminToken?: string;
}

export function createAdminRouter(
  repo: EncyclopediaRepo,
  options: AdminRouterOptions = {}
): Router {
  const router = Router();

  // All admin routes behind auth
  router.use(
    requireAdminAuth({
      expectedToken: options.adminToken ?? process.env.ENCYCLOPEDIA_ADMIN_TOKEN,
    })
  );

  // GET /v1/encyclopedia/admin/review-queue
  router.get(
    "/v1/encyclopedia/admin/review-queue",
    async (req: Request, res: Response) => {
      try {
        const { limit, offset, status } = req.query;

        const desiredStatus: EntryStatus =
          typeof status === "string" && status !== ""
            ? (status as EntryStatus)
            : "pending_review";

        const limitNum = parseNumberParam(limit, 20, { min: 1, max: 100 });
        const offsetNum = parseNumberParam(offset, 0, { min: 0 });

        const result = await repo.listForReview(
          desiredStatus,
          limitNum,
          offsetNum
        );

        res.json({
          items: result.items,
          total: result.total,
          nextOffset: result.nextOffset,
        });
      } catch (err) {
        console.error("[ADMIN] review-queue error", err);
        res.status(500).json({ error: "internal_error" });
      }
    }
  );

  // GET /v1/encyclopedia/admin/entries/:id
  router.get(
    "/v1/encyclopedia/admin/entries/:id",
    async (req: Request, res: Response) => {
      try {
        const entry = await repo.getById(req.params.id);
        if (!entry) {
          return res.status(404).json({ error: "not_found" });
        }
        res.json(entry);
      } catch (err) {
        console.error("[ADMIN] get entry error", err);
        res.status(500).json({ error: "internal_error" });
      }
    }
  );

  // POST /v1/encyclopedia/admin/entries/:id/review
  router.post(
    "/v1/encyclopedia/admin/entries/:id/review",
    async (req: Request, res: Response) => {
      try {
        const entry = await repo.getById(req.params.id);
        if (!entry) {
          return res.status(404).json({ error: "not_found" });
        }

        const payload = req.body as ReviewDecisionPayload;
        if (!payload || !["approve", "reject"].includes(payload.decision)) {
          return res.status(400).json({ error: "invalid_decision" });
        }

        const reviewerId = (req as any).userId || "unknown_reviewer";
        const now = new Date().toISOString();

        const newStatus: EntryStatus =
          payload.decision === "approve" ? "approved" : "rejected";
        let ledgerTxId: string | null = null;

        // TODO: optional Civic Ledger attestation
        if (payload.attachLedger && payload.decision === "approve") {
          // ledgerTxId = await attestReviewToLedger({ entry, reviewerId, notes: payload.notes });
        }

        const updated = await repo.updateStatus(entry.id, newStatus, {
          reviewedBy: reviewerId,
          reviewedAt: now,
          reviewNotes: payload.notes,
          ledgerTxId,
        });

        res.json(updated);
      } catch (err) {
        console.error("[ADMIN] review entry error", err);
        res.status(500).json({ error: "internal_error" });
      }
    }
  );

  return router;
}
