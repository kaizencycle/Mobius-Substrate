# Documentation Reorganization Plan

**Date:** 2025-01-27  
**Status:** Implementation Plan  
**Goal:** Consolidate all documentation into numbered taxonomy structure

---

## Current State Analysis

### Organized (Numbered Structure)
- ✅ `01-whitepapers/` — Economic theory
- ✅ `02-governance/` — Foundation governance
- ✅ `03-architecture/` — System design
- ✅ `04-guides/` — How-to guides
- ✅ `05-research/` — Academic research
- ✅ `06-specifications/` — Technical specs
- ✅ `07-reference/` — Quick reference
- ✅ `08-processes/` — Workflows
- ✅ `09-reports/` — Status reports

### Unorganized (Root Level)
- ⚠️ `agents/` → Move to `02-governance/agents/` or `10-agents/`
- ⚠️ `api/` → Move to `06-specifications/api/`
- ⚠️ `architecture/` → Merge into `03-architecture/`
- ⚠️ `archive/` → Keep as-is (historical)
- ⚠️ `attestations/` → Move to `09-reports/attestations/`
- ⚠️ `audits/` → Move to `11-security/audits/`
- ⚠️ `blueprints/` → Move to `03-architecture/blueprints/`
- ⚠️ `codex/` → Move to `02-governance/codex/`
- ⚠️ `companions/` → Move to `10-agents/companions/`
- ⚠️ `consensus-chamber/` → Move to `02-governance/consensus-chamber/`
- ⚠️ `constitution/` → Move to `02-governance/constitution/`
- ⚠️ `design/` → Move to `03-architecture/design/`
- ⚠️ `diagrams/` → Merge into `03-architecture/diagrams/`
- ⚠️ `drift/` → Move to `11-security/drift/`
- ⚠️ `dva/` → Move to `03-architecture/dva/`
- ⚠️ `encyclopedia/` → Move to `12-systems/encyclopedia/`
- ⚠️ `figures/` → Move to `03-architecture/figures/`
- ⚠️ `fixes/` → Move to `09-reports/fixes/`
- ⚠️ `founders-agents.gic.md` → Move to `10-agents/founders-agents.gic.md`
- ⚠️ `founding-agents/` → Move to `10-agents/founding-agents/`
- ⚠️ `genesis/` → Move to `13-philosophy/genesis/`
- ⚠️ `governance/` → Merge into `02-governance/`
- ⚠️ `handbook/` → Keep as-is (comprehensive guide)
- ⚠️ `intelligence/` → Move to `05-research/intelligence/`
- ⚠️ `jade/` → Move to `10-agents/jade/`
- ⚠️ `ktt-trial-001-implementation.md` → Move to `05-research/ktt/ktt-trial-001-implementation.md`
- ⚠️ `lab7/` → Move to `03-architecture/labs/lab7/`
- ⚠️ `labor/` → Move to `05-research/labor/`
- ⚠️ `ledger/` → Move to `06-specifications/ledger/`
- ⚠️ `manifesto/` → Move to `13-philosophy/manifesto/`
- ⚠️ `mic/` → Move to `01-whitepapers/mic/`
- ⚠️ `mobius-kernel-spec-v0.1.md` → Move to `06-specifications/kernel/mobius-kernel-spec-v0.1.md`
- ⚠️ `observability/` → Move to `08-processes/observability/`
- ⚠️ `onboarding/` → Merge into `04-guides/onboarding/`
- ⚠️ `optimizations/` → Move to `09-reports/optimizations/`
- ⚠️ `outreach/` → Move to `09-reports/outreach/`
- ⚠️ `peer-review-response.md` → Move to `05-research/peer-review/peer-review-response.md`
- ⚠️ `peer-review-summary.md` → Move to `05-research/peer-review/peer-review-summary.md`
- ⚠️ `philosophy/` → Move to `13-philosophy/`
- ⚠️ `policy/` → Move to `02-governance/policy/`
- ⚠️ `product/` → Move to `04-guides/product/`
- ⚠️ `protocols/` → Move to `06-specifications/protocols/`
- ⚠️ `rituals/` → Move to `08-processes/rituals/`
- ⚠️ `security/` → Move to `11-security/`
- ⚠️ `sentinels/` → Move to `10-agents/sentinels/`
- ⚠️ `specs/` → Merge into `06-specifications/`
- ⚠️ `theory/` → Move to `05-research/theory/`
- ⚠️ `tokenomics/` → Move to `01-whitepapers/tokenomics/`

---

## Proposed New Structure

```
docs/
├── 01-whitepapers/
│   ├── mic/
│   └── tokenomics/
├── 02-governance/
│   ├── agents/
│   ├── codex/
│   ├── consensus-chamber/
│   ├── constitution/
│   └── policy/
├── 03-architecture/
│   ├── blueprints/
│   ├── design/
│   ├── diagrams/
│   ├── dva/
│   ├── figures/
│   └── labs/
├── 04-guides/
│   ├── onboarding/
│   └── product/
├── 05-research/
│   ├── intelligence/
│   ├── ktt/
│   ├── labor/
│   ├── peer-review/
│   ├── theory/
│   └── ...
├── 06-specifications/
│   ├── api/
│   ├── kernel/
│   ├── ledger/
│   ├── protocols/
│   └── ...
├── 07-reference/
│   └── (keep as-is)
├── 08-processes/
│   ├── observability/
│   ├── rituals/
│   └── ...
├── 09-reports/
│   ├── attestations/
│   ├── fixes/
│   ├── optimizations/
│   ├── outreach/
│   └── ...
├── 10-agents/
│   ├── companions/
│   ├── founding-agents/
│   ├── jade/
│   └── sentinels/
├── 11-security/
│   ├── audits/
│   ├── drift/
│   └── ...
├── 12-systems/
│   └── encyclopedia/
├── 13-philosophy/
│   ├── genesis/
│   └── manifesto/
├── archive/
│   └── (keep as-is)
├── handbook/
│   └── (keep as-is)
└── README.md
```

---

## Implementation Steps

### Phase 1: Create New Directories
1. Create `10-agents/`, `11-security/`, `12-systems/`, `13-philosophy/`
2. Create subdirectories as needed

### Phase 2: Move Files (Preserve Git History)
1. Use `git mv` to preserve history
2. Update all cross-references
3. Update README files

### Phase 3: Update References
1. Search and replace paths in all markdown files
2. Update `document-index.json`
3. Update `ACADEMIC_INDEX.md`

### Phase 4: Validation
1. Verify all links work
2. Check for broken references
3. Update navigation

---

## Notes

- **Archive:** Keep `archive/` as-is (historical reference)
- **Handbook:** Keep `handbook/` as-is (comprehensive guide)
- **README.md:** Update main README with new structure
- **Git History:** Use `git mv` to preserve file history

---

**Status:** Planning Complete — Ready for Implementation
