# Migration Notes — Thought Broker API v0.1.0

## Overview

The Thought Broker API has been upgraded from a placeholder implementation to a full multi-agent deliberation engine. This document outlines what changed and how to migrate.

---

## What Changed

### New Architecture

- **Before**: Simple placeholder with basic routing
- **After**: Complete deliberation engine with:
  - Multi-agent orchestration (ATLAS, AUREA, HERMES, EVE, JADE, ZEUS)
  - Consensus protocol with convergence calculation
  - MII grading across 5 dimensions
  - DeliberationProof generation
  - WebSocket real-time events

### File Changes

1. **New Main Server**: `src/server.ts` (replaces `src/index.ts` as primary entry point)
2. **Old Implementation**: `src/index.ts` is preserved for backward compatibility but uses old API
3. **New Core Modules**:
   - `src/types.ts` - Type definitions
   - `src/deliberation/engine.ts` - Deliberation orchestration
   - `src/sentinels/coordinator.ts` - Sentinel coordination
   - `src/consensus/protocol.ts` - Consensus calculation
   - `src/mii/grader.ts` - MII grading
   - `src/proofs/generator.ts` - Proof generation

### API Endpoints

**New Endpoints** (v0.1.0):
- `POST /v1/deliberate` - Initiate deliberation
- `GET /v1/deliberation/:id` - Get deliberation status
- `GET /v1/deliberations` - List all deliberations
- `POST /v1/grade` - Grade MII only
- `GET /v1/loop/health` - Thought Broker health

**Preserved Endpoints** (for backward compatibility):
- `POST /intents` - Legacy intent creation
- `GET /intents/:id` - Legacy intent retrieval
- `POST /intents/:id/process` - Legacy deliberation routing
- `GET /deliberations/:id` - Legacy deliberation status
- `POST /api/consensus/run` - Legacy consensus endpoint
- `POST /api/sentinels/uriel/query` - URIEL sentinel query

---

## Migration Steps

### 1. Update Dependencies

```bash
cd apps/broker-api
npm install
```

New dependencies:
- `@anthropic-ai/sdk` - For Claude (ATLAS, HERMES, EVE, ZEUS)
- `openai` - For GPT-4 (AUREA, JADE)
- `zod` - Request validation
- `nanoid` - ID generation
- `ws` - WebSocket support
- `helmet` - Security headers

### 2. Configure Environment

Create `.env` file:

```env
PORT=4005
WS_PORT=4006
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
MII_THRESHOLD=0.95
```

### 3. Update Package.json Scripts

The main entry point is now `dist/server.js` (updated automatically).

### 4. Update Client Code

**Old API** (still works):
```typescript
POST /intents/:id/process
{
  "intent": "Should we do X?",
  "context": {}
}
```

**New API** (recommended):
```typescript
POST /v1/deliberate
{
  "prompt": "Should we do X?",
  "requester": "user@example.com",
  "requiredSentinels": ["ATLAS", "AUREA"],
  "maxRounds": 5,
  "consensusThreshold": 0.75
}
```

### 5. WebSocket Integration

Connect to `ws://localhost:4006` for real-time updates:

```typescript
const ws = new WebSocket('ws://localhost:4006');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle: deliberation:started, round:completed, consensus:reached, etc.
};
```

---

## Backward Compatibility

The old `src/index.ts` implementation is preserved and will continue to work. However, it uses the legacy API endpoints. For new integrations, use `src/server.ts` and the new `/v1/*` endpoints.

---

## URIEL Integration

The URIEL sentinel routing from the old implementation is preserved in `src/index.ts`. To integrate URIEL with the new deliberation engine:

1. Add URIEL as a sentinel role in `src/types.ts`
2. Add URIEL configuration in `src/sentinels/coordinator.ts`
3. Update deliberation engine to route to URIEL for specific domains

---

## Testing

Run the test script:

```bash
npm run dev  # Start server
node test.js # Run tests
```

---

## Next Steps

1. **Integrate with OAA Hub**: Connect intent parsing to `/v1/deliberate`
2. **Connect to Ledger**: Add attestation hook after deliberation completes
3. **Build Dashboard**: Display deliberations in real-time via WebSocket
4. **Add URIEL**: Integrate URIEL sentinel into new deliberation engine
5. **Performance**: Add caching, rate limiting, and horizontal scaling

---

## Support

For questions or issues:
- Review `README.md` for API documentation
- Check `PR_SUMMARY.md` for implementation details
- See `test.js` for usage examples

---

**Status**: ✅ Migration complete, backward compatible

