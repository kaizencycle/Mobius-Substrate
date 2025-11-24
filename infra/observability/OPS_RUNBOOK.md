🛠️ **Mobius Ops Runbook (1-Page)**

Purpose: Quick reference for on-call operators, contributors, or future maintainers running the Mobius observability stack (Prometheus + Grafana + Ops Console).

This page covers startup, validation, debugging, and recovery—nothing philosophical.

---

✅ **1. Start the Observability Stack**

```bash
cd infra/observability
docker compose up -d
```

Services:

- Prometheus → http://localhost:9090
- Grafana → http://localhost:3000 (admin / admin)

---

✅ **2. Validate DVA.LITE Metrics Endpoint**

```bash
curl http://<dva-lite-host>:8080/metrics
```

Expected:

- `text/plain` Prometheus metrics
- No HTML / JSON errors
- No 404

If this fails, Prometheus can’t scrape.

---

✅ **3. Verify Prometheus Targets**

Open http://localhost:9090/targets and confirm:

```
dva-lite — UP
```

If `DOWN`:

- Fix `prometheus.yml` target
- Check Docker networking
- Ensure DVA.LITE is reachable
- Restart Prometheus: `docker compose restart prometheus`

---

✅ **4. Grafana Dashboard**

1. Grafana → Dashboards → Import
2. Upload `infra/observability/grafana/dashboards/mobius_ops_dashboard.json`
3. Pick the Prometheus datasource

You should see:

- GI score trend
- Engine latencies
- Routing counts
- Alerts (24h)
- Decisions (OK / Needs Human / Reject)

---

🧭 **5. Web Ops Console (Optional)**

The `/ops` page in the Mobius web app calls `GET /ops/summary`.

Set:

```
NEXT_PUBLIC_DVA_LITE_URL=https://your-dva-lite-url
```

Visit `/ops`.

---

🚨 **6. Common Failures & Fixes**

- **Grafana “No Data”**
  - Prometheus needs 15–30s for first scrape
  - Datasource URL incorrect
  - Dashboard panel set to wrong datasource
- **Prometheus can’t reach DVA.LITE**
  - Use `host.docker.internal` (Mac/Windows) or `172.17.0.1` (Linux)
  - Ensure ports open
- **Prometheus “duplicate job names”**
  - Rename or remove duplicates in `prometheus.yml`
- **Grafana won’t start**
  - `docker compose logs grafana`
  - Check volume permissions / port conflicts

---

🧹 **7. Teardown**

```bash
docker compose down
```

Remove volumes as well:

```bash
docker compose down -v
```

---

📝 **8. Shift Checklist**

| Task | Frequency |
| --- | --- |
| Prometheus targets UP? | Daily |
| GI score above threshold? | Daily |
| Latency spikes? | Daily |
| Scrape errors? | Daily |
| Dashboard loading normally? | Daily |
| `/metrics` reachable? | After deployments |
| `/ops/summary` returning JSON? | After deployments |

---

🧩 **9. Where to Edit Configs**

| Component | File |
| --- | --- |
| Prometheus jobs | `infra/observability/prometheus.yml` |
| Grafana dashboards | `infra/observability/grafana/dashboards/*.json` |
| Docker stack | `infra/observability/docker-compose.yml` |
| Ops Console endpoint URL | `.env / NEXT_PUBLIC_DVA_LITE_URL` |

---

☑️ **Done**

Stack is operational, monitorable, and on-call ready.
