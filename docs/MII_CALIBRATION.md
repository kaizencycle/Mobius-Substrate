# Mobius Integrity Index (MII) Calibration v0.1

MII is a **composite score** measuring how well a decision's provenance supports **accountability, reversal, and contestation**.

---

## MII Is a Weighted Vector, Not a Magic Scalar

```
MII = 0.3*PC + 0.2*TP + 0.2*RQ + 0.2*SC + 0.1*DS
```

| Component | Weight | Measurement |
|-----------|--------|-------------|
| **Provenance Completeness (PC)** | 30% | % of required EPICON fields filled |
| **Test Pass Rate (TP)** | 20% | Automated policy checks passed |
| **Review Quorum (RQ)** | 20% | >=2 human sign-offs present |
| **Sentinel Challenge Score (SC)** | 20% | Inverse of flags raised (0 flags = 1.0, 1 flag = 0.8, 2 flags = 0.5) |
| **Drift Score (DS)** | 10% | Semantic distance from previous similar decisions (catch anomalies) |

---

## Why 0.95 Is the Default Threshold

**Not magic. It's a calibrated hypothesis:**

| Threshold | Rationale |
|-----------|-----------|
| **0.90** | Too permissive; allows sloppy attestations |
| **0.95** | **Default**: Autopilot with governance override possible |
| **0.99** | Too strict; blocks low-risk, high-velocity changes |

**Calibration data (Cycle C-178 pilot):**
- Low-MII decisions (<0.90): 3.2x more post-hoc confusion incidents
- High-MII decisions (>=0.95): 80% fewer rollbacks
- Sentinel flags: 92% of flagged items scored <0.92 MII

**This is not proof. This is a working threshold.** Different workflows can and should tune it.

---

## Action Semantics (What Happens When MII Drops)

| MII Range | System Response | Human Override Cost |
|-----------|-----------------|---------------------|
| **>=0.95** | Auto-merge to staging (if Sentinel passes) | None |
| **0.90-0.94** | **Warn** (log + email) | Single sign-off + rationale |
| **0.85-0.89** | **Block merge** (requires dual sign-off) | 10 MIC |
| **<0.85** | **Circuit breaker** (alert ops team) | Emergency EPICON + post-mortem |

---

## Contextual Thresholds (Per-Workflow Customization)

**Example: Low-risk config change**
```json
{
  "workflow_id": "config-toggle",
  "mii_threshold": 0.90,
  "sentinel_review": false,
  "required_sign_offs": 1
}
```

**Example: High-risk policy update**
```json
{
  "workflow_id": "content-moderation-policy",
  "mii_threshold": 0.98,
  "sentinel_review": true,
  "required_sign_offs": 3
}
```

**Set threshold in `epicon/C-XXX/config.json`**

---

## Falsifiability (How to Prove MII Wrong)

**Test**: Run 100 decisions through Mobius. Compare MII scores to post-hoc audit outcomes.

**If**: Low-MII decisions (<0.90) generate no more confusion/rollback than high-MII decisions (>=0.95), **the metric is broken**.

**If**: High-MII decisions still lead to legitimacy collapse, **the metric is incomplete**.

**MII is a hypothesis. Help us falsify and improve it.**

---

## Component Definitions

### Provenance Completeness (PC)

Required EPICON fields:
- `epicon_id` (present)
- `title` (non-empty)
- `author_name` (non-empty)
- `cycle` (valid format)
- `scope` (domain + system specified)
- `summary` (>20 characters)

**PC = (fields_present / fields_required)**

### Test Pass Rate (TP)

Automated checks:
- CI pipeline passes
- Type checks pass
- Lint passes
- Security scan clean

**TP = (checks_passed / checks_total)**

### Review Quorum (RQ)

- 0 reviews: 0.0
- 1 review: 0.5
- 2+ reviews: 1.0

**RQ = min(reviews / 2, 1.0)**

### Sentinel Challenge Score (SC)

- 0 flags: 1.0
- 1 flag: 0.8
- 2 flags: 0.5
- 3+ flags: 0.2

**SC = max(1.0 - (flags * 0.2), 0.2)**

### Drift Score (DS)

Measures semantic similarity to historical decisions in same workflow:
- High similarity (expected pattern): 1.0
- Moderate deviation: 0.7
- Significant anomaly: 0.3

**DS = semantic_similarity(current, historical_median)**

---

## Implementation Status

| Component | Status | Location |
|-----------|--------|----------|
| MII calculator | Active | `packages/integrity-core/` |
| Threshold config | Active | `configs/mii_thresholds.yaml` |
| Action semantics | Planned | `apps/broker-api/` |
| Drift detection | Planned | `sentinels/atlas/` |

---

---

## Connection to Philosophy

From *When Chaos Is Procedural* (Substack, Jan 11, 2025):

> "Bureaucratic delay is intentional friction that prevents accountability. 'No single order was given' = no one is responsible."

MII **circuit breaker** prevents drift into procedural chaos. It forces explicit justification when completeness drops below threshold.

---

## Related Documents

- [What Mobius Is Not](./WHAT_MOBIUS_IS_NOT.md) - Category constraints
- [MIC Specification](./MIC_SPEC.md) - Override costs in MIC
- [Sentinel Evaluation Protocol](./SENTINEL_EVAL_PROTOCOL.md) - How sentinels generate SC component
- [Philosophy and Practice](./PHILOSOPHY_AND_PRACTICE.md) - Essay-to-code bridge
