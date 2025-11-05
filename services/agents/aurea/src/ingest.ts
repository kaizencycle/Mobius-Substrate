import { projectedBuffer } from "./state_buffer.js";

/** Blend projected state with AUREA local context (proxy).
 * If KV hooks are unavailable, we convert the numeric vector
 * into a short-lived "semantic bias token" for the next inference.
 */
export function useProjectedStateInAUREA(projected: {
  bytes_b64: string; dtype: "float16"|"float32"; shape: number[]; ts: string;
}, lambda = Number(process.env.AUREA_BLEND_LAMBDA ?? "0.35")) {
  projectedBuffer.push(projected);

  // --- Proxy bias token generation ---
  // Compute a small hash-based token we can stuff into system hints.
  const hash = simpleHash(projected.bytes_b64).toString(36).slice(0, 10);
  const bias = `<<semantic-bridge bias=${hash} λ=${lambda.toFixed(2)}>>`;

  // In your real agent loop, attach this to the next prompt metadata or KV.
  return {
    biasToken: bias,
    appliedLambda: lambda,
    projectedTs: projected.ts,
    bufferSize: projectedBuffer.size()
  };
}

function simpleHash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
