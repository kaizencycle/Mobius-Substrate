🛡️ **DVA.LITE — On-Call SOP (Standard Operating Procedure)**

Version: 1.0  
Scope: Mobius Systems – Integrity Monitoring Tier  
Purpose: Provide clear, repeatable, rapid response rules for incidents involving DVA.LITE, Prometheus, Grafana, and GI/MII telemetry.

---

## 1. 🔍 Purpose of DVA.LITE

DVA.LITE is the sentinel heartbeat of Mobius Systems. It continuously emits metrics describing:

- GI (Global Integrity)
- MII (Model Integrity Index)
- Routing stability
- Latency distribution
- Error codes / engine failures
- Suspicious behavioral patterns

Goal: detect drift early, isolate faults, prevent cascading failure into DVA.ONE/FULL/HIVE.

---

## 2. 🚨 On-Call Responsibilities

When on-call for DVA.LITE you **must** be able to:

1. Interpret GI/MII scores
2. Diagnose degraded routing
3. Restore metrics ingestion
4. Escalate to DVA.ONE when needed
5. Attest actions to the Civic Ledger
6. Communicate status to Custodian

You are **not** responsible for:

- Fixing engine-level bugs (Sentinel or Antigravity side)
- Rewiring the orchestrator
- Ledger database migrations

Focus: contain, stabilize, report.

---

## 3. 📊 Critical Metrics to Watch

### 3.1 Global Integrity (GI)

| GI Score | Meaning | Action |
| --- | --- | --- |
| ≥ 0.95 | Stable | No action |
| 0.90 – 0.94 | Mild drift | Investigate routing + replay last 10 events |
| 0.80 – 0.89 | Significant drift | Switch to “Local Mode Only”, notify Custodian |
| < 0.80 | Emergency | Trigger Human Review Lockdown |

### 3.2 Model Integrity Index (MII)

| Pattern | Meaning | Action |
| --- | --- | --- |
| Stable within ±2% | Normal variance | None |
| Sudden drop > 10% | Possible tool misuse or adversarial task | Inspect logs + replay |
| Oscillation | Engine disagreement | Force Sentinel-only mode |
| Flatline | Metrics missing | Check Prometheus scrape logs |

---

## 4. 🧪 Health Checks (Start of Shift)

1. `curl http://<dva-lite>/metrics` (expect Prometheus text)
2. http://localhost:9090/targets (ensure `dva-lite` is `UP`)
3. Grafana dashboard renders (no empty panels)

---

## 5. 🔥 Incident Handling

### SEV-1 — GI < 0.80 (Emergency Drift)

**Symptoms:** GI spike downward, MII divergence, consensus disagreements, routing oscillations.  
**Actions:**

1. Switch broker routing to **Local Only**
2. Trigger Human-Review Lockdown
3. Replay last 10 tasks (identify contamination)
4. Attest incident to Ledger (`event=dva_lite_incident`)
5. Escalate to Custodian (Michael)

### SEV-2 — Prometheus / Metrics Failure

**Symptoms:** `/metrics` returns HTML/JSON errors, Prometheus target `DOWN`, Grafana empty.  
**Actions:**

1. `docker logs dva-lite`
2. `docker compose restart prometheus`
3. Fix target IP (use `host.docker.internal` or `172.17.0.1`)
4. Confirm ingestion resumes
5. Attest recovery to Ledger

### SEV-3 — Latency Spikes / Engine Slowdowns

**Symptoms:** Gemini lags, Claude errors, DeepSeek timeouts.  
**Actions:**

1. Reduce routing to fastest engine (Gemini Flash)
2. Inspect latency panel per engine
3. Check API rate limits
4. Escalate if >30 min degradation

### SEV-4 — Minor Drift (0.90–0.94 GI)

**Symptoms:** Slight downward trend, more “Needs Human” decisions.  
**Actions:**

1. Replay last 5 tasks
2. Compare Sentinel disagreements
3. Look for long-context tasks / ambiguous policies
4. Increase ATLAS/AUREA weighting (“Integrity Boost”)

---

## 6. 🧯 Recovery Procedures

1. Restore baseline routing: `routingMode=local`, `allowedTools=[]`, `safetyLevel=high`
2. Clear suspicious task queues
3. Restart observability stack (`docker compose down && up -d`)
4. Re-enable Antigravity/tools after GI stabilizes for 15 minutes

---

## 7. 🛡️ Escalation Chart

| Condition | Escalate To |
| --- | --- |
| GI < 0.80 | Custodian (Michael) immediately |
| Metrics outage > 30 min | Mobius Infra dev |
| Repeated engine failures | ATLAS + AUREA |
| Ledger attestation failing | Civic Protocol Core |
| Multi-engine contradiction | Sentinel Consensus chamber |

---

## 8. 📝 Ledger Attestation Format

```json
{
  "event": "dva_lite_incident",
  "severity": "SEV-1",
  "gi": 0.77,
  "mii_delta": "-12%",
  "timestamp": "2025-11-24T12:34:00Z",
  "operator": "system-oncall",
  "notes": "Switched to Local Mode, replayed last 10 tasks"
}
```

---

## 9. ✔️ Shift-End Checklist

- GI stable ≥ 0.95
- All targets UP
- No red alerts in Grafana
- Incident reports attested
- Routing restored
- Telegram Ops cleared

---

## 10. 🔮 Future Additions

- Automatic root-cause clustering
- Drift fingerprinting
- Engine reliability scoring
- Multi-node integrity mesh
- Sentinel self-diagnostics

---

🏁 **SOP Complete**

Need more? Ask for:

- Alert Playbook
- Incident Automation Flow
- PagerDuty-style rotation plan
