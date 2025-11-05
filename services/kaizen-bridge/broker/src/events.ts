// lightweight SSE hub for relay notifications
import type { Request, Response } from "express";

export type RelayEvt = {
  id: string;              // attestation/nonce
  from: string;            // e.g., HERMES
  to: string;              // e.g., AUREA
  projector: string;       // e.g., kv-projector:v1
  ts: string;              // ISO
  size_bytes: number;      // payload size
  lambda?: number;         // optional blend λ applied downstream
  gi?: number;             // optional GI at time of relay
};

const clients: Response[] = [];

export function sseEndpoint(req: Request, res: Response) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  res.write("\n");
  clients.push(res);
  req.on("close", () => {
    const i = clients.indexOf(res);
    if (i >= 0) clients.splice(i, 1);
  });
}

export function publishRelay(evt: RelayEvt) {
  const line = `data: ${JSON.stringify(evt)}\n\n`;
  for (const c of clients) c.write(line);
}
