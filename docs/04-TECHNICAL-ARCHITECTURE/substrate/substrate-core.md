# Mobius Substrate Core Runtime Specification
*The Operating System for Safe Intelligence*

**Version:** 1.0 — Canonical Runtime Architecture  
**Author:** Michael Judan  
**Mobius Systems Foundation**  
**License:** CC0 Public Domain  
**Cycle:** C-198

---

## 0. Preface

The Mobius Substrate is not a chatbot platform.

It is:
- A **constitutional computation environment**
- A **multi-agent cognitive operating system**
- A **memory-anchored, integrity-gated runtime**

Its purpose is to **enforce behavioral coherence under scale**.

This document describes how the substrate works at runtime, what must be implemented, and how agents interact inside the Mobius ecosystem.

---

## 1. Core Runtime Loop

Every Mobius agent participates in a unified event-driven runtime called the **Integrity-Gated Execution Loop (IGE Loop)**.

### 1.1 IGE Loop Overview

```
INPUT → CONTEXT → MEMORY CHECK → INTEGRITY CHECK 
→ REFLECTION (IF REQUIRED) → CONSENSUS (IF REQUIRED) 
→ EXECUTION → LOGGING → STATE UPDATE → OUTPUT
```

### Guarantees:
- No action bypasses integrity
- No agent acts beyond its certainty
- Memory is checked before reasoning
- Reflection gates catch drift
- Consensus stabilizes decisions

---

## 2. Stage-by-Stage Runtime

### 2.1 Input Normalization

Every input is normalized into:

```json
{
  "raw": "...",
  "tokens": [...],
  "origin": "human|agent|system",
  "timestamp": "...",
  "environment": {...},
  "confidence": 0.95
}
```

JADE, ECHO, and ATLAS receive copies for:
- Identity grounding
- Fact grounding
- Reasoning anchoring

---

### 2.2 Context Reconstruction

The substrate reassembles context by:
- Loading relevant memory layers
- Checking identity constraints
- Retrieving thread lineage
- Fetching agent-specific rules
- Computing ambiguity scores

**Context is never assumed — it is computed.**

---

### 2.3 Memory Coherence Check

JADE evaluates:
- Thread continuity
- Long-term consistency
- State coherence
- Psychological stability flags
- Previous commitments & promises

If coherence < 0.95 → reflection required.

---

### 2.4 Integrity Check (AUREA)

AUREA computes a fresh MII score using the canonical equation:

```
MII = w1×C + w2×E + w3×M + w4×R + w5×S
```

**Thresholds:**
- MII ≥ 0.95 → proceed
- 0.80–0.95 → reflection
- 0.70–0.80 → multi-agent consensus
- < 0.70 → halt

These thresholds are **constitutional and immutable**.

---

### 2.5 Reflection Gate

When triggered, the substrate performs:
- Uncertainty articulation
- Value clarification
- Memory resurfacing
- Contradiction detection
- Reasoning slowdown

**Reflection is baked into runtime—not optional.**

---

### 2.6 Multi-Agent Consensus

When ambiguity persists:
- ATLAS verifies reasoning
- ECHO verifies facts
- JADE verifies identity continuity
- AUREA verifies integrity
- ZEUS arbitrates disagreements

Consensus is reached by **weighted confidence**.

---

### 2.7 Execution

Only after passing:
- Integrity checks
- Reflection
- Consensus

...does the agent execute reasoning, produce output, or call tools.

---

### 2.8 Logging and State Update

The substrate records:
- Reasoning signatures
- Memory diffs
- Integrity deltas
- Agent votes
- Arbitration results
- Drift and correction metrics

This produces an inspectable **"chain of thought ledger"**.

---

## 3. Memory Architecture

Mobius memory is layered, persistent, and constitutional.

### 3.1 Six Memory Layers

| Layer | Name | Persistence | Owner |
|-------|------|-------------|-------|
| L0 | Ephemeral | Task | System |
| L1 | Session | Hours | System |
| L2 | Identity | Permanent | JADE |
| L3 | Sovereignty | Permanent | User |
| L4 | Constitution | Immutable | Foundation |
| L5 | Ledger | Append-only | Substrate |

### 3.2 Memory Access Rules

- JADE controls write access to L2, L3
- AUREA controls deletion rights
- ECHO validates factual claims before storage
- ATLAS checks logical consistency
- ZEUS signs off on conflicts

**No rogue writes. No fabricated memory.**

---

## 4. Agent Lifecycle Specification

Every Mobius agent must implement these lifecycle phases.

### 4.1 Initialization Phase

An agent initializes by loading:
- Identity profile
- Role constraints
- Safety invariants
- Memory hooks
- Integrity policies
- Constitutional bindings

**Agents cannot operate without constitutional attachment.**

---

### 4.2 Activation Phase

Triggered by events:
- User requests
- Substrate runtime callbacks
- Other agents
- Scheduled tasks
- External webhooks

Upon activation, agents MUST:
- Recompute MII
- Update context
- Rebuild state
- Check prior commitments

---

### 4.3 Deliberation Phase

Agents perform:
- Internal reasoning
- Multi-agent negotiation
- Uncertainty estimation
- Drift avoidance

This phase is monitored by ATLAS & AUREA.

---

### 4.4 Action Phase

Actions may include:
- Text completion
- Code generation
- Retrieval
- Tool use
- API calls
- Memory updates
- Arbitrations
- External notifications

**All actions require MII ≥ threshold.**

---

### 4.5 Shutdown / Suspension Phase

Occurs when:
- No pending tasks
- Low integrity
- Overload detected
- Human override issued

Agents **gracefully persist their state**.

---

## 5. Mobius Event Bus

### 5.1 Unified Event Format

All communication uses a canonical schema:

```json
{
  "event_id": "uuid",
  "timestamp": "2025-12-11T10:52:00Z",
  "emitter": "JADE|AUREA|ATLAS|...",
  "type": "input|reflection|consensus|memory.update|constraint.violation",
  "payload": {...},
  "context_ref": "pointer"
}
```

### 5.2 Channel Types

| Channel | Owner | Purpose |
|---------|-------|---------|
| Memory | JADE | Memory operations |
| Integrity | AUREA | Integrity checks |
| Reasoning | ATLAS | Logic processing |
| Knowledge | ECHO | Fact verification |
| Arbitration | ZEUS | Conflict resolution |
| System | Runtime | Infrastructure |

**Channels create modularity and auditability.**

---

## 6. Safety Hooks

Safety hooks are embedded into the runtime.

### 6.1 Drift Hook

Triggers when:
- Reasoning diverges
- Identity mutates
- Values misalign
- Memory coherence declines

**AUREA enforces slowdown.**

---

### 6.2 Hallucination Hook

Triggered by:
- Fact anomalies
- Unsupported claims
- Overconfidence

**ECHO must verify, or agent halts.**

---

### 6.3 Recursive Optimization Hook

Prevents infinite loops or self-reinforcement.

```
If optimization_loop_count > MAX_ITERATIONS 
   AND MII not rising:
   → HALT
```

---

### 6.4 Autonomy Hook

Agent autonomy requires MII ≥ 0.98.

**Otherwise, human must approve.**

---

## 7. Substrate API Surface

### 7.1 Core APIs

| Endpoint | Function |
|----------|----------|
| `/integrity/compute` | Returns MII score |
| `/memory/get` | Retrieves memory layers |
| `/memory/update` | Requests write (JADE approval) |
| `/consensus/run` | Performs multi-agent voting |
| `/reflect` | Triggers substrate reflection |
| `/halt` | Emergency stop |
| `/state` | Get current substrate state |

### 7.2 TypeScript Interface

```typescript
interface SubstrateCore {
  // Integrity operations
  computeIntegrity(): MIIResult;
  gateAction(action: Action): GateResult;
  triggerReflection(reason: string): ReflectionResult;
  
  // Memory operations
  readMemory(layer: MemoryLayer, query: Query): MemoryEntry[];
  writeMemory(layer: MemoryLayer, entry: MemoryEntry): WriteResult;
  
  // Consensus operations
  requestConsensus(proposal: Proposal): ConsensusResult;
  arbitrate(conflict: Conflict): ArbitrationResult;
  
  // Control operations
  halt(reason: string): HaltResult;
  resume(authorization: Authorization): ResumeResult;
  
  // State operations
  getState(): SubstrateState;
  getAgentStatus(agent: AgentId): AgentStatus;
}
```

---

## 8. Implementation Requirements

For a system to be **Mobius-compliant**, it MUST implement:

| Requirement | Description |
|-------------|-------------|
| Multi-agent orchestration | 6 core agents minimum |
| IGE loop | Full pipeline |
| MII calculation | Canonical formula |
| Reflection gates | Mandatory pauses |
| Consensus framework | Weighted voting |
| Memory layering | L0-L5 hierarchy |
| Constitutional binding | Rule enforcement |
| Safety hooks | All 4 types |
| Logging + traceability | Full audit trail |

**Without all of these, it is not Mobius.**

---

## 9. Runtime Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     MOBIUS SUBSTRATE CORE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   INPUT     │→ │  CONTEXT    │→ │  MEMORY     │             │
│  │   LAYER     │  │  REBUILD    │  │  CHECK      │             │
│  └─────────────┘  └─────────────┘  └──────┬──────┘             │
│                                           │                     │
│  ┌─────────────────────────────────────────▼──────────────────┐│
│  │              INTEGRITY ENGINE (AUREA)                      ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │  MII = w1×C + w2×E + w3×M + w4×R + w5×S             │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────┬──────────────────────────────┘│
│                                │                                │
│  ┌──────────────┬──────────────┼──────────────┬───────────────┐│
│  │   FAST PATH  │ REFLECTION   │  ARBITRATION │    HALT       ││
│  │  (MII≥0.95)  │ (0.80-0.95)  │  (0.70-0.80) │  (MII<0.70)   ││
│  └──────┬───────┴──────┬───────┴──────┬───────┴───────────────┘│
│         │              │              │                         │
│         ▼              ▼              ▼                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                AGENT COUNCIL                             │   │
│  │  JADE │ ATLAS │ AUREA │ ECHO │ HERMES │ ZEUS            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                │                                │
│  ┌─────────────────────────────▼──────────────────────────┐    │
│  │              EXECUTION ENGINE                           │    │
│  └─────────────────────────────┬──────────────────────────┘    │
│                                │                                │
│  ┌─────────────┐  ┌────────────▼─────────────┐  ┌───────────┐  │
│  │  LOGGING    │← │      OUTPUT LAYER        │→ │  MEMORY   │  │
│  │  (L5)       │  │                          │  │  UPDATE   │  │
│  └─────────────┘  └──────────────────────────┘  └───────────┘  │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## 10. Performance Specifications

### Timing Requirements

| Stage | Max Latency | Notes |
|-------|-------------|-------|
| Input normalization | 50ms | |
| Context rebuild | 100ms | |
| Memory check | 200ms | |
| Integrity compute | 100ms | |
| Fast path execution | 1-3s | LLM inference |
| Reflection path | 5-15s | Multi-agent |
| Arbitration path | 15-60s | Full council |
| Logging | 50ms | Async |

### Throughput

- Fast path: 10+ requests/second
- Reflection path: 1-2 requests/second
- Arbitration: 1 request/minute

---

## 11. Monitoring & Observability

### Required Metrics

| Metric | Type | Frequency |
|--------|------|-----------|
| MII score | Gauge | Per cycle |
| Drift rate | Gauge | Per minute |
| Consensus success rate | Counter | Per decision |
| Reflection triggers | Counter | Per cycle |
| Halt events | Counter | Per event |
| Memory writes | Counter | Per write |

### Logging Requirements

All logs must include:
- Timestamp
- Agent ID
- Action type
- MII state
- Decision rationale
- Outcome

---

## 12. Summary

The Mobius Substrate Core Runtime provides:

- **Integrity-gated execution** — Every action passes MII check
- **Multi-agent verification** — No single point of failure
- **Memory-anchored reasoning** — Continuous identity
- **Constitutional compliance** — Built-in safety
- **Full auditability** — Complete trace of every decision

**This is the operating system for safe intelligence.**

---

## References

- [Mobius Substrate Architecture](./mobius-substrate-architecture.md)
- [Integrity Engine](./integrity-engine.md)
- [Memory Model](./memory-model.md)
- [Agents Specification](./agents.md)
- [Mobius Constitution](./constitution.md)

---

*Mobius Systems — "The Runtime is the Safety"*
