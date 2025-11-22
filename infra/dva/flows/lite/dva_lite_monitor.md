# DVA.LITE — Core Monitor

## Purpose

Continuously monitor the health and responsiveness of:

- Thought Broker API
- Civic Ledger API
- (Future) other critical Mobius services

## Behavior

- Runs every 5 minutes
- Calls `BROKER_URL/healthz` and `LEDGER_URL/health`
- Captures HTTP status, latency, and errors
- Emits metrics into the ops telemetry sink (TODO placeholder)

## Outputs

- Metrics sink for dashboards and alerts
- Source data for `dva_lite_anomaly_dashboard`
