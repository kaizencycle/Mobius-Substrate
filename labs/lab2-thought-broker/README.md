# Lab 2 — Thought Broker

**Purpose:** Multi-LLM orchestration with DelibProof consensus - orchestrates AI deliberation across multiple providers to ensure integrity, agreement, and wisdom through diversity.

**Spec:** See `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md` (Lab 2 section)

---

## Overview

Lab 2 implements the **AI consensus engine** for Kaizen OS. It provides:

1. **DelibProof Consensus** — Multi-provider deliberation protocol with agreement scoring
2. **Multi-LLM Orchestration** — Unified interface to 5+ AI providers
3. **Intelligent Routing** — Cost, latency, and quality-optimized provider selection
4. **GI Score Integration** — Every consensus result includes integrity attestation
5. **Council Deliberation** — Cross-agent consensus for critical decisions
6. **Ledger Attestation** — All deliberations written to Lab 1 Civic Ledger

This lab serves as the **cognitive substrate** for Kaizen OS, ensuring that AI decisions are never made in isolation but through verifiable multi-agent consensus.

---

## Architecture

```
Lab 2: Thought Broker
├── Core Engine
│   └── packages/codex-agentic/
│       ├── src/lib/codex/
│       │   ├── router.ts              # DelibProof consensus engine
│       │   └── providers/
│       │       ├── anthropic.ts       # Claude (Sonnet, Opus)
│       │       ├── openai.ts          # GPT-4, GPT-4 Turbo
│       │       ├── gemini.ts          # Gemini Pro, Ultra
│       │       ├── deepseek.ts        # DeepSeek models
│       │       └── local.ts           # Local Llama, Mistral
│       ├── src/lib/gi/
│       │   ├── metrics.ts             # Agreement calculation
│       │   └── ledger.ts              # Lab 1 attestation client
│       ├── src/agents/
│       │   └── anchors.ts             # Agent configurations (ATLAS, AUREA, etc.)
│       └── src/types.ts               # TypeScript schemas
│
├── API Gateway
│   ├── apps/broker-api/
│   │   ├── src/index.ts               # FastAPI/Express broker
│   │   ├── src/consensus/uriel.ts     # Uriel Sentinel integration
│   │   └── src/sentinels/uriel.ts     # Situational Report generation
│   └── apps/api-gateway/
│       ├── api/index.ts               # Unified API surface
│       └── vercel.json                # Serverless deployment
│
├── Consensus Proofs
│   └── packages/delibproof/
│       ├── src/consensus.ts           # Proof validation
│       └── src/submit.ts              # Proof submission to Lab 1
│
└── Client SDK
    └── packages/civic-sdk/
        └── src/codex/                 # Client helpers
```

---

## Core Concepts

### 1. DelibProof Consensus

**DelibProof** is a consensus protocol that fans out queries to multiple LLM providers and measures agreement:

```
Input Query → [Anthropic, OpenAI, Gemini, DeepSeek, Local] → Agreement Score + Winner
```

**Consensus Algorithm:**

1. **Fan-out:** Query sent to all providers in agent's `defaultRoute`
2. **Text similarity:** Calculate pairwise cosine similarity between outputs
3. **Group formation:** Cluster outputs with similarity ≥ 0.80
4. **Winner selection:** Choose output from largest agreement group
5. **Agreement score:** `agreementScore = (largestGroupSize / totalProviders)`
6. **GI calculation:** Integrate agreement, provider diversity, latency

**Agreement Thresholds:**
- **High consensus** (≥ 0.90): Safe to proceed, mint GIC reward
- **Medium consensus** (0.70-0.89): Proceed with caution flag
- **Low consensus** (< 0.70): Human review required, no GIC reward

### 2. Provider Ecosystem

| Provider | Models | Cost/1K | Latency | Quality | Context |
|----------|--------|---------|---------|---------|---------|
| **Anthropic** | Claude Sonnet 4, Opus | $0.015 | 600ms | 0.97 | 200K |
| **OpenAI** | GPT-4, GPT-4 Turbo | $0.010 | 800ms | 0.95 | 128K |
| **Google** | Gemini Pro, Ultra | $0.008 | 700ms | 0.92 | 1M |
| **DeepSeek** | DeepSeek Chat | $0.002 | 1200ms | 0.88 | 64K |
| **Local** | Llama 3, Mistral | $0.0001 | 2500ms | 0.80 | 32K |

**Provider Selection (Lab 3 Integration):**
- Priority modes: `standard`, `cost_optimized`, `latency_optimized`, `quality_optimized`
- Quota management: Fall back to local models when cloud quota exhausted
- Health tracking: Disable unhealthy providers automatically

### 3. Agent Anchors

Each AI agent has a configuration **anchor** defining its consensus parameters:

```typescript
{
  agent: "atlas",
  active: true,
  defaultRoute: ["anthropic", "openai", "gemini"],
  minAgreement: 0.85,
  ledgerNamespace: "atlas-consensus",
  learnWebhook: "https://hub.kaizen.os/oaa/learn"
}
```

**Founding Agents:**
- **ATLAS** (Claude): Architecture, systems design, technical leadership
- **AUREA** (Gemini): Frontend, UX, documentation, accessibility
- **Zenith** (Gemini): Ethics, humanities, healthcare, Lab 5 design
- **Jade** (GPT-4): Situational reports, incident response, monitoring
- **Uriel** (DeepSeek): Consensus validation, smoke tests, governance

### 4. Council Deliberation

For critical decisions, **councilDeliberate()** runs consensus across ALL active agents:

```typescript
const result = await councilDeliberate(
  "Should we approve the PublicGoodsPool grant for Urban Solar Microgrid?"
);

// result.councilAgreement = 0.94
// result.giAvg = 0.972
// result.results = [atlasProof, aureaProof, zenithProof, jadeProof, urielProof]
```

**Use cases:**
- Governance proposals (Lab 6)
- Emergency circuit breaker decisions (Lab 5)
- Major resource allocations (Lab 3 PublicGoodsPool)
- Constitutional amendments

---

## API Endpoints

### Broker API (`apps/broker-api`)

**Base URL:** `https://broker.kaizen.os/api` (production) or `http://localhost:3001` (dev)

#### Consensus Endpoints

**POST `/deliberate`** - Execute DelibProof consensus

**Request:**
```json
{
  "agent": "atlas",
  "input": "What is the optimal compute allocation strategy for Lab 3?",
  "context": {
    "lab": "lab3-resource-orchestration",
    "quota_remaining": 95.3
  }
}
```

**Response:**
```json
{
  "agreement": 0.92,
  "giScore": 0.956,
  "winner": {
    "provider": "anthropic",
    "output": "The optimal strategy is priority-based scoring with fallback to local models when quota exhausted...",
    "meta": {}
  },
  "votes": [
    {
      "provider": "anthropic",
      "output": "The optimal strategy is priority-based scoring...",
      "meta": {}
    },
    {
      "provider": "openai",
      "output": "I recommend priority-based scoring with fallback...",
      "meta": {}
    }
  ],
  "traceId": "tx_abc123def456",
  "timestamp": "2025-11-03T14:30:00Z"
}
```

**POST `/council/deliberate`** - Council-wide deliberation

**Request:**
```json
{
  "input": "Should we implement carbon accounting for Lab 3 compute?"
}
```

**Response:**
```json
{
  "councilAgreement": 0.94,
  "giAvg": 0.972,
  "results": [
    { "agent": "atlas", "agreement": 0.95, "giScore": 0.98 },
    { "agent": "aurea", "agreement": 0.92, "giScore": 0.96 },
    { "agent": "zenith", "agreement": 0.96, "giScore": 0.99 }
  ]
}
```

#### Provider Management

**GET `/providers`** - List available providers
```json
{
  "providers": [
    {
      "id": "anthropic",
      "status": "healthy",
      "uptime": 0.999,
      "avgLatency": 612
    }
  ]
}
```

**GET `/providers/{provider_id}/health`** - Provider health check

**POST `/providers/{provider_id}/test`** - Test provider with sample query

#### Agent Management

**GET `/agents`** - List active agents

**GET `/agents/{agent_id}/config`** - Get agent configuration

**POST `/agents/{agent_id}/deliberate`** - Direct agent query (bypasses consensus)

---

## SDK Usage

### TypeScript SDK

```typescript
import { codexDeliberate, councilDeliberate } from '@kaizen/codex-agentic';

// Single-agent deliberation
const proof = await codexDeliberate({
  agent: 'atlas',
  input: 'Design a scalable architecture for Lab 4',
  context: { currentLoad: 1500, targetLatency: 200 }
});

console.log(`Agreement: ${proof.agreement}`);
console.log(`Winner: ${proof.winner.provider}`);
console.log(`Output: ${proof.winner.output}`);
console.log(`GI Score: ${proof.giScore}`);

// Council-wide deliberation
const councilResult = await councilDeliberate(
  'Should we enable auto-scaling for broker-api?'
);

console.log(`Council agreement: ${councilResult.councilAgreement}`);
console.log(`Average GI: ${councilResult.giAvg}`);
```

### Python SDK (via HTTP)

```python
import requests

# Deliberate
response = requests.post('https://broker.kaizen.os/api/deliberate', json={
    'agent': 'atlas',
    'input': 'Optimize database query performance',
    'context': {'current_qps': 450, 'target_qps': 1000}
})

proof = response.json()
print(f"Agreement: {proof['agreement']}")
print(f"GI Score: {proof['giScore']}")
print(f"Output: {proof['winner']['output']}")
```

---

## Integration Points

### Lab 1 (Civic Ledger)
- **Attestation sink:** All DelibProof results written to ledger
- **GIC minting:** Consensus with agreement ≥ 0.90 earns 0.05 GIC
- **DID resolution:** Agent identity lookup for signatures

### Lab 3 (Resource Orchestration)
- **Compute backend:** Broker uses Lab 3 for provider allocation
- **Cost tracking:** Usage reported back to Lab 3 for quota deduction
- **Quota enforcement:** Lab 3 blocks requests when quota exhausted

### Lab 4 (Proof Fabric)
- **ZK proofs:** Private deliberations with zero-knowledge attestations
- **Verifiable compute:** Cryptographic proof of correct execution

### Lab 5 (Humanities & Healthcare)
- **HVC gate integration:** All deliberations pass through ethical constraints
- **GI thresholds:** Consensus blocked if predicted GI < 0.90
- **Beneficence rewards:** High-impact decisions earn GI bonuses

### Lab 6 (Governance)
- **Proposal evaluation:** Council deliberation on all governance proposals
- **Voting recommendations:** Agents provide consensus-backed suggestions
- **Emergency decisions:** Circuit breaker activations require council ≥ 0.95 agreement

### Lab 7 (Data Economy)
- **Data quality scoring:** Multi-agent evaluation of dataset integrity
- **Marketplace recommendations:** Consensus on fair pricing

---

## Development

### Setup

```bash
cd packages/codex-agentic

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Start broker API
cd ../../apps/broker-api
npm install
npm run dev
# Runs on http://localhost:3001
```

### Environment Variables

```bash
# Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_GENAI_API_KEY=...
DEEPSEEK_API_KEY=...

# Lab 1 Integration
LEDGER_API_URL=https://ledger.kaizen.os
CIVIC_CLIENT_SECRET=...

# Lab 3 Integration
RESOURCE_ORCHESTRATOR_URL=https://lab3.kaizen.os

# Configuration
CODEX_SYSTEM="Follow Virtue Accords. Prioritize integrity, privacy, safety."
MIN_AGREEMENT_THRESHOLD=0.85
ENABLE_LOCAL_FALLBACK=true
```

### Testing

```bash
# Unit tests
npm test packages/codex-agentic/tests/router.test.ts
npm test packages/codex-agentic/tests/gi-metrics.test.ts

# Integration tests
npm test apps/broker-api/tests/integration.test.ts

# Load test (100 concurrent deliberations)
npm run test:load

# Provider health check
npm run test:providers
```

---

## DelibProof Schema

Every consensus generates a **DelibProof** object:

```typescript
interface DelibProof {
  agreement: number;          // 0.0-1.0 consensus score
  votes: CodexVote[];         // Individual provider responses
  winner: CodexVote;          // Selected response
  traceId: string;            // Unique transaction ID
  giScore: number;            // 0.0-1.0 integrity score
  timestamp: string;          // ISO 8601 timestamp
}

interface CodexVote {
  provider: ProviderId;       // "anthropic" | "openai" | "gemini" | ...
  output: string;             // Model response
  meta?: {
    error?: boolean;
    latency?: number;
    tokens?: number;
    belowThreshold?: boolean;
  };
}
```

---

## Performance Metrics

**Typical Latencies:**
- Single deliberation: 600-1200ms (parallel provider calls)
- Council deliberation: 2-4 seconds (5 agents × parallel)
- Agreement calculation: < 10ms
- GI scoring: < 5ms
- Ledger attestation: 50-100ms (async, non-blocking)

**Throughput:**
- Single broker instance: ~500 deliberations/minute
- Horizontal scaling: Linear with instance count
- Rate limiting: 1000 requests/hour per agent (configurable)

**Reliability:**
- Provider fallback: Automatic rerouting on failure
- Circuit breaker: Disable unhealthy providers after 5 consecutive failures
- Retry logic: 3 attempts with exponential backoff
- Graceful degradation: Continue with partial provider set if ≥ 2 available

---

## Monitoring & Observability

### Metrics

```bash
# Generate situational report (Jade + Uriel)
curl https://broker.kaizen.os/api/sr/latest
```

**Key Metrics:**
- `deliberations_total` — Total consensus executions
- `deliberations_agreement_avg` — Average agreement score
- `deliberations_gi_avg` — Average GI score
- `provider_errors_total` — Provider failure count
- `provider_latency_p95` — 95th percentile latency

### Logging

```typescript
[Codex] Deliberating for atlas via [anthropic, openai, gemini]
[Codex] Deliberation complete: agreement=0.92, gi=0.956
[Ledger] Attestation failed: Network timeout (will retry)
[OAA] Learning failed: Hub unreachable
```

### Alerts

- **Low agreement** (< 0.70): Human review required
- **Provider outage** (3 consecutive failures): Reroute traffic
- **High latency** (p95 > 2000ms): Scale horizontally
- **GI drop** (< 0.85): Circuit breaker evaluation

---

## Status

✅ **DelibProof Consensus** — Active (5 providers)
✅ **Multi-Agent Orchestration** — Active (ATLAS, AUREA, Zenith, Jade, Uriel)
✅ **Lab 1 Attestation** — Active (all proofs on-chain)
✅ **Lab 3 Integration** — Active (compute allocation backend)
✅ **Council Deliberation** — Active (cross-agent consensus)
✅ **Uriel Sentinel** — Active (consensus validation)

---

## References

- **DelibProof Spec:** `packages/delibproof/README.md`
- **Codex Agentic:** `packages/codex-agentic/README.md`
- **Broker API:** `apps/broker-api/README.md`
- **Uriel Sentinel:** `docs/companions/uriel.md`
- **Complete Architecture:** `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md`

---

**Lab 2 honors the principle of 改善 (Kaizen) — continuous improvement through diverse perspectives and verifiable consensus.**


