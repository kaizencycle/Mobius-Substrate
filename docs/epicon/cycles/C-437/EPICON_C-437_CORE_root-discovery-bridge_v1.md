---
epicon_id: EPICON_C-437_CORE_root-discovery-bridge_v1
title: "C-437: Root Discovery Bridge — apex robots/sitemap/llms.txt + Cycle 0 proxy"
cycle: "C-437"
status: published
agent_id: claude-code-c437-root-discovery-bridge
authority: content_publication_no_production_mutation
execution_authorized: false
---

# EPICON_C-437_CORE_root-discovery-bridge_v1

## Intent publication

```intent
epicon_id: EPICON_C-437_CORE_root-discovery-bridge_v1
ledger_id: kaizencycle
scope: core, docs
mode: normal
issued_at: 2026-09-18T00:00:00Z
expires_at: 2026-12-17T00:00:00Z
justification:
  VALUES INVOKED: transparency, non-duplication, verifiability, provenance.
  REASONING: The Cycle 0 / Virtue Accord discovery PR (mobius-browser-shell
    #103) was built on an unverified assumption that Browser Shell served
    mobius-substrate.com's root domain. A follow-up check against actual
    Vercel project domains found otherwise: the apex belongs to a separate
    project, mobius-landing, which is part of this repository
    (apps/mobius-landing). All discovery URLs published in #103 (canonical
    links, llms.txt, sitemap.xml) pointed at a domain that never served
    that content. The maintainer's direction was explicit: do not move the
    apex domain away from mobius-landing, do not settle for
    chambers.mobius-substrate.com as the only canonical location, and do
    not duplicate Cycle 0's text into a second app. This PR builds the
    requested Root Discovery Bridge instead, scoped narrowly to
    apps/mobius-landing plus one doc correction. This EPICON record exists
    because sentinel-review.yml's REQUIRE_EPICON hard rule requires a
    docs/epicon/* record on any PR it reviews; this file satisfies that
    while mirroring the same intent block already published in the PR
    body (Mobius-Substrate#450), per EPICON-02's own no-duplicate-source
    intent.
  ANCHORS:
    - mobius-browser-shell#103 (merged) and its own Codex review thread,
      where the topology gap was first surfaced and the maintainer's
      Option 3 (reverse-proxy from apex, not domain reassignment) was
      chosen
    - Vercel project API: mobius-browser-shell's only Mobius domain is
      chambers.mobius-substrate.com; mobius-landing owns
      mobius-substrate.com and www.mobius-substrate.com
    - apps/mobius-landing's existing app/ directory before this PR
      (app/page.tsx, app/[...page]/page.tsx, app/layout.tsx) had no
      robots.ts, sitemap.ts, or llms.txt route at all
  BOUNDARIES: Only apps/mobius-landing (new robots.ts, sitemap.ts,
    llms.txt route, a small lib/site.ts constant, and three lines of
    next.config.mjs rewrites) plus this docs/epicon record and one other
    doc correction (FIVE_SURFACES.md). No change to mobius-browser-shell
    or its canon content in this PR; no DNS/domain reassignment in
    Vercel; no duplication of Cycle 0 or Virtue Accord text into this
    app, since both proxy through to Browser Shell's existing pages
    unmodified.
  COUNTERFACTUAL: If the rewrite proxy breaks canonical-link resolution
    or introduces a redirect loop, revert next.config.mjs's rewrites()
    addition alone; robots.ts/sitemap.ts/llms.txt route stand
    independently of it. If a maintainer wants epicon.mobius-substrate.com
    listed in llms.txt, that requires provisioning the subdomain first —
    it was deliberately left out here because no such domain exists yet
    in this org's Vercel projects or docs.
counterfactuals:
  - If a human reviewer finds the proxy destination wrong, fix next.config.mjs's rewrites() array; no other file needs to change.
  - If ZEUS flags the /ops Disallow as out of stated scope, revert that one line independently — not load-bearing for the discovery bridge.
  - If next build still cannot be validated in CI the way it failed locally, that is a CI-environment question (Google Fonts egress), not a defect in these files.
```

## Witness Table

| Claim | Verdict | Evidence |
|-------|---------|----------|
| `chambers.mobius-substrate.com` is the only Mobius-Substrate-pattern domain on the `mobius-browser-shell` Vercel project; the apex is not | TRUE | https://vercel.com/kaizencycles-projects/mobius-browser-shell |
| `mobius-substrate.com` and `www.mobius-substrate.com` belong to a separate project, `mobius-landing`, backed by `apps/mobius-landing` in this repo | TRUE | https://vercel.com/kaizencycles-projects/mobius-landing |
| `terminal.mobius-substrate.com` is a real, attached domain (not assumed) | TRUE | https://vercel.com/kaizencycles-projects/mobius-civic-ai-terminal |
| `handbook.mobius-substrate.com` is served via GitHub Pages, not Vercel | TRUE | `git show origin/main:CNAME` → `handbook.mobius-substrate.com` |
| `epicon.mobius-substrate.com` does not exist anywhere in this org's docs, code, or Vercel projects — deliberately excluded from the new `llms.txt` | TRUE | `git grep -n "epicon\.mobius-substrate" origin/main` — zero matches in Mobius-Substrate and mobius-browser-shell |
| `apps/mobius-landing` had no `robots.txt`, `sitemap.xml`, or `llms.txt` before this PR | TRUE | `git ls-tree -r --name-only origin/main -- apps/mobius-landing` (pre-PR) — no such files listed |
| New TypeScript files type-check and lint cleanly | TRUE | `npx tsc --noEmit` and `npx next lint --dir app --dir lib` — zero errors, zero warnings |
| `next.config.mjs` rewrites resolve to the intended destinations | TRUE | `next.config.mjs`'s `rewrites()` evaluated directly — three entries, `/canon/cycle-0`, `/canon/cycle-0.json`, `/canon/virtue-accord`, each pointing at `chambers.mobius-substrate.com` |
| A full `next build` could not be completed in this sandbox | TRUE-gap | `npm run build --workspace=apps/mobius-landing` fails fetching Google Fonts (`fonts.googleapis.com`), reproduced identically on unmodified `main` via `git stash` — pre-existing sandbox egress limitation, not this diff |

## Authority

`execution_authorized: false` — this record publishes the intent already stated in Mobius-Substrate#450's PR body; the code change itself is a content-discovery routing addition (new static routes, a narrow reverse-proxy config) with no production data mutation, no credential or secret access, and no deployment authority exercised beyond the repo's normal Vercel auto-deploy on merge.

---

*"We heal as we walk." — Mobius Systems*
