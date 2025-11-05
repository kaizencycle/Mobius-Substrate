import type { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { attestToLedger } from "../attestation/ledger.js";
import { publishRelay } from "../events.js";

const relaySchema = z.object({
  from: z.string(), to: z.string(),
  packet: z.object({
    model: z.string(),
    layer: z.array(z.number()),
    dtype: z.enum(["float16","float32"]),
    shape: z.array(z.number()),
    bytes_b64: z.string(),
    nonce: z.string(),
    ts: z.string()
  }),
  context: z.record(z.any()).optional()
});

export function makeRelayRoute(cfg:any) {
  return async (req: Request, res: Response) => {
    const parsed = relaySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "bad payload" });

    // optional HMAC
    if (cfg.security?.require_hmac) {
      const key = process.env[cfg.security.key_env];
      const sig = req.header(cfg.security.hmac_header);
      const computed = crypto.createHmac("sha256", key).update(JSON.stringify(req.body)).digest("hex");
      if (sig !== computed) return res.status(401).json({ error: "bad signature" });
    }

    // route to projector
    const pair = (cfg.pairs || []).find((p:any)=> p.from===req.body.from && p.to===req.body.to);
    if (!pair) return res.status(404).json({ error: "no projector mapping" });

    const pjRes = await fetch(`http://localhost:${cfg.listen.projector_port}/project`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ projector: pair.projector, packet: req.body.packet })
    });

    if (!pjRes.ok) return res.status(502).json({ error: "projector failed" });
    const out = await pjRes.json();

    // ledger attestation
    let attId: string | undefined;
    if (cfg.attestation?.enabled) {
      const hashIn  = crypto.createHash("sha256").update(req.body.packet.bytes_b64).digest("hex");
      const hashOut = crypto.createHash("sha256").update(out.projected.bytes_b64).digest("hex");
      attId = await attestToLedger(cfg.attestation.endpoint, {
        id: crypto.randomUUID(),
        from: req.body.from,
        to: req.body.to,
        projector: pair.projector,
        input_hash: hashIn,
        output_hash: hashOut,
        ts: new Date().toISOString(),
        gi_floor: 0.95
      });
    }

    // publish SSE event
    publishRelay({
      id: attId ?? req.body.packet.nonce,
      from: req.body.from,
      to: req.body.to,
      projector: pair.projector,
      ts: new Date().toISOString(),
      size_bytes: Buffer.from(req.body.packet.bytes_b64, "base64").length
    });

    res.json({ projected: out.projected, attestationId: attId });
  };
}
