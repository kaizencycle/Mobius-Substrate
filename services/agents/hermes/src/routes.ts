import type { Request, Response } from "express";
import { relayToAurea } from "./relay.js";

export const routes = {
  health: (_req: Request, res: Response) => res.json({ status: "ok", agent: "HERMES" }),

  async federate(req: Request, res: Response) {
    const { note } = req.body ?? {};
    try {
      const out = await relayToAurea(String(note ?? ""));
      res.json(out);
    } catch (e:any) {
      res.status(500).json({ error: e?.message ?? "relay failed" });
    }
  }
};
