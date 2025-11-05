export type AgentId = "AUREA"|"HERMES"|"EVE"|"JADE"|"ATLAS"|"ECHO";

export interface KVCachePacket {
  model: string;            // e.g. "gpt-4o", "claude-3-opus", "local-mistral"
  layer: number[];          // layers included
  dtype: "float16"|"float32";
  shape: number[];          // e.g. [layers, heads, seq, dim]
  bytes_b64: string;        // base64 of raw tensor buffer
  nonce: string;
  ts: string;               // ISO
}

export interface BridgeRequest {
  from: AgentId;
  to: AgentId;
  packet: KVCachePacket;
  context?: Record<string, unknown>;  // optional routing hints
}

export interface BridgeResponse {
  projected: KVCachePacket;
  attestationId?: string;
}
