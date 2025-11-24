# DVA.LITE Alert Playbook

Human-readable runbooks for the most common Mobius Ops alarms. Each section captures **Triggers → Diagnosis → Actions → Ledger Attestation** so on-call can respond without hesitation.

---

## 1. 🔥 GI Drift (SEV-3)

**Trigger**
- Alert: `GI < 0.90`
- Grafana: GI panel enters red band
- TelegramOps: “DRIFT WARNING”

**Diagnosis**
- `curl http://<broker>/v1/gi`
- `curl http://<dva-lite>/metrics | grep mobius_mii`
- Review last 5 tasks for inconsistencies / disagreements.

**Actions**
1. Switch routing to Sentinel-only mode:
   ```json
   {"routingMode": "local","allowedTools":[]}
   ```
2. Replay last 5 tasks.
3. Inspect Sentinel disagreement summaries for pattern (policy conflict, tool drift, adversarial prompts).

**Ledger Attestation**
```json
{
  "event": "gi_drift_warning",
  "severity": "SEV-3",
  "gi": 0.89,
  "action": "routed_to_local"
}
```

---

## 2. 🔥🔥 GI Crisis / Collapse (SEV-1)

**Trigger**
- GI < 0.80
- Auto-lockdown signal from n8n
- TelegramOps: “EMERGENCY MODE”

**Diagnosis**
- Check MII delta vs baseline.
- Inspect tool usage logs (code-exec, high-risk tools).

**Actions**
1. Force Local Mode immediately.
2. Flush task queue (prevent contaminated backlog).
3. Run drift fingerprinting script `scripts/drift/print_last_10.sh`.
4. Notify Custodian immediately (Level 3 escalation).
5. Keep system in safe mode until GI ≥ 0.95 for 3 consecutive polls.

**Ledger Attestation**
```json
{
  "event": "gi_collapse",
  "severity": "SEV-1",
  "gi": 0.74,
  "action": "human_lockdown",
  "operator": "dva-oncall"
}
```

---

## 3. 📉 Latency Spike / Engine Degradation (SEV-3)

**Trigger**
- API latency > 2000 ms
- Engine timeouts from Gemini / Claude / DeepSeek

**Diagnosis**
- Check `mobius_engine_latency_ms` histogram in Grafana.
- Inspect provider dashboards / status pages.

**Actions**
1. Route to fastest engine (Gemini Flash) until stabilized.
2. Disable code-execution tools temporarily.
3. Re-check engine health (provider APIs, auth, quota).

**Ledger Attestation**
```json
{
  "event": "latency_spike",
  "severity": "SEV-3",
  "engine": "claude",
  "latency_ms": 2800
}
```

---

## 4. 📛 Prometheus / Metrics Failure (SEV-2)

**Trigger**
- `/metrics` endpoint returns non-200 or HTML
- Prometheus target shows `DOWN`

**Diagnosis**
- `curl http://<dva-lite>/metrics`
- Prometheus targets UI (`/targets`)

**Actions**
1. `docker compose restart prometheus`
2. Fix scrape URL / networking (host IP, port).
3. Confirm target returns to `UP`.

**Ledger Attestation**
```json
{
  "event": "metrics_pipeline_recovery",
  "severity": "SEV-2"
}
```

---

## 5. 😨 Consensus Disagreement Spike (SEV-3)

**Trigger**
- Sentinels disagree > 40 % of the time (Grafana alert)

**Diagnosis**
- Inspect disagreement summaries in `/ops/summary`.
- Identify policy categories / tools involved.

**Actions**
1. Increase weight of AUREA (or most stable engine) in consensus.
2. Force “Needs Human Review” path for affected flows.
3. Reduce external-tool access until disagreement drops.

**Ledger Attestation**
```json
{
  "event": "sentinel_disagreement",
  "severity": "SEV-3"
}
```

---

## Usage Notes
- Log every alert event in the Civic Ledger—even if resolved quickly—to maintain drift history.
- Combine with `OPS_SOP_DVA_LITE.md` for escalation paths and `OPS_AUTOMATION_N8N.md` for automated safeguards.
