# PR Intent: Documentation Organization (Cycle C-178)

```intent
epicon_id: EPICON_C-178_DOCS_organize-documentation_v1
title: Organize Documentation Structure
cycle: C-178
scope: docs
mode: standard
issued_at: 2026-01-05T00:00:00Z
expires_at: 2026-04-05T00:00:00Z
author: ATLAS (Claude Agent)
```

## Summary

Reorganize Mobius Substrate documentation to improve discoverability and logical structure.

## Changes Made

### 1. Created Master Navigation Hub
- **Added:** `DOCS.md` at repository root
- **Purpose:** Single entry point for all documentation paths
- **Routes:** External stakeholders (4 cathedrals) + Contributors/Operators

### 2. Consolidated Scattered Directories
- **Moved:** `DIPLOMACY/` → `FOR-GOVERNMENTS/DIPLOMACY/`
  - Rationale: Diplomatic materials are policy-oriented content
  - Better alignment with "Policy Cathedral" structure

- **Moved:** `CIVIC/` → `docs/03-GOVERNANCE-AND-POLICY/civic/`
  - Rationale: Civic validator protocols belong in governance docs
  - Maintains separation from organizational governance (FOUNDATION/, GOVERNANCE/)

### 3. Updated Cross-References
- Updated `REPO_MAP_TREE.md` to reflect new directory locations
- Updated `GOVERNANCE/ROLES.md` links to CIVIC files
- Updated `FOR-GOVERNMENTS/README.md` to include DIPLOMACY section
- Updated main `README.md` to link to new DOCS.md navigator

## Files Changed

### Created
- `DOCS.md` (new master navigation file)

### Moved
- `DIPLOMACY/` → `FOR-GOVERNMENTS/DIPLOMACY/`
- `CIVIC/` → `docs/03-GOVERNANCE-AND-POLICY/civic/`

### Modified
- `README.md` (added DOCS.md link)
- `REPO_MAP_TREE.md` (updated directory references)
- `GOVERNANCE/ROLES.md` (updated CIVIC/ links)
- `FOR-GOVERNMENTS/README.md` (added DIPLOMACY section)

## Intent Justification

**Problem:** Documentation was scattered with multiple entry points and unclear navigation for different user types.

**Solution:** Create unified navigation (DOCS.md) and consolidate thematically-related directories.

**Integrity Impact:** Improves documentation coherence without removing or degrading existing content. All moves preserve content integrity.

## Divergence Assessment

**Severity:** Low
**Rationale:** Organizational change only, no content modification or deletion

## Related Documents

- [Documentation Strategy](./docs/00-META/NAVIGATION_GUIDE.md)
- [Four Cathedrals Concept](./00-START-HERE/README.md)
- [Repository Structure](./CONTRIBUTING.md)

---

*"Intelligence moves. Integrity guides. We heal as we walk."*

**Cycle C-178 | EPICON Production Era | Documentation Organization**
