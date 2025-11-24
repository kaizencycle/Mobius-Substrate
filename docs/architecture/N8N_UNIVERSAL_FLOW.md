# Universal Orchestrator Flow (n8n-style)

The Mobius OS exposes a minimal, constitutional set of APIs (`/v1/deliberate`, Civic Ledger attest endpoints, DVA.LITE health/metrics) that can be composed inside a visual orchestrator such as n8n. The goal is to let operators build “UI shells” (Discord bots, Substack pipelines, incident bots) without granting those shells any governance authority.

## High-Level Steps

1. **Ingress** &mdash; A trigger node listens to Discord, email, or a custom webhook and forwards the human prompt plus metadata.
2. **Broker Call** &mdash; The orchestrator POSTs to `https://broker.mobius/v1/deliberate` with `routingMode` set to `multi-engine` (or the policy-required mode). The response includes `gi_score`, `decision`, and per-engine telemetry.
3. **Decision Gate** &mdash; A switch node checks the `gi_score` and `decision` fields. If the result is `needs_human_review` or `gi_score < 0.95`, the flow routes to an operator review task (PagerDuty, Slack thread, etc.).
4. **Distribution** &mdash; When the decision is `ok`, the orchestrator can publish the answer to Substack, Notion, Discord, or GitHub Issue templates. Every payload includes the `deliberation_id` for traceability.
5. **Telemetry Loop** &mdash; A parallel branch hits `DVA.LITE /metrics` and `Ledger /ledger/stats/mii` to embed current GI state into dashboards or send them along with the result.
6. **Ledger Anchor** &mdash; Optional nodes can fetch the Civic Ledger attestation for the `deliberation_id` and attach it to downstream destinations, ensuring recipients can verify provenance.

## Governance Guardrails

- The orchestrator never writes to Broker or Ledger; it only reads API responses and reacts.
- Human-in-the-loop paths are mandatory whenever the Broker returns `needs_human_review` or the GI threshold is breached.
- The orchestrator stores only the `deliberation_id` and derived artifacts; all high-integrity data lives in the Ledger/Sentinel stack.

## Recommended Nodes

| Node | Purpose |
| --- | --- |
| HTTP Request (POST) | Call `/v1/deliberate` with routing metadata. |
| IF / Switch | Branch on `gi_score`, `decision`, or `flags`. |
| Slack/Discord | Deliver answers or alerts to operators. |
| Notion/Substack | Publish approved responses. |
| HTTP Request (GET) | Poll DVA.LITE `/health` or `/metrics` for dashboards. |
| Delay/Loop | Re-run GI checks every N minutes for long-lived deliberations. |

With these nodes, teams can compose new “operator runbooks” without redeploying core services, keeping Mobius flexible while honoring the charter’s separation between tools and governors.
