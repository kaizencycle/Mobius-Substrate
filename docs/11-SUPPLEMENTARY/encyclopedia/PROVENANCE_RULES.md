# Encyclopedia Provenance & Review Rules

This document captures how we decide which entries become canon, how the admin queue works, and how Civic Ledger attestations fit in.

## Status Ladder

| Status | Description | Entry Path |
|--------|-------------|------------|
| `approved` | High-GI, ready for public reuse. | `giScore ≥ 0.97` auto-approve or human promotion. |
| `pending_review` | Borderline GI answers awaiting custodian sign-off. | `0.93 ≤ giScore < 0.97` or explicit manual flag. |
| `draft` | Stored for analysis but not exposed. | Experimental seeds or `giScore < 0.93`. |
| `rejected` | Reviewed and deemed inaccurate / incomplete. | Requires explicit human action. |

Public API defaults to `status=approved`. Internal tools can request `approved,pending_review`. Rejected entries never leak unless admins fetch them directly.

## Admin Review Workflow

1. **Queue** — `GET /v1/encyclopedia/admin/review-queue?status=pending_review&limit=20`.
2. **Inspect** — `GET /v1/encyclopedia/admin/entries/:id` shows answer, sources, GI, consensusLevel, echoId, ledgerTxId.
3. **Decide** — `POST /v1/encyclopedia/admin/entries/:id/review` with `{ decision: "approve" | "reject", notes, attachLedger }`.
4. **Ledger (optional)** — when `attachLedger = true`, the service posts `type:"encyclopedia_entry_review"` to Civic Ledger, persisting reviewer ID + notes.

Every human action sets `reviewedBy`, `reviewedAt`, `reviewNotes`, and optionally `ledgerTxId`. These fields power MIC rewards for librarians, dashboards for leadership, and audit trails for future agents.

## Ledger Integration

- **Automatic attestation** — the seeding pipeline tries to call Civic Ledger right after saving a new entry.
- **Review attestation** — manual approvals can mint a second ledger record referencing the reviewer.
- **Traceability** — each entry ultimately references:
  - `echoId` (ECHO memory)
  - `ledgerTxId` (machine attestation)
  - `reviewLedgerTxId` (optional human attestation, future field)

## Serving Rules

- Clients should display GI + ledger badges (e.g., `GI 0.97 • Ledger tx-123`).
- When multiple versions exist, always return the highest `version` with `status=approved`.
- When GI dips below policy thresholds, degrade gracefully: show warning badge (“Trusted, Under Review”) or force fresh deliberation.

## MIC Incentives (future)

- Approving a pending entry yields MIC based on `giScore` × future usage.
- Rejecting or editing inaccurate entries yields a smaller reward plus ledger trace.
- Review history becomes part of custodian reputation inside Kaizen OS.
