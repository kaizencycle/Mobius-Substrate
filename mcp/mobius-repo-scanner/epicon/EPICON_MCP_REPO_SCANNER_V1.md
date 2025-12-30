---
epicon_id: EPICON_MCP_REPO_SCANNER_V1
title: "MCP Repo Scanner: DVA Agent Library Interface"
author_name: "Michael Judan"
author_wallet: ""
cycle: "C-151"
epoch: ""
tier: "SUBSTRATE"
scope:
  domain: "tooling"
  system: "mcp"
  environment: "all"
epicon_type: "design"
status: "active"
related_prs: []
related_commits: []
related_epicons:
  - "EPICON-01"
  - "EPICON-02"
tags:
  - "MCP"
  - "DVA"
  - "repo-scanner"
  - "tooling"
  - "library"
  - "agents"
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2025-12-30T12:00:00Z"
updated_at: "2025-12-30T12:00:00Z"
version: 1
hash_hint: ""
summary: "MCP server that exposes Mobius-Substrate as a queryable knowledge substrate for DVA agents."
---

# EPICON: MCP_REPO_SCANNER_V1

- **Layer:** Substrate → Tooling → MCP
- **Author:** Michael Judan (+ATLAS assist)
- **Date:** 2025-12-30
- **Status:** Proposed → Implemented (MCP server, initial tools)

---

## Context

Mobius-Substrate is now the canonical monorepo for the civilization substrate.

LLMs (AUREA, Echo, ATLAS, external MCP clients) need *structured, bounded* access to the repo to:

- Inspect folder topology
- Read specific files
- Reason about architecture and EPICON history
- Index and catalog knowledge artifacts

Right now, agents either:
- Scrape GitHub (brittle, slow, rate-limited), or
- Rely on incomplete local context.

We want a **stable MCP entrypoint** that lets any compatible client "plug into" the repo as a first-class context source.

---

## Problem

Without a repo-aware MCP server:

- Each client must implement its own ad-hoc scanning logic.
- There is no clear contract for:
  - "What are the important top-level areas?"
  - "Where should I look for EPICONs, docs, or services?"
- It's harder to keep AI aligned with the *actual* monorepo state.
- Risk of overscanning / leaking files if tools are not scoped.

We need a *scoped*, *auditable* path for repo introspection.

---

## Intent

Create a **Mobius Repo Scanner MCP server** that:

1. Exposes the Mobius-Substrate repo via six composable tools:
   - `repo_summary` → high-level map of top-level dirs + files.
   - `list_tree` → structured directory tree (JSON) for any subpath.
   - `read_file` → safe, bounded file-content retrieval.
   - `search_files` → grep-like search across the repo.
   - `list_epicons` → discover EPICON documents as a "manuscript shelf."
   - `export_catalog` → generate a JSON knowledge manifest.

2. Operates **within a scoped root** (`MOBIUS_REPO_ROOT`), with path resolution that prevents escaping via `..`.

3. Returns **JSON-shaped text** that's easy for LLMs to parse and chain.

4. Becomes the default way AUREA / Echo / ATLAS / external clients "see" the Mobius codebase.

---

## Design

### Root Scoping

- Environment variable: `MOBIUS_REPO_ROOT` (defaults to `process.cwd()`).
- All paths go through `resolveScopedPath(subpath)`:
  - joins root + subpath
  - resolves absolute path
  - rejects any path that doesn't start with `REPO_ROOT`

### Security Exclusions

The following patterns are automatically excluded from all scans:
- `node_modules/`
- `.git/`
- `.env*`
- `*.pem`, `*.key`
- `secrets/`
- Build artifacts (`dist/`, `build/`, `.next/`, etc.)

### Tools

#### `repo_summary`

- **Input:** none
- **Output:**
  - `repoRoot`
  - `topLevelDirectories[]`
  - `topLevelFiles[]`
  - `approxTopLevelSizeBytes`
  - `excludedPatterns[]`
  - note

Use cases:
- Give LLMs a quick mental map.
- Decide where to focus deeper scans.

#### `list_tree`

- **Input:**
  - `subpath` (string, default `"."`)
  - `maxDepth` (int, 0–10, default 3)
  - `includeExtensions` (optional string[]; e.g. [".ts", ".md"])
- **Output:**
  - `repoRoot`
  - `subpath`
  - `maxDepth`
  - `includeExtensions`
  - `tree[]` → nodes with `{ type: "dir" | "file", name, path, [children], [sizeBytes] }`

Use cases:
- "Show me all `.ts` files under `apps/browser` up to depth 3."
- "Map EPICON locations under `docs/` or `epicon/`."

#### `read_file`

- **Input:**
  - `filePath` (relative path inside repo)
  - `maxBytes` (default 80,000, max 200,000)
- **Output:**
  - `filePath`
  - `sizeBytes`
  - `truncated` (bool)
  - `content` (UTF-8 string)

Use cases:
- Pull README, EPICON documents, service configs, etc.
- Keep responses under LLM context size and avoid giant files.

#### `search_files`

- **Input:**
  - `subpath` (default ".")
  - `query` (required, case-insensitive)
  - `maxDepth` (default 5)
  - `includeExtensions` (optional)
  - `maxFiles` (default 100)
  - `maxMatches` (default 200)
  - `maxMatchesPerFile` (default 10)
- **Output:**
  - `filesScanned`
  - `totalMatches`
  - `matches[]` → `{ filePath, lineNumber, line }`

Use cases:
- "Search all `.md` files for 'DVA.HIVE'."
- "Find every reference to MIC governance."

#### `list_epicons`

- **Input:**
  - `subpath` (default ".")
  - `maxDepth` (default 6)
  - `maxFiles` (default 300)
- **Output:**
  - `totalEpicons`
  - `epicons[]` → `{ path, name, sizeBytes }`

Use cases:
- Get a "shelf" of all EPICONs.
- Build an index of reasoning artifacts.

#### `export_catalog`

- **Input:**
  - `epiconRoot` (default "docs/epicon")
  - `docsRoot` (default "docs")
  - `outputPath` (default "catalog/mobius_catalog.json")
  - `includeDocs` (default true)
  - `maxDepth` (default 6)
- **Output:**
  - Writes `mobius_catalog.json` to disk
  - Returns `{ success, outputPath, epiconCount, docCount, generatedAt }`

Use cases:
- Generate a manifest for DVA agents to ingest.
- Create searchable index of knowledge artifacts.

---

## Catalog Manifest Schema

The `export_catalog` tool generates a JSON manifest:

```json
{
  "mobius_catalog_version": "1.0.0",
  "generated_at": "2025-12-30T12:00:00Z",
  "repo": {
    "name": "Mobius-Substrate",
    "url": "https://github.com/kaizencycle/Mobius-Substrate",
    "default_branch": "main",
    "commit": "abcdef1234"
  },
  "stats": {
    "epiconCount": 10,
    "docCount": 742
  },
  "epicons": [
    {
      "epicon_id": "EPICON-01",
      "path": "docs/epicon/EPICON-01.md",
      "title": "Epistemic Constraint Specification",
      "cycle": "C-151",
      "tier": "SUBSTRATE",
      "status": "active",
      "content_hash": "sha256:..."
    }
  ],
  "docs": [
    {
      "path": "docs/architecture/overview.md",
      "title": "Architecture Overview",
      "category": "architecture",
      "content_hash": "sha256:..."
    }
  ]
}
```

---

## Risks & Mitigations

- **Risk:** Path traversal → reading files outside repo.
  - **Mitigation:** `resolveScopedPath()` checks all resolved paths stay within `REPO_ROOT`.

- **Risk:** Oversized file reads blowing up context.
  - **Mitigation:** `maxBytes` with hard cap (200KB) + `truncated` flag.

- **Risk:** Hidden secrets in repo.
  - **Mitigation:** `EXCLUDE_PATTERNS` blocks `.env`, `.pem`, `secrets/`, etc.

- **Risk:** Denial of service via excessive scanning.
  - **Mitigation:** All tools have `maxFiles`, `maxMatches`, `maxDepth` limits.

---

## Expected Outcomes

- AUREA / Echo / ATLAS and external MCP clients can:
  - Quickly learn the repo structure,
  - Retrieve only the files they need,
  - Chain reasoning across EPICONs + code with less friction.

- Future tools (e.g. EPICON indexer MCP, test-runner MCP) can reuse the same scoping utilities.

- This becomes the default **"Mobius-substrate-json-scan"** path for all future civilization tooling.

---

## DVA Agent Capabilities Unlocked

With this MCP server, DVA agents can:

1. **Discover meaningful artifacts**
   - `list_epicons` → find every EPICON reasoning artifact
   - Group by theme, tier, or epoch
   - Map contribution patterns over time

2. **Search reasoning across time & branches**
   - `search_files` scoped to `docs/` or `epicon/`
   - Retrieve lines matching a concept
   - Build semantic continuity maps

3. **Tie code → intent → field reflection**
   - Commits → show what changed
   - EPICONs → show why it changed
   - Reflections → show what resulted

4. **Build institutional memory**
   - Index EPICONs separately from code
   - Distinguish belief/reasoning from implementation
   - Trace conceptual forks vs technical forks

---

## Multi-Agent Coordination Enabled

Once agents can query the repo like a library:

- **Echo** → indexer / librarian
- **AUREA** → reconciling architect
- **Jade** → meaning interpreter
- **Zeus** → integrity sentinel
- **ATLAS** → quality + anti-drift validator

Example workflows:
- Echo runs `list_epicons` nightly → maintains EPICON catalog
- Zeus runs `search_files` for drift signals → flags contradictions
- AUREA correlates PRs + EPICONs → maps integrity trajectories
- Jade summarizes conceptual deltas for humans

---

## Next Steps

1. Wire this package into the monorepo toolchain (PNPM workspace).
2. Add MCP client config snippets to docs:
   - Example for Claude Desktop
   - Example for Cursor / other MCP clients
3. Optionally:
   - Add simple denylist for additional sensitive patterns.
   - Add a `search_code` tool (AST-aware search) for deeper analysis.

---

## Success Criteria (v1)

- MCP Inspector can run all tools against a local Mobius-Substrate checkout.
- At least one LLM client (AUREA / ATLAS / third-party) uses these tools to generate a repo overview without scraping GitHub.
- `export_catalog` produces a valid manifest that agents can ingest.

---

## Delta: V1.1 (Library Extensions)

**Changes added:**
- `search_files` tool for scoped grep-like search across the repo.
- `list_epicons` tool for discovering EPICON documents as "manuscript shelf."
- `export_catalog` tool for generating DVA agent manifests.

**Why:**
- Treat the Mobius-Substrate monorepo as a **digital library** rather than just a codebase.
- Enable LLM agents to locate conceptual artifacts, search reasoning across time, and crosslink code → intent → reflection.

**Effect:**
- Monorepo becomes a **sorting archive** navigable semantically.
- This is the first step in turning the repo into the **Library of the Substrate**.

---

*"We heal as we walk." — Mobius Systems*
