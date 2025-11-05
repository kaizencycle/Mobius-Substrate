import { KaizenBridgeClient } from "@kaizen/bridge-broker/src/sdk/client.js";
import { dumpHermesKVCache } from "./kv.js";
import type { BridgeResponse } from "@kaizen/bridge-broker/src/sdk/types.js";

const BRIDGE_URL = process.env.KAIZEN_BRIDGE_URL ?? "http://localhost:4010";
const HMAC = process.env.KAIZEN_HMAC_KEY;

export async function relayToAurea(contextNote?: string): Promise<BridgeResponse> {
  const client = new KaizenBridgeClient(BRIDGE_URL, HMAC);
  const packet = await dumpHermesKVCache(
    process.env.HERMES_MODEL,
    contextNote ?? "default: HERMES semantic sweep"
  );
  return await client.transmit({
    from: "HERMES",
    to: "AUREA",
    packet,
    context: { note: contextNote ?? "" }
  });
}
