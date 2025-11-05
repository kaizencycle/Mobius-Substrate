# Kaizen Bridge — Broker

Cache-to-cache semantic federation broker service.

## Quick Start

1. Install dependencies:
```bash
pnpm --filter @kaizen/bridge-broker install
```

2. Set environment variables (if HMAC enabled):
```bash
export KAIZEN_HMAC_KEY="your-secret-key"
```

3. Ensure projector service is running on port 4011 (or configured port).

4. Start broker:
```bash
pnpm --filter @kaizen/bridge-broker dev
```

## Usage

### Example: Relay from HERMES to AUREA

```typescript
import { KaizenBridgeClient } from "@kaizen/bridge-broker/src/sdk/client.js";

const client = new KaizenBridgeClient(
  "http://localhost:4010",
  process.env.KAIZEN_HMAC_KEY
);

const response = await client.transmit({
  from: "HERMES",
  to: "AUREA",
  packet: {
    model: "hermes-local-ctx",
    layer: [20, 21, 22],
    dtype: "float32",
    shape: [1, 4096],
    bytes_b64: "...", // base64 encoded tensor
    nonce: crypto.randomUUID(),
    ts: new Date().toISOString()
  }
});
```

## Endpoints

- `GET /health` - Health check
- `GET /events/relays` - SSE stream for relay events
- `POST /relay` - Relay a KV cache packet through projector

## Configuration

See `configs/kaizen_bridge.yaml` for broker configuration.
