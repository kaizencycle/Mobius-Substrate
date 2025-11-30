# Chaos & Tokenomics Observability Pack

Grok highlighted the gap between Mobius' engineering rigor and the lack of published chaos/observability tooling. This note defines the minimum viable metrics and Grafana panels required to land the A+ stability score.

## Prometheus Targets

Add the following scrape jobs to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "mobius-chaos"
    metrics_path: "/metrics"
    static_configs:
      - targets:
          - "broker-api:9102"
          - "ledger-api:9103"
          - "shield-api:9104"
  - job_name: "sentinel-heartbeats"
    static_configs:
      - targets:
          - "atlas-sentinel:9110"
          - "aurea-sentinel:9111"
          - "zeus-sentinel:9112"
```

Each service must expose the following gauges/counters:

| Metric | Type | Description |
|--------|------|-------------|
| `mobius_gi_score` | gauge | Current GI reading (0–1.2) |
| `mobius_mii_score` | gauge | Current MII reading per service |
| `mobius_entropy_tax_burn_total` | counter | MIC burned via ETX |
| `mobius_integrity_rebate_total` | counter | MIC rebates paid |
| `mobius_cycle_lock_ratio` | gauge | Locked MIC ÷ circulating MIC |
| `mobius_sentinel_latency_ms` | summary | Round-trip sentinel decision latency |
| `mobius_consensus_fail_safe_total` | counter | FAIL_SAFE events triggered |

## Grafana Panels

Create a new dashboard `chaos_guardrails.json` with the following rows:

1. **Integrity Floor** — Graph `min(mobius_gi_score)` with threshold @ 0.95.
2. **Tokenomics Burns vs Mints** — Stacked bar `mobius_entropy_tax_burn_total` vs mint rate from ledger.
3. **Cycle-Lock Ratio** — SingleStat referencing `mobius_cycle_lock_ratio` (target 0.12–0.20).
4. **Sentinel Availability** — Table showing last heartbeat timestamp per sentinel (green ≤ 30s).
5. **Chaos Drill Timeline** — Annotation list built from Echo events tagged `chaos-test` (import via JSON API datasource).

Store the dashboard JSON under `infra/observability/grafana/dashboards/chaos_guardrails.json` once exported.

## Alert Rules

Add Prometheus alerting rules (pseudo):

```yaml
- alert: GIUnderfloor
  expr: mobius_gi_score < 0.95
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "GI dropped below 0.95"

- alert: SentinelOffline
  expr: absent(mobius_sentinel_latency_ms)
  for: 1m
  labels:
    severity: warning
```

## Operational Ritual

1. Every chaos drill must annotate Grafana (use the HTTP API) with `chaos-test:<scenario>`.
2. Echo logs `chaos:run` events referencing scenario + outcome.
3. Weekly runbook review ensures dashboards stay green; failures become C-150 follow-up tickets.

> *Telemetry is the proof of stability. Without charts, chaos is just a story.*
