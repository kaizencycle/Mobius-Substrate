# Mobius Ops Console

**Status:** Draft  
**Scope:** DVA.LITE telemetry → Prometheus → Grafana → `/ops` web console  
**Goal:** Give operators a clear, simple way to see if Mobius is *healthy, honest, and fast*.

---

## 1. What This Console Shows

The Mobius Ops Console stitches together:

- **DVA.LITE telemetry API** — emits metrics (MII, alerts, latency, decisions)
- **Prometheus** — scrapes/stores time-series metrics
- **Grafana** — operator dashboards
- **Web `/ops` page** — lightweight React view of current status

You get:

- Live **Global Integrity (MII)** snapshot
- **Alert counts** (last 24h)
- Decision distribution: ✅ OK / 🟡 Needs Human / ⛔ Reject
- Per-engine latency (p50/p90)
- MII vs threshold trend over time

---

## 2. Prerequisites

- Running **DVA.LITE** exposing:
  - `/metrics` (Prometheus)
  - `/ops/summary` (JSON summary for the dashboard)
- Prometheus + Grafana stack
- Mobius web app deployed with `NEXT_PUBLIC_DVA_LITE_URL`

Example web env:

```bash
NEXT_PUBLIC_DVA_LITE_URL=https://dva-lite.example.com
```

---

## 3. Architecture

```
User Browser  →  /ops (Next.js)  ┐
                                  │
                    DVA.LITE ──> /ops/summary (JSON)
                    DVA.LITE ──> /metrics (Prometheus)
                                  │
Prometheus ← scrape metrics       │
Grafana   ← visualize via Prometheus datasource
```

- Web `/ops` = current snapshot
- Grafana = history, trends, deep dive

---

## 4. Prometheus + Grafana (docker-compose)

`infra/observability/docker-compose.yml`

```yaml
version: "3.9"
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: mobius-prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    container_name: mobius-grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

`infra/observability/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "dva-lite"
    metrics_path: "/metrics"
    static_configs:
      - targets:
          - "dva-lite:8080"
```

Replace `dva-lite:8080` with the reachable host/port for your deployment.

Start the stack:

```bash
cd infra/observability
docker compose up -d
```

- Prometheus → http://localhost:9090  
- Grafana → http://localhost:3000 (admin / admin)

---

## 5. Import Grafana Dashboard

Use `infra/observability/grafana/dashboards/mobius_ops_dashboard.json`.

1. Grafana → Dashboards → Import
2. Upload the JSON file
3. Select Prometheus datasource
4. Save

Panels:

- Global Integrity (stat)
- Alerts (24h stat)
- Decisions (24h bar gauge)
- Engine latency p50/p90 (timeseries)
- MII vs threshold trend (timeseries)

---

## 6. Web `/ops` Console

- Page: `apps/mobius-landing/app/ops/page.tsx`
- Component: `apps/mobius-landing/components/ops/MobiusOpsDashboard.tsx`
- Backend: `GET {NEXT_PUBLIC_DVA_LITE_URL}/ops/summary`

Expected JSON shape:

```json
{
  "miiCurrent": 0.982,
  "miiThreshold": 0.95,
  "safeModeEnabled": false,
  "last24h": {
    "alerts": 3,
    "avgLatencyMs": {
      "openai": 780,
      "claude": 620,
      "gemini": 540,
      "deepseek": 690
    },
    "decisions": {
      "ok": 182,
      "needsHumanReview": 9,
      "reject": 2
    }
  }
}
```

If `/ops/summary` is not yet implemented, DVA.LITE should aggregate Prometheus metrics or maintain a summary cache.

---

## 7. Metrics Reference

Alignment / GI:

- `mobius_mii_current` — gauge
- `mobius_mii_threshold` — gauge
- `mobius_mii_trend{direction}` — gauge
- `mobius_mii_threshold_breach_total{severity}` — counter
- `mobius_alert_total{alert_type}` — counter
- `mobius_safe_mode_enabled` — gauge (0/1)

Deliberations:

- `mobius_deliberation_total{routing_mode,decision}` — counter
- `mobius_deliberation_gi_score{routing_mode}` — histogram `[0.0, 0.8, 0.9, 0.95, 0.98, 1.0]`

Engines:

- `mobius_engine_request_total{engine_id,routing_mode}` — counter
- `mobius_engine_error_total{engine_id,error_type}` — counter
- `mobius_engine_latency_ms_bucket{engine_id,le}` — histogram `[50, 100, 250, 500, 1000, 2000, 5000]`

Alerts / Safety:

- `mobius_alert_total{alert_type}` — counter (`gi_breach`, `engine_failure`, `latency_spike`, `config_change`)
- `mobius_safe_mode_enabled` — gauge

---

## 8. How Ops Reads the Dashboard

### 8.1 Global Integrity (MII)

- ≥ 0.98 → 🟢 Excellent
- 0.95–0.979 → 🟡 Watch closely (check Needs Human)
- < 0.95 → 🔴 Action required (safe mode / human-in-loop / audit recent changes)

If MII drops:

1. Check Alerts (24h)
2. Review recent deployments/config changes
3. Inspect engine latency panel

### 8.2 Alerts (24h)

- Low, stable → normal
- Spike → integrity violations, model disagreement, policy conflicts

Immediate actions:

1. Review Decisions (24h)
2. Inspect logs around alert timestamps
3. Raise thresholds or disable risky tools if needed

### 8.3 Decisions (24h)

- High `ok`, low `needsHuman/reject` → healthy
- Rising `needsHumanReview` → system uncertain → new workloads, ambiguous policies, probing users
- Rising `reject` → hard blocks → investigate potential abuse or over-tight policies

`needsHumanReview` = safety valve.  
`reject` = alarm bell.

### 8.4 Engine Latency

- p50 stable, p90 exploding → long-tail issues
- All engines slow → upstream/network issue
- Single engine slow → down-weight temporarily

High latency risks timeouts, retries, behavior drift.

### 8.5 MII vs Threshold Trend

Answers:

- Are we trending healthier?
- Did a change help/hurt?
- Are we hovering near threshold?

Use it for change validation, determining when to relax or tighten controls.

---

## 9. Minimal Ops Playbook

Three key questions:

1. **Is integrity holding?** → GI/MII, alerts
2. **Are decisions healthy?** → Decisions panel
3. **Is performance acceptable?** → Engine latency

If GI < threshold or alerts spike:

1. Enable safe/conservative mode
2. Increase human-in-loop coverage
3. Investigate deployments, provider outages, new request patterns

Always log incident notes so DVA.ONE / DVA.HIVE can learn and adjust thresholds/policies.

---

## 10. Next Steps / Extensions

- Per-tenant/per-city dashboards for HIVE domes
- DVA.LITE anomaly alerts (Slack/Telegram)
- Postmortem notebooks that merge metrics + logs
- Public transparency pages (sanitized integrity stats)

**Goal:** make it impossible for Mobius to drift in silence. The Ops Console is the first pair of human eyes over the integrity sky.

---
