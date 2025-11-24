# DVA.LITE PagerDuty-Style On-Call Plan

Structured rotation + escalation policy for running Mobius like a real civic infrastructure NOC.

---

## 1. 👥 Roles & Responsibilities

| Role | Scope | Core Responsibilities |
| --- | --- | --- |
| **DVA.LITE Operator (Level 1)** | Integrity telemetry, routing toggles | Handle alerts, run playbooks, replay tasks, maintain `/metrics` & `/ops/summary` |
| **DVA.ONE Operator (Level 2)** | Pattern diagnostics, multi-engine alignment | Deep investigations, root-cause clustering, approve tool re-enablement |
| **Custodian (Level 3)** | Constitutional authority | SEV-1 incidents, charter changes, global resets, public comms |

---

## 2. 🕑 Rotation Schedule

### Basic (2 Person) Plan

| Day | Primary | Backup |
| --- | --- | --- |
| Mon–Wed | Operator A | Operator B |
| Thu–Sat | Operator B | Operator A |
| Sunday | Custodian | — |

### Advanced (Follow-the-Sun)

Once >5 operators:
- 8-hour shifts (US → EU → SG)
- Each shift has primary + shadow
- Use runbook-driven handoff (see below)

---

## 3. 🚦 Escalation Ladder

### Level 1 — DVA.LITE Operator
- Handles metric outages, drift warnings, latency spikes
- Response SLA: **15 minutes**
- Escalates when:
  - GI < 0.80
  - Consensus disagreement >40%
  - Unable to restore metrics within 30 minutes

### Level 2 — DVA.ONE Operator
- Triggered by Level 1 escalation or automated SEV-2
- Response SLA: **10 minutes**
- Focus: root-cause drift, run drift fingerprints, inspect sentinel weights

### Level 3 — Custodian
- Triggered by SEV-1 collapse, ledger corruption suspicion, constitutional breach
- Response SLA: **5 minutes**
- Authority to suspend services, issue public comms, modify charter guardrails

---

## 4. 🔐 Shift Handoff Checklist

Every rotation (and any ad-hoc handoff) includes:
1. Current GI/MII trend (last 6h) + screenshot
2. Routing mode + any disabled tools
3. Open incidents / tickets / ledger attestations
4. Pending replays or investigations
5. n8n automation status (healthy/paused)

Document via shared Ops notebook (Notion/Confluence/Git).

---

## 5. 📡 Weekly Ritual (Sunday)

1. Review drift fingerprints & incident summaries.
2. Inspect metrics for recurring patterns.
3. Audit human overrides & ledger attestations.
4. Tune sentinel weights if necessary.
5. Run chaos drill: `scripts/chaos/drift_injection.sh`.

---

## 6. Tooling & Communication

- Primary alerting: PagerDuty/Opsgenie (mirrors TelegramOps)
- Secondary comms: dedicated Telegram room + Slack channel
- Incident docs: `infra/observability/*.md` + ledger attestations
- Automation: `OPS_AUTOMATION_N8N.md`

---

## 7. Readiness Checklist for New Operators

Before joining the rotation:
- Shadow at least 2 shifts.
- Run through alert simulations (GI drift, latency spike, metrics outage).
- Complete ledger attestation dry-run.
- Understand escalation contacts and availability windows.

---

## 8. Key References

- `OPS_SOP_DVA_LITE.md` — step-by-step SOP
- `OPS_ALERT_PLAYBOOK.md` — human playbooks
- `OPS_AUTOMATION_N8N.md` — automation wiring
- `docs/observability/MOBIUS_OPS_CONSOLE.md` — conceptual overview

Keep these documents updated whenever routing logic or integrity policy changes.
