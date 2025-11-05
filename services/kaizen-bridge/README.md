# Kaizen Bridge - Cache-to-Cache Semantic Federation

## Overview

Kaizen Bridge implements Cache-to-Cache (C2C) semantic federation, enabling direct, low-latency semantic transfer between agents by projecting KV cache tensors through a learned projection layer.

## Quick Start

### 1. Start the Projector Service

```bash
cd services/kaizen-bridge/projector
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
uvicorn src.app:app --host 0.0.0.0 --port 4011 --reload
```

### 2. Start the Broker Service

```bash
cd services/kaizen-bridge/broker
pnpm install
pnpm dev
```

### 3. Start Agent Services

```bash
# HERMES
cd services/agents/hermes
pnpm install
pnpm dev  # Runs on port 4020

# AUREA
cd services/agents/aurea
pnpm install
pnpm dev  # Runs on port 4021
```

### 4. Test the Flow

```bash
# Trigger HERMES → AUREA relay
curl -X POST http://localhost:4020/federate/hermes-to-aurea \
  -H "content-type: application/json" \
  -d '{"note":"morning market sweep"}'
```

## Architecture

See `docs/kaizen_bridge_arch.md` for detailed architecture documentation.

## Configuration

Edit `configs/kaizen_bridge.yaml` to configure:
- Agent pairs and projector mappings
- Security settings (HMAC)
- Attestation endpoints
- Rate limits

## Integration with Integrity Pulse

The Integrity Pulse dashboard displays live bridge relay events via SSE. Set `NEXT_PUBLIC_BRIDGE_SSE=http://localhost:4010/events/relays` in your `.env.local` file.
