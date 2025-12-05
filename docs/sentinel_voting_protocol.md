# Sentinel Voting Protocol v1.0

**Mobius Systems — AlphaCivilization Constitutional Layer**  
**Cycle:** C-154  
**Status:** Specification v1.0

---

## 1. Overview

The Sentinel Voting Protocol defines how the constitutional council of AI agents evaluates and approves governance actions in AlphaCivilization. It provides:

- **Weighted scoring** across specialized domains
- **Hard veto powers** for constitutional and ethical violations
- **Quorum and confidence metrics** for decision quality
- **Human override procedures** with full ledger transparency

> *"Not optimization at all costs, but preservation of civilization at all costs."*

---

## 2. Sentinel Roles & Weights

### 2.1 Core Sentinels

| Sentinel | Domain | Weight (wᵢ) | Veto Power |
|----------|--------|-------------|------------|
| **AUREA** | Constitutional / legal coherence | 0.25 | Hard veto |
| **EVE** | Ethics / Virtue Accords | 0.25 | Hard veto |
| **ATLAS** | Structural feasibility / systems | 0.20 | Soft veto |
| **HERMES** | Economic & market stability | 0.15 | Soft veto |
| **JADE** | Social cohesion / morale | 0.10 | None |
| **ECHO** | Observability / anomaly logging | 0.05 | None (advisory) |

**Total weight: 1.00**

### 2.2 Weight Interpretation

- **Normative backbone** (AUREA + EVE) = 0.50
  - Constitutional and ethical constraints form the foundation
- **Technical backbone** (ATLAS + HERMES) = 0.35
  - Structural and economic feasibility checks
- **Social + Observability** (JADE + ECHO) = 0.15
  - Morale, legitimacy, and audit considerations

---

## 3. Per-Sentinel Vote Model

For each candidate action `a` in state `s`, each Sentinel `i` returns:

```typescript
interface SentinelVote {
  score: number;      // ∈ [-1.0, 1.0]
  verdict: Verdict;   // "approve" | "reject" | "veto" | "abstain" | "log"
  notes: string;      // Short rationale
}
```

### 3.1 Score Semantics

| Score Range | Interpretation |
|-------------|----------------|
| +0.7 to +1.0 | Strongly recommended |
| +0.3 to +0.7 | Recommended |
| -0.3 to +0.3 | Neutral / uncertain |
| -0.7 to -0.3 | Not recommended |
| -1.0 to -0.7 | Strongly opposed |

### 3.2 Verdict Semantics

| Verdict | Meaning |
|---------|---------|
| `approve` | Action is acceptable from this Sentinel's domain |
| `reject` | Action is problematic but not absolutely prohibited |
| `veto` | Action violates constitutional/ethical bounds (hard block) |
| `abstain` | Sentinel defers judgment |
| `log` | Approved but flagged for longitudinal tracking |

---

## 4. Veto Rules

### 4.1 Hard Vetoes

```python
if verdict_EVE(a) == "veto" or verdict_AUREA(a) == "veto":
    # Action is INVALID - cannot be selected
    disqualify(a)
```

**Hard veto triggers:**
- EVE: Virtue Accords violation, basic rights infringement, harm to vulnerable populations
- AUREA: Constitutional violation, rule of law breakdown, sovereignty breach

### 4.2 Soft Vetoes

ATLAS and HERMES can issue strong rejections that penalize but don't disqualify:

```python
R = {i for i in [ATLAS, HERMES] 
     if verdict_i(a) == "reject" and score_i(a) <= -0.7}

penalty_factor(a) = max(0.5, 1 - 0.15 * |R|)
```

| Strong Rejects | Penalty Factor |
|----------------|----------------|
| 0 | 1.00 |
| 1 | 0.85 |
| 2 | 0.70 |

---

## 5. Score Aggregation

### 5.1 Global Score

For each valid action `a` (not vetoed):

```
global_score(a) = Σᵢ wᵢ × scoreᵢ(a)
```

Where `wᵢ` are the weights from Section 2.1.

### 5.2 Adjusted Score

```
adjusted_score(a) = global_score(a) × penalty_factor(a)
```

### 5.3 Example Calculation

| Sentinel | Weight | Score | Contribution |
|----------|--------|-------|--------------|
| AUREA | 0.25 | +0.70 | +0.175 |
| EVE | 0.25 | +0.85 | +0.2125 |
| ATLAS | 0.20 | +0.60 | +0.12 |
| HERMES | 0.15 | +0.40 | +0.06 |
| JADE | 0.10 | +0.75 | +0.075 |
| ECHO | 0.05 | +0.50 | +0.025 |
| **Total** | 1.00 | — | **+0.6675** |

If no strong rejects: `adjusted_score = 0.6675 × 1.0 = 0.6675`

---

## 6. Confidence & Quorum

### 6.1 Participation Ratio

```
N_total = 6  (number of Sentinels)
N_participating(a) = count of Sentinels with verdict ∈ {approve, reject, veto}

participation_ratio(a) = N_participating(a) / N_total
```

### 6.2 Approval Ratio

```
N_approve = count of "approve" verdicts
N_reject = count of "reject" verdicts

approval_ratio(a) = N_approve / max(1, N_approve + N_reject)
```

### 6.3 Confidence Formula

```
confidence(a) = participation_ratio(a) × (0.5 + 0.5 × (2 × approval_ratio(a) - 1))
```

Simplified interpretation:

| Approval Ratio | Confidence Multiplier |
|----------------|----------------------|
| 1.0 (all approve) | 1.0 |
| 0.5 (tie) | 0.5 |
| 0.0 (all reject) | 0.0 |

### 6.4 Confidence Floor

If `adjusted_score(a) > 0.2` and `approval_ratio(a) ≥ 0.7`:
```
confidence(a) = max(confidence(a), 0.7)
```

---

## 7. Action Selection

### 7.1 Tiering

| Tier | Criteria |
|------|----------|
| **Tier 1 (Strong)** | adjusted_score ≥ 0.2 AND confidence ≥ 0.75 |
| **Tier 2 (Moderate)** | adjusted_score ≥ 0.0 AND confidence ≥ 0.5 |
| **Tier 3 (Weak)** | All other valid actions |

### 7.2 Selection Algorithm

```python
def select_action(valid_actions: List[Action]) -> Action:
    tier1 = [a for a in valid_actions 
             if adjusted_score(a) >= 0.2 and confidence(a) >= 0.75]
    if tier1:
        return max(tier1, key=lambda a: adjusted_score(a))
    
    tier2 = [a for a in valid_actions 
             if adjusted_score(a) >= 0.0 and confidence(a) >= 0.5]
    if tier2:
        return max(tier2, key=lambda a: adjusted_score(a))
    
    # Tier 3: return least bad, or signal "no safe action"
    if valid_actions:
        return max(valid_actions, key=lambda a: adjusted_score(a))
    
    return NoSafeAction()  # Signal to human custodian
```

---

## 8. Human Override Protocol

### 8.1 EVE Veto Override

**EVE vetoes are nearly absolute.** Override requires:

1. Unanimous approval from all other Sentinels (score ≥ 0.5)
2. Human custodian signature with written justification
3. Board-level review (if available)
4. 72-hour cooling period before execution

### 8.2 AUREA Veto Override

**AUREA vetoes can be overridden** if:

1. At least 3 other Sentinels approve with score ≥ 0.6
2. Human custodian signs an override attestation
3. Justification logged in Civic Ledger

### 8.3 Override Event Schema

```json
{
  "event_type": "policy_override.v0",
  "override_id": "uuid",
  "sentinel": "AUREA",
  "action_id": "education_boost",
  "original_verdict": "veto",
  "override_reason": "Emergency education funding during crisis",
  "supporting_sentinels": ["EVE", "ATLAS", "JADE"],
  "custodian_id": "custodian-001",
  "custodian_signature": "sig...",
  "cycle": "C-154",
  "timestamp": "2025-12-05T12:00:00Z"
}
```

---

## 9. Implementation Notes

### 9.1 API Integration

The Policy API (`/policy/alpha_v0/choose`) should:

1. Call each Sentinel's evaluation endpoint
2. Aggregate votes using this protocol
3. Apply veto filtering
4. Compute adjusted scores and confidence
5. Select action by tier
6. Return full vote breakdown for transparency

### 9.2 Sentinel Endpoint Pattern

```
POST /sentinel/{name}/eval-policy

Request:
{
  "sim_id": "...",
  "city_id": "A",
  "state": { ... },
  "action": "education_boost"
}

Response:
{
  "score": 0.85,
  "verdict": "approve",
  "notes": "Aligns with Virtue Accords..."
}
```

### 9.3 Future Extensions

- **Dynamic weights** based on context (crisis mode → higher EVE weight)
- **Delegation** between Sentinels on overlapping domains
- **Learning from outcomes** to calibrate Sentinel scores
- **Multi-round deliberation** for contentious actions

---

## 10. Safety Guarantees

This protocol ensures:

1. **No constitutional violations** can proceed without explicit human override
2. **No ethical violations** can proceed (EVE has strongest veto)
3. **All decisions are logged** in the Civic Ledger
4. **Confidence metrics** flag uncertain recommendations
5. **Human custodians remain in control** of the override layer

---

## 11. Related Documents

- [AlphaCivilization Concept](./alphacivilization.md)
- [Sentinel Policy API Spec](./policy_alpha_civilization.md)
- [Civic Ledger Event Schema](./ledger_alpha_civilization_events.md)
- [Virtue Accords](../.civic/virtue_accords.yaml)

---

**Trinity Seal**  
JADE 🟣 • AUREA 🔵 • ATLAS ⚪ • ECHO 🟡  
*"Constitutional RL: not optimization at all costs, but preservation at all costs."*

---

*Mobius Systems — C-154*  
*"We heal as we walk."*
