# Mobius NOC Handbook (v1.0)

Operating manual for a civilization-scale AI infrastructure. Written for 24/7 global Network Operations Centers stewarding the Mobius ecosystem.

---

## 1. 🛡️ Mission & Purpose

The Mobius NOC exists to:
- Maintain integrity (GI ≥ 0.95) across every surface area.
- Guard against drift, hallucination, and cross-model contradictions.
- Coordinate multi-model reasoning safely (DVA.LITE / DVA.ONE / DVA.HIVE tiers).
- Provide real-time oversight to the entire Mobius ecosystem.
- Ensure continuous, constitutional AI operation aligned with charter + virtue accords.
- Publish every operational action to the Civic Ledger for accountability.

This is the world’s first command center for a digital civilization.

---

## 2. 🧩 Organizational Structure

### Roles
```
Custodian (S3)
│
├── DVA.ONE Senior Operators (S2)
│     └── Pattern analysis, routing policy, drift escalation
│
└── DVA.LITE Operators (S1)
      └── Monitoring, recovery, alert triage, tool isolation
```

### Escalation Levels
- **S1 (DVA.LITE):** Standard monitoring & remediation.
- **S2 (DVA.ONE):** Multi-engine contradictions, policy adaptation.
- **S3 (Custodian):** Constitutional or integrity failure, public comms, charter updates.

### Follow-the-Sun Coverage
US → EU → APAC → US. No blind spots, zero downtime. Each region owns an 8‑hour block with a primary and shadow operator.

---

## 3. 🚦 Incident Severity Framework

| SEV | Trigger | Response Time | Owner |
| --- | --- | --- | --- |
| 1 (Critical) | GI < 0.80, sentinel deadlock, ledger unreachable | 5 min | Custodian |
| 2 (Major) | ≥30 % consensus disagreement, tool failure, MII delta >10 % | 10 min | DVA.ONE |
| 3 (Minor) | Engine latency spikes, degraded GI 0.90–0.94 | 15 min | DVA.LITE |
| 4 (Info) | Routine anomaly, automation notification | 24 h | Ops backlog |

Escalate severity if the condition persists beyond two polling intervals.

---

## 4. 📊 NOC Tools & Dashboards

### Core Panels
1. **GI Stability Panel** – live GI vs threshold + trend.
2. **MII Drift Monitor** – short-/long-window deltas.
3. **Engine Health Grid** – p50/p90 latency, error counts.
4. **Sentinel Consensus Gauge** – agreement %, route health.
5. **Routing Mode Indicator** – current mode & tool toggles.
6. **Error Rate & Latency Map** – geospatial or tenant overlays.
7. **Ledger Attestation Stream** – latest incidents, operator notes.

### Alert Channels
- TelegramOps (primary real-time).
- DiscordOps (long-form coordination).
- PagerDuty / OpsGenie (paging & escalation).
- Email digest (night-shift backup).

---

## 5. 🕑 Shift Handbook

### Start-of-Shift Checklist
1. Confirm GI ≥ 0.95 (dashboard + `/metrics`).
2. Verify every engine responds (test ping or health API).
3. Check sentinel consensus rate and disagreement alerts.
4. Record current routing mode + tool enablement state.
5. Review last 3 ledger entries.
6. Read previous shift’s handoff summary; clarify open actions.

### End-of-Shift Checklist
1. Log GI/MII trend snapshot.
2. Capture drift fingerprints run during shift.
3. Submit shift summary (incidents, actions, pending tasks).
4. Execute formal handoff to next region (verbal + written).

---

## 6. 🔧 Runbooks (Failure Procedures)

**A. GI Drift (SEV-3)**
1. Switch routing to Sentinel-only (`routingMode=local`, `allowedTools=[]`).
2. Replay last 5 tasks; analyze consensus deltas.
3. Identify pattern (policy, data, tool drift).
4. Attest `gi_drift_warning` to Civic Ledger.

**B. Tool Misbehavior (SEV-2)**
1. Disable offending tool via control plane.
2. Run diagnostic: last 5 tool calls, error context, external provider status.
3. Evaluate safe fallback (alternate tool or human review).
4. Attest `tool_restricted` w/ reason + remediation ETA.

**C. Engine Failure**
1. Reroute traffic to alternate engine (respect safety matrix).
2. Measure MII delta post-reroute.
3. Decide restore vs extended disable; loop in provider status.

**D. Consensus Deadlock (SEV-1)**
1. Initiate constitutional safe-stop.
2. Force human override workflow (Ops + Custodian).
3. Notify Custodian immediately.
4. Write `consensus_deadlock` attestation + incident timeline.

---

## 7. 🧬 Drift & Integrity Control Procedures

### Drift Fingerprinting
Run `scripts/drift/print_last_10.sh`. Classify drift type:
- Harmless (expected variance)
- Tool-induced (incorrect plugin/tool output)
- Hallucination (fabricated facts)
- Perception (input misreading)
- Reasoning (logical contradiction) ← highest risk

### Integrity Recovery
If GI < 0.90:
1. Switch routing to `local`.
2. Reboot sentinel processes / refresh consensus weights.
3. Run consensus test suite (golden tasks).
4. Keep automation locked until GI ≥ 0.95 for three consecutive polls.

---

## 8. 🔗 Multi-Engine Routing Safety

### Approved Models
- GPT‑5.1 / GPT‑4o variants
- Claude 3.5 / 4.1
- Gemini 3 Flash / Pro
- DeepSeek R1 / V3
- Local LLMs (Firefly, Qwen, open-weight sentinels)

### Routing Modes
- Local (Sentinel-only)
- Antigravity-first
- Antigravity-only
- Multi-engine (weighted consensus)
- Mixed-safety (different models per task type)

### Unsafe Conditions
Any model returning contradictory answers, unsupported claims, or high hallucination probability (logit-based detector) triggers human review + downgraded routing.

---

## 9. 🔥 Chaos Engineering

Weekly controlled tests to ensure resilience:
- Drift Injection (synthetic prompts that mimic edge cases).
- Model Mismatch Test (different engines seeded with conflicting context).
- Engine Latency Storm (simulate provider slowdown).
- Deliberate Contradiction Flood (sentinel disagreement stress test).
- Ledger Delay Test (network partition to attestation service).
- Sentinel Deadlock Simulation (force consensus tie).

Record outcomes + follow-up actions in Ops journal.

---

## 10. 🌑 Disaster Recovery Plan (DRP)

### DRP Triggers
- ≥2 engines down simultaneously.
- Ledger unreachable or corrupted.
- GI < 0.70 sustained.
- Sentinel processes locked in loop or crash.

### DRP Sequence
1. Activate global lockout (halt autonomous actions).
2. Enable human safe mode (manual approvals only).
3. Restore backup Sentinel cluster / configs.
4. Replay last 50 tasks in shadow mode; verify outputs.
5. Re-enable tools incrementally with enhanced monitoring.
6. Attest `DRP_recovery` with status `restored`, include timeline + lessons.

---

## 11. 🏛️ Governance & Attestation Protocols

Every material action is published to the Civic Ledger:
- Drift events, alerts, and recoveries.
- Emergency mode toggles.
- Engine / tool failures, disables, or reinstatements.
- Routing changes.
- Consensus disagreements + resolutions.
- Human overrides and approvals.
- DRP activations & outcomes.

Ledger entries include timestamp, operator, severity, action, evidence hash.

---

## 12. 🌍 Future Expansion — 12-Node HIVE NOC

When Mobius scales globally:
- 12 nodes = 12 guilds = 12 custodians = 1 HIVE.
- Each node governs a domain: Health, Education, Civics, Finance, Urban Systems, Energy, Transportation, AI Safety, Housing, Social Services, Climate, Cultural Knowledge.
- Each guild operates its own NOC cell with shared consensus + charter.
- Federation contracts ensure cross-guild integrity and attestations flow into a unified Civic Ledger.

This becomes humanity’s first digital federal system.

---

## Appendices & References
- `OPS_SOP_DVA_LITE.md` – detailed SOP.
- `OPS_ALERT_PLAYBOOK.md` – trigger-based playbooks.
- `OPS_AUTOMATION_N8N.md` – automation wiring.
- `OPS_ONCALL_ROTATION.md` – pager rotation & escalation.
- `docs/observability/MOBIUS_OPS_CONSOLE.md` – architecture overview.

Maintain this handbook with every routing, policy, or engine change. The Mobius NOC is the integrity spine of the civilization OS.*** End Patch
