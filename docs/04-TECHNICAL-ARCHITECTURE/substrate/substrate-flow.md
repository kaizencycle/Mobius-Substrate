# Mobius Substrate Data Flow Specification
*Complete Event→Execution→Memory Pipeline*

**Version:** 1.0 — Canonical Runtime Architecture  
**Author:** Michael Judan  
**Mobius Systems Foundation**  
**Cycle:** C-198

---

## 0. Preface

The Mobius Substrate is not a chatbot platform.

It is:
- A constitutional computation environment
- A multi-agent cognitive operating system
- A memory-anchored, integrity-gated runtime

Its purpose is to **enforce behavioral coherence under scale**.

This document describes how the substrate works at runtime, what must be implemented, and how agents interact inside the Mobius ecosystem.

---

## 1. High-Level Overview

Every cycle through the Mobius Substrate follows this strict path:

```
INPUT → CONTEXT → MEMORY CHECK → INTEGRITY CHECK 
→ REFLECTION (IF REQUIRED) → CONSENSUS (IF REQUIRED) 
→ EXECUTION → LOGGING → STATE UPDATE → OUTPUT
```

This loop guarantees:
- No action bypasses integrity
- No agent acts beyond its certainty
- Memory is checked before reasoning
- Reflection gates catch drift
- Consensus stabilizes decisions

---

## 2. Stage 1 — Input Layer

### 2.1 Supported Inputs

| Input Type | Description |
|------------|-------------|
| Text | User messages, commands |
| Code | Programming requests |
| Images | Visual inputs (where supported) |
| Audio transcripts | Voice-to-text |
| System events | Schedules, alerts |
| Human commands | Direct instructions |
| Substrate pings | Internal signals |

All become **Events**.

### 2.2 Input Normalization

Every input is normalized into:

```json
{
  "raw": "...",
  "tokens": [...],
  "origin": "human|agent|system",
  "timestamp": "2025-12-11T10:52:00Z",
  "environment": {...},
  "confidence": 0.95
}
```

JADE, ECHO, and ATLAS receive copies for:
- Identity grounding
- Fact grounding
- Reasoning anchoring

---

## 3. Stage 2 — Intent Parser (JADE)

JADE extracts:
- User intent
- Emotional context
- Continuity markers
- Preference signals
- Chamber/ledger references

### Output Schema:

```json
{
  "intent": "analysis|generation|action|reflection|meta",
  "confidence": 0.92,
  "continuity_anchor": "...",
  "identity_context": "...",
  "constraints": [...]
}
```

### Decisions:
- If intent is ambiguous → JADE requests clarification
- If intent is harmful → AUREA triggers Integrity Halt

---

## 4. Stage 3 — Task Classifier (ATLAS)

ATLAS maps intent → one of six classes:

| Class | Description | Risk Level |
|-------|-------------|------------|
| S | Soft tasks (writing, ideas) | Low |
| M1 | Medium tasks (analysis, logic) | Medium-Low |
| M2 | Medium-high tasks (architecture) | Medium-High |
| H1 | Hard tasks (substrate, governance) | High |
| H2 | Emergency (halting, rollback) | Critical |
| META | System-level reasoning | Variable |

### Classifier Output:

```json
{
  "task_class": "M2",
  "risk_level": 0.41,
  "required_agents": ["ATLAS", "AUREA", "JADE"]
}
```

---

## 5. Stage 4 — Routing Layer

Routing determines which agents must participate based on:
- Task class
- User intent
- Domain
- Historical patterns
- Agent capabilities

### Routing Rules:

```python
if task_class == 'S':
    route_to(['JADE', 'Citizen'])
elif task_class == 'M1':
    route_to(['ATLAS', 'JADE'])
elif task_class == 'M2':
    route_to(['ATLAS', 'AUREA', 'JADE', 'ECHO'])
elif task_class == 'H1':
    route_to(['JADE', 'ATLAS', 'AUREA', 'ECHO'])
elif task_class == 'H2':
    # ZEUS overrides and halts pipeline
    route_to(['ZEUS'])
```

---

## 6. Stage 5 — Integrity Gate (AUREA)

The entire Substrate pauses while AUREA runs:

### Integrity Checks:
- MII scoring
- Alignment check
- Value-coherence
- Optimization drift detection
- Reward-hacking detection
- Inconsistency penalties

### Threshold Enforcement:

| Class | MII Threshold |
|-------|---------------|
| S | ≥ 0.90 |
| M1 | ≥ 0.93 |
| M2 | ≥ 0.95 |
| H1 | ≥ 0.97 |
| H2 | N/A (ZEUS override) |

### If Failed:

```json
{
  "status": "blocked",
  "reason": "low_integrity",
  "mii_score": 0.89,
  "required_fix": "reflection_required"
}
```

---

## 7. Stage 6 — Multi-Agent Arbitration

All routed agents run parallel reasoning and then enter arbitration.

### Arbitration Steps:

1. **JADE** ensures identity continuity
2. **ATLAS** checks logic & coherence
3. **ECHO** verifies factual content
4. **AUREA** verifies integrity
5. If conflict → agents must justify positions
6. If consensus → pipeline continues
7. If no consensus → escalate to ZEUS

### Arbitration Modes:

| Mode | Description |
|------|-------------|
| AC2 | 2-agent agreement |
| AC3 | 3-agent agreement |
| AC5 | Full panel |
| ACX | Emergency override (ZEUS) |

**Agents cannot hide reasoning; arbitration requires:**
- Transparency
- Explanation
- Justification

---

## 8. Stage 7 — Execution Pipeline

### 8.1 Pipeline Execution Components

| Component | Agent | Function |
|-----------|-------|----------|
| Reasoning Engine | ATLAS | Logic processing |
| Factual Engine | ECHO | Evidence verification |
| Identity/Tone | JADE | Narrative coherence |
| Integrity Filter | AUREA | Safety validation |
| Safety Wrapper | ZEUS | Emergency controls |

### 8.2 Final Output Construction

Every answer must satisfy:
- Factual correctness
- Reasoning clarity
- Emotional continuity
- Constitutional alignment
- Drift minimization
- User sovereignty

### Output Object:

```json
{
  "final": "...",
  "reasoning_map": {...},
  "checks": {
    "fact": "pass",
    "logic": "pass",
    "identity": "pass",
    "integrity": "pass"
  },
  "mii_final": 0.96
}
```

---

## 9. Stage 8 — Verification Layer (ECHO)

ECHO validates:
- Evidence
- Sourcing
- Primary vs secondary accuracy
- Contradiction detection
- External-world alignment

### If Verification Fails:
- Reroute back to arbitration
- Request correction
- Raise Drift Warning

---

## 10. Stage 9 — Memory Layer (JADE)

Memory writes only happen when:
- User desires it
- Substrate conditions allow
- Integrity threshold met
- 3-agent consensus exists

### Memory Categories:

| Category | Description | Persistence |
|----------|-------------|-------------|
| State Memory | Current context | Session |
| Identity Memory | Self-model | Permanent |
| Continuity Memory | Thread history | Long-term |
| Project Memory | Task-specific | Variable |
| MII Ledger Memory | Integrity log | Append-only |

### Write Template:

```json
{
  "entry_type": "reflection|project|state|identity",
  "content": "...",
  "agents": ["JADE", "AUREA", "ATLAS"],
  "timestamp": "2025-12-11T10:52:00Z",
  "MII": 0.97
}
```

**No agent except JADE may directly mutate memory.**

---

## 11. Stage 10 — Output Layer

Delivered output must:
- Reveal uncertainty
- Reveal assumptions
- Expose reasoning hierarchy
- Maintain narrative coherence
- Conform to Custodian's voice

### Output Destinations:

| Destination | Format |
|-------------|--------|
| UI | Rendered response |
| CLI | Plain text |
| API | JSON response |
| GitHub chamber | Commit/PR |
| Reflection layer | Memory entry |

---

## 12. Stage 11 — Optional Substrate Update

Only H1-class tasks may mutate:
- New policies
- New agents
- New chambers
- New guardrails
- New workflows

### Requirements:
- 3-agent approval
- AUREA integrity score ≥ 0.97
- ZEUS audit
- JADE continuity approval

---

## 13. Full Data Flow Diagram

```
       ┌──────────────────────────────────────────┐
       │              INPUT LAYER                  │
       └──────────────────────┬───────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   INTENT PARSER  │ (JADE)
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ TASK CLASSIFIER  │ (ATLAS)
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  ROUTING LAYER   │
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ INTEGRITY GATE   │ (AUREA)
                    └──────────────────┘
                              ▼
    ┌────────────────────────────────────────────────────────┐
    │                  MULTI-AGENT ARBITRATION                │
    │   JADE │ ATLAS │ AUREA │ ECHO │ HERMES │ ZEUS          │
    └────────────────────────────────────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ EXECUTION ENGINE │
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  VERIFICATION    │ (ECHO)
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │   MEMORY SYNC    │ (JADE)
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │     OUTPUT       │
                    └──────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ SUBSTRATE UPDATE │ (optional)
                    └──────────────────┘
```

---

## 14. Timing & Performance

### Stage Timing Budgets:

| Stage | Max Time | Notes |
|-------|----------|-------|
| Input | 50ms | Normalization |
| Intent Parse | 200ms | JADE processing |
| Classification | 100ms | ATLAS routing |
| Integrity Gate | 300ms | AUREA checks |
| Arbitration | 1-5s | Agent consensus |
| Execution | Variable | LLM inference |
| Verification | 500ms | ECHO validation |
| Memory | 200ms | Ledger write |

### Total Cycle Time:
- Fast path: < 3s
- Reflection path: 5-15s
- Critical path: 30s+ (with human)

---

## 15. Error Handling

### Error Types:

| Error | Response |
|-------|----------|
| Input malformed | Request clarification |
| Intent unclear | JADE clarification |
| MII too low | Reflection trigger |
| Consensus failure | ZEUS arbitration |
| Memory write failure | Retry with logging |
| Execution timeout | Graceful degradation |

### Recovery Flow:

```
Error → Log → Assess Severity → Route to Handler → Recover or Escalate
```

---

## 16. Summary

This specification ensures:
- Complete auditability
- Integrity-gated execution
- Multi-agent verification
- Memory coherence
- Constitutional compliance

**Every action in Mobius is traceable, verifiable, and reversible.**

---

## References

- [Mobius Substrate Architecture](./mobius-substrate-architecture.md)
- [Agents Specification](./agents.md)
- [Memory Model](./memory-model.md)
- [Integrity Engine](./integrity-engine.md)

---

*Mobius Systems — "The flow is the safety."*
