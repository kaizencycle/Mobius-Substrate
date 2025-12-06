# DVA.LITE n8n Incident Automation Flow

End-to-end automation that enforces lock-down rules, escalations, and ledger attestations whenever GI/MII signals degrade. Import into n8n (or similar orchestrator) and update credentials/secrets accordingly.

---

## 1. 🌐 Webhook Trigger

- **Endpoint:** `POST /n8n/dva-lite/ingest`
- **Payload fields:** `gi`, `mii`, `routingMode`, `toolUsage`, `sentinelDisagreements`, `timestamp`
- Store raw payload for audit log (e.g., Supabase / Dynamo / Postgres).

---

## 2. 🧮 Decision Node — GI Threshold

```
IF gi < 0.80        → Lockdown Path
ELSE IF gi < 0.90   → Drift Warning Path
ELSE                → Healthy Path
```

Also calculate moving averages to avoid flapping (e.g., require 2 consecutive samples).

---

## 3. 🔥 Lockdown Path (SEV-1)

1. **Set Routing Mode**
   - `PATCH https://broker//api/routing`
   - Body: `{"routingMode":"local","allowedTools":[]}`
2. **Pause Tool Integrations**
   - Disable Claude/Gemini/DeepSeek code-exec toggles via their APIs or feature flags.
3. **Telegram Emergency Broadcast**
   - Message template:
     ```
     🚨 SEV-1: GI COLLAPSE
     System now in LOCKDOWN MODE.
     Routing restricted to Sentinel-only.
     ```
4. **Ledger Attestation**
   - `POST /ledger/attest`
   - Payload mirrors playbook (`event: gi_collapse`).
5. **Create PagerDuty / Opsgenie Incident**
   - Include dashboards + log links.

Automation remains in lockdown until GI ≥ 0.95 for 3 consecutive polls.

---

## 4. ⚠️ Drift Warning Path (SEV-3)

1. **Telegram Drift Notice**
   - “GI = 0.88. Routing downgraded, please review last 5 tasks.”
2. **Replay Last 5 Tasks**
   - Invoke broker replay endpoint or queue worker.
3. **Human Classification Request**
   - Create ticket / Slack thread for policy team if sentinel disagreements high.
4. **Ledger Attestation**
   - `event: gi_drift_warning`.

System remains in warning state until GI ≥ 0.95 or manual clearance.

---

## 5. 🔵 Healthy Path

1. Update Grafana annotations or metrics (optional).
2. Append data to daily digest store.
3. No alerts fired.

---

## 6. 🧯 Recovery Automation

Triggered when GI ≥ 0.95 for **3 consecutive** webhook payloads.

1. Re-enable Antigravity / external tools (reverse of lockdown).
2. Restore multi-engine routing policy.
3. TelegramOps: “Integrity stabilized — re-enabling tools.”
4. Ledger attestation:
   ```json
   {
     "event": "gi_recovered",
     "severity": "INFO",
     "gi": 0.97
   }
   ```

---

## 7. Implementation Notes

- Use n8n “HTTP Request” nodes for broker, ledger, and Telegram integrations.
- Add circuit breakers (max retries / exponential backoff) to avoid loops if endpoints fail.
- Write all actions to an incident table (timestamp, action, operator/n8n, payload hash).
- Pair with `OPS_ALERT_PLAYBOOK.md` so humans know how automation decisions were made.
