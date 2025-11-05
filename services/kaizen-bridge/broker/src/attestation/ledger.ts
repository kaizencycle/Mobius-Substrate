import fetch from "node-fetch";
import { BridgeAttestation } from "./schema.js";

export async function attestToLedger(endpoint: string, a: BridgeAttestation): Promise<string|undefined> {
  try {
    const res = await fetch(endpoint, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(a) });
    if (!res.ok) return undefined;
    const j = await res.json();
    return j.id ?? undefined;
  } catch { return undefined; }
}
