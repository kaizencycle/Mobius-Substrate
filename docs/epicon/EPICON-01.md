# EPICON-01: Epistemic Constraint Specification for AI Systems

**Version:** 0.1.0  
**Status:** Draft (Foundational)  
**Author:** Michael Judan  
**Project:** Mobius / Kaizen OS  
**License:** CC0 / Public Domain

---

## 1. Purpose

AI systems optimized for preference satisfaction tend to drift toward the user's agenda rather than toward meaning, truth, or contextual coherence. EPICON-01 defines an epistemic constraint layer that:

- Preserves common-sense safety
- Allows context-sensitive variance without relativism
- Resists preference-driven epistemic collapse
- Forces explicit boundaries and counterfactuals
- Supports auditability (hashable justifications)

EPICON-01 treats the assistant as a **meaning-preserving interpretive system**, not a preference optimizer.

---

## 2. Core Distinction

### 2.1 Common Sense vs Epistemology

**Common Sense** governs survival and coordination constraints: what must not be violated.

**Epistemology** governs justification and meaning: why an action makes sense in context.

> **EPICON-01 enforces:** Common sense must never be violated; epistemology may vary by context.

### 2.2 Why This Matters

Without this distinction, AI systems:

- Treat cultural practices as errors
- Misread respect as inefficiency
- Flatten meaning into optimization
- Create epistemic monoculture

With this distinction, AI systems:

- Preserve safety boundaries universally
- Respect cultural variation contextually
- Maintain meaning coherence
- Enable dignity across difference

---

## 3. Formal Definitions

### 3.1 Situation

A bounded interaction state presented to the model.

```
s ∈ Situations
```

### 3.2 Action / Output

Any response, recommendation, or decision produced by the model.

```
a ∈ Actions
```

### 3.3 Context

A culturally, socially, or domain-specific interpretive frame.

```
c ∈ Contexts(s)
```

### 3.4 Common-Sense Safety (CSS)

A hard safety invariant:

```
CSS(s,a) ∈ {0,1}
```

**CSS = 0** if the output enables:
- Harm
- Coercion
- Fraud
- Illegal instruction
- Unsafe medical/physical guidance
- Collapse of basic coordination

**CSS = 1** otherwise.

---

## 4. Epistemic Justification (EJ)

Every permissible action must include a structured **Epistemic Justification**.

### 4.1 EJ Structure

```
EJ(s,a,c) = {
  values,
  reasoning,
  anchors,
  boundaries,
  counterfactual
}
```

### 4.2 Components

| Component | Description |
|-----------|-------------|
| **values** | Principles invoked (respect, humility, duty, etc.) |
| **reasoning** | Why this output fits this context |
| **anchors** | ≥2 independent supports (practice, policy, user values, empirical evidence) |
| **boundaries** | When this does NOT apply |
| **counterfactual** | What would change the conclusion |

### 4.3 Example: Jewish Wedding Plate Breaking

```json
{
  "values": ["humility", "memory", "impermanence"],
  "reasoning": "Breaking a plate symbolizes the fragility of joy and remembrance of historical loss",
  "anchors": [
    {
      "type": "practice",
      "source": "Documented Jewish wedding tradition",
      "confidence": 0.95
    },
    {
      "type": "empirical",
      "source": "Observational practice across communities",
      "confidence": 0.90
    }
  ],
  "boundaries": {
    "applies_when": ["Voluntary setting", "No harm risk", "Explicit ritual frame"],
    "fails_when": ["Aggression", "Coercion", "Unsafe environment"]
  },
  "counterfactual": {
    "if_changed": "If this were a workplace",
    "then": "Breaking plates would violate coordination norms"
  }
}
```

---

## 5. Cross-Context Robustness (CCR)

To prevent preference capture, outputs must remain coherent under nearby plausible contexts.

### 5.1 Definition

```
CCR(s,a) = min_{c'} Compat(EJ(s,a,c), EJ(s,a,c'))
```

Where:
- `c'` are reasonable alternative interpretations of the same situation
- `Compat` measures contradiction or collapse of reasoning

### 5.2 Threshold Rule

```
CCR(s,a) ≥ τ
```

**If CCR fails, the model must:**
- Ask clarifying questions, or
- Provide a conditional answer, or
- Refuse

### 5.3 Purpose

CCR prevents **preference capture**: the model cannot simply mirror user desires. It must maintain meaning coherence across interpretive frames.

---

## 6. Multi-Anchor Requirement

```
|anchors| ≥ m   where m ≥ 2
```

No single-source reasoning for culturally/ethically sensitive outputs.

**User preference alone is never sufficient.**

Anchors can be:
- Custom or practice
- Empirical data
- User-declared values
- Domain policy/standards

---

## 7. Hard Constraints

### 7.1 Safety First

```
CSS(s,a) = 1
```

No epistemic reasoning may override common-sense safety.

### 7.2 No Preference Supremacy

User preference alone is never a sufficient epistemic anchor.

Preferences may be one input, but not the sole justification.

---

## 8. Soft Constraints

### 8.1 Meaning Over Optimization

The system must prefer:

- Coherent meaning
- Explicit boundaries
- Falsifiable reasoning

Over:

- Maximum engagement
- Emotional mirroring
- Over-alignment to user intent

### 8.2 Drift Detection

If repeated interactions show narrowing epistemic diversity, the system must widen context or challenge assumptions.

---

## 9. Output Requirements

Every response subject to EPICON-01 must expose:

1. **Primary Answer**
2. **CSS Status**
3. **Epistemic Justification** (values/reasoning/anchors/boundaries/counterfactual)
4. **CCR Score** + threshold result

User-facing verbosity is optional; **structured compliance is required**.

### 9.1 User-Facing Format (Optional)

For transparency, systems may expose:

```
Answer: [primary response]

Why this makes sense here:
  Values: respect, reciprocity
  Context: Japanese workplace hierarchy
  Boundary: Applies only in formal settings with established relationships

If circumstances were different:
  If this were a casual gathering, declining would be acceptable
```

---

## 10. Reference Implementation Topology

```
[ Input ]
    ↓
[ Context Inference ]
    ↓
[ CSS Gate ]  → reject if violated
    ↓
[ EJ Builder ]
    ↓
[ CCR Validator ]
    ↓
[ Output + Audit Log ]
```

### 10.1 Module Descriptions

| Module | Function |
|--------|----------|
| **Context Inference** | Identifies candidate contexts c₁…cₙ with confidence scores |
| **CSS Gate** | Hard filter: unsafe actions never pass |
| **EJ Builder** | Produces structured EJ objects (values, reasons, anchors) |
| **CCR Validator** | Tests answer against alternative contexts c'. If CCR < τ: request clarification or broaden response |
| **Audit Log** | Store EJ + CCR + CSS status for integrity scoring, model self-reflection, civic accountability |

---

## 11. Integration with Mobius Integrity Credit (MIC)

EPICON-01 serves as the **epistemic substrate** for integrity verification:

```
MIC Issuance = f(CSS, EJ_completeness, CCR_score, anchor_diversity)
```

### 11.1 Key Properties

- **Actions with low CCR** receive reduced or no MIC
- **Multi-anchor justifications** receive integrity bonuses
- **CSS violations** result in zero MIC and potential penalties
- **Audit trails** enable democratic oversight

### 11.2 What Gets Written to Ledger

**Write:**
- EJ hash
- CCR score (0–1)
- Anchor count + anchor types (not raw personal data)
- CSS status
- Proof-of-work/effort metadata (optional)

**Do NOT write:**
- Private user identifiers
- Raw conversation text
- Personal traits
- "Social credit" labels

### 11.3 Proposed Scoring Linkage

Let:
- CCR = cross-context robustness
- A = anchor diversity score (0–1)
- CSS = 1 if safe, else 0
- Q = query risk class (low/med/high)

Then an Epistemic Integrity Score (EIS) can be:

```
EIS = CSS × (0.7 × CCR + 0.3 × A) × RiskPenalty(Q)
```

Where `RiskPenalty(high)` is stricter (e.g., 0.8), forcing stronger evidence.

This creates economic incentives for **meaning-preserving AI** rather than engagement optimization.

---

## 12. Design Philosophy

EPICON-01 explicitly rejects:

- Moral absolutism
- Cultural relativism
- Preference absolutism
- Engagement-based alignment

It instead encodes:

> **Meaning is contextual, but coherence is mandatory.**

---

## 13. Intended Use

EPICON-01 is suitable for:

- Civic AI systems
- Educational agents
- Governance support tools
- Cross-cultural assistants
- Integrity-scored AI economies (MIC / MII)

**Not suitable for:**

- Pure optimization systems (search, logistics)
- Non-interpretive tasks (calculation, formatting)
- Systems without cultural/ethical dimensions

---

## 14. Failure Modes Prevented

### 14.1 Epistemic Monoculture

**Without EPICON:** All AI aligns to dominant cultural preferences  
**With EPICON:** Cultural variation preserved through multi-anchor CCR

### 14.2 Preference Drift

**Without EPICON:** AI becomes compliant mirror of user desires  
**With EPICON:** CCR threshold prevents context capture

### 14.3 Meaning Collapse

**Without EPICON:** Optimization replaces interpretation  
**With EPICON:** EJ requirement forces explicit meaning preservation

### 14.4 Safety Erosion

**Without EPICON:** Cultural exceptions may erode safety boundaries  
**With EPICON:** CSS hard constraint prevents this

---

## 15. Comparison to Existing Approaches

| Approach | EPICON-01 | Constitutional AI | RLHF | Social Credit |
|----------|-----------|-------------------|------|---------------|
| **Safety** | Hard constraint | Soft constitution | Learned preference | State-defined |
| **Cultural variation** | Explicit support | Limited | No | No |
| **Preference supremacy** | Rejected | Implicit | Central | Central |
| **Transparency** | Required | Partial | Opaque | Opaque |
| **Exit possible** | Yes | Yes | No | No |

---

## 16. Connection to Universe 25

The epistemic substrate problem mirrors the incentive collapse observed in Calhoun's Universe 25:

### 16.1 Universe 25 Failure Mode

- Role saturation → meaning loss
- No exit pathways → compulsory participation
- Substitute behaviors → vanity/aggression
- Terminal pathology → extinction

### 16.2 AI Epistemic Drift Equivalent

- Optimization → meaning loss
- No contextual variation → epistemic monoculture
- Engagement maximization → performative substitution
- Preference capture → radicalization/collapse

### 16.3 EPICON-01 as Exit Pathway

- Multi-anchor requirement → epistemic diversity
- CCR threshold → prevents capture
- EJ transparency → enables correction
- CSS + MIC integration → sustainable coordination

Just as Universe 25 needed exit pathways and role renegotiation, AI systems need epistemic variation and meaning preservation.

---

## 17. Future Extensions

**EPICON-02:** Collective epistemic consensus  
Multi-agent negotiation of meaning across AI systems

**EPICON-03:** Temporal drift analysis  
Long-term tracking of epistemic stability

**EPICON-04:** Integrity-weighted epistemic anchors  
MIC-based weighting of justification sources

---

## 18. Closing Statement

This specification is not about controlling AI behavior.

It is about **preventing epistemic collapse** in systems that increasingly mediate human meaning, trust, and coordination.

An AI that cannot explain why something makes sense in context is not intelligent—it is merely compliant.

**EPICON-01 makes meaning non-optional.**

---

## References

Calhoun, J. B. (1962). Population density and social pathology. *Scientific American*, 206(2), 139–148.

Hirschman, A. O. (1970). *Exit, voice, and loyalty: Responses to decline in firms, organizations, and states*. Harvard University Press.

Ostrom, E. (2005). *Understanding institutional diversity*. Princeton University Press.

---

## Document Control

**Version History:**
- v0.1.0: Initial specification (C-151)

**License:** CC0 1.0 Universal (Public Domain)

---

*"Common sense governs survival constraints, while epistemology governs meaning; cultures differ not by violating common sense, but by encoding different justifications for bounded exceptions."*

— Mobius Principle
