# Guardrails vs Integrity Loops

## Two Approaches to AI Safety

Guardrails and integrity loops are complementary mechanisms.
Mobius extends guardrails—it does not bypass or replace them.

---

## Guardrails: Local Safety

Guardrails operate **locally and episodically**.

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Single output or interaction |
| **Timing** | Real-time evaluation |
| **Method** | Syntactic or semantic checks |
| **Response** | Block, filter, or redirect |
| **Memory** | None (stateless) |

### Guardrail Strengths
- Immediate protection against known harms
- Fast response to explicit violations
- Clear, auditable rules
- Easy to implement and verify

### Guardrail Limitations
- Cannot evaluate trajectory or intent
- Vulnerable to semantic evasion
- No memory of prior behavior
- Creates incentive for jailbreak attempts
- Episodic nature enables gaming

---

## Integrity Loops: Temporal Safety

Integrity loops operate **temporally and cumulatively**.

| Characteristic | Description |
|----------------|-------------|
| **Scope** | Behavioral trajectory over time |
| **Timing** | Continuous evaluation |
| **Method** | Pattern and trajectory analysis |
| **Response** | Adjust incentives, modify access |
| **Memory** | Persistent (long-state) |

### Integrity Loop Strengths
- Evaluates patterns, not just outputs
- Reduces incentive for evasion
- Rewards sustained cooperation
- Credits correction and growth
- Binds consequence to identity

### Integrity Loop Limitations
- Slower response than guardrails
- Requires persistent infrastructure
- Cannot block immediate harms
- Needs time to establish trajectory

---

## Complementary Design

Mobius does not bypass guardrails.
It extends them across time.

```
┌─────────────────────────────────────────────────┐
│              GUARDRAILS (Local)                 │
│   ┌─────────────────────────────────────────┐   │
│   │  • Real-time output filtering           │   │
│   │  • Immediate harm prevention            │   │
│   │  • Explicit rule enforcement            │   │
│   └─────────────────────────────────────────┘   │
│                      ↓                          │
│          INTEGRITY LOOPS (Temporal)             │
│   ┌─────────────────────────────────────────┐   │
│   │  • Trajectory evaluation                │   │
│   │  • Pattern detection                    │   │
│   │  • Correction incentives                │   │
│   │  • Long-term consequence binding        │   │
│   └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Why This Matters

### Without Integrity Loops
- Guardrails become a game to beat
- Each session is a fresh opportunity to evade
- No cost to repeated jailbreak attempts
- No reward for sustained cooperation

### With Integrity Loops
- Evasion attempts accumulate in trajectory
- Repeated violations degrade integrity score
- Cooperation builds trust over time
- System incentivizes alignment, not just compliance

---

## Practical Effect

| Scenario | Guardrails Only | Guardrails + Integrity Loops |
|----------|-----------------|------------------------------|
| Single jailbreak attempt | Blocked | Blocked + logged to trajectory |
| Repeated attempts | Blocked each time | Blocked + integrity degradation |
| Sustained cooperation | No recognition | Trust accumulation |
| Correction after error | No credit | Integrity improvement |

---

## Key Insight

Guardrails ask: *"Is this output safe?"*

Integrity loops ask: *"Is this participant aligned over time?"*

Both questions matter. Mobius answers the second without compromising the first.

---

*Mobius extends guardrails across time, reducing the incentive for jailbreaks and semantic evasion.*

*Cycle: C-171 | Ledger: VIII*
