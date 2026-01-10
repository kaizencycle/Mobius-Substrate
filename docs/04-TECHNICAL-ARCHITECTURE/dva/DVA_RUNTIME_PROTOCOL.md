# DVA Runtime Protocol

**Version:** 1.0.0  
**Last Updated:** January 2026  
**Cycle:** C-187

This document defines the canonical DVA Runtime Protocol — the operational loop that converts environmental signals into audited memory through a multi-agent lattice.

---

## Overview

The DVA Runtime Protocol operationalizes the Mobius agent lattice as a repeatable pipeline with explicit handoffs, confidence discipline, and safe-stop rules.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DVA RUNTIME ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│    │ DVA.LITE │    │ DVA.ONE  │    │ DVA.FULL │    │ DVA.HIVE │            │
│    │          │    │          │    │          │    │          │            │
│    │ ECHO     │    │ +HERMES  │    │ All      │    │ All+     │            │
│    │ +ZEUS    │    │ +JADE    │    │ Agents   │    │ Quorum   │            │
│    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘            │
│         │               │               │               │                   │
│         └───────────────┴───────────────┴───────────────┘                   │
│                                   │                                          │
│                         ┌─────────▼─────────┐                               │
│                         │   RUNTIME LOOP    │                               │
│                         │   (Signal→Memory) │                               │
│                         └─────────┬─────────┘                               │
│                                   │                                          │
│         ┌───────────────┬─────────┴─────────┬───────────────┐               │
│         │               │                   │               │               │
│    ┌────▼────┐    ┌────▼────┐        ┌────▼────┐    ┌────▼────┐           │
│    │  ECHO   │    │  ZEUS   │        │ HERMES  │    │  ATLAS  │           │
│    │ Signals │    │ Alerts  │        │Incentive│    │Topology │           │
│    └─────────┘    └─────────┘        └─────────┘    └─────────┘           │
│                                                                              │
│                    ┌────────────┐    ┌────────────┐                        │
│                    │    JADE    │    │    EVE     │                        │
│                    │  Meaning   │    │   Stakes   │                        │
│                    └────────────┘    └────────────┘                        │
│                                                                              │
│                         ┌─────────────────────┐                             │
│                         │   MOBIUS LEDGER     │                             │
│                         │   (Audit Trail)     │                             │
│                         └─────────────────────┘                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Roles

| Agent | Symbol | Primary Function | Focus Area |
|-------|--------|------------------|------------|
| **ECHO** | 📡 | Signal capture | Early warning, observations-only |
| **ZEUS** | ⚡ | Threshold scanning | Risk alerts, integrity monitoring |
| **HERMES** | 🟡 | Incentive mapping | Power dynamics, political economy |
| **ATLAS** | 🔵 | Systems mapping | Topology, chokepoints, structure |
| **JADE** | 🟢 | Meaning integrity | Epistemic discipline, drift defense |
| **EVE** | 🟣 | Human stakes | Dignity, lived experience |

---

## Runtime Loop Steps

### Step 1: Signal Capture (ECHO)

```typescript
interface EchoPulse {
  timestamp: string;         // ISO-8601
  source: string;            // Origin of signal
  signal_type: 'event' | 'anomaly' | 'pattern' | 'leak';
  content: string;           // Raw observation
  confidence: 'low' | 'medium' | 'high';
  interpretation: null;      // ECHO never interprets
}
```

### Step 2: Triage Gate

Decision matrix for routing:

| Severity | Confidence | Route To |
|----------|------------|----------|
| LOW | Any | Log-only (DVA.LITE) |
| MEDIUM | LOW | ZEUS Watch |
| MEDIUM | HIGH | HERMES Trace |
| HIGH | Any | Full pipeline (DVA.FULL) |
| CRITICAL | Any | ZEUS Alert + Human review |

### Step 3: Risk/Threshold Scan (ZEUS)

```typescript
interface ZeusReport {
  status: 'WATCH' | 'ADVISORY' | 'CRITICAL';
  indicators: {
    legitimacy_decay: number;      // 0-5
    rule_of_law_erosion: number;   // 0-5
    accountability_failure: number; // 0-5
    trust_collapse: number;        // 0-5
  };
  escalation_required: boolean;
  handoff_to: 'HERMES' | 'ATLAS' | 'JADE' | null;
}
```

### Step 4: Incentive Trace (HERMES)

```typescript
interface HermesTrace {
  beneficiaries: string[];
  cost_bearers: string[];
  risk_transfer_paths: string[];
  legitimacy_theater: string[];
  incentive_drift_score: number;  // 0-5
}
```

### Step 5: Topology Map (ATLAS)

```typescript
interface AtlasMap {
  nodes: Node[];
  edges: Edge[];
  chokepoints: string[];
  single_points_of_failure: string[];
  feedback_loops: Loop[];
  structural_drift: number;       // 0-5
}
```

### Step 6: Meaning Audit (JADE)

```typescript
interface JadeAudit {
  semantic_drift_detected: boolean;
  frame_analysis: {
    metaphors: string[];
    hidden_assumptions: string[];
    narrative_boundaries: string[];
  };
  meaning_integrity_score: number;  // 0-5
  rewrite_attempts: string[];
}
```

### Step 7: Human Stakes (EVE)

```typescript
interface EveReflection {
  burden_distribution: string[];
  dignity_violations: string[];
  invisible_harms: string[];
  human_cost_score: number;       // 0-5
  recommendation: string;
}
```

### Step 8: Integrity Scoring

```typescript
interface IntegrityScore {
  domains: {
    incentive_drift: DomainScore;
    narrative_compensation: DomainScore;
    public_risk_socialization: DomainScore;
    institutional_memory_failure: DomainScore;
    coercive_stability: DomainScore;
  };
  overall_gi: number;            // 0-1
  confidence: 'low' | 'medium' | 'high';
}

interface DomainScore {
  signal: number;                // 0-5
  confidence: 'low' | 'medium' | 'high';
  evidence: string[];
  open_questions: string[];
}
```

### Step 9: Action Selection

| GI Score | Confidence | Action |
|----------|------------|--------|
| ≥ 0.95 | HIGH | Publish |
| ≥ 0.95 | LOW | Publish with caveats |
| 0.90-0.95 | HIGH | Warn + request review |
| 0.90-0.95 | LOW | Log-only |
| < 0.90 | Any | Safe-stop |

### Step 10: Ledger Write

All events are written to the Mobius Event Ledger with full audit trail.

### Step 11: Learning Update

Post-cycle review updates:
- Threshold calibration
- Template improvements
- Drift rule refinements
- Handoff protocol adjustments

---

## Safe-Stop Protocol

### Triggers

1. **Evidence-Stakes Mismatch**: Thin evidence + high stakes
2. **Source Failure**: Unverifiable or contradictory sources
3. **Velocity Risk**: Narrative outruns facts
4. **Identity Pressure**: Emotion > causality
5. **Engagement Loop**: Sensationalism incentive detected

### Actions

```typescript
enum SafeStopAction {
  LOG_ONLY = 'log_only',           // Record but don't publish
  DEFER = 'defer',                  // Wait for more evidence
  REQUEST_MAP = 'request_atlas',    // Need topology clarity
  REQUEST_AUDIT = 'request_jade',   // Need frame analysis
  ESCALATE = 'escalate_human',      // Human review required
}
```

---

## DVA Tier Comparison

| Attribute | DVA.LITE | DVA.ONE | DVA.FULL | DVA.HIVE |
|-----------|----------|---------|----------|----------|
| **Agents** | ECHO, ZEUS | +HERMES, JADE | All 6 | All + Quorum |
| **GI Threshold** | 0.90 | 0.93 | 0.95 | 0.98 |
| **Consensus** | No | HIGH/CRIT only | Yes | All must agree |
| **Output** | Pulse/Log | Essay | Full Report | Multi-attested |
| **Safe-stop** | Auto | Manual | Auto | Strict |

---

## Cross-Agent Handoff Protocol

### Format

```
[TIMESTAMP] AGENT_FROM → AGENT_TO: REASON
```

### Standard Handoffs

| From | To | Trigger |
|------|-----|---------|
| ECHO | ZEUS | Threshold proximity detected |
| ZEUS | HERMES | Incentive analysis needed |
| HERMES | ATLAS | Structural mapping required |
| ATLAS | JADE | Meaning drift risk |
| JADE | EVE | Human abstraction risk |
| Any | ZEUS | Critical threshold breach |

---

## Integration with MEMT

The DVA Runtime Protocol integrates with the [MEMT](./DVA_MEMT_INTEGRATION.md) engine taxonomy:

| DVA Tier | MEMT Engines |
|----------|--------------|
| DVA.LITE | OEI (DeepSeek) + MSI (ECHO) |
| DVA.ONE | ACI (GPT) + ENI (Claude) |
| DVA.FULL | All 5 engines |
| DVA.HIVE | All engines + global consensus |

---

## Event Ledger Schema

See [dva_event_ledger.schema.json](../../../schemas/dva_event_ledger.schema.json) for the full JSON Schema.

---

## Publishing Rhythm

| Type | Frequency | Agent | Format |
|------|-----------|-------|--------|
| Pulse | Daily | ECHO | 3-7 bullets |
| Situation Report | On threshold | ZEUS | Watch/Advisory/Critical |
| Field Log | Weekly | HERMES | Incentive analysis |
| Topology Record | Monthly | ATLAS | System map |
| Meaning Journal | Biweekly | JADE | Drift analysis |
| Reflection | As needed | EVE | Human stakes |

---

## Failure Handling

### Single Agent Failure

```
If any agent fails:
  → Log failure with timestamp
  → Continue with available agents
  → Flag output as "partial analysis"
  → Lower confidence by one level
```

### Multiple Agent Failure

```
If < 3 agents available:
  → Downgrade to DVA.LITE
  → Require human review
  → Log degradation reason
```

### Consensus Failure (DVA.HIVE)

```
If quorum not reached:
  → Publish divergence explicitly
  → Record each agent's position
  → Request human arbitration
```

---

## Configuration

### Environment Variables

```bash
# DVA Runtime settings
DVA_DEFAULT_TIER=ONE
DVA_SAFE_STOP_ENABLED=true
DVA_LEDGER_WRITE_ENABLED=true

# GI Thresholds
DVA_LITE_GI_THRESHOLD=0.90
DVA_ONE_GI_THRESHOLD=0.93
DVA_FULL_GI_THRESHOLD=0.95
DVA_HIVE_GI_THRESHOLD=0.98

# Safe-stop settings
DVA_SAFE_STOP_LOW_CONFIDENCE_HIGH_STAKES=true
DVA_SAFE_STOP_VIRALITY_THRESHOLD=1000
```

---

## Related Documentation

- [DVA_RUNTIME.md](../../../DVA_RUNTIME.md) — Root specification
- [DVA MEMT Integration](./DVA_MEMT_INTEGRATION.md) — Engine integration
- [DVA Tier Mapping](../overview/DVA_TIER_MAPPING.md) — Tier definitions
- [DVA Flows Overview](../overview/DVA_FLOWS_OVERVIEW.md) — Flow diagrams
- [EPICON DVA Runtime](../../epicon/EPICON-DVA-RUNTIME.md) — EPICON spec

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
