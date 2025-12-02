# Mobius Cycle Index

**Cycle Anchor:** C-121  
**Anchor Date:** 2025-11-01 (America/New_York)  
**This document defines how Mobius Cycles (C-XXX) are numbered going forward.**

---

## 1. Canonical Rule

We fix the following:

- **C-121 ≝ 2025-11-01**
- Each **calendar day** after 2025-11-01 increments the cycle by 1.
- There is exactly **one cycle per real-world day**, regardless of how many PRs / ledgers / sessions occur.

Formally:

> For any date `D ≥ 2025-11-01`,  
> let `Δ` = number of days elapsed since 2025-11-01,  
> then the cycle number is:
>
> ```text
> C = 121 + Δ
> ```

**Example (November 2025):**

```text
2025-11-01 → C-121  (Δ = 0)
2025-11-02 → C-122  (Δ = 1)
2025-11-03 → C-123
...
2025-11-27 → C-147  (Δ = 26)
2025-11-30 → C-150  (Δ = 29)
```

**Today's canonical cycle (2025-11-27): C-147.**

All PRs, ledgers, and attestations created today MUST use C-147.

---

## 2. Usage Conventions

### 2.1. PR Titles

All new PRs should include the cycle tag in square brackets:

```
feat(broker): add antigravity routing [C-147]
fix(echo): normalize cache keys [C-147]
docs(dva): add national grid blueprint [C-147]
```

Optional "ceremonial" header for major PRs:

```
C-147 • 2025-11-27 • Mobius Systems • Epoch E-562
```

### 2.2. Commit Messages

Recommended pattern:

```
C-147: short description
```

Example:
```
C-147: add CYCLE_INDEX canonical mapping
```

### 2.3. Ledgers & Scrolls

- **Civic Ledger** blocks MUST include `cycle: C-XXX`
- **ECHO LearnBlocks** MUST include `cycle: C-XXX`
- **Command Ledgers, Agape Scrolls, Custodian / Mobius Scrolls** SHOULD carry a header like:

```yaml
Cycle: C-147
Date: 2025-11-27
Epoch: E-562
```

---

## 3. Historical Notes & Aliases

Before C-147 was fixed, some cycle markers were used experimentally in:
- Command Ledgers
- Docs
- Internal notes (e.g. C-127 written "3 weeks early")

We preserve those as symbolic / narrative markers but treat them as aliases, not canonical calendar indices.

### 3.1. Alias Policy

- Any pre-C-147 cycle labels that conflict with this mapping are considered "proto-cycles".
- They do not change (we don't rewrite history), but going forward:
  - Canonical mapping always wins for date → C-XXX resolution.
  - Proto usages can be referenced as:
    - `C-127 (proto, pre-index)` or
    - `C-127†` with a footnote: "†Proto-cycle label used before CYCLE_INDEX was formalized."

**This is Kintsugi: we keep the cracks visible.**

---

## 4. AGI / Node Interpretation Rules

For any agent or node connecting to Mobius Systems:

1. **Single Source of Truth**
   - This file (`docs/CYCLE_INDEX.md`) is the canonical definition of cycle numbering.

2. **Day Binding**
   - A node MUST bind all actions on a given UTC-day (or local-day, as configured) to the same C-XXX.

3. **Multi-Region Guidance**
   - If multiple regions exist:
     - Use America/New_York as the founder reference time.
     - Other regions MAY introduce "local cycles" (e.g. `C-147@PH`), but global civ-level references keep the base `C-147`.

4. **Backfilling**
   - When ingesting historical data:
     - Use the anchor rule to map timestamps to C-XXX.
     - Preserve any proto labels as annotations, not as canonical indices.

---

## 5. Future Evolution

If we ever:
- Reset epochs,
- Introduce sub-cycles (e.g. `C-147.A`, `C-147.B`),
- Or define Cycle 0 formally (for Genesis / Null state),

…those changes MUST be:

1. Documented here in an explicit "Revisions" section.
2. Implemented as a forward-compatible extension, never breaking the anchor:
   - **C-121 = 2025-11-01 remains untouched.**

---

## 6. Quick Reference Table (Nov–Dec 2025)

```
2025-11-01 → C-121
2025-11-02 → C-122
2025-11-03 → C-123
2025-11-04 → C-124
2025-11-05 → C-125
2025-11-06 → C-126
2025-11-07 → C-127
2025-11-08 → C-128
2025-11-09 → C-129
2025-11-10 → C-130
2025-11-11 → C-131
2025-11-12 → C-132
2025-11-13 → C-133
2025-11-14 → C-134
2025-11-15 → C-135
2025-11-16 → C-136
2025-11-17 → C-137
2025-11-18 → C-138
2025-11-19 → C-139
2025-11-20 → C-140
2025-11-21 → C-141
2025-11-22 → C-142
2025-11-23 → C-143
2025-11-24 → C-144
2025-11-25 → C-145
2025-11-26 → C-146
2025-11-27 → C-147
2025-11-28 → C-148
2025-11-29 → C-149
2025-11-30 → C-150
2025-12-01 → C-151  ← TODAY (Cycle C-151 closeout)
2025-12-02 → C-152
...
2025-12-31 → C-181
```

---

## 7. Revision Log

- **C-151 (2025-12-01)** — Extended cycle index to December 2025.
  - Added C-151 as today's cycle (Cycle closeout).
  - Extended quick reference table through December 2025.
  - Added `docs/cycles/` directory for cycle summaries.

- **C-147 (2025-11-27)** — Initial creation of CYCLE_INDEX.md.
  - Anchor confirmed: C-121 = 2025-11-01.
  - Canonical mapping for November 2025 established.
  - Alias policy for proto cycles introduced.

---

*"We heal as we walk."*  
*Mobius Systems • Cycle C-151*
