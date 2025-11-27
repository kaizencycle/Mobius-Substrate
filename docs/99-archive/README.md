# Archive & Legacy

> "We honor the cracks; repair makes the story more beautiful." — 金繕い (Kintsugi)

This folder preserves the evolution of Mobius Systems.

---

## Purpose

The archive serves multiple functions:

1. **Historical Record** — Preserve decisions and reasoning
2. **Learning Resource** — See how thinking evolved
3. **Succession Planning** — Future contributors understand context
4. **Kintsugi Principle** — Repairs are visible, honored, not hidden

**We don't erase the past; we annotate it.**

---

## What Gets Archived

Documents move here when they are:

- **Superseded** — Replaced by newer versions
- **Deprecated** — No longer applicable to current system
- **Historical** — Important for context but not current practice
- **Legacy** — From previous naming (Kaizen OS, Civic OS)

Documents stay in their original sections if they are:
- Still accurate and useful
- Part of active documentation
- Referenced by current specs

---

## Archive Format

When moving a document here, add this header:

```markdown
> **[ARCHIVED YYYY-MM-DD]**  
> **Cycle:** C-XXX  
> **Replaced by:** [Link to new document]  
> **Reason:** Brief explanation of why archived  
> **Historical Context:** Why this doc mattered at the time

[Original content follows unchanged]
```

---

## Current Archive Contents

### Legacy Naming

**Kaizen OS → Mobius Systems (C-119)**
- Why: Broader vision beyond individual improvement
- Files: Early manifesto drafts, original architecture docs

**Civic OS → Mobius Systems (C-119)**
- Why: More poetic, mathematically resonant name
- Files: Civic-specific branding, policy docs

### Superseded Specifications

Documents replaced by newer versions:
- Protocol drafts that evolved
- API specs with breaking changes
- Economic models that were refined

### Historical Decisions

Architecture decisions that were tried and changed:
- Why certain approaches didn't work
- What we learned from experiments
- Context for current design

### Proto-Cycles

Pre-C-147 cycle numbering:
- Experimental cycle labels
- Narrative markers vs. calendar anchors
- See `CYCLE_INDEX.md` for canonical mapping

---

## Accessing Archived Documents

All archived documents remain:
- **Version controlled** in git history
- **Searchable** via GitHub search
- **Linked** from current documentation where relevant
- **Citable** for research purposes

Use git to explore evolution:
```bash
# See history of a file
git log --follow -- path/to/archived/file.md

# View old version
git show COMMIT_HASH:path/to/file.md

# Compare versions
git diff OLD_HASH NEW_HASH -- path/to/file.md
```

---

## Archive vs. Deletion

**Archive when:**
- Document has historical value
- Shows evolution of thinking
- Might be referenced in research
- Provides context for decisions

**Delete when:**
- Sensitive information that shouldn't be preserved
- Duplicate content with no unique value
- Truly irrelevant drafts or notes
- But prefer archiving with explanation

---

## Learning from History

The archive is not just a graveyard—it's a classroom:

### What Worked
- Successful experiments that became features
- Design decisions that proved wise
- Community feedback that shaped direction

### What Didn't
- Failed approaches and why they failed
- Assumptions that turned out wrong
- Complexity that was simplified away

### What Changed
- External factors (technology, society)
- Internal priorities (philosophy evolution)
- Community growth (scaling challenges)

---

## Kintsugi Philosophy

In Japanese art, Kintsugi repairs broken pottery with gold, making the cracks visible and beautiful.

**Mobius applies this to documentation:**

- Mistakes aren't hidden, they're annotated
- Evolution is traced, not rewritten
- History informs, doesn't constrain
- Repairs strengthen rather than erase

**The cracks tell the story of resilience.**

---

## Archive Index

As documents accumulate, maintain an index:

### `/legacy/naming/`
- Original Kaizen OS branding
- Civic OS transition materials
- Name change rationale (C-119)

### `/superseded/specs/`
- Old API contracts
- Previous economic models
- Early protocol drafts

### `/superseded/architecture/`
- Architecture decisions that changed
- Component designs that evolved
- System diagrams from early versions

### `/historical/governance/`
- Early governance proposals
- Constitutional drafts
- Founding discussions

### `/proto-cycles/`
- Pre-index cycle numbering
- Experimental time markers
- Narrative vs. calendar anchors

---

## Contributing to the Archive

When archiving a document:

1. **Add Archive Header** — Use the format above
2. **Move to Appropriate Subfolder** — Keep organized
3. **Update Original Location** — Add redirect/tombstone
4. **Update Index** — Add to this README
5. **Explain Context** — Why archived, what replaced it
6. **Preserve Links** — Update references throughout docs

---

## Future Archive Policy

As Mobius evolves over 50 years:

- **Epoch Transitions** — Major phase changes create natural archive points
- **Constitutional Amendments** — Old versions preserved with rationale
- **Technology Shifts** — Platform changes documented thoroughly
- **Community Growth** — Scaling decisions and tradeoffs recorded

The archive grows with the system, providing continuous context for future custodians.

---

## Research Value

The archive is valuable for:

- **Longitudinal Studies** — How AI governance evolves
- **Design Science Research** — What worked and why
- **Historical Analysis** — Social factors in technical decisions
- **Case Studies** — Real-world system evolution

Researchers are encouraged to cite archived materials when relevant.

---

## Relationship to Git History

The archive complements but doesn't replace git:

- **Git:** Complete technical history, every commit
- **Archive:** Curated narrative, explained context
- **Together:** Full picture of evolution

Git shows *what* changed. Archive explains *why*.

---

## Archive Integrity

Archived documents are:
- **Immutable** — No editing after archiving
- **Signed** — Cryptographic attestation when archived
- **Timestamped** — Cycle and date recorded
- **Linked** — Connected to current docs

This ensures historical integrity matching Mobius principles.

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*

---

**The archive is not where documents go to die.**  
**It's where they go to teach.**
