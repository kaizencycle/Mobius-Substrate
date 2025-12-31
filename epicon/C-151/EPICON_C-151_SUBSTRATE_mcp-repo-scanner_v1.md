---
epicon_id: EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1
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
  - "mcp"
  - "dva"
  - "repo-scanner"
  - "tooling"
  - "library"
  - "agents"
  - "catalog"
integrity_index_baseline: 0.95
risk_level: "low"
created_at: "2025-12-30T12:00:00-05:00"
updated_at: "2025-12-30T12:00:00-05:00"
version: 1
hash_hint: ""
summary: "MCP server that exposes Mobius-Substrate as a queryable knowledge substrate for DVA agents."
---

# Summary

This EPICON establishes the **MCP Repo Scanner** - a Model Context Protocol server that exposes the Mobius-Substrate repository as a queryable knowledge substrate for DVA agents. It transforms the monorepo from "just code" into a **digital library** with structured JSON tools.

---

## 1. Context

- Mobius-Substrate is the canonical monorepo for the civilization substrate
- DVA agents (AUREA, Echo, ATLAS, external MCP clients) need structured access to:
  - Repository topology
  - EPICON reasoning artifacts
  - Documentation
  - Code files
- Current approaches rely on ad-hoc GitHub scraping or incomplete local context
- We need a stable, scoped, auditable MCP entrypoint

## 2. Assumptions

- A1: MCP (Model Context Protocol) is the emerging standard for AI-tool integration
- A2: DVA agents benefit from structured JSON responses over raw file content
- A3: Security requires path scoping to prevent traversal attacks
- A4: EPICON documents should be first-class queryable artifacts

## 3. Problem Statement

Without a repo-aware MCP server:
- Each client implements ad-hoc scanning logic
- No clear contract for "where is what" in the repo
- Risk of over-scanning or leaking sensitive files
- EPICONs are hidden in the file tree rather than indexed

We need a **scoped, auditable, agent-friendly** interface to the Mobius knowledge surface.

## 4. Options Considered

### Option A: GitHub API Scraping
- Description: Use GitHub's REST/GraphQL API to fetch repo contents
- Upside: No custom server needed
- Downside: Rate limits, latency, incomplete file access
- Risks: Breaks with API changes, no local dev story

### Option B: Local File System Access
- Description: Give agents direct fs access via existing tools
- Upside: Fast, no new infrastructure
- Downside: No security boundary, no structured output
- Risks: Path traversal, context overflow, no filtering

### Option C: Custom MCP Server (Chosen)
- Description: Purpose-built MCP server with scoped tools
- Upside: Full control, security, structured JSON, EPICON awareness
- Downside: Requires maintenance, new package
- Risks: Need to keep in sync with repo structure

## 5. Decision / Design

- Chosen option: **Option C - Custom MCP Server**
- Why: Provides security (path scoping), structure (JSON tools), and first-class EPICON support
- Package: `@mobius/mcp-repo-scanner` at `mcp/mobius-repo-scanner/`
- Revisit when: MCP SDK has breaking changes, or GitHub adds native MCP support

### Scope of Access (Authority Clarification)

This section clarifies what authority the MCP server grants to agents:

| Aspect | Value | Notes |
|--------|-------|-------|
| **Access Mode** | Read-only | No write, delete, or modify operations |
| **Scope** | Local repository only | Scoped to `MOBIUS_REPO_ROOT` environment variable |
| **Path Traversal** | Blocked | `..` segments rejected; paths must resolve within repo root |
| **Excluded Paths** | Yes | `node_modules/`, `.git/`, `.env*`, `*.pem`, `*.key`, `secrets/`, build artifacts |
| **File Size Limit** | 200KB max | Prevents memory exhaustion; truncates larger files |
| **Rate Limits** | None (local) | MCP runs locally; no network rate limiting needed |
| **External Access** | No | Internal sentinels only; not exposed to external networks |
| **Symlink Following** | No | Symlinks are not followed to prevent escape attacks |

**Who Can Call This Server:**
- Internal DVA sentinels (ATLAS, AUREA, Echo, etc.)
- Local MCP clients (Cursor, Claude Desktop)
- CI/CD pipelines for catalog generation

**Who Cannot Call This Server:**
- External agents over the network (not exposed)
- Untrusted third-party tools
- Public APIs

### Tools Implemented

| Tool | Purpose |
|------|---------|
| `repo_summary` | High-level snapshot of repo structure |
| `list_tree` | Directory tree as JSON with depth/extension filtering |
| `read_file` | Safe, bounded file retrieval (max 200KB) |
| `search_files` | Grep-like search with configurable limits |
| `list_epicons` | Discover EPICON documents |
| `export_catalog` | Generate `catalog/mobius_catalog.json` manifest |

### Security Features

- **Path scoping**: All paths validated to stay within `MOBIUS_REPO_ROOT`
- **Exclusion patterns**: `node_modules/`, `.git/`, `.env*`, `*.pem`, `secrets/` blocked
- **Size limits**: Hard caps on file reads, search results, tree depth

## 6. Risk & Integrity Notes

- **Integrity tradeoffs**: Adding MCP tooling increases attack surface, but path scoping mitigates
- **Risk bearers**: Repository operators if exclusion patterns are incomplete
- **Metrics to watch**: Error rates, path traversal attempts, context size of responses
- **Follow-up needed**: If secrets leak, or if agents start hitting limits frequently

## 7. Implementation Links

- PRs: (this PR)
- Package: `mcp/mobius-repo-scanner/`
- Script: `scripts/exportCatalog.ts`
- Config: `.cursor/mcp.json`
- Catalog: `catalog/mobius_catalog.json`

## 8. Reflection Hook

Questions for future reflections:

- Did DVA agents actually use the MCP tools effectively?
- Were there any path traversal attempts or security issues?
- Did the catalog become the canonical "table of contents" for agents?
- Were the exclusion patterns sufficient, or did sensitive data leak?
- Did EPICON adoption increase now that they're queryable?
