---
# ============================================================================
# EPICON FRONTMATTER TEMPLATE
# ============================================================================
# Copy this template when creating new EPICONs.
# Fill in all required fields and remove optional ones you don't need.
# ============================================================================

epicon_id: EPICON_C-XXX_<TIER>_<slug>_v1
title: "<Human-readable title describing the EPICON>"
author_name: "<Your Name>"
author_wallet: ""                  # MIC wallet ID (optional)
cycle: "C-XXX"                     # Cycle number when created
epoch: ""                          # Optional epoch reference
tier: "SUBSTRATE"                  # One of: DVA.LITE | DVA.ONE | DVA.FULL | DVA.HIVE | SUBSTRATE
scope:
  domain: "<domain>"               # e.g., traffic, governance, tooling, economics
  system: "<system>"               # e.g., city-grid, mcp, sentinel
  environment: "testnet"           # testnet | mainnet | sim
epicon_type: "design"              # design | decision | reflection | incident | spec
status: "draft"                    # draft | active | deprecated | superseded
related_prs: []                    # GitHub PR URLs
related_commits: []                # Commit hashes
related_epicons: []                # Other EPICON IDs this builds on
tags: []                           # Searchable keywords
integrity_index_baseline: 0.95     # MIC / integrity score when authored
risk_level: "low"                  # low | medium | high | critical
created_at: ""                     # ISO 8601 timestamp
updated_at: ""                     # ISO 8601 timestamp
version: 1
hash_hint: ""                      # Optional content hash for verification
summary: ""                        # One-line summary for catalog indexing
---

# <EPICON Title>

- **Layer:** <Tier> → <Domain> → <System>
- **Author:** <Name> (+<AI Assist if applicable>)
- **Date:** <YYYY-MM-DD>
- **Status:** <Status>

---

## Summary

> One tight paragraph: what problem this EPICON addresses, at which tier, and the outcome you're aiming for.

---

## 1. Context

- What system are we operating in?
- What constraints are already known?
- What previous EPICONs / decisions does this build on?

---

## 2. Assumptions

- **A1:** <First assumption>
- **A2:** <Second assumption>
- **A3:** <Third assumption>

---

## 3. Problem Statement

Clear, bounded statement of the problem or decision.

---

## 4. Options Considered

### Option A: <Name>

- **Description:** What this option entails
- **Upside:** Benefits
- **Downside:** Drawbacks
- **Risk / Failure Modes:** What could go wrong

### Option B: <Name>

- **Description:** What this option entails
- **Upside:** Benefits
- **Downside:** Drawbacks
- **Risk / Failure Modes:** What could go wrong

---

## 5. Decision / Design

- **Chosen Option:** <Which option was selected>
- **Rationale:** Why it was chosen now
- **Conditions for Revisit:** When we'd reconsider this decision

---

## 6. Risk & Integrity Notes

- Integrity tradeoffs
- Who might bear risk
- What metrics we'll watch
- MII/GI impact assessment

---

## 7. Implementation Links

- **PRs:** <Links to related pull requests>
- **Commits:** <Relevant commit hashes>
- **Diagrams:** <Links to architecture diagrams>
- **Config Paths:** <Relevant configuration files>

---

## 8. Reflection Hook

Questions we want future reflections to answer:

- "Did this reduce incidents?"
- "Did it create new failure modes?"
- "Did incentives drift?"
- "What unexpected consequences emerged?"

---

## Document Control

**Version History:**
- v1: Initial specification (<Cycle>)

**License:** CC0 1.0 Universal (Public Domain)

---

*"We heal as we walk." — Mobius Systems*
