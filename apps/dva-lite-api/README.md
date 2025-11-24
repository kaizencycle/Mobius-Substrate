# DVA.LITE API

DVA.LITE is the first tier of the Dynamic Verification Architecture. It is a passive, read-only watcher that keeps an eye on Mobius-wide GI/MII signals and surfaces early warnings when integrity begins to drift.

## Features

- `/health` — readiness/liveness endpoint summarizing GI snapshot and broker metrics.
- `/metrics` — full Prometheus registry (GI gauges, engine histograms, alerts, etc.).
- `/alerts/check` — on-demand hook that emits a webhook alert when MII drops below the configured threshold.
- `/ops/summary` — JSON snapshot powering the Mobius `/ops` dashboard.

The service never mutates ledger or broker state. It exists purely as the “stethoscope” for operators.

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `8088` |
| `LEDGER_BASE_URL` | Civic Ledger base URL | `http://localhost:4006` |
| `BROKER_METRICS_URL` | Optional URL returning broker metrics JSON | _unset_ |
| `ALERT_WEBHOOK_URL` | Optional webhook target (Discord/Slack/etc.) | _unset_ |
| `MII_THRESHOLD` | Minimum acceptable integrity score before alerts fire | `0.95` |
| `SAFE_MODE_ENABLED` | Whether to expose the service as already in safe mode (0/1 gauge) | `false` |
| `METRICS_REFRESH_MS` | Polling interval for GI snapshots feeding `/metrics` & `/ops/summary` | `30000` |

## Development

```bash
npm install
npm run dev
```

The service will hot-reload via `tsx` and listen on `PORT` (default `8088`).

## Production

```bash
npm run build
PORT=8088 LEDGER_BASE_URL=https://ledger.mobius.run npm start
```

Deployments should front this service with Render/Kubernetes health checks hitting `/health`.
