# DVA.LITE API

DVA.LITE is the first tier of the Dynamic Verification Architecture. It is a passive, read-only watcher that keeps an eye on Mobius-wide GI/MII signals and surfaces early warnings when integrity begins to drift.

## Features

- `/health` &mdash; readiness/liveness endpoint summarizing GI snapshot and broker metrics.
- `/metrics` &mdash; Prometheus-style counters suitable for Grafana/Render scraping.
- `/alerts/check` &mdash; on-demand hook that emits a webhook alert when MII drops below 0.95.

The service never mutates ledger or broker state. It exists purely as the “stethoscope” for operators.

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `8088` |
| `LEDGER_BASE_URL` | Civic Ledger base URL | `http://localhost:4006` |
| `BROKER_METRICS_URL` | Optional URL returning broker metrics JSON | _unset_ |
| `ALERT_WEBHOOK_URL` | Optional webhook target (Discord/Slack/etc.) | _unset_ |

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
