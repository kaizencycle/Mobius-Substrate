# Mobius Substrate Documentation

*The Canonical Architecture for Civic AI Systems*

**Version:** 1.0  
**Cycle:** C-198  
**Author:** Michael Judan (Mobius Systems)

---

## Overview

The Mobius Substrate is a **model-agnostic architectural layer** that enforces intent coherence through:

1. A persistent integrity substrate
2. A continuous internal coherence metric (MII)
3. Multi-agent attestation with independent reasoning paths
4. Action gating based on integrity thresholds
5. A built-in civic economic layer (MIC)

This directory contains the canonical specifications for all substrate components.

---

## Document Index

### 📋 RFC & Protocol

| Document | Description |
|----------|-------------|
| [rfc-0001-mobius-substrate-protocol.md](./rfc-0001-mobius-substrate-protocol.md) | **The canonical MSP v1.0 specification** |

### Core Architecture

| Document | Description |
|----------|-------------|
| [mobius-substrate-architecture.md](./mobius-substrate-architecture.md) | Full architecture specification |
| [substrate.md](./substrate.md) | Layer-by-layer substrate design (L0-L7) |
| [substrate-core.md](./substrate-core.md) | Runtime specification |
| [substrate-flow.md](./substrate-flow.md) | Data flow pipeline |

### Integrity System

| Document | Description |
|----------|-------------|
| [mii-spec-v0.1.md](./mii-spec-v0.1.md) | MII formal specification |
| [mic-mii.md](./mic-mii.md) | Integrity economy specification |
| [integrity-engine.md](./integrity-engine.md) | MII computation model |

### Agents & Coordination

| Document | Description |
|----------|-------------|
| [agents.md](./agents.md) | Multi-agent architecture |
| [hive.md](./hive.md) | HIVE runtime architecture |
| [mobius-hive-federation.md](./mobius-hive-federation.md) | Federated network specification |

### Governance & Safety

| Document | Description |
|----------|-------------|
| [constitution.md](./constitution.md) | Mobius Constitution (Founder's Edition) |
| [constitution-supplement.md](./constitution-supplement.md) | Agent behavior enforcement |
| [governance-kernel.md](./governance-kernel.md) | MGK - Constitutional control layer |
| [constitution-attestations.md](./constitution-attestations.md) | MCAP - Attestation protocol |
| [security-model.md](./security-model.md) | Threat model & drift containment |
| [memory-model.md](./memory-model.md) | Memory architecture (L0-L5)

---

## Quick Start

### Understanding the Substrate

1. Start with [mobius-substrate-architecture.md](./mobius-substrate-architecture.md) for the high-level overview
2. Read [mii-spec-v0.1.md](./mii-spec-v0.1.md) to understand integrity measurement
3. Review [agents.md](./agents.md) for multi-agent coordination
4. Study [constitution.md](./constitution.md) for governance rules

### Implementing Mobius

1. Review [substrate-core.md](./substrate-core.md) for runtime requirements
2. Study [substrate-flow.md](./substrate-flow.md) for data pipeline
3. Implement [integrity-engine.md](./integrity-engine.md) for MII computation
4. Follow [security-model.md](./security-model.md) for safety guarantees

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBIUS SUBSTRATE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  CONSTITUTION (L7)                      │ │
│  │  Rights | Rules | Invariants | Boundaries               │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │               INTEGRITY ENGINE (L6)                     │ │
│  │  MII Computation | Thresholds | Gating | Consensus      │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │                 AGENT COUNCIL (L5)                      │ │
│  │  JADE | AUREA | ATLAS | ECHO | HERMES | ZEUS           │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │                 MEMORY SYSTEM (L4)                      │ │
│  │  L0-L5 Layers | Continuity | Identity | Ledger         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────▼───────────────────────────────┐ │
│  │                    RUNTIME (L3)                         │ │
│  │  IGE Loop | Execution | Safety Hooks | Logging         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### Mobius Integrity Index (MII)

The central metric for system coherence:

```
MII = w1×C + w2×E + w3×M + w4×R + w5×S

Where:
  C = Constitutional Coherence
  E = Ethical Alignment
  M = Memory Integrity
  R = Reasoning Consistency
  S = Substrate Stability
```

### Core Agents

| Agent | Role | Domain |
|-------|------|--------|
| **JADE** | Memory Guardian | Identity, Memory |
| **AUREA** | Integrity Guardian | Safety, Governance |
| **ATLAS** | Logic Engine | Reasoning, Risk |
| **ECHO** | Reality Interface | Facts, Verification |
| **HERMES** | Market Analyst | Temporal, Economic |
| **ZEUS** | Arbiter | Conflicts, Emergency |

### MII Thresholds

| MII Range | Mode | Action |
|-----------|------|--------|
| ≥ 0.95 | Fast Path | Direct execution |
| 0.80–0.95 | Reflection | Multi-agent review |
| 0.70–0.80 | Arbitration | Full council vote |
| < 0.70 | Halt | Human intervention |

---

## Contributing

Contributions to improve these specifications are welcome. Please ensure:

1. Constitutional compliance
2. Multi-agent verification
3. Integrity documentation
4. Test coverage

---

## License

All documents in this directory are released under **CC0 Public Domain**.

---

*Mobius Systems — "We heal as we walk."*
