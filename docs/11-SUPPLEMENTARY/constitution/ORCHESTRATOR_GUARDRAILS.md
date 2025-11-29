# Orchestrator Guardrails

These guardrails describe how any external orchestrator (n8n, Zapier, custom flow engine) may interface with Mobius OS while preserving the charter’s separation between tools and governors.

## Principles

1. **Sentinels arbitrate** &mdash; external workflows may never bypass Sentinel consensus or alter routing policy. `/v1/deliberate` is the only supported ingress.
2. **GI > 0.95 or bust** &mdash; any result with `gi_score < 0.95` (or `decision = needs_human_review / human_required`) must be escalated to a human operator. Automated posting is prohibited until review is complete.
3. **Ledger-first provenance** &mdash; orchestrators must attach the Civic Ledger attestation (or the `deliberation_id` link) to every distribution target so downstream readers can verify integrity.
4. **Read-only posture** &mdash; flows may read `/health`, `/metrics`, `/alerts/check`, and ledger stats. They may not write to the ledger, Sentinels, or MIC reward systems.
5. **Transparent logging** &mdash; each orchestration run logs `{ deliberation_id, routingMode, gi_score, target }` for audit. Logs must be retained for at least one GI season.

## Approved Automation

- Posting Broker-approved answers to public channels once GI ≥ 0.95.
- Creating Notion/Docs summaries that embed the decision, GI, and ledger link.
- Paging operators when the Broker flags `needs_human_review`.
- Refreshing dashboards by pulling DVA.LITE metrics.

## Prohibited Automation

- Auto-approving decisions when GI < 0.95 or when Sentinels request a human.
- Modifying `ENGINE_CONFIG`, `DEFAULT_ROUTING_MODE`, or Sentinel weights from an orchestrator.
- Triggering new deliberations recursively based solely on an engine answer (prevents AI→AI loops).
- Writing attestation data directly to the Civic Ledger.

Following these constraints keeps orchestrators firmly in the “UI shell” role while ensuring Mobius’ constitutional loop—Broker ➝ Sentinels ➝ Ledger—remains intact.
