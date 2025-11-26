# DVA ↔ MEMT Integration Protocol

**Version:** 1.0.0  
**Last Updated:** November 2025

This document defines how the Distributed Virtual Agent (DVA) tiers integrate with the Mobius Multi-Engine Model Taxonomy (MEMT) for constitutional AI governance.

---

## Overview

DVA operates at four tiers, each with different resource requirements and governance needs. MEMT provides the intelligence routing layer that maps tasks to appropriate AI engines based on DVA tier requirements.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DVA ↔ MEMT ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│    │ DVA.LITE │    │ DVA.ONE  │    │ DVA.FULL │    │ DVA.HIVE │            │
│    │          │    │          │    │          │    │          │            │
│    │ OEI+MSI  │    │ ACI+ENI  │    │ All 5    │    │ All+     │            │
│    │          │    │          │    │ Engines  │    │ Consensus│            │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘            │
│         │               │               │               │                   │
│         └───────────────┴───────────────┴───────────────┘                   │
│                                   │                                          │
│                         ┌─────────▼─────────┐                               │
│                         │   MEMT ROUTER     │                               │
│                         │   (Thought Broker)│                               │
│                         └─────────┬─────────┘                               │
│                                   │                                          │
│         ┌───────────────┬─────────┴─────────┬───────────────┐               │
│         │               │                   │               │               │
│    ┌────▼────┐    ┌────▼────┐        ┌────▼────┐    ┌────▼────┐           │
│    │ ACI/GPT │    │ENI/Claude│       │SXI/Gemini│   │OEI/DeepSeek│          │
│    │ AUREA   │    │ ATLAS   │        │ HERMES  │    │ ZEUS    │           │
│    └─────────┘    └─────────┘        └─────────┘    └─────────┘           │
│                                                                              │
│                         ┌─────────────────────┐                             │
│                         │   MSI / ECHO Layer  │                             │
│                         │   (Memory Substrate)│                             │
│                         └─────────────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## DVA Tier Definitions

### DVA.LITE — Monitoring Tier

**Purpose:** Lightweight monitoring and high-fidelity memory for resource-constrained deployments.

| Attribute | Value |
|-----------|-------|
| **Engines Used** | OEI (DeepSeek) + MSI (ECHO) |
| **GI Threshold** | 0.90 |
| **Consensus Required** | No |
| **Human Review Trigger** | GI < 0.90 |
| **Use Cases** | IoT monitoring, edge computing, simple queries |

**Routing Rules:**
```typescript
if (dvaTier === 'LITE') {
  engines = [
    { engine: 'deepseek', role: 'PRIMARY' },
    { engine: 'echo', role: 'MEMORY' }
  ];
  giThreshold = 0.90;
  requireConsensus = false;
}
```

---

### DVA.ONE — Personal Agent Tier

**Purpose:** Personal AI agent with high-precision engineering capabilities.

| Attribute | Value |
|-----------|-------|
| **Engines Used** | ACI (GPT) + ENI (Claude) |
| **GI Threshold** | 0.93 |
| **Consensus Required** | For HIGH/CRITICAL risk only |
| **Human Review Trigger** | GI < 0.93 or CRITICAL risk |
| **Use Cases** | Personal assistant, code generation, planning |

**Routing Rules:**
```typescript
if (dvaTier === 'ONE') {
  engines = [
    { engine: 'openai', role: 'PRIMARY' },
    { engine: 'claude', role: 'VERIFIER' }
  ];
  giThreshold = 0.93;
  requireConsensus = risk === 'HIGH' || risk === 'CRITICAL';
}
```

---

### DVA.FULL — Multi-Agent Tier

**Purpose:** Full multi-engine orchestration for enterprise governance.

| Attribute | Value |
|-----------|-------|
| **Engines Used** | ACI + ENI + SXI + OEI + MSI (All engines) |
| **GI Threshold** | 0.95 |
| **Consensus Required** | Yes |
| **Human Review Trigger** | GI < 0.95 or HIGH/CRITICAL risk |
| **Use Cases** | Enterprise decisions, civic governance, multi-stakeholder |

**Routing Rules:**
```typescript
if (dvaTier === 'FULL') {
  engines = [
    { engine: 'claude', role: 'PRIMARY' },
    { engine: 'openai', role: 'VERIFIER' },
    { engine: 'antigravity', role: 'VERIFIER' },
    { engine: 'deepseek', role: 'OPTIMIZER' },
    { engine: 'echo', role: 'MEMORY' }
  ];
  giThreshold = 0.95;
  requireConsensus = true;
}
```

---

### DVA.HIVE — Global Civic Tier

**Purpose:** Planetary civic AI governance with cross-model global consensus.

| Attribute | Value |
|-----------|-------|
| **Engines Used** | All engines + Global consensus + Human oversight |
| **GI Threshold** | 0.98 |
| **Consensus Required** | Yes (all engines must agree) |
| **Human Review Trigger** | Always for CRITICAL decisions |
| **Use Cases** | Cross-jurisdiction governance, planetary decisions |

**Routing Rules:**
```typescript
if (dvaTier === 'HIVE') {
  engines = [
    { engine: 'claude', role: 'PRIMARY' },
    { engine: 'openai', role: 'VERIFIER' },
    { engine: 'antigravity', role: 'VERIFIER' },
    { engine: 'deepseek', role: 'VERIFIER' },
    { engine: 'echo', role: 'MEMORY' }
  ];
  giThreshold = 0.98;
  requireConsensus = true;
  requireHumanReview = risk === 'CRITICAL';
}
```

---

## Task Kind to DVA Tier Mapping

| Task Kind | Default DVA Tier | Can Override To |
|-----------|------------------|-----------------|
| GENERAL | ONE | LITE, FULL |
| ARCHITECTURE | ONE | FULL, HIVE |
| ENGINEERING | ONE | LITE, FULL |
| FRONTEND | ONE | LITE |
| MATH_OPTIMIZATION | LITE | ONE |
| MEMORY_RECALL | LITE | ONE |
| CIVIC_POLICY | FULL | HIVE |
| CRITICAL_DECISION | HIVE | (no override) |

---

## Consensus Rules by Tier

### DVA.LITE Consensus

```
No formal consensus required.
Single engine (OEI) makes decisions.
ECHO provides memory context only.
```

### DVA.ONE Consensus

```
Two-engine consensus:
- ACI provides architectural reasoning
- ENI verifies and validates

Consensus = (ACI_score * 0.50) + (ENI_score * 0.50)
Threshold = 0.93
```

### DVA.FULL Consensus

```
Multi-engine consensus:
- ENI as primary (0.35 weight)
- ACI as verifier (0.25 weight)
- SXI as verifier (0.15 weight)
- OEI as optimizer (0.15 weight)
- MSI provides context (0.10 weight)

Consensus = Σ(engine_score * weight)
Threshold = 0.95
Disagreement penalty = -0.05 per major disagreement
```

### DVA.HIVE Consensus

```
Global consensus with quorum:
- All engines must participate
- Minimum 4/5 engines must agree
- At least 2 different cognitive classes must agree
- Human-in-loop for all CRITICAL decisions

Consensus = min(all_engine_scores) * 0.70 + avg(all_engine_scores) * 0.30
Threshold = 0.98
```

---

## Integration Endpoints

### Check DVA Tier for Request

```typescript
POST /v1/memt/classify
{
  "prompt": "Design a city-wide evacuation system",
  "context": { "jurisdictionId": "nyc" }
}

Response:
{
  "classification": {
    "kind": "CIVIC_POLICY",
    "risk": "CRITICAL",
    "confidence": 0.95
  },
  "routingPlan": {
    "dvaTier": "HIVE",
    "giThreshold": 0.98,
    "requireConsensus": true,
    "engines": [...]
  }
}
```

### Execute with Explicit DVA Tier

```typescript
POST /v1/memt/deliberate
{
  "prompt": "Optimize this database query",
  "dvaTier": "LITE",  // Force LITE tier
  "kind": "MATH_OPTIMIZATION"
}
```

### Monitor DVA Tier Usage

```typescript
GET /v1/memt/stats

Response:
{
  "byDvaTier": {
    "LITE": 1523,
    "ONE": 4521,
    "FULL": 892,
    "HIVE": 47
  },
  "avgGiByTier": {
    "LITE": 0.92,
    "ONE": 0.94,
    "FULL": 0.96,
    "HIVE": 0.98
  }
}
```

---

## Ledger Attestation by Tier

All DVA tiers produce Civic Ledger attestations, but with varying detail:

### DVA.LITE Attestation

```json
{
  "task_id": "memt_abc123",
  "dva_tier": "LITE",
  "gi_score": 0.92,
  "engines": [
    { "id": "deepseek", "role": "PRIMARY" }
  ],
  "decision": "ok"
}
```

### DVA.HIVE Attestation

```json
{
  "task_id": "memt_xyz789",
  "dva_tier": "HIVE",
  "gi_score": 0.98,
  "engines": [
    { "id": "claude", "role": "PRIMARY", "gi_contribution": 0.35 },
    { "id": "openai", "role": "VERIFIER", "gi_contribution": 0.25 },
    { "id": "antigravity", "role": "VERIFIER", "gi_contribution": 0.15 },
    { "id": "deepseek", "role": "VERIFIER", "gi_contribution": 0.15 },
    { "id": "echo", "role": "MEMORY", "gi_contribution": 0.10 }
  ],
  "consensus": {
    "agreement_rate": 0.95,
    "disagreements": [],
    "quorum_met": true
  },
  "human_review": {
    "required": true,
    "reviewer_id": "human_001",
    "approved": true,
    "timestamp": "2025-11-26T12:00:00Z"
  },
  "decision": "ok"
}
```

---

## Failure Handling by Tier

### DVA.LITE Failures

```
If OEI fails:
  → Retry once with exponential backoff
  → If retry fails, return error to user
  → Log to DVA-LITE error queue
```

### DVA.ONE Failures

```
If ACI fails:
  → Promote ENI to PRIMARY
  → Continue with single-engine mode
  → Log degradation

If ENI fails:
  → Keep ACI as PRIMARY
  → Flag as unverified
  → Require human review
```

### DVA.FULL Failures

```
If any engine fails:
  → Continue with remaining engines
  → Reweight consensus calculation
  → If < 3 engines available, downgrade to DVA.ONE

If PRIMARY (ENI) fails:
  → Promote ACI to PRIMARY
  → Flag as degraded
  → Lower GI threshold by 0.02
```

### DVA.HIVE Failures

```
If any engine fails:
  → Continue with remaining engines
  → Log which engine failed
  → If < 4 engines, block decision
  → Require explicit human override to proceed
```

---

## Configuration

### Environment Variables

```bash
# DVA Tier defaults
DVA_DEFAULT_TIER=ONE
DVA_LITE_GI_THRESHOLD=0.90
DVA_ONE_GI_THRESHOLD=0.93
DVA_FULL_GI_THRESHOLD=0.95
DVA_HIVE_GI_THRESHOLD=0.98

# Consensus settings
DVA_FULL_CONSENSUS_REQUIRED=true
DVA_HIVE_HUMAN_REVIEW_CRITICAL=true

# Engine weights for consensus
DVA_CONSENSUS_WEIGHT_ACI=0.25
DVA_CONSENSUS_WEIGHT_ENI=0.35
DVA_CONSENSUS_WEIGHT_SXI=0.15
DVA_CONSENSUS_WEIGHT_OEI=0.15
DVA_CONSENSUS_WEIGHT_MSI=0.10
```

---

## Related Documentation

- [MEMT Whitepaper](../architecture/MEMT/MEMT_WHITEPAPER.md)
- [GI Engine Rules](../governance/GI_ENGINE_RULES.md)
- [DVA Flows Overview](../architecture/DVA_FLOWS_OVERVIEW.md)
- [DVA LITE Overview](../architecture/DVA_LITE_OVERVIEW.md)

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
