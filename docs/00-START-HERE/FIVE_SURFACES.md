# Five Surfaces — Mobius Federation Topology

**Cycle:** C-363 · **Status:** Canonical reference

Mobius is not a single application. It is five cooperating surfaces. When documentation refers to “layers” or “repos,” prefer this list to avoid drift.

---

## The five surfaces

| # | Surface | Role | Canonical home |
|---|---------|------|----------------|
| 1 | **Mobius Substrate** | Constitutional docs, cycles, sentinels, integrity math, federation policy | This repository |
| 2 | **Mobius Civic AI Terminal** | Live pulse — GI, vault seals, sentinel journal, tripwires, EPICON ingest | `mobius-civic-ai-terminal` |
| 3 | **Mobius Browser Shell** | Public onboarding — School of Chambers, learn/play/explore | `mobius-browser-shell` |
| 4 | **Civic Protocol Core (CPC)** | Protocol rails — identity, ledger, MIC wallet, attestations | `Civic-Protocol-Core` |
| 5 | **HIVE** | Playable civic world — quests, signals, community simulation | Browser Shell + world APIs |

---

## How they relate

```text
Browser Shell (onboard) ──► Terminal (pulse) ──► CPC (attest)
        │                         │
        └──── HIVE (world) ◄──────┘
Substrate (constitution, cycles, definitions)
```

- **Substrate** does not replace runtime services — it defines how they must behave.
- **Terminal** is the live integrity console; do not confuse it with the Shell hallway.
- **CPC** is the write path for immutable attestations; Shell and Terminal call it, they do not duplicate it.
- **HIVE** is the experiential world layer; canon names stay `HIVE`, public UI may say **World**.

---

## Domain topology (verified against production, C-437)

**Stale-framing note (C-437):** during Cycle 0 discovery work, an agent
inferred from this doc's repo-ownership table that Browser Shell served
`mobius-substrate.com`'s root domain, and published discovery URLs
(canonical links, `llms.txt`, `sitemap.xml`) on that assumption. Production
Vercel routing said otherwise. That inference is marked **stale**, not
this doc's table above — the table describes repo ownership of each
surface's *code*, which is still accurate; it never claimed to describe
DNS/domain routing. The mapping below closes that gap so the same
inference isn't repeated.

| Domain | Serves | Vercel project | Repo |
|---|---|---|---|
| `mobius-substrate.com`, `www.mobius-substrate.com` | Front door — journey landing page, Builder.io-managed pages, root discovery bridge (`/robots.txt`, `/llms.txt`, `/sitemap.xml`, `/canon/cycle-0`, `/canon/virtue-accord`) | `mobius-landing` | `Mobius-Substrate` (`apps/mobius-landing`) |
| `chambers.mobius-substrate.com` | School of Chambers — canon renderer, citizen entry, canonical `/canon/*` content | `mobius-browser-shell` | `mobius-browser-shell` |
| `terminal.mobius-substrate.com` | Live pulse — GI, vault seals, sentinel journal, EPICON ingest | `mobius-civic-ai-terminal` | `mobius-civic-ai-terminal` |
| `handbook.mobius-substrate.com` | Rendered documentation site | GitHub Pages (`CNAME`) | `Mobius-Substrate` |

The apex (`mobius-substrate.com`) does not duplicate Cycle 0 / Virtue
Accord content. It reverse-proxies `/canon/cycle-0`, `/canon/cycle-0.json`,
and `/canon/virtue-accord` to Browser Shell via `next.config.mjs`
`rewrites()` in `apps/mobius-landing`, so Browser Shell stays the single
owner of that content while the apex remains the discoverable front door.
Each surface's own `robots.txt`/`sitemap.xml` stays independently
controlled — the apex's does not forward Browser Shell's, since each host
may need different crawl rules over time. `llms.txt` is the one exception:
the apex's `llms.txt` is deliberately the Mobius-wide discovery map, not
just this app's local manifest.

**Lesson:** DNS and deployment topology are evidence too. Verify against
`vercel.com` project domains (or an equivalent live check) before
asserting which surface serves which host — this doc does not define that
mapping by itself, and can drift from it exactly as it just did.

---

## Deprecated framings

Replace older copy that says:

- “four repositories” → **five surfaces** (above)
- “four layers of sovereignty” (whitepaper sense) → keep in research papers; for **product** docs use five surfaces
- “Mobius Systems” (legal legacy) → **Mobius Substrate** or **Mobius** as appropriate

---

## Cross-links

- [What is Mobius?](./WHAT_IS_MOBIUS.md)
- [School of Chambers](./SCHOOL_OF_CHAMBERS.md) — public names vs canon names
- [Canonical definitions](./CANONICAL_DEFINITIONS.md)
- [State of the Substrate (latest)](../STATE_OF_THE_SUBSTRATE_LATEST.md)

*"We heal as we walk."*
