# Kaizen Bridge Architecture

## Overview

Kaizen Bridge implements Cache-to-Cache (C2C) semantic federation, enabling direct, low-latency semantic transfer between agents (e.g., AUREA ↔ HERMES) by projecting one model's KV/hidden states into another's latent space.

## Why Cache-to-Cache?

Traditional multi-agent systems send text back and forth, requiring each model to:
- Decode → Interpret → Generate → Re-encode

This burns latency and loses nuance (the "semantic compression" problem).

C2C bypasses that by letting one model send its KV-Cache vectors — basically its live thought state — directly into another's network, with a projection layer to align meaning.

## Benefits

1. **Latency** — 2× speedup across federated agent loops
2. **Integrity Preservation** — no semantic loss during transfer
3. **Scalability** — allows direct cognitive mesh among agents without text bottlenecks

## Architecture

```
HERMES Agent → KV Extract → Broker → Projector → AUREA Agent
                ↓                                    ↓
            Ledger Attestation              State Buffer
```

### Components

1. **Broker** (`services/kaizen-bridge/broker/`)
   - Express.js service handling relay requests
   - Routes packets to appropriate projector
   - Handles HMAC signatures and attestation
   - Emits SSE events for dashboard visualization

2. **Projector** (`services/kaizen-bridge/projector/`)
   - Python FastAPI service
   - MLP-based projection models
   - Transforms KV cache tensors between agent pairs

3. **Agent Stubs** (`services/agents/{hermes,aurea}/`)
   - KV cache extraction (or simulation)
   - Bridge client integration
   - State buffer and blending

## Trust Model

- **Signed Relay**: HMAC signatures on broker requests
- **Ledger Attestations**: Each relay writes `{from,to,projector,input_hash,output_hash,ts}` to civic-ledger
- **GI Floors**: Enforce minimum GI scores (default: 0.95) for relay eligibility

## Phased Rollout

1. **Shadow Mode**: Relay + projection, target still generates text from projected state
2. **Hybrid**: Target blends projected state with its own cache
3. **Direct**: Target accepts projected vectors for downstream layers

## Security

- HMAC authentication on broker endpoints
- Payload size & rate limits
- No raw user data; only numerical tensors encoded in base64
- Ledger attestation for audit trail

## Future Enhancements

1. Extractor plugins for each provider (OpenAI, Anthropic, local) to standardize KVCachePacket
2. Learned alignment (train the MLP on parallel traces; add checkpoint save/load)
3. GRPC path for lower overhead; optional quantization (int8) to cut bandwidth
4. Privacy mode: on-device projection for sensitive agents (no network hop)
5. GI-aware routing: deny relay if GI < floor or pair not whitelisted
