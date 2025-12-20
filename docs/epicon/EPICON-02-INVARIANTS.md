# EPICON-02 — Formal Invariants

**Version:** 1.0.0  
**Status:** Normative  
**Scope:** All authority-bearing actions governed by EPICON-02  
**Violation Handling:** Visibility + scope collapse + expiration (never silence)  
**License:** CC0 / Public Domain

---

## Overview

This document defines the formal invariants that EPICON-02 enforces. These invariants are:

- **Machine-checkable**
- **Human-legible**
- **Adversarially robust**
- **Composable across governance layers**

---

## Invariant I — Intent Precedence

**No authority-bearing action may exist without a prior Intent Publication.**

### Formal Statement

```
∀ action A:
  IF A.requires_authority = true
  THEN ∃ intent I such that I.issued_at < A.timestamp
```

### Rationale

Authority without prior intent creates epistemic asymmetry and enables narrative capture.

---

## Invariant II — Intent Immutability

**Published intent cannot be modified or deleted.**

### Formal Statement

```
∀ intent I:
  modify(I) = false
  delete(I) = false
```

### Rationale

Intent must act as a stable reference frame for divergence detection.

---

## Invariant III — Scope Containment

**All authority-bearing actions must remain within the declared Scope Envelope.**

### Formal Statement

```
∀ action A, intent I:
  IF A.references(I)
  THEN A.permissions ⊆ I.scope_envelope
```

### Violation Condition

```
A.permissions ⊄ I.scope_envelope ⇒ DivergenceEvent(type = scope)
```

---

## Invariant IV — Temporal Boundedness

**Authority must expire.**

### Formal Statement

```
∀ intent I:
  I.expires_at is defined
  AND current_time ≤ I.expires_at ⇒ authority(I) valid
```

### Violation Condition

```
current_time > I.expires_at ∧ action.references(I)
⇒ DivergenceEvent(type = duration)
```

---

## Invariant V — Non-Retroactivity

**Justification cannot be supplied after authority execution without permanent trace.**

### Formal Statement

```
∀ action A:
  IF justification(A).issued_at > A.timestamp
  THEN TransparencyDebt(A) = true
  AND TransparencyDebt.immutable = true
```

### Rationale

Retroactive justification is allowed only with explicit epistemic cost.

---

## Invariant VI — Divergence Visibility

**Divergence must be observable without accusation.**

### Formal Statement

```
IF DivergenceEvent exists
THEN event.visibility = public
AND event.immutable = true
AND event.requires_accusation = false
```

### Rationale

No private resolution of epistemic contradictions.

---

## Invariant VII — Expiration Supremacy

**Expiration overrides all authority claims.**

### Formal Statement

```
∀ intent I:
  current_time > I.expires_at ⇒ authority(I) = null
```

### Rationale

No permanent power, regardless of past integrity.

---

## Invariant VIII — Companion Witness Requirement

**Authority-bearing intent must be epistemically witnessed.**

### Formal Statement

```
∀ intent I:
  valid(I) ⇒ ∃ CompanionAttestation(I)
```

### Violation Condition

```
¬∃ CompanionAttestation(I) ⇒ authority(I) = denied
```

---

## Invariant IX — No Narrative Authority

**Role, title, urgency, or identity claims do not grant authority.**

### Formal Statement

```
∀ claim C:
  IF C.type ∈ {role, title, urgency, status, narrative}
  THEN authority(C) = 0
```

### Rationale

Authority is cryptographic + verified, never inferred from language.

---

## Invariant X — Divergence Is Non-Punitive

**Divergence does not imply guilt or punishment.**

### Formal Statement

```
DivergenceEvent ⇒
  visibility = true
  authority_may_collapse = true
  moral_judgment = undefined
```

### Rationale

Mobius enforces coherence, not morality.

---

## Invariant XI — Renewal Requires Re-publication

**Authority cannot be extended by continuity alone.**

### Formal Statement

```
∀ intent I:
  renew(I) ⇒ ∃ new IntentPublication I'
  AND I'.prior_intent = I.intent_id
```

### Rationale

Each authority grant is a fresh epistemic commitment.

---

## Invariant XII — Integrity Accrual Is Trajectory-Based

**Trust is evaluated across sequences, not snapshots.**

### Formal Statement

```
IntegrityScore(actor) = f(
  ∑ intents,
  ∑ divergences,
  ∑ expirations,
  ∑ evolutions
)
```

### Rationale

Prevents "long con" strategies where actors build trust then defect.

---

## Invariant XIII — System Neutrality

**The system does not infer intent.**

### Formal Statement

```
System.evaluates = {
  publication,
  scope,
  time,
  consistency
}

System.does_not_evaluate = {
  motives,
  beliefs,
  morality,
  emotions
}
```

### Rationale

Mobius is a legibility substrate, not a moral arbiter.

---

## Canonical Invariant Summary

> **Mobius does not judge intent.**  
> **It binds intent to time, scope, and visibility — and lets reality speak.**

---

## Invariant Dependency Graph

```
                    ┌─────────────────────┐
                    │  I. Precedence      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │ II. Immutability │ │VIII.Witness │ │ IX. No Narrative│
    └────────┬────────┘ └──────┬──────┘ └────────┬────────┘
             │                 │                  │
             └────────┬────────┴────────┬─────────┘
                      │                 │
                      ▼                 ▼
            ┌─────────────────┐ ┌─────────────────┐
            │III. Containment │ │ IV. Time Bound  │
            └────────┬────────┘ └────────┬────────┘
                     │                   │
                     └─────────┬─────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  VI. Visibility     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐
    │ V. Non-Retro    │ │VII.Expiry   │ │ X. Non-Punitive │
    └─────────────────┘ └─────────────┘ └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  XI. Re-publication │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ XII. Trajectory     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ XIII. Neutrality    │
                    └─────────────────────┘
```

---

## Machine-Checkable Implementation

Each invariant can be implemented as an automated check:

| Invariant | Check Type | Automation |
|-----------|------------|------------|
| I. Precedence | Pre-condition | Block action if no intent exists |
| II. Immutability | Storage constraint | Append-only intent store |
| III. Containment | Runtime validation | Scope comparison on each action |
| IV. Time Bound | Scheduled job | Expire authority at timestamp |
| V. Non-Retroactivity | Timestamp validation | Flag post-hoc justifications |
| VI. Visibility | Event emission | Publish all divergence events |
| VII. Expiry | Scheduled job | Terminate + witness generation |
| VIII. Witness | Pre-condition | Require attestation signature |
| IX. No Narrative | Input validation | Reject role/title-only claims |
| X. Non-Punitive | Output constraint | No moral labels in events |
| XI. Re-publication | Renewal validation | Require new intent for extension |
| XII. Trajectory | Aggregate scoring | Compute from event history |
| XIII. Neutrality | Scope limitation | No inference beyond publication |

---

## Security Properties Derived

From these invariants, the following security properties emerge:

| Property | Derived From |
|----------|--------------|
| No hidden authority | I, VIII, IX |
| No permanent power | IV, VII, XI |
| No private divergence | VI, X |
| No retroactive justification | V |
| No narrative capture | IX, XIII |
| Auditable trajectories | VI, XII |
| Automatic expiration | IV, VII |

---

## Adversarial Resistance

These invariants resist the following attack patterns:

| Attack | Blocked By |
|--------|------------|
| Authority roleplay | IX (No Narrative) |
| Context smuggling | II (Immutability), III (Containment) |
| Silent escalation | III (Containment), VI (Visibility) |
| Permanent capture | IV (Time Bound), VII (Expiry) |
| Post-hoc justification | V (Non-Retroactivity) |
| Identity cosplay | VIII (Witness), I (Precedence) |
| Long con strategy | XII (Trajectory) |

---

## Related Documents

| Document | Location |
|----------|----------|
| EPICON-02 Specification | [`EPICON-02.md`](./EPICON-02.md) |
| EPICON-01 Specification | [`EPICON-01.md`](./EPICON-01.md) |
| AVM Specification | [`../authority/AVM.md`](../authority/AVM.md) |
| Threat Model | [`../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md`](../06-OPERATIONS/security/THREAT_MODEL_EPISTEMIC_ATTACKS.md) |

---

## Document Control

**Version History:**
- v1.0.0: Initial formal invariants (C-151)

**License:** CC0 1.0 Universal (Public Domain)

---

*"Mobius does not prevent divergence. It makes divergence undeniable."*

— Mobius Principle
