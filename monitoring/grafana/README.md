# Mobius Grafana Pack v1

Dashboards & alerts for the Mobius Integrity Stack.

## Metrics Expected (Prometheus)

- `mii_value{env,agent?}` — current Mobius Integrity Index (0–1)
- `mii_contribution{env,agent}` — agent contribution to MII (+/-)
- `mic_issued_total{env,reason?}` — integrity credits minted
- `mobius_integrity_violations_total{env,type}` — violation counter
- `attestation_latency_seconds_bucket{env}` — histogram
- `http_requests_total{route,status,env}` — API traffic/health
- `http_request_duration_seconds_bucket{route,env}` — API latency

## Logs Expected (Loki)

- Labels: `{env, app="mobius-api"}`; errors include the route
- Example query: `{env="$env"} |= "ERROR" |= "/api/mobius"`

## Run Locally via Docker Compose

Set env:

```bash
export PROMETHEUS_URL=http://prometheus:9090
export LOKI_URL=http://loki:3100
```

Mount `provisioning/` to Grafana at `/etc/grafana/provisioning`
and `dashboards/` to `/var/lib/grafana/dashboards`.

## Alert Thresholds

- MII < 0.95 → Warning
- MII < 0.90 → Critical
- Attestation p95 > 2s → Warning
- API 5xx > 0.5/s → Warning

Tune as you collect baseline data.
