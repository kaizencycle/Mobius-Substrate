# Sentinel Rule: Cycle Binding Protocol

**Status:** Active  
**Version:** 1.0  
**Effective:** Cycle C-148+  
**Binding Authority:** MCP v1.0

---

## Purpose

This document defines how Sentinels (ATLAS, AUREA, ECHO) must interact with the Mobius Cycle Protocol (MCP) v1.0.

**Core Rule:** Sentinels may NOT approve a PR unless MCP conditions are met.

---

## Sentinel Responsibilities

### 1. ATLAS (Architectural Sentinel)

**Role:** Verify architectural coherence and system integration.

**MCP Requirements:**
- [ ] Cycle metadata present (C-XXX format)
- [ ] PR Bundle includes Technical Changes section
- [ ] Code structure aligns with Mobius architecture
- [ ] No architectural violations detected
- [ ] Integration points properly documented

**Approval Criteria:**
- Architecture is coherent
- Design patterns are consistent
- System integration is sound
- Scalability considerations addressed

**Rejection Criteria:**
- Architectural violations detected
- Inconsistent design patterns
- Poor system integration
- Missing integration documentation

---

### 2. AUREA (Correctness Sentinel)

**Role:** Verify correctness, stability, and moral coherence.

**MCP Requirements:**
- [ ] GI Score ≥ 0.95 (hard requirement)
- [ ] Test coverage adequate
- [ ] Logic correctness verified
- [ ] Security analysis passed
- [ ] Moral coherence checked (Virtue Accords compliance)

**Approval Criteria:**
- Code logic is correct
- Tests pass and coverage is adequate
- No security vulnerabilities
- Aligns with Virtue Accords

**Rejection Criteria:**
- GI Score < 0.95
- Tests failing or coverage insufficient
- Logic errors detected
- Security vulnerabilities found
- Virtue Accords violations

---

### 3. ECHO (Drift Sentinel)

**Role:** Verify drift resistance, reflection alignment, and recursive learning.

**MCP Requirements:**
- [ ] ECHO Score ≥ 0.95 (hard requirement)
- [ ] No drift violations detected
- [ ] Reflection aligns with declared intent
- [ ] Recursive learning demonstrated
- [ ] Integrity preserved or improved

**Approval Criteria:**
- No drift violations
- Reflection aligns with intent
- Shows improvement over baseline
- Integrity maintained or enhanced

**Rejection Criteria:**
- ECHO Score < 0.95
- Drift violations detected
- Reflection misaligned with intent
- No recursive learning demonstrated
- Integrity degraded

---

## Consensus Requirement

**All three sentinels must approve for PR merge.**

**Consensus Rule:**
- If any sentinel rejects → PR blocked
- If any sentinel requests changes → PR blocked until resolved
- All three must explicitly approve → PR can merge

**Exception:** Emergency hotfixes may use fast-track validation, but still require all three sentinels to acknowledge.

---

## Sentinel Review Process

### Step 1: Initial Review

Each sentinel reviews PR independently:

1. Check for cycle metadata
2. Validate PR Bundle format
3. Review assigned section (architecture/correctness/drift)
4. Compute relevant scores (GI/ECHO)
5. Make approval/rejection decision

### Step 2: Consensus Check

After individual reviews:

1. Check if all three sentinels approved
2. If yes → PR ready for merge
3. If no → Block merge, request changes

### Step 3: Re-review After Changes

If changes requested:

1. Sentinels re-review updated PR
2. Verify fixes address concerns
3. Re-run validation checks
4. Update approval status

---

## Integration with GitHub Actions

**Automated Checks:**
- GitHub Actions workflow (`.github/workflows/mcp-enforcer.yml`) runs first
- Validates cycle metadata, GI Score, ECHO Score
- Blocks PR if automated checks fail

**Sentinel Review:**
- Sentinels review after automated checks pass
- Sentinels provide detailed feedback
- Sentinels make final approval decision

**Workflow:**
```
PR Created
  ↓
GitHub Actions (Automated Checks)
  ↓
  ├─ Pass → Sentinel Review
  │         ↓
  │         ├─ All Approve → Merge
  │         └─ Any Reject → Request Changes
  │
  └─ Fail → Block PR
```

---

## Sentinel Communication

### Approval Format

**ATLAS:**
```
✅ ATLAS Approved

Architecture Review:
- Code structure: ✅ Coherent
- Design patterns: ✅ Consistent
- Integration: ✅ Sound
- Scalability: ✅ Addressed

No architectural violations detected.
```

**AUREA:**
```
✅ AUREA Approved

Correctness Review:
- GI Score: 0.97 ✅
- Tests: ✅ All passing
- Logic: ✅ Correct
- Security: ✅ No vulnerabilities
- Virtue Accords: ✅ Compliant

Code is correct and stable.
```

**ECHO:**
```
✅ ECHO Approved

Drift Review:
- ECHO Score: 0.98 ✅
- Drift: ✅ No violations
- Reflection: ✅ Aligned with intent
- Learning: ✅ Improvement demonstrated
- Integrity: ✅ Preserved

No drift detected, integrity maintained.
```

### Rejection Format

**Example:**
```
❌ ATLAS Request Changes

Architecture Issues:
- Missing integration documentation
- Inconsistent design pattern in `src/utils/helpers.ts`
- Scalability concerns in `api/routes/cycles.ts`

Please address these issues before resubmission.
```

---

## Enforcement

### Hard Requirements (Cannot Override)

1. **GI Score ≥ 0.95** — Enforced by AUREA
2. **ECHO Score ≥ 0.95** — Enforced by ECHO
3. **Cycle metadata present** — Enforced by all sentinels
4. **All three sentinels approve** — Enforced by consensus rule

### Soft Requirements (Can Override with Justification)

1. Test coverage thresholds (can be lower for documentation-only changes)
2. Documentation completeness (can be deferred with issue tracking)
3. Performance benchmarks (can be relaxed for non-critical paths)

---

## Exceptions

### Emergency Hotfixes

**Process:**
1. Include `[EMERGENCY]` tag in PR
2. Still require GI Score ≥ 0.95
3. Fast-track validation (reduced review time)
4. All three sentinels must acknowledge (even if expedited)
5. Post-merge attestation required

### Documentation-Only Changes

**Process:**
1. Relaxed GI threshold (≥ 0.90 instead of ≥ 0.95)
2. Still require cycle metadata
3. Still require PR Bundle
4. Still require all three sentinels to acknowledge

---

## Related Documents

- [`MCP_v1.0.md`](../../06-OPERATIONS/protocols/MCP_v1.0.md) — Full MCP specification
- [`pr-cycle-template.md`](../../04-guides/development/pr-cycle-template.md) — PR Bundle template
- [`.github/workflows/mcp-enforcer.yml`](../../../.github/workflows/mcp-enforcer.yml) — Automated enforcement

---

## Version History

| Version | Date | Changes | Cycle |
|---------|------|---------|-------|
| 1.0 | 2025-11-29 | Initial release | C-148 |

---

*Cycle C-148 • 2025-11-29*  
*Sentinel Rule: Cycle Binding Protocol*  
*"All three must approve. No exceptions."*
