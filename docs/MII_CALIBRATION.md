# Mobius Integrity Index (MII) — Calibration v0.1

MII is a composite score measuring how well a decision's provenance supports **accountability, reversibility, and contestation**.

MII is calibrated, not revealed.

---

## MII Is a Vector (Implemented as a Scalar)

Treat MII as a weighted sum of components:

| Component | Weight | Measurement |
|-----------|-------:|-------------|
| Provenance Completeness (PC) | 30% | % of required EPICON fields present |
| Test/Policy Pass Rate (TP) | 20% | Automated checks passed |
| Review Quorum (RQ) | 20% | Required human sign-offs met |
| Sentinel Challenge Score (SC) | 20% | Inverse of severity/flags |
| Drift Score (DS) | 10% | Semantic distance from prior similar decisions |

**Formula:** `MII = 0.3*PC + 0.2*TP + 0.2*RQ + 0.2*SC + 0.1*DS`

---

## Why 0.95 Is the Default Threshold

0.95 is a **policy default**, not a law.

- **0.90** tends to allow sloppy attestations.
- **0.95** balances throughput and legitimacy.
- **0.99** may be too strict for high-velocity workflows.

The project will replace this intuition with data via pilot studies.

---

## Action Semantics (What Happens When MII Drops)

| MII Range | System Response | Override |
|-----------|-----------------|----------|
| ≥ 0.95 | Allow staging merge if Sentinel passes | None |
| 0.90–0.94 | Warn + require justification | Single sign-off + EPICON rationale |
| 0.85–0.89 | Block | Dual sign-off + EPICON override |
| < 0.85 | Circuit breaker + alert | Emergency EPICON + post-mortem |

Overrides are recorded as first-class attestations.

---

## Contextual Thresholds (Per Workflow)

MII thresholds can be tuned per workflow based on risk tolerance.

### Example: Low-Risk Configuration Updates

```json
{
  "workflow_id": "config-update",
  "mii_threshold": 0.90,
  "required_sign_offs": 1,
  "sentinel_review_required": false,
  "rationale": "Speed > exhaustive provenance for non-critical configs"
}
```

### Example: High-Risk Policy Changes

```json
{
  "workflow_id": "content-moderation-policy",
  "mii_threshold": 0.98,
  "required_sign_offs": 3,
  "sentinel_review_required": true,
  "rationale": "Legitimacy > velocity for user-facing policy"
}
```

---

## Calibration Methodology

### Phase 1: Baseline (Current)

1. Default threshold: 0.95
2. No historical data for calibration
3. Components weighted by intuition

### Phase 2: Data Collection (Pilots)

1. Run pilot workflows with MII tracking
2. Record:
   - MII score at decision time
   - Post-hoc audit outcomes
   - Rollback frequency
   - Time-to-reconstruct intent
3. Correlate MII with outcomes

### Phase 3: Calibration (Post-Pilot)

1. Adjust weights based on predictive power
2. Adjust thresholds based on outcome correlation
3. Publish calibration results

---

## Component Details

### Provenance Completeness (PC)

Required EPICON fields:
- `epicon_id`
- `title`
- `author_name`
- `cycle`
- `scope`
- `justification` (with VALUES, REASONING, ANCHORS, BOUNDARIES, COUNTERFACTUAL)
- `counterfactuals`

PC = (fields present / fields required) * 100%

### Test/Policy Pass Rate (TP)

- CI tests passed
- Lint checks passed
- Type checks passed
- Policy compliance verified

TP = (checks passed / checks required) * 100%

### Review Quorum (RQ)

- Required approvals obtained
- CODEOWNERS satisfied
- Sentinel review completed (if required)

RQ = (approvals obtained / approvals required) * 100%

### Sentinel Challenge Score (SC)

Inverse of flag severity:
- No flags: SC = 1.0
- Low severity: SC = 0.9
- Medium severity: SC = 0.7
- High severity: SC = 0.4
- Critical severity: SC = 0.1

### Drift Score (DS)

Semantic distance from prior similar decisions:
- No drift detected: DS = 1.0
- Minor drift: DS = 0.8
- Significant drift: DS = 0.5
- Major drift: DS = 0.2

---

## Falsifiability (How to Prove MII Wrong)

Run N decisions through Mobius and compare:
- MII score
- Post-hoc audit outcomes
- Rollback frequency
- Time-to-reconstruct intent

**If low-MII decisions do not correlate with worse audit outcomes, MII is broken.**

**If high-MII decisions still produce legitimacy collapse, MII is incomplete.**

MII is a hypothesis. Help falsify and improve it.

---

## Override Recording

All overrides are recorded with:

```json
{
  "override_id": "OVERRIDE-2026-01-24-001",
  "original_mii": 0.87,
  "threshold_required": 0.95,
  "override_type": "dual-sign-off",
  "justification": "Emergency fix for production incident",
  "approvers": ["human:approver1", "human:approver2"],
  "epicon_ref": "EPICON_C-202_EMERGENCY_incident-fix_v1",
  "timestamp": "2026-01-24T15:30:00Z"
}
```

---

## Governance of MII Parameters

Changes to MII formula, weights, or default thresholds require:

- RFC filed in `docs/11-SUPPLEMENTARY/rfcs/`
- 72-hour minimum review window
- ≥2 maintainer approvals
- EPICON documenting intent and rationale

See `docs/RFC_PROCESS.md` for details.

---

*"We heal as we walk." — Mobius Substrate*
