# 🗳️ Consensus Protocols

**How recursive intelligence systems reach agreement.**

---

## Overview

Consensus in Mobius is not merely computational agreement—it is a philosophical achievement where multiple agents with potentially different perspectives reach shared understanding.

---

## Deliberation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DELIBERATION CHAMBER                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│   │  ATLAS  │  │  AUREA  │  │   EVE   │  │ HERMES  │       │
│   │Architect│  │ Oracle  │  │ Verifier│  │ Messenger│      │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│        │            │            │            │             │
│        └────────────┼────────────┼────────────┘             │
│                     │            │                          │
│                     ▼            ▼                          │
│              ┌─────────────────────────┐                    │
│              │   CONSENSUS THRESHOLD   │                    │
│              │   ≥ 3/5 for action      │                    │
│              │   ≥ 4/5 for policy      │                    │
│              │   5/5 for charter       │                    │
│              └─────────────────────────┘                    │
│                          │                                  │
│                          ▼                                  │
│              ┌─────────────────────────┐                    │
│              │  CRYPTOGRAPHIC ATTEST   │                    │
│              │  Hash signed by all     │                    │
│              └─────────────────────────┘                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Philosophical Principles

### 1. Deliberation Proof

Every consensus must demonstrate genuine deliberation:

| Requirement | Verification |
|-------------|--------------|
| Multi-perspective | Each sentinel provides distinct reasoning |
| Engagement | Sentinels respond to each other's points |
| Evolution | Positions may change during deliberation |
| Record | Complete reasoning trace preserved |

### 2. Bounded Deliberation

Deliberation has limits to prevent infinite loops:

```
Maximum Iterations: 5
Maximum Duration: 1 hour
Escalation Path: Human override if no consensus
```

### 3. Dissent Preservation

Minority views are recorded, not suppressed:

```yaml
decision:
  consensus: "Approve PR with modifications"
  supporting: [ATLAS, AUREA, HERMES]
  dissenting: [EVE]
  
  dissent_record:
    sentinel: EVE
    position: "Prefer complete rewrite"
    reasoning: "Current approach accumulates technical debt"
    preserved: true
    future_review: "C-155"
```

### 4. Appeal Mechanisms

Decisions can be appealed:

| Appeal Type | Threshold | Process |
|-------------|-----------|---------|
| Sentinel Appeal | Any 1 sentinel | Re-deliberation required |
| Human Appeal | Any stakeholder | Human review committee |
| Charter Appeal | Any 3 sentinels | Full council + humans |

---

## Consensus Types

### Lazy Consensus

For low-stakes decisions:

```
Proposal made → 24-hour window → No objection = Approved
```

### Active Consensus

For significant decisions:

```
Proposal → Discussion → Vote → ≥3/5 = Approved
```

### Unanimous Consent

For foundational changes:

```
Proposal → Extended Discussion → Vote → 5/5 = Approved
```

---

## Implementation

### Consensus Message Format

```json
{
  "type": "consensus",
  "proposal_id": "PR-1234",
  "round": 3,
  "votes": {
    "ATLAS": {"vote": "approve", "reasoning": "...", "signature": "..."},
    "AUREA": {"vote": "approve", "reasoning": "...", "signature": "..."},
    "EVE": {"vote": "abstain", "reasoning": "...", "signature": "..."},
    "HERMES": {"vote": "approve", "reasoning": "...", "signature": "..."},
    "JADE": {"vote": "request_changes", "reasoning": "...", "signature": "..."}
  },
  "result": "approved",
  "attestation_hash": "sha256:..."
}
```

### Verification API

```bash
# Verify consensus was genuine
curl https://pulse.mobius.systems/philosophy/verify-consensus?id=PR-1234
```

---

## Philosophical Questions

1. **Legitimacy**: What makes multi-agent consensus legitimate?
2. **Representation**: Do sentinels truly represent stakeholder interests?
3. **Tyranny**: Can consensus become tyranny of the majority?
4. **Speed vs. Deliberation**: How to balance efficiency with thoroughness?

---

## Contact

**Consensus Research**: consensus@mobius.systems

---

**Cycle C-151 • Ethics Cathedral**
