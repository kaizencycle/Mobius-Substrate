export interface BridgeAttestation {
  id: string;
  from: string;
  to: string;
  projector: string;
  input_hash: string;       // SHA256(b64 bytes)
  output_hash: string;
  ts: string;
  gi_floor: number;         // read from civic-ledger if needed
}
