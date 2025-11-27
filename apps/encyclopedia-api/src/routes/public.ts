import { Request, Response, Router } from "express";
import { EncyclopediaRepo } from "../db/encyclopediaRepo";
import { ListEntriesQuery } from "../types";
import { parseNumberParam, parseTopicsParam } from "../utils/validation";

export function createPublicRouter(repo: EncyclopediaRepo): Router {
  const router = Router();

  // GET /v1/encyclopedia
  router.get("/v1/encyclopedia", async (req: Request, res: Response) => {
    try {
      const { q, topics, status, limit, offset } = req.query;

      const query: ListEntriesQuery = {
        q: typeof q === "string" ? q : undefined,
        topics: parseTopicsParam(topics),
        status:
          typeof status === "string"
            ? (status as ListEntriesQuery["status"])
            : undefined,
        limit:
          limit !== undefined
            ? parseNumberParam(limit, 20, { min: 1, max: 100 })
            : undefined,
        offset:
          offset !== undefined
            ? parseNumberParam(offset, 0, { min: 0 })
            : undefined,
      };

      // default: only approved entries
      if (!query.status) {
        query.status = "approved";
      }

      const result = await repo.listPublic(query);

      res.json({
        items: result.items,
        total: result.total,
        nextOffset: result.nextOffset,
      });
    } catch (err) {
      console.error("[PUBLIC] /v1/encyclopedia error", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  // GET /v1/encyclopedia/:id
  router.get("/v1/encyclopedia/:id", async (req: Request, res: Response) => {
    try {
      const entry = await repo.getById(req.params.id);
      if (!entry || entry.status !== "approved") {
        return res.status(404).json({ error: "not_found" });
      }
      res.json(entry);
    } catch (err) {
      console.error("[PUBLIC] /v1/encyclopedia/:id error", err);
      res.status(500).json({ error: "internal_error" });
    }
  });

  return router;
}
