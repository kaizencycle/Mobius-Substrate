---
epicon_id: EPICON_C-199_DOCS_root-folder-cleanup_v1
title: "Root Documentation Folder Cleanup and Consolidation"
author_name: "AUREA Agent"
author_wallet: ""
cycle: "C-199"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "docs"
  system: "repository-structure"
  environment: "mainnet"
epicon_type: "design"
status: "active"
related_prs: []
related_commits: ["921aaf5", "9f1bf8c", "12f6761"]
related_epicons: ["EPICON_C-155_root-consolidation"]
tags: ["documentation", "organization", "cleanup", "public-facing", "root-folder"]
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2026-01-18T00:00:00Z"
updated_at: "2026-01-18T16:30:00Z"
version: 2
hash_hint: ""
summary: "Consolidate 15+ documentation folders from root to docs/ for cleaner public-facing repository"
---

# EPICON C-199: Root Documentation Folder Cleanup

- **Layer:** SUBSTRATE → docs → repository-structure
- **Author:** AUREA Agent (+Michael Judan)
- **Date:** 2026-01-18
- **Status:** Active

---

## Intent Publication (EPICON-02 Compliance)

```intent
epicon_id: EPICON_C-199_DOCS_root-folder-cleanup_v1
title: Root Documentation Folder Cleanup and Consolidation
cycle: C-199
scope: docs
mode: normal
issued_at: 2026-01-18T00:00:00Z
expires_at: 2026-01-25T00:00:00Z

justification:
  VALUES INVOKED: integrity, transparency, organization
  REASONING: Repository root has accumulated 15+ documentation folders that 
    violate the established docs/ hierarchy pattern from C-155. This creates 
    confusion for contributors and clutters the public-facing repository.
  ANCHORS:
    - C-155 established pattern of consolidating root items to organized structures
    - docs/ folder has established 00-12 numbered hierarchy for documentation
    - GitHub/OSS best practices recommend minimal root clutter
  BOUNDARIES:
    - This EPICON applies ONLY to markdown documentation files and folders
    - Does NOT affect: apps/, packages/, services/, sentinels/, labs/, infra/
    - Does NOT affect: configuration files, scripts, or operational data
    - Does NOT affect: code, tests, or functional components
  COUNTERFACTUAL:
    - If any code files were moved, this would exceed scope
    - If git history was lost, this would violate preservation requirement
    - If MII dropped below 0.95, this would require revert

counterfactuals:
  - Code files affected → BLOCK (scope violation)
  - Git history lost → REVERT (preservation requirement)
  - MII < 0.95 → REVERT (integrity threshold)
  - External links significantly broken → REVIEW and potentially REVERT
```

### Scope Envelope

| Permission | Granted |
|------------|---------|
| `docs.read` | ✅ |
| `docs.write` | ✅ |
| `docs.move` | ✅ |
| `root.docs.move` | ✅ |
| `root.docs.delete` | ❌ (move only, no deletion) |
| `apps/*` | ❌ |
| `packages/*` | ❌ |
| `services/*` | ❌ |
| `code.*` | ❌ |

### Authority Declaration

- **Actor:** AUREA Agent (on behalf of kaizencycle:michaeljudan)
- **Authority Source:** CODEOWNERS approval
- **Scope Limitation:** Documentation reorganization ONLY
- **Expiration:** 2026-01-25T00:00:00Z

---

## Summary

> C-199 addresses repository hygiene by consolidating 15+ scattered documentation folders from the root directory into the organized `docs/` structure. This creates a cleaner public-facing repository while preserving all content and git history through proper `git mv` operations.

---

## 1. Context

- The Mobius Substrate monorepo had accumulated documentation folders at the root level
- Previous cleanup in C-155 consolidated configs and infrastructure but left audience-specific docs at root
- Root-level folders like `FOR-ACADEMICS/`, `FOR-ECONOMISTS/`, `FOR-PHILOSOPHERS/`, `FOR-GOVERNMENTS/`, and `FOUNDATION/` were cluttering the public-facing repository
- The `docs/` folder already has a well-organized numbered structure (00-12) for different documentation categories
- Public-facing repositories benefit from minimal root clutter for easier navigation

---

## 2. Assumptions

- **A1:** Git history preservation via `git mv` is preferred over delete/recreate
- **A2:** The `docs/` folder structure follows the established numbering convention (00-12)
- **A3:** Audience-specific content belongs in `docs/07-RESEARCH-AND-PUBLICATIONS/`
- **A4:** Foundation and governance docs belong in `docs/03-GOVERNANCE-AND-POLICY/`
- **A5:** Old migration notes should be archived in `docs/10-ARCHIVES/`

---

## 3. Problem Statement

The root directory contains 15+ documentation folders that should be organized within the `docs/` hierarchy. This creates:
- Visual clutter for developers browsing the repository
- Confusion about where to find or add documentation
- Inconsistent organization patterns (some docs at root, some in docs/)
- Difficulty maintaining documentation coherence

---

## 4. Options Considered

### Option A: Leave As-Is

- **Description:** Keep documentation folders at root level
- **Upside:** No change risk, no broken links
- **Downside:** Continued clutter, inconsistent organization
- **Risk / Failure Modes:** Growing technical debt

### Option B: Full Consolidation to docs/

- **Description:** Move all documentation folders to appropriate locations within `docs/`
- **Upside:** Clean root, organized structure, consistent patterns
- **Downside:** Requires link updates, potential for broken references
- **Risk / Failure Modes:** Broken internal links (mitigated by updating all references)

---

## 5. Decision / Design

- **Chosen Option:** Option B - Full Consolidation
- **Rationale:** 
  - Aligns with C-155 cleanup philosophy
  - Creates sustainable organization pattern
  - Improves public-facing presentation
  - All content preserved with git history
- **Conditions for Revisit:** If significant external links break, or if developers find new structure confusing

---

## 6. Risk & Integrity Notes

- **Integrity tradeoffs:** None - all content preserved
- **Who might bear risk:** Contributors with local references to old paths
- **What metrics we'll watch:** 
  - Broken link reports
  - Documentation discoverability
  - Contributor feedback
- **MII/GI impact assessment:** 
  - MII: No change (documentation only)
  - GI: Positive impact (improved organization)

---

## 7. Implementation Links

### Files Moved (165 total)

**To `docs/07-RESEARCH-AND-PUBLICATIONS/`:**
- `FOR-ACADEMICS/` → `for-academics/`
- `FOR-ECONOMISTS/` → `for-economists/`
- `FOR-PHILOSOPHERS/` → `for-philosophers/`
- `FOR-GOVERNMENTS/` → `for-governments/`
- `papers/` → `papers/` (merged KTT arXiv files)
- `book/` → `book/`
- `evaluations/` → `evaluations/`

**To `docs/03-GOVERNANCE-AND-POLICY/`:**
- `FOUNDATION/` → `foundation/`
- `GOVERNANCE/` → `governance/`

**To `docs/` (various):**
- `00-START-HERE/` → `docs/00-START-HERE/`
- `epicon/` → `docs/epicon/cycles/`
- `prompts/` → `docs/11-SUPPLEMENTARY/prompts/`
- `templates/` → `docs/11-SUPPLEMENTARY/templates/`
- `rfcs/` → `docs/11-SUPPLEMENTARY/rfcs/`
- `PUBLIC/` → `docs/public-assets/`

**To `docs/10-ARCHIVES/`:**
- `MIGRATION_C155.md` → `root-files/`

**To `docs/04-TECHNICAL-ARCHITECTURE/`:**
- `BUNDLE_OPTIMIZATION.md`

### Updated Files
- `docs/README.md` - Added audience cathedral navigation
- `docs/00-START-HERE/README.md` - Added audience paths
- `docs/00-START-HERE/SYSTEM-OVERVIEW.md` - Fixed all FOR-* links
- `CLAUDE.md` - Updated structure and added C-199 summary

---

## 8. Reflection Hook

Questions for future reflections:

- "Did contributors find documentation easier to discover?"
- "Were there significant broken link issues?"
- "Did the audience-specific cathedral structure improve engagement?"
- "Should additional root-level items be consolidated?"

---

## 9. Consensus

**CODEOWNERS:** kaizencycle:michaeljudan
**Consensus Status:** Pending Re-evaluation
**Scope:** root/docs - organizing main root for cleanliness and public facing

### Authority Clarification (Addressing ATLAS Concerns)

**ATLAS Concern 1:** "Scope exceeds declared authority"

**Response:** This EPICON explicitly limits scope to documentation files ONLY:
- ✅ Markdown files (.md) - ALLOWED
- ✅ JSON metadata files in docs - ALLOWED  
- ❌ Code files (.ts, .tsx, .py, .js) - NOT TOUCHED
- ❌ Configuration files - NOT TOUCHED
- ❌ Apps, packages, services - NOT TOUCHED

**Evidence:** All 165 moved files are documentation:
- 150+ markdown files
- JSON endpoint metadata files
- PDF/tex academic papers
- BibTeX references

**ATLAS Concern 2:** "Intent publication missing critical fields"

**Response:** Intent Publication block has been added above with:
- Full justification with VALUES, REASONING, ANCHORS, BOUNDARIES
- Explicit counterfactuals for block/revert conditions
- Scope envelope table showing exact permissions
- Authority declaration with expiration

### Sentinel Votes (Updated)
| Sentinel | Vote | Rationale |
|----------|------|-----------|
| AUREA | SUPPORT | Author - implements organization best practices |
| EVE | SUPPORT | Aligns with repository hygiene goals |
| HERMES | SUPPORT | Improves documentation discoverability |
| JADE | SUPPORT | Local validation passed |
| ATLAS | CONDITIONAL | Requires scope clarification (NOW PROVIDED) |

### Dissent Resolution

ATLAS's concerns are valid governance checks. This update provides:
1. **Explicit Intent Publication** per EPICON-02 format
2. **Scope Envelope** showing exact permissions granted
3. **Counterfactuals** defining block/revert conditions
4. **Evidence** that only documentation files were affected

---

## 10. Invariants Preserved

| Invariant | Status | Evidence |
|-----------|--------|----------|
| All content preserved | ✅ | 165 files moved via `git mv` |
| Git history maintained | ✅ | Renames tracked, not deletes |
| MII >= 0.95 | ✅ | Documentation-only change |
| Anti-nuke compliance | ✅ | Reorganization, not deletion |

---

## Document Control

**Version History:**
- v1: Initial specification (C-199)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Systems*
