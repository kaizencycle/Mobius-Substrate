# Observability Stack (Quick Start)

This directory launches a minimal Prometheus + Grafana stack for monitoring **DVA.LITE** and the Mobius integrity pipeline.

---

## 1. Requirements

- Docker + Docker Compose
- A running `DVA.LITE` service exposing:
  - `/metrics` (Prometheus format)
  - `/ops/summary` (JSON summary)

Update `prometheus.yml` with the correct host/port for DVA.LITE.

---

## 2. Start the Stack

```bash
cd infra/observability
docker compose up -d
```

Services:

- Prometheus → http://localhost:9090
- Grafana → http://localhost:3000 (user/pass: admin / admin)

---

## 3. Configure Prometheus

Edit `prometheus.yml` if your DVA.LITE host differs:

```yaml
scrape_configs:
  - job_name: "dva-lite"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["host.docker.internal:8080"]
```

Replace `host.docker.internal:8080` with whatever your service exposes.

---

## 4. Import the Grafana Dashboard

1. Open Grafana → **Dashboards → Import**
2. Upload `infra/observability/grafana/dashboards/mobius_ops_dashboard.json`
3. Select your Prometheus datasource
4. Save

You now have the full Mobius Ops Console:

- MII (Global Integrity)
- Alerts (24h)
- Decisions (OK / Needs Human / Reject)
- Engine Latency (p50/p90)
- MII vs Threshold trend

---

## 5. Web Ops Console (Optional)

The Mobius web app renders a live snapshot from `GET /ops/summary`.

Set:

```
NEXT_PUBLIC_DVA_LITE_URL=https://your-dva-lite-url
```

Then visit `/ops`.

---

## 6. Stop Everything

```bash
docker compose down
```

---

## 7. Troubleshooting

- **No metrics in Grafana?**
  - Check DVA.LITE reachability from Docker
  - Ensure `prometheus.yml` points to the right host
- **Prometheus won’t start?**
  - Validate YAML indentation
  - Ensure no duplicate job names
- **Grafana “No data”?**
  - Wait 15–30 seconds for the first scrape
  - Verify the datasource URL

---

This README is intentionally minimal—future contributors get a <15 second setup path with zero cognitive load.

---
