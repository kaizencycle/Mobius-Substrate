import fetch from "node-fetch";
import crypto from "node:crypto";
import { BridgeRequest, BridgeResponse } from "./types.js";

export class KaizenBridgeClient {
  constructor(private baseURL: string, private hmacKey?: string) {}

  private sign(payload: string) {
    if (!this.hmacKey) return {};
    const sig = crypto.createHmac("sha256", this.hmacKey).update(payload).digest("hex");
    return { "X-KAIZEN-SIG": sig };
  }

  async transmit(req: BridgeRequest): Promise<BridgeResponse> {
    const body = JSON.stringify(req);
    const res = await fetch(`${this.baseURL}/relay`, {
      method: "POST",
      headers: { "content-type": "application/json", ...this.sign(body) },
      body
    });
    if (!res.ok) throw new Error(`Bridge relay failed ${res.status}`);
    return await res.json() as BridgeResponse;
  }
}
