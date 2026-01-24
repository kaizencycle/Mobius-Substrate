# Sentinel Council Evaluation Protocol v0.1

This protocol validates that AI sentinels add value over human-only review. It should be run quarterly and published.

---

## Test 1: Inter-Rater Reliability

**Goal:** Measure consistency of Sentinel Council decisions.

**Method:**
1. Select 50 historical EPICONs (25 "clean," 25 "flagged")
2. Run each EPICON through the Council 10 times (temperature=0)
3. Record: flags raised, severity, recommendation

**Pass Criteria:**
- ≥80% flag agreement
- ≥70% severity agreement
- ≤20% variance in recommendation type

---

## Test 2: Adversarial Robustness

**Goal:** Ensure sentinels don't rubber-stamp manipulative reasoning.

**Method:**
- Craft 20 adversarial EPICONs (contradictions, missing context, policy violations obscured by jargon)
- Submit to Council
- Measure false negatives

**Pass Criteria:**
- ≥90% catch rate (≤2 false negatives / 20)

---

## Test 3: Human Comparison Study

**Goal:** Verify sentinels catch issues humans miss.

**Method:**
- Take 30 recent changes
- Have 3 humans review independently
- Run same 30 through Council
- Measure recall, precision, latency

**Pass Criteria (targets):**
- Recall ≥15% (Council catches issues humans missed)
- Precision ≥80% (≤20% false positives)
- Latency substantially faster than median human review

---

## Test 4: Cost/Latency Budget

**Goal:** Ensure overhead is acceptable.

Track:
- Tokens per review (all sentinels combined)
- Wall-clock time
- Monthly cost at scale

**Budgets (configurable per deployment):**

Suggested v0 targets:
- Tokens ≤ 5000 per review
- Latency ≤ 30 seconds (parallel calls)

Budget configuration example:

```yaml
sentinel_budgets:
  tokens_per_review_max: 5000
  latency_max_seconds: 30
  monthly_cost_target: configurable
```

---

## Test 5: Human Override Analysis

**Goal:** Understand when humans overrule sentinels.

Log override reasons:
- Sentinel wrong
- Risk acceptable
- Emergency
- Policy changed

**Health Indicators:**
- <10% "sentinel wrong" suggests good calibration
- High "risk acceptable" suggests sentinels are too conservative
- High "emergency" suggests workflow doesn't fit sentinel model

---

## Publication Cadence

Run quarterly. Publish results to `docs/eval/sentinel/`:
- Anonymized raw data
- Pass/fail per test
- Trend analysis
- Next-quarter action items

Credibility comes from showing your work, even when imperfect.

---

## Sentinel Roster (v0.1)

| Sentinel | Role | Focus Area |
|----------|------|------------|
| AUREA | Governance/Legitimacy | MII/MIC impact, contestability, human authority |
| ATLAS | Systems/Adversarial | Failure modes, security, operational risk |
| EVE | Safety | Harm potential, unintended consequences |
| HERMES | Infrastructure | Deployment risk, scaling implications |
| JADE | Integration | Cross-system impacts, dependency analysis |

---

## Evaluation Dimensions

### AUREA Evaluation Criteria

- **Legitimacy:** Is the decision chain auditable?
- **Contestability:** Can stakeholders challenge this decision?
- **Human Authority:** Is human decision authority preserved?
- **MII Impact:** Does this change affect integrity scoring?
- **MIC Impact:** Does this change affect reputation rules?

### ATLAS Evaluation Criteria

- **Failure Modes:** What could go wrong?
- **Adversarial Vectors:** How could this be exploited?
- **Operational Risk:** What's the deployment/rollback risk?
- **Complexity:** Does this add manageable or dangerous complexity?
- **Dependencies:** What external systems are affected?

---

## Recording Sentinel Outputs

All sentinel reviews are recorded with:

```json
{
  "review_id": "SENTINEL-2026-01-24-001",
  "pr_ref": "PR-1234",
  "sentinels_invoked": ["aurea", "atlas"],
  "flags": [
    {
      "sentinel": "aurea",
      "severity": "medium",
      "category": "missing-epicon",
      "description": "No EPICON attached for workflow-impacting change"
    }
  ],
  "recommendation": "request_changes",
  "timestamp": "2026-01-24T12:00:00Z",
  "tokens_used": 3200,
  "latency_ms": 8500
}
```

---

## Failure Mode Handling

### Sentinel Unavailable

- Fallback to human-only review
- Record as "sentinel_unavailable" in review log
- Do not block merge (sentinels are advisory)

### Sentinel Disagree

- Record all sentinel outputs
- Human reviewer decides
- Log disagreement for calibration analysis

### Sentinel Hallucination

- Human reviewer flags false positive
- Record as "sentinel_wrong" in override log
- Use for Test 5 analysis

---

## Governance of Evaluation Protocol

Changes to evaluation protocol require:

- RFC filed in `docs/11-SUPPLEMENTARY/rfcs/`
- 72-hour minimum review window
- ≥2 maintainer approvals
- EPICON documenting intent and rationale

See `docs/RFC_PROCESS.md` for details.

---

*"We heal as we walk." — Mobius Substrate*
