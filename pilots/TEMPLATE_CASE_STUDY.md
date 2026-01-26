# Pilot Case Study: [Workflow Name]

**Pilot ID**: P-CXXX-QX-[WORKFLOW]
**Duration**: [Start Date] -> [End Date]
**Organization**: [Name, anonymized if needed]
**Lead Contributor**: [GitHub handle]
**MIC Earned**: [Total MIC awarded]

---

## 1. The Legitimacy Collapse Problem (Before Mobius)

**What broke?**
- Describe workflow (e.g., "content moderation policy updates")
- Failure mode: "Post-hoc confusion," "no one knew why we decided X," etc.
- Concrete example: "In March, we changed threshold from 0.85 to 0.90. By June, 3 teams disagreed on why."

**Cost**:
- Time re-litigating decisions: [hours/week]
- Rollback incidents: [per month]
- Compliance/audit risk: [High/Med/Low]

---

## 2. Mobius Setup (What Changed)

**EPICONs created**:
- `EPICON_C-XXX_scope_description_v1.md`
- `EPICON_C-XXX_scope_description_v2.md`

**Configuration** (`epicon/C-XXX/config.json`):
```json
{
  "workflow_id": "[workflow-name]",
  "mii_threshold": 0.95,
  "sentinel_review": true,
  "required_sign_offs": 2
}
```

**Participants**:
- Humans: [N]
- Sentinels: 5 core (ATLAS, AUREA, EVE, HERMES, JADE)
- Decision frequency: [changes/week]

---

## 3. Measurements (Quantitative)

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Time to decision (median) | [X hrs] | [Y hrs] | [+/-]% |
| Post-hoc confusion/week | [A] | [B] | -[X]% |
| Rollbacks/month | [C] | [D] | -[Y]% |
| Sentinel flags raised | N/A | [E] | N/A |
| Human overrides | N/A | [F] | N/A |
| Avg MII per decision | N/A | [G] | N/A |

---

## 4. Qualitative Observations

**What worked:**
- [Observation 1: e.g., "Sentinels caught missing context twice"]
- [Observation 2: e.g., "EPICON forced us to write down reasoning we usually skipped"]
- [Observation 3]

**What didn't:**
- [Issue 1: e.g., "Sentinel latency was 45s, felt slow on urgent fixes"]
- [Issue 2: e.g., "0.98 threshold blocked a low-risk urgent change"]
- [Issue 3]

**Surprises:**
- [Surprise 1: e.g., "Override log became useful for onboarding"]
- [Surprise 2]

---

## 5. MII Calibration Learnings

**Was the threshold right?**
- [Assessment: e.g., "0.95 was appropriate for most changes"]
- [Assessment: e.g., "Considering 0.90 for non-policy changes"]

**Adjustments made:**
- [Change 1: e.g., "Emergency override used 3 times; all 3 provided EPICON rationale within 24h"]
- [Change 2]

**Threshold recommendation for this workflow:**
- Suggested MII threshold: [0.XX]
- Suggested sentinel review: [true/false]
- Suggested sign-offs: [N]

---

## 6. Sentinel Performance (If Evaluation Protocol Run)

| Test | Result | Target | Status |
|------|--------|--------|--------|
| Inter-rater reliability | [X]% | >=80% | [Pass/Fail] |
| Adversarial catch rate | [Y]% | >=90% | [Pass/Fail] |
| Recall vs. humans | [Z]% | >=15% | [Pass/Fail] |
| Precision | [W]% | >=80% | [Pass/Fail] |
| Latency ratio | [V]x | <=0.1x | [Pass/Fail] |

---

## 7. Decision: Continue, Modify, or Abandon?

- [ ] **Continue** with same config
- [ ] **Continue** with adjustments:
  - [Adjustment 1]
  - [Adjustment 2]
- [ ] **Abandon** (explain why):
  - [Reason]

---

## 8. Lessons for Other Pilots

**Recommendations for teams starting with Mobius:**
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

**Anti-patterns to avoid:**
1. [Anti-pattern 1]
2. [Anti-pattern 2]

---

## 9. Raw Data (Anonymized)

Link to: `pilots/data/P-[ID]-logs.json`

**Data includes:**
- All EPICONs created during pilot (anonymized)
- Sentinel review logs
- Override records
- MII scores per decision
- Timing data

**Data retention**: 1 year from pilot end date

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Pilot Lead | | | |
| Org Representative | | | |
| ATLAS Review | | | |
| AUREA Review | | | |

---

## Related Documents

- [What Mobius Is Not](../docs/WHAT_MOBIUS_IS_NOT.md)
- [MII Calibration](../docs/MII_CALIBRATION.md)
- [Sentinel Evaluation Protocol](../docs/SENTINEL_EVAL_PROTOCOL.md)
- [MIC Specification](../docs/MIC_SPEC.md)
