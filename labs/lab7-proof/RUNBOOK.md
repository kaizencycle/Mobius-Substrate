# Sentinel Runbook (Lab7 - OAA Hub)

**Purpose:** Ensure reproducible handling of alerts, drift, or outage.

## Severity Levels

- **SEV-1**: Ledger write blocked or GI drop > 0.02
- **SEV-2**: Attestation latency > 2s p95 for 5m
- **SEV-3**: Model loop guard tripped > 3 times / hr

## On-call Actions

1. **Acknowledge** in <#lab7-alerts> within 10 min.

2. **Capture context:**
   - Sentinel name, model version, input hash, rule triggered.

3. **Mitigations:**
   - For loop: toggle `AGENT_LOOP_GUARD=true`; set `MAX_TURNS=4`.
   - For ledger: fallback to local queue; retry with backoff.

4. **Escalation:**
   - Ping ZEUS custodian group (multisig quorum 2/3).

5. **Postmortem** within 48h:
   - Root cause, timeline, rule updates, test added.

## Dashboards

- `/metrics`: Prometheus
- `/healthz`: liveness
- `/readyz`: readiness

