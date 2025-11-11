# Thought Broker API

**Version**: 0.1.0  
**Status**: MVP Complete ✅  
**Port**: 4005 (REST) | 4006 (WebSocket)

> *"The Broker is not a service. The Broker is where the system thinks."*  
> — ATLAS, C-131

---

## Overview

The **Thought Broker** is the deliberation and consensus engine of Mobius Systems. It orchestrates multi-agent deliberation loops, synthesizes positions, calculates Mobius Integrity Index (MII) scores, and generates cryptographic DeliberationProof artifacts.

### Key Capabilities

- ✅ **Multi-Agent Deliberation**: Coordinate ATLAS, AUREA, HERMES, EVE, JADE, ZEUS
- ✅ **Bounded Consensus Protocol**: Iterative rounds with convergence calculation
- ✅ **MII Grading**: Evaluate integrity impact across 5 dimensions
- ✅ **DeliberationProof**: Cryptographic attestations with Merkle roots
- ✅ **Real-time Updates**: WebSocket streaming of deliberation events
- ✅ **RESTful API**: Complete async deliberation management

---

## Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=4005
WS_PORT=4006
NODE_ENV=development

# AI Provider Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# MII Configuration
MII_THRESHOLD=0.95
```

---

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## API Reference

### 1. Health Check

```http
GET /healthz
```

**Response:**

```json
{
  "status": "healthy",
  "service": "thought-broker-api",
  "version": "0.1.0",
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

---

### 2. Initiate Deliberation

```http
POST /v1/deliberate
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "Should we implement feature X?",
  "context": {
    "feature": "real-time collaboration",
    "impact": "high"
  },
  "requester": "michael@kaizen.os",
  "priority": "high",
  "requiredSentinels": ["ATLAS", "AUREA"],
  "maxRounds": 5,
  "consensusThreshold": 0.75
}
```

**Response (202 Accepted):**

```json
{
  "success": true,
  "data": {
    "deliberationId": "abc123xyz"
  },
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

---

### 3. Get Deliberation Status

```http
GET /v1/deliberation/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "status": "CONSENSUS_REACHED",
    "request": { ... },
    "rounds": [ ... ],
    "consensus": { ... },
    "miiScore": 0.89,
    "deliberationProof": { ... },
    "createdAt": "2025-11-11T10:00:00.000Z",
    "completedAt": "2025-11-11T10:00:10.000Z"
  },
  "timestamp": "2025-11-11T10:05:00.000Z"
}
```

---

### 4. Grade MII Only

```http
POST /v1/grade
Content-Type: application/json
```

**Request Body:**

```json
{
  "action": "Deploy new feature",
  "context": {
    "feature": "real-time sync"
  },
  "proposedBy": "engineering-team"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "score": 0.87,
    "passed": false,
    "threshold": 0.95,
    "breakdown": {
      "transparency": 0.85,
      "accountability": 0.90,
      "safety": 0.95,
      "equity": 0.80,
      "sustainability": 0.85
    },
    "reasoning": "MII Assessment: 87.0% (Threshold: 95%)...",
    "warnings": [
      "Equity concerns - evaluate impact distribution"
    ]
  },
  "timestamp": "2025-11-11T10:00:00.000Z"
}
```

---

## WebSocket Events

Connect to `ws://localhost:4006` to receive real-time updates.

### Event Types

```typescript
enum WSEventType {
  DELIBERATION_STARTED = 'deliberation:started',
  ROUND_COMPLETED = 'round:completed',
  SENTINEL_RESPONDED = 'sentinel:responded',
  CONSENSUS_REACHED = 'consensus:reached',
  CONSENSUS_FAILED = 'consensus:failed',
  MII_GRADED = 'mii:graded',
  DELIBERATION_COMPLETED = 'deliberation:completed',
  ERROR = 'error'
}
```

---

## Testing

### Manual Test

```bash
# Start server
npm run dev

# In another terminal:
curl -X POST http://localhost:4005/v1/deliberate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test deliberation",
    "requester": "test-user",
    "priority": "medium"
  }'

# Get result
curl http://localhost:4005/v1/deliberation/[RETURNED_ID]
```

---

## Integration with Mobius Systems

### Ledger Attestation

When deliberation completes successfully, attest to Mobius Ledger:

```typescript
await fetch('http://localhost:4001/attest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event: 'deliberation_completed',
    agent: 'thought-broker',
    data: {
      deliberationId,
      consensus: session.consensus,
      miiScore: session.miiScore,
      proof: session.deliberationProof
    }
  })
});
```

---

## License

CC0-1.0 Public Domain

---

**Built with integrity. Governed by consensus. Proven by mathematics.**

🔴 Thought Broker v0.1 — The Heart of Mobius Systems

