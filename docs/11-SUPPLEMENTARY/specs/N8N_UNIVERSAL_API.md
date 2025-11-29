# Universal Flow API Contract

This document captures the minimal API surface needed by an external orchestrator (e.g., n8n) to drive Mobius OS flows without elevated privileges.

## `/v1/deliberate`

- **Method:** `POST`
- **Auth:** Broker API key header
- **Body:**

```json
{
  "prompt": "string",
  "routingMode": "local | antigravity-first | antigravity-only | multi-engine",
  "engines": ["antigravity", "openai", "claude", "deepseek"],
  "allowedTools": ["web-search"],
  "safetyLevel": "low | medium | high",
  "metadata": { "campaign": "string" }
}
```

- **Success Response:**

```json
{
  "status": "ok | needs_human_review",
  "gi_score": 0.97,
  "decision": "ok | needs_human_review | human_required | reject",
  "answer": "final decision text",
  "deliberation_id": "uuid",
  "engines": [
    {
      "engineId": "antigravity",
      "answer": "string",
      "riskFlags": [],
      "latencyMs": 1234
    }
  ],
  "flags": [],
  "consensus_source": "remote | local"
}
```

- **Human review Response:** HTTP `202` with the same payload but `status = "needs_human_review"`.

## Civic Ledger Snapshot

- **Endpoint:** `GET {LEDGER_BASE_URL}/ledger/stats/mii`
- **Returns:** `{ "mii": number, "trend": "up" | "down" | "flat", "window": "PT1H" }`
- Used by orchestrators to annotate outbound messages with the current GI trend.

## DVA.LITE

- **`GET /health`** &mdash; readiness plus broker metrics; useful for dashboards.
- **`GET /metrics`** &mdash; Prometheus text for Grafana or Render monitors.
- **`POST /alerts/check`** &mdash; triggers a webhook alert when `MII < 0.95`.

## Guardrails Checklist

1. Always log `deliberation_id` alongside downstream postings.
2. Treat `needs_human_review` and `human_required` as non-final until an operator confirms.
3. Surface GI trend + ledger attestation links wherever results are displayed.
4. Never store or replay raw engine outputs; rely on the Broker response for provenance.
