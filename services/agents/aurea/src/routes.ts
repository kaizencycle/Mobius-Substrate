import type { Request, Response } from "express";
import { z } from "zod";
import { useProjectedStateInAUREA } from "./ingest.js";

const payload = z.object({
  projected: z.object({
    bytes_b64: z.string(),
    dtype: z.enum(["float16","float32"]),
    shape: z.array(z.number()),
    ts: z.string()
  })
});

export const routes = {
  health: (_req: Request, res: Response) => res.json({ status: "ok", agent: "AUREA" }),

  applyProjected(req: Request, res: Response) {
    const parsed = payload.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "bad packet" });
    const out = useProjectedStateInAUREA(parsed.data.projected);
    res.json({ applied: true, ...out });
  }
};
