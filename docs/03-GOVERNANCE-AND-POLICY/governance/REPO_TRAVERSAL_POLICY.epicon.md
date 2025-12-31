# EPICON — Repo Traversal Policy v1

---
epicon_id: EPICON_C-178_GOVERNANCE_repo-traversal-policy_v1
title: Repo Traversal Policy
cycle: C-178
epoch: EPICON_ERA
tier: GOVERNANCE
epicon_type: policy
status: adopted
author_name: Michael (Kaizen)
author_wallet: null
tags:
  - traversal
  - navigation
  - mcp
  - dva
  - agents
  - llm
  - governance
related_prs: []
related_commits: []
integrity_index_baseline: 0.95
risk_level: low
created_at: 2025-12-31
updated_at: 2025-12-31
summary: Defines bounded, interpretable, and integrity-preserving traversal rules for humans, agents, MCP tools, and DVA tiers interacting with the Mobius Substrate monorepo.
---

**Status:** ADOPTED  
**Owner:** Mobius Substrate Core  
**Scope:** Monorepo + DVA / MCP Agent Access  
**Hash-Anchor:** `pending-merge-attestation`

---

## INTENT

This policy defines **bounded, interpretable, and integrity-preserving traversal rules** for humans, agents, MCP tools, and DVA tiers interacting with the Mobius Substrate monorepo.

The repo has exceeded the scale where naive recursive crawling is feasible.

Unbounded traversal causes:

- Context overrun
- Ambiguous architectural interpretation
- Accidental prioritization of noisy files
- Destructive hallucination pressure in agents
- GitHub rate-limit triggers
- Degraded reasoning signal

Instead, traversal must become **intent-first** and **zone-aware**.

This policy ensures that:

1. Agents start from **stable narrative anchors**
2. Traversal becomes **purpose-driven, not exhaustive**
3. History cannot be mistaken for current state
4. Research areas do not pollute governance context
5. Integrity signals remain legible across scale

---

## DESIGN PRINCIPLES

- **Memory before volume** — deeper meaning > more files
- **Friction as safety** — HOT = easy, WARM = selective, COLD = explicit consent
- **History is preserved, not normalized**
- **Substrate must remain human-interpretable**
- **Agents should never outrun the civic memory**

---

## ZONE MODEL

| Zone | Meaning | Access |
|------|---------|--------|
| 🔥 **HOT** | Stable + high-signal | Bulk traversal allowed |
| 🌡️ **WARM** | Valuable but heavier contexts | Targeted traversal only |
| ❄️ **COLD** | Experimental & infra | Explicit opt-in |
| 🧊 **FROZEN** | Sealed historical memory | Read-only |

### HOT Zone Paths

```
REPO_DIGEST.md
REPO_MAP_TREE.md
llm-manifest.json
00-START-HERE/**
FOUNDATION/**
epicon/**
apps/browser-shell/**
docs/04-TECHNICAL-ARCHITECTURE/overview/**
```

### WARM Zone Paths

```
docs/** (except archives)
packages/**
sentinels/**
services/**
specs/**
mcp/**
FOR-ACADEMICS/**
FOR-ECONOMISTS/**
FOR-GOVERNMENTS/**
FOR-PHILOSOPHERS/**
```

### COLD Zone Paths

```
labs/**
infra/**
configs/**
scripts/**
tests/**
docs/07-RESEARCH-AND-PUBLICATIONS/**
```

### FROZEN Zone Paths

```
docs/10-ARCHIVES/**
```

---

## CANONICAL TRAVERSAL TRIAD

These files constitute the **canonical traversal triad**:

| File | Purpose |
|------|---------|
| `REPO_DIGEST.md` | Human-readable navigation index |
| `REPO_MAP_TREE.md` | Compact directory structure |
| `llm-manifest.json` | Machine-readable zone definitions |
| `mcp/mobius-repo-scanner/src/routes.config.ts` | MCP routing implementation |

All four must remain synchronized.

---

## FAILURE MODES MITIGATED

This policy mitigates:

- ❌ Agents hallucinating architecture from partial scans
- ❌ Recursive traversal into abandoned experiments
- ❌ Historical branches overwriting current truth
- ❌ Excessive token flooding → broken reasoning
- ❌ Hidden drift caused by noise-weighted traversal
- ❌ LLMs deriving false coherence from incomplete traversal
- ❌ Agents misreading archived experiments as live doctrine
- ❌ "Scan whole repo" prompts flooding models with noise
- ❌ CI / companion agents over-ingesting low-value zones
- ❌ Architectural hallucination feedback loops

---

## VALIDATION CONDITIONS

This policy is considered **working as intended** when:

- ✅ Agents consistently begin in:
  - `REPO_DIGEST.md`
  - `00-START-HERE/README.md`
- ✅ Traversal metadata logs zone classification
- ✅ Large-repo reasoning improves vs naive crawling
- ✅ Agents never:
  - Recursively traverse `docs/10-ARCHIVES/`
  - Infer governance from retired experiments
  - Attempt full-repo ingestion

---

## IMPLEMENTATION

### MCP Scanner Integration

The `@mobius/mcp-repo-scanner` package implements this policy via:

```typescript
// mcp/mobius-repo-scanner/src/routes.config.ts
import { classifyPath, REPO_ZONES } from './routes.config';

const rule = classifyPath(requestedPath);
if (recursive && !rule.allowBulkScan) {
  throw new Error(`Bulk scanning not allowed for zone=${rule.zone}`);
}
```

### Agent Guidance

Agents should:

1. Load `llm-manifest.json` to understand zone boundaries
2. Start with `REPO_DIGEST.md` for orientation
3. Request specific paths rather than glob patterns
4. Log zone classification for audit trail
5. Never attempt bulk traversal of COLD or FROZEN zones

---

## CHANGE POLICY

Any modification to:

- Zone definitions
- Traversal depth rules
- Bulk-scan allowances

**Must include:**

1. Updated:
   - `REPO_DIGEST.md`
   - `REPO_MAP_TREE.md`
   - `llm-manifest.json`
   - MCP routing config

2. An EPICON justification note explaining:
   - Risks assumed
   - Mitigations added
   - Scope of downstream impact

3. Review by:
   - ATLAS sentinel
   - Human maintainer

---

## ATTESTATION

| Reviewer | Status | Date |
|----------|--------|------|
| ATLAS | ⬜ Pending | - |
| AUREA | ⬜ Pending | - |
| Human (Kaizen) | ✅ Approved | 2025-12-31 |

---

## CLOSING NOTE

This policy treats traversal not as a technical act, but as a **civic reasoning action**.

The monorepo is not just code.  
It is a **memory structure**.

Traversal rules are therefore **integrity rules**.

This EPICON locks the intent.  
The implementation may evolve.

---

*"We heal as we walk." — Mobius Systems*  
*Cycle C-178 • EPICON Production Era*
