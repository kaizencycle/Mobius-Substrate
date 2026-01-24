# Founder Standing EPICON Template (v0.1)

**File:** `docs/templates/EPICON_FOUNDER_STANDING.md`
**Status:** Canonical
**Applies to:** All EPICONs invoking custodial or transitional authority prior to formal governance ratification

---

## Purpose

This template exists to make authority explicit rather than implicit.

It prevents legitimacy drift by ensuring that any exercise of founder or custodian authority is:
- **Declared** — authority is named, not assumed
- **Scoped** — boundaries are explicit
- **Time-bounded** — sunset conditions exist
- **Contestable** — dissent pathways are preserved
- **Reversible** — rollback is always possible

If this section is omitted when authority is exercised, the EPICON is considered **procedurally incomplete**.

---

## How to Use This Template

For any EPICON involving authority changes:

1. Copy the "Authority Provenance & Standing" section below
2. Adjust "Scope Constraints" and "Sunset Condition" for your specific case
3. Add this reference at the top of your authority section:

```
*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*
```

For PR reviewers and sentinels:
- If authority is exercised without this section → request clarification
- If authority exceeds declared scope → flag as violation
- If authority is implicit → fail the consensus check

---

## Authority Provenance & Standing (Copy This Section)

```markdown
## Authority Provenance & Standing

*Authority declared using `docs/templates/EPICON_FOUNDER_STANDING.md` v0.1*

This EPICON invokes **founder–custodian standing** under Mobius governance norms at pre-charter phase (v0).

**At the time of this action:**
- Mobius has no elected governance council
- No external stakeholders have delegated authority
- No ratified charter supersedes founder custodianship

As project originator and current custodian, the proposer is authorized to perform transitional governance actions necessary to:
- Establish initial accountability infrastructure
- Assign narrowly scoped review authority
- Define consensus and audit mechanisms
- Enable empirical validation of governance systems

**This authority is not permanent** and is exercised under the following constraints.

### Scope Constraints

The authority exercised in this EPICON is:
- **Narrowly scoped** to the change explicitly described
- **Non-transferable** (cannot be delegated further without new EPICON)
- **Non-expansive** (does not create new implicit powers)
- **Fully auditable** via EPICON records and ledger history

No authority beyond what is written here is implied.

### Temporality & Revocation

This authority is **transitional**.

It is expected to be:
- Re-reviewed upon formation of a governance council
- Ratified, modified, or revoked by successor processes
- Superseded by a formal charter once adopted

This EPICON explicitly records authority so that it may later be contested, amended, or invalidated with full historical context.

### Legitimacy Rationale

This authority action is justified because:
- The absence of explicit authority creates implicit power
- Implicit power is less accountable than declared power
- Declared authority allows audit, dissent, and redesign

This EPICON does not assert moral superiority, permanence, or exemption.
It asserts **responsibility with traceability**.

### Acknowledgement of Risk

The proposer acknowledges that:
- Founder authority is inherently asymmetric
- Asymmetry must be constrained, not normalized
- Future governance may judge this action incorrect

This EPICON exists so that such judgment is possible.

### Sunset Condition

This authority expires automatically upon:
- Formation of a ratified governance council
- Adoption of a formal Mobius charter
- Explicit revocation via successor EPICON

Until then, the authority remains contestable at all times.
```

---

## Sentinel Interpretation Guidance

Sentinel agents reviewing EPICONs with authority changes should evaluate:

| Check | Question |
|-------|----------|
| Declaration | Is authority explicitly declared? |
| Scope | Is the scope minimal and bounded? |
| Revocation | Are revocation pathways preserved? |
| Future Governance | Is future governance acknowledged? |
| Temporality | Is authority marked as transitional? |

Sentinels should **not** assess whether the proposer "deserves" authority — only whether authority is **declared and constrained**.

---

## Why This Matters

This template represents a rare practice: **formalizing founder power**.

Most projects leave founder authority implicit, which creates:
- Legitimacy drift ("who decided this?")
- Accountability gaps ("no one owned the decision")
- Governance theater (rules exist but aren't enforced)

By using this template, Mobius:
- Makes founder power reviewable
- Makes it temporary by default
- Invites future revocation
- Creates audit trails for all authority exercises

This is not bureaucracy. This is **legitimacy engineering**.

---

## Versioning

- **Template version:** v0.1
- **Created:** C-202 (2026-01-24)
- **Approved via:** EPICON-03 Multi-Agent Consensus
- **Maintainers:** kaizencycle, michaeljudan

---

*"We heal as we walk." — Mobius Substrate*
