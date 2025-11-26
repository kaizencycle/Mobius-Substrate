# AI Encyclopedia + ECHO Retrieval

Mobius now maintains a GI-gated Encyclopedia that captures the best nightly answers from Thought Broker. Entries are versioned, source-backed, and optionally anchored to Civic Ledger so any agent can "retrieve canon" before re-running a full deliberation.

## Components
- **Database**: `encyclopedia_entries` table (see `apps/broker-api/migrations/20251126_create_encyclopedia_entries.sql`).
- **Service Layer**: `apps/broker-api/src/services/encyclopediaService.ts` handles search, canonical lookups, and ingestion.
- **API**: `GET /v1/encyclopedia/:topicId`, `GET /v1/encyclopedia?query=` and `POST /v1/encyclopedia/ingest` (see `apps/broker-api/src/routes/encyclopedia.ts`).
- **Nightly Builder Flow**: documented JSON contract plus cron/n8n recipe in `AI_ENCYCLOPEDIA_FLOW.md`.
- **Retrieval Priority**: agent-side decision tree for when to trust ECHO vs Encyclopedia vs Thought Broker (see `RETRIEVAL_PRIORITY.md`).
- **Governance**: Charter and promotion/demotion rules captured in `CHARTER.md`.

## Usage
1. **Ingest** high-GI consensus payloads via `/v1/encyclopedia/ingest`. The service auto-promotes entries to `CANONICAL` when `giScore >= 0.95` and records the ledger transaction ID when provided.
2. **Retrieve** canonical knowledge with `GET /v1/encyclopedia/:topicId`. Agents can pass `jurisdictionId` to scope entries.
3. **Search** by topic/title/summary using `GET /v1/encyclopedia?query=tokenomics` for human dashboards or debug tooling.
4. **Nightly Automation**: Configure n8n (or cron + worker) per `AI_ENCYCLOPEDIA_FLOW.md` to generate topics, call `/v1/deliberate`, optionally anchor to Civic Ledger, and ingest back into the Encyclopedia.
5. **Agent SDK**: Follow the `retrieveCanon()` helper contract in `RETRIEVAL_PRIORITY.md` to bias retrieval toward already verified knowledge before invoking costly deliberation runs.

## Status Workflow
| Status | Threshold | Action |
|--------|-----------|--------|
| `CANONICAL` | GI ≥ 0.95 | Available for trusted retrieval; ledger anchoring required |
| `DRAFT` | 0.90 ≤ GI < 0.95 | Requires human review within 30 days; optional ledger anchor |
| `NEEDS_REVIEW` | GI < 0.90 | Blocked from retrieval until corrected |
| `REDACTED` | N/A | Removed due to legal/ethics override (documented in Charter) |

Promotion/demotion processes, reviewer expectations, and ledger requirements live in `CHARTER.md`.

## File Map
```
docs/encyclopedia/
├── README.md                # This overview
├── AI_ENCYCLOPEDIA_FLOW.md  # n8n/cron JSON contract
├── RETRIEVAL_PRIORITY.md    # Retrieval decision tree + helper snippet
└── CHARTER.md               # Canonical/Draft governance rules
```

> **Tagline**: *"MEMT tasks graduate with honors—then live forever in the Cathedral’s Encyclopedia."* Every night we distill the best civic knowledge, GI-score it, anchor it, and make it instantly retrievable.
