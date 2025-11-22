# DVA.LITE Flows — Monitoring Tier

DVA.LITE is the **lightweight monitoring layer** of the DVA stack. It does not execute actions; it only observes, logs, and surfaces anomalies.

## Flows

- `dva_lite_monitor.json` — Core uptime & latency monitor for Broker + Ledger
- `dva_lite_anomaly_dashboard.json` — Daily digest that summarizes anomalies
- `*.md` files — Design notes for each flow

Outputs from this tier may notify operators (Discord/Telegram) but never mutate state.
