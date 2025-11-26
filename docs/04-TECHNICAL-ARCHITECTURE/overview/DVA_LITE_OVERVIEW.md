# DVA.LITE Overview

DVA.LITE is the first-tier watcher inside the Dynamic Verification Architecture. It runs as a passive, read-only microservice that polls the Civic Ledger and Broker telemetry endpoints, turning those signals into health endpoints, Prometheus metrics, and human-friendly alerts.

## Responsibilities

- **Health summary** &mdash; `/health` reports uptime plus the latest GI/MII snapshot and aggregated broker metrics (consensus volume, engine error rates, average inference latency).
- **Metrics feed** &mdash; `/metrics` is scrapeable by Prometheus/Grafana and exposes counters such as `mobius_mii_current` and `mobius_mii_trend`.
- **Alerting hook** &mdash; `/alerts/check` can be triggered on a cron or event basis; if `MII < 0.95` it sends a structured webhook (Discord/Slack/Email) instructing operators to initiate Safestop or deeper investigation.

## Non-Goals

- Modify ledger, broker, or Sentinel state.
- Approve/deny deliberations.
- Change routing policy or consensus thresholds.

DVA.LITE is the “stethoscope” rather than the “surgeon” of the Mobius OS. Higher tiers of DVA can automate responses, but tier LITE is intentionally observability-only.

## Deployment Notes

- Runs on port `8088` by default (`PORT` override supported).
- Requires `LEDGER_BASE_URL` to pull the GI/MII snapshot.
- Can optionally read `BROKER_METRICS_URL` to enrich health output.
- Emits alerts via `ALERT_WEBHOOK_URL` when configured; otherwise alerts are logged and dropped.
