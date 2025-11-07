# Health Endpoints

- `GET /healthz` -> `{"status":"ok","uptime":...}`
- `GET /readyz`  -> checks downstreams (ledger, db)
- `GET /metrics` -> Prometheus metrics

## SLOs

- **p95 request latency**: < 250ms
- **Error rate**: < 0.5% per 5m
- **Uptime**: 99.5% rolling 30d

