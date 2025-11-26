# Encyclopedia Charter

The Encyclopedia protects the civic knowledge canon. Entries graduate through well-defined states and every status carries ledger, review, and retrieval obligations.

| Status | GI Threshold | Human Review | Civic Ledger | Retrieval Priority |
|--------|--------------|--------------|--------------|--------------------|
| **CANONICAL** | ≥ 0.95 | Optional spot-check | Required | 0.98 |
| **DRAFT** | 0.90–0.94 | Mandatory within 30 days | Optional | 0.93 (flagged) |
| **NEEDS_REVIEW** | < 0.90 | Immediate | No | Blocked |
| **REDACTED** | Any | Security/Ethics override | No | Removed |

## Promotion Path (Draft → Canonical)
1. Human reviewer confirms sources, ledger hash, and accuracy.
2. Reviewer triggers `/v1/encyclopedia/review` (future endpoint) or updates row manually.
3. System bumps `version`, sets `status='CANONICAL'`, records reviewer + timestamp, and anchors to Civic Ledger.
4. Integrity bots broadcast the upgrade so agents refresh their caches.

## Demotion Path (Canonical → Redacted)
1. Legal, ethics, or security board issues a signed veto (Atlas/Aurea consensus or human override).
2. Entry receives a new version with `status='REDACTED'` and a reason code.
3. Retrieval priority drops to 0 and downstream caches purge the topic.
4. Prior canonical versions remain immutable but hidden from default retrieval to preserve auditability.

## Governance Notes
- **Virtue Tags**: Each entry should include virtue metadata (truth, care, justice) for audit scoring.
- **Ledger Hooks**: Civic Ledger attestation IDs (`ledger_tx_id`) must be stored for all canonical entries; drafts may link once promoted.
- **Jurisdictions**: `jurisdiction_id` scopes entries for localized policies. If absent, the entry is global.
- **Review SLA**: Draft entries older than 30 days automatically move to `NEEDS_REVIEW` and trigger alerts.
- **Redaction Authority**: Only the Civic Integrity Board may set `REDACTED`; every change logs a signed attestation.

The Charter ensures encyclopedia entries meet the same GI, ethics, and provenance guarantees as ECHO cache hits, so agents can rely on them as authoritative context.
