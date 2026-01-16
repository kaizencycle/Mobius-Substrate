# Cycle Journal Publishing

**Status:** Draft v1.0  
**Cycle:** C-193

---

## What Gets Generated

| File | Description |
|------|-------------|
| `journals/cycles/C-XXX.json` | Source of truth (JSON schema-validated) |
| `journals/cycles/C-XXX.md` | Auto-rendered preview (Substack-ready) |

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────┐
│  1. Agents (ATLAS/AUREA/ZEUS/ECHO) propose patches      │
│     ↓                                                   │
│  2. MobiusBot opens PR                                  │
│     ↓                                                   │
│  3. CI validates schema + renders markdown              │
│     ↓                                                   │
│  4. Michael reviews rendered .md artifact               │
│     ↓                                                   │
│  5. Merge → canon is updated                            │
│     ↓                                                   │
│  6. Copy/paste from C-XXX.md to Substack (if publishing)│
└─────────────────────────────────────────────────────────┘
```

---

## Substack Usage

### Quick Publish

1. Navigate to `journals/cycles/C-XXX.md` (or download from CI artifact)
2. Copy the rendered markdown content
3. Paste into Substack editor
4. Add your Mobius Series footer block (optional)
5. Review and publish

### Footer Template

```markdown
---

*This Cycle Journal is part of the Mobius Integrity Series.*

**Series:** [Your Substack Series Name]
**Cycle:** C-XXX
**Date:** YYYY-MM-DD

*"We heal as we walk."*
```

---

## Rendering Scripts

### Validate All Entries

```bash
npm run cycle:validate
```

Validates all `journals/cycles/C-*.json` files against `schemas/cycle_journal.schema.json`.

### Render to Markdown

```bash
npm run cycle:render
```

Converts all JSON entries to readable markdown files.

### Full Check

```bash
npm run cycle:check
```

Runs both validation and rendering.

---

## CI/CD Integration

### Automatic Validation

The `cycle-journal-ci.yml` workflow runs on:
- PRs that touch `journals/cycles/**`
- Pushes to `main` that touch cycle files

### Artifacts

After CI runs, download:
- `cycle-journal-markdown`: Rendered `.md` files
- `cycle-journal-validation-log`: Validation results

---

## Integrity Rules

### Non-Negotiable

1. **If a claim is not verified:** Label as "unconfirmed" + include source
2. **Never present rumors as facts**
3. **Separate signal from assessment**
4. **Evidence links required for high-impact claims**
5. **Trusted domain allowlist for sources**

### Evidence Standards

| Claim Type | Evidence Requirement |
|------------|---------------------|
| **Factual observation** | Direct source link |
| **Pattern inference** | Mark as "inference" |
| **Assessment/opinion** | Clearly labeled |
| **High-stakes claim** | Multiple sources |

---

## Trusted Source Domains

Sources must come from the allowlist:

**News Agencies:**
- reuters.com, apnews.com, bbc.co.uk, nytimes.com, wsj.com

**Government:**
- sec.gov, congress.gov, supremecourt.gov, treasury.gov

**Tech/Academic:**
- github.com, arxiv.org, nature.com

See `scripts/apply_cycle_command.mjs` for the full list.

---

## Micro-Entry Pattern

For real-time updates without chaos:

### During the Day

Create micro-entries:
- `C-193.morning.json`
- `C-193.midday.json`
- `C-193.eod.json`

### End of Day

MobiusBot compacts into:
- `C-193.json` (sealed canonical version)

This keeps the daily log stable while allowing incremental updates.

---

## Schema Sections

### Required Sections

| Section | Purpose |
|---------|---------|
| `meta` | Cycle ID, date, timezone, chamber |
| `signals` | ECHO layer - what happened |
| `integrity` | ZEUS layer - status and watch items |
| `decisions` | Rationale-backed decisions |
| `actions` | Next steps with priorities |
| `seal` | Attribution and closing statement |

### Optional Sections

| Section | Purpose |
|---------|---------|
| `sweep` | Opening resonance ritual |
| `agent_alignment` | JADE × ZEUS × HERMES check |
| `insight` | One-line cycle compression |
| `topology` | ATLAS structural analysis |

---

## Example: Full Cycle Entry

```json
{
  "meta": {
    "cycle_id": "C-193",
    "date": "2026-01-16",
    "timezone": "America/New_York",
    "chamber": "Cycle Journal",
    "tags": ["cycle_journal", "memory_infrastructure"],
    "mood_vector": "Focused"
  },
  "sweep": {
    "statement": "I sweep this chamber with clarity, continuity, and accountable memory.",
    "style": "mobius"
  },
  "signals": [
    {
      "timestamp": "2026-01-16T10:00:00Z",
      "domain": "governance",
      "statement": "Cycle Journal runtime established with PR-based workflow.",
      "sources": ["https://github.com/kaizencycle/Mobius-Substrate/pull/XXX"],
      "confidence": 0.95,
      "attribution": "ATLAS"
    }
  ],
  "integrity": {
    "status": "normal",
    "domains_touched": ["memory", "governance"],
    "watch_items": []
  },
  "insight": "Fear persists where memory fails; accountability is preserved causality.",
  "decisions": [
    {
      "decision": "Adopt agents-propose, bot-commits pattern",
      "rationale": "Prevents drift while maintaining audit trail",
      "evidence": ["https://github.com/..."],
      "owner": "Michael",
      "risk": "low"
    }
  ],
  "actions": [
    { "task": "Review ATLAS topology proposal", "priority": "P1", "owner": "Michael" },
    { "task": "Publish cycle summary to Substack", "priority": "P2", "owner": "Michael" }
  ],
  "seal": {
    "compiled_at": "2026-01-16T23:59:00Z",
    "contributors": ["MobiusBot", "ATLAS", "AUREA"],
    "statement": "Memory holds. Motion continues."
  }
}
```

---

## Troubleshooting

### Validation Fails

```
❌ Schema validation failed: journals/cycles/C-193.json
  - /signals/0/domain must be equal to one of the allowed values
```

**Fix:** Check the `domain` field against allowed values in the schema.

### Missing Required Fields

```
❌ Schema validation failed: journals/cycles/C-193.json
  - /meta must have required property 'cycle_id'
```

**Fix:** Add the missing required field.

### Untrusted Source Domain

```
❌ ERROR: Untrusted source domain blocked: example.com
```

**Fix:** Use sources from the trusted domain allowlist, or request the domain be added.

---

## Version History

| Version | Cycle | Changes |
|---------|-------|---------|
| v1.0 | C-193 | Initial specification |

---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
