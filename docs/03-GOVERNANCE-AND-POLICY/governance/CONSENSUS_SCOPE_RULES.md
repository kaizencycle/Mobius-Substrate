# EPICON-03 Consensus Scope Rules

**Version:** 1.0.0  
**Cycle:** C-187  
**Status:** Active  
**Last Updated:** 2026-01-10

---

## Overview

This document defines the scope-based consensus rules for the EPICON-03 Multi-Agent Consensus Engine. Different types of changes receive different levels of scrutiny based on their potential impact on system governance and authority.

---

## Scope Classification

### Governance Scope (Highest Scrutiny)

**Trigger Conditions:**
- `"governance"` in scope
- `"code_ownership"` in scope

**Consensus Parameters:**
| Parameter | Value |
|-----------|-------|
| Support Probability | 50% |
| Conditional Probability | 35% |
| Oppose Probability | 15% |
| Base Confidence | 70% |

**Rationale:** Changes to governance structures, authority boundaries, or code ownership have the highest potential for systemic impact. These require the most careful review and cannot be overridden by supermajority.

### Specs Scope (Moderate Scrutiny)

**Trigger Conditions:**
- `"specs"` in scope (without `"docs"`)

**Consensus Parameters:**
| Parameter | Value |
|-----------|-------|
| Support Probability | 65% |
| Conditional Probability | 25% |
| Oppose Probability | 10% |
| Base Confidence | 75% |

**Rationale:** Specification changes can affect system behavior and contracts. They require careful review but are less sensitive than governance changes.

### Documentation Scope (Lenient Treatment)

**Trigger Conditions:**
- `"docs"` in scope (without `"governance"`)

**Consensus Parameters:**
| Parameter | Value |
|-----------|-------|
| Support Probability | 88% |
| Conditional Probability | 10% |
| Oppose Probability | 2% |
| Base Confidence | 85% |

**Rationale:** Documentation changes typically have low governance impact. They improve clarity and accessibility without affecting system behavior or authority structures.

### CI-Only Scope (Lower Risk)

**Trigger Conditions:**
- Scope is exactly `["ci"]`
- Single-element scope containing only `"ci"`

**Consensus Parameters:**
| Parameter | Value |
|-----------|-------|
| Support Probability | 85% |
| Conditional Probability | 12% |
| Oppose Probability | 3% |
| Base Confidence | 85% |

**Rationale:** CI/CD infrastructure changes affect build and deployment processes but rarely impact governance or authority.

### Default Scope

**Trigger Conditions:**
- None of the above conditions match

**Consensus Parameters:**
| Parameter | Value |
|-----------|-------|
| Support Probability | 75% |
| Conditional Probability | 20% |
| Oppose Probability | 5% |
| Base Confidence | 80% |

---

## Supermajority Override (Documentation Scope Only)

### Rule Definition

For **documentation-scope changes only**, a supermajority override is permitted when:

1. **Scope Condition:** `"docs"` is in scope AND `"governance"` is NOT in scope
2. **Vote Condition:** At least 4 agents support AND at most 1 agent opposes
3. **ECS Threshold:** Reduced to 0.60 (from standard 0.75)

### Implementation

```python
# From epicon03_consensus.py
is_docs_scope = "docs" in self.request.scope and "governance" not in self.request.scope
has_supermajority = vote["support"] >= 4 and vote["oppose"] <= 1

if vote["oppose"] > 0:
    # Allow single dissent if supermajority supports and it's docs scope
    if is_docs_scope and has_supermajority:
        # Supermajority override - proceed with caution
        pass
    else:
        return ConsensusStatus.FAIL
```

### Rationale

1. **Lower Risk Profile:** Documentation changes rarely affect system behavior or authority
2. **Minority Protection:** Dissent is still recorded in the dissent bundle
3. **Threshold Adjustment:** The ECS threshold is lowered to 0.60 but not eliminated
4. **Governance Exclusion:** Any change touching governance CANNOT use this override

### Safeguards

Even with supermajority override:

- ✅ Dissent is preserved in the attestation record
- ✅ Dissenting agent's objections are documented
- ✅ ECS score still must meet minimum threshold (0.60)
- ✅ Full audit trail is maintained
- ✅ Override cannot be used for governance changes

---

## Condition Generation by Scope

### Documentation Scope Conditions

When an agent votes **CONDITIONAL** on a docs-scope change:
- "Verify documentation accuracy"
- "Confirm no unintended scope expansion"

**Note:** Authority change questions are NOT generated for documentation scope.

### Non-Documentation Scope Conditions

When an agent votes **CONDITIONAL** on other changes:
- "Ensure all required fields are present in intent publication"
- "Verify scope alignment with changed files"
- "Please clarify the justification for this authority change."

### Objection Patterns

**Documentation Scope:**
- "Documentation may be inaccurate or misleading"
- "Scope unclear or potentially expanding"

**Non-Documentation Scope:**
- "Intent publication missing critical fields"
- "Scope exceeds declared authority"

---

## Priority Order

When multiple scope triggers match, the following priority applies (highest first):

1. **Governance** - Always takes precedence
2. **Documentation** - Overrides CI/Specs for lenient treatment
3. **CI-only** - Applied only when CI is the sole scope
4. **Specs** - Applied when specs is present without docs
5. **Default** - Fallback for unmatched combinations

---

## Audit Trail

All consensus decisions are logged with:

- Full agent reports including stance and confidence
- ECS score breakdown
- Scope classification applied
- Whether supermajority override was used
- Dissent bundle (if any opposition)
- Attestation hash for verification

---

## Related Documents

- [EPICON-03 Specification](../../epicon/EPICON-03.md)
- [Consensus Authentication Flow](./CONSENSUS_AUTH_FLOW.md)
- [Sentinel Constitution](./SENTINEL_CONSTITUTION.md)
- [Governance Overview](./GOVERNANCE_OVERVIEW.md)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-10 | Initial documentation of scope rules |

---

*"Intelligence moves. Integrity guides. We heal as we walk."* — Mobius Systems
