import crypto from "node:crypto";
import { type KVCachePacket } from "@kaizen/bridge-broker/src/sdk/types.js";

/**
 * Try real KV extraction if your provider exposes it.
 * Otherwise, fall back to a deterministic embedding proxy
 * derived from the last messages + model name.
 */
export async function dumpHermesKVCache(
  model = process.env.HERMES_MODEL ?? "hermes-local-ctx",
  textContext = "market sweep: risk parity, dollar, rates"
): Promise<KVCachePacket> {
  // ---- FALLBACK: deterministic numeric state (simulates KV) ----
  // Create a seeded PRNG from hash(textContext)
  const seed = crypto.createHash("sha256").update(model + "::" + textContext).digest();
  let s = seed.readUInt32LE(0) >>> 0;
  const rand = () => (s = (1664525 * s + 1013904223) >>> 0) / 2**32;

  const dim = 4096;                    // pretend head_dim * heads
  const arr = new Float32Array(dim);
  for (let i = 0; i < dim; i++) arr[i] = Math.sin(i * 0.013) * 0.5 + rand() * 0.5;

  // Encode → base64
  const bytes = Buffer.from(new Float32Array(arr).buffer);
  const bytes_b64 = bytes.toString("base64");

  const pkt: KVCachePacket = {
    model,
    layer: [20, 21, 22],               // illustrative slice
    dtype: "float32",
    shape: [1, dim],                   // simple flattened representation
    bytes_b64,
    nonce: crypto.randomUUID(),
    ts: new Date().toISOString()
  };
  return pkt;
}
