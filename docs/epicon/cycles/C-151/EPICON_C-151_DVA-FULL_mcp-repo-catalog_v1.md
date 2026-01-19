---
epicon_id: EPICON_C-151_DVA-FULL_mcp-repo-catalog_v1
title: "MCP Repo Catalog & Integrity Gate for Mobius Substrate"
author_name: "Michael Judan"
author_wallet: ""
cycle: "C-151"
epoch: ""
tier: "DVA.FULL"
scope:
  domain: "infrastructure"
  system: "catalog"
  environment: "all"
epicon_type: "design"
status: "active"
related_prs: []
related_commits: []
related_epicons:
  - "EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1"
  - "EPICON-01"
tags:
  - "catalog"
  - "mcp"
  - "epicon"
  - "integrity"
  - "dva"
  - "agents"
  - "repo-index"
  - "mobius-substrate"
  - "ci"
  - "github-actions"
integrity_index_baseline: 0.97
risk_level: "low"
created_at: "2025-12-30T12:00:00-05:00"
updated_at: "2025-12-30T12:00:00-05:00"
version: 1
hash_hint: ""
summary: "Introduces a machine-readable catalog (catalog/mobius_catalog.json) plus a CI gate to keep it fresh, so DVA/MCP agents can treat the Mobius Substrate as a stable library with an always-up-to-date index of EPICONs and docs."
---

# EPICON C-151 — MCP Repo Catalog & Integrity Gate

## Summary

This EPICON establishes the **Mobius Catalog System** — a machine-readable index of EPICONs and docs, plus a CI gate that ensures the catalog never silently drifts from the source files. Together, these turn the Mobius Substrate into a **stable, indexed library** that DVA/MCP agents can query with confidence.

---

## 1. Context

Mobius is shifting from "interesting monorepo" to "civilization substrate".

That means the repo is no longer just code; it is:

- a **library of intent** (EPICONs),
- a **library of documentation** (architecture, specs, diagrams),
- and a **source of truth** for DVA / MCP agents.

For agents to behave safely and coherently, they need:

- a **stable, machine-readable index** of the repo (EPICONs + docs),
- a **simple API** to query it (catalog tool),
- and a **guardrail** that prevents the index from silently drifting.

Without that, every agent has to "scan GitHub" ad-hoc, which is:

- brittle,
- slow,
- and easy to forget to update whenever humans change EPICONs.

This EPICON defines the **Repo Catalog + CI Gate** so the Mobius Substrate behaves like a real, indexed library.

---

## 2. Problem Statement

We need to solve:

1. **Discovery for agents**  
   DVA / MCP agents need a predictable way to discover:
   - all EPICONs
   - all relevant docs
   - key metadata (tier, type, tags, cycles, hashes, summaries)

2. **Integrity of the index**  
   Humans will add/edit EPICONs and docs. If they forget to regenerate the catalog, agents will see stale data and misroute queries.

3. **Simple integration point**  
   We want one small, reusable entrypoint for tools so every agent doesn't reimplement repo traversal logic.

**Constraints:**

- Must be light-weight (no heavy DBs).
- Must be CI-enforceable (fail PRs if index is stale).
- Must be Git-native (Merkle tree friendly, diffable, reviewable).

---

## 3. Design

### 3.1 Catalog File

We standardize on a single JSON catalog:

- **Path:** `catalog/mobius_catalog.json`
- **Source:** auto-generated from:
  - `epicon/` (EPICONs)
  - `docs/` (core documentation)

High-level schema:

```typescript
type Catalog = {
  mobius_catalog_version: string;
  generated_at: string;
  repo: {
    name: string;
    url: string;
    default_branch: string;
    commit: string;
  };
  stats: {
    epiconCount: number;
    docCount: number;
  };
  epicons: EpiconEntry[];
  docs: DocEntry[];
};
```

Where `EpiconEntry` and `DocEntry` include:
- `path`
- `title`
- `tier` / `cycle` (for EPICONs)
- `tags`
- `status`
- `content_hash`
- `summary`
- `related_prs` / `related_commits` (for EPICONs)

The catalog is:
- **human-reviewable** (diff-friendly JSON)
- **machine-friendly** (agents can search/filter)
- **hashable** (for integrity checks)

### 3.2 Catalog Export Script

We use a script (wired in `package.json`) to regenerate the catalog:

```json
{
  "scripts": {
    "export:catalog": "tsx scripts/exportCatalog.ts"
  }
}
```

`exportCatalog.ts`:
- scans `epicon/` and `docs/`
- extracts frontmatter + metadata
- computes `content_hash` for each file
- writes a fresh `catalog/mobius_catalog.json`

Developers run:

```bash
npm run export:catalog
```

any time they:
- add a new EPICON,
- update an EPICON,
- add/update a doc.

### 3.3 MCP / Agent Helper

For DVA / MCP-style agents, we provide a small helper:

- **File:** `tools/mobiusCatalogTool.ts`

Exports:
- `loadCatalog()`
- `listEpicons(filter?)`
- `getEpiconById(epiconId)`
- `listDocs()`
- `searchCatalog(query)`

Example usage (pseudo-MCP):

```typescript
commands["mobius.list_epicons"] = async (args) =>
  listEpicons({
    tier: args.tier,
    cycle: args.cycle,
    status: args.status,
    tag: args.tag,
    epicon_type: args.epicon_type
  });

commands["mobius.get_epicon"] = async (args) => getEpiconById(args.epicon_id);

commands["mobius.list_docs"] = async () => listDocs();
```

This gives all agents a single, stable interface into the "Mobius library".

---

## 4. CI Integrity Gate

We add a GitHub Action to enforce catalog freshness:

- **File:** `.github/workflows/catalog-check.yml`

**Behavior:**

1. On `push` and `pull_request` to `main`/`master`/`develop`:
   - checkout
   - `npm ci`
   - `npm run export:catalog`

2. Compare `catalog/mobius_catalog.json` to the committed version:
   - If unchanged: ✅ pass.
   - If changed: ❌ fail with message:
     ```
     Run: npm run export:catalog and commit the updated file.
     ```

This ensures:
- No EPICON or doc can land in `main` without a corresponding catalog update.
- Agents never read from a stale index.
- The catalog is always synchronized with human-intent changes.

---

## 5. Integrity & Risk Analysis

### Benefits

| Benefit | Description |
|---------|-------------|
| 📚 Library semantics | Mobius behaves like a real archive, not a random code pile |
| 🧠 Agent safety | DVA / MCP agents rely on a consistent, up-to-date index |
| 🔍 Traceability | Reviewers can see how catalog entries changed over time |
| 🧬 Merkle-aligned | Catalog changes become part of the repo's commit graph and integrity story |

### Risks / Failure Modes

| Risk | Mitigation |
|------|------------|
| Script breaks → CI red | Keep `exportCatalog.ts` small, tested, and covered by unit tests |
| Developers forget workflow semantics | Clear error message + notes in README and `epicon/README` |
| Catalog grows large over time | Keep entries concise; consider pagination/secondary indices later if needed |

**Integrity index baseline:** 0.97

The pattern reinforces:

```
intent → export → catalog → CI gate → agents
```

with minimal new complexity.

---

## 6. Implementation

### Files Created

| File | Purpose |
|------|---------|
| `scripts/exportCatalog.ts` | Scans `epicon/` and `docs/`, generates catalog JSON |
| `tools/mobiusCatalogTool.ts` | TypeScript API for agents to query the catalog |
| `catalog/mobius_catalog.json` | The machine-readable index (auto-generated) |
| `catalog/README.md` | Documentation for the catalog system |
| `.github/workflows/catalog-check.yml` | CI gate that fails PRs with stale catalogs |

### npm Scripts

| Script | Command |
|--------|---------|
| `export:catalog` | `tsx scripts/exportCatalog.ts` |

### Usage

```bash
# After adding/editing EPICONs or docs:
npm run export:catalog
git add catalog/mobius_catalog.json
git commit -m "chore: update catalog"
```

---

## 7. Telemetry & Next Steps

### What to Watch

- How often PRs fail due to stale catalog
- Whether contributors can reasonably fix it with `npm run export:catalog`
- Whether DVA / MCP agents find the catalog sufficient, or need extra views

### Future Extensions

- Per-tier catalogs (e.g., `catalog/dva-lite.json`)
- Tag-based indices
- Search indices for faster queries
- Webhook integration for external systems

---

## 8. Reflection Hook

Questions for future reflections:

- Did the CI gate actually catch stale catalogs?
- Did it create friction that slowed down contributions?
- Are agents successfully using the catalog as their primary index?
- Do we need secondary indices or search capabilities?
- Has the catalog JSON grown unwieldy?

---

## Mental Model

Once this lands, Mobius officially behaves like a sorted archive:

| Concept | Analog |
|---------|--------|
| EPICONs | Shelves of intent |
| Docs | Reference volumes |
| `catalog/mobius_catalog.json` | Card catalog |
| MCP / DVA agents | Librarians |
| CI gate | Archivist at the door |

> "You can rearrange the library all you want — but you must update the catalog before you leave." 📚🕯️

---

*"We heal as we walk." — Mobius Systems*
