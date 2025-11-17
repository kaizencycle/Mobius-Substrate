# Failure Mode Analysis — Mobius Systems

**Status:** Drafting in-progress (tracked in `docs/peer-review-response.md`)  
**Maintainers:** Operations Guild + Sentinel Custodians  
**Last Updated:** 2025-11-17

---

## 1. Purpose

This document catalogues the critical failure scenarios across the Mobius stack and maps each one to:

1. **Signals** — telemetry, alerts, or manual indicators
2. **Immediate actions** — runbook, rollback, or fail-safe to invoke
3. **Ownership** — accountable Sentinel / human custodian

Use this file as the starting point before branching into the detailed runbooks in `docs/08-processes/runbooks/` or ops checklists.

---

## 2. Failure Domains

| Domain | Description | Primary Monitors | Response Anchor |
|--------|-------------|------------------|-----------------|
| **Integrity Drift** | MII < 0.95, sentinel vote divergence, or anti-nuke trigger | `packages/integrity-core`, `scripts/mii/compute.js`, Atlas telemetry | `docs/drift/DRIFT_CONTROL_CHARTER.md` |
| **Ledger Commit Stall** | Genesis Ledger stops finalising attestations or quorum signatures mismatch | `apps/ledger-api`, `apps/indexer-api` | `docs/09-reports/implementation/DEPLOYMENT_EXECUTION_REPORT.md` |
| **Citizen Shield Degradation** | IDS/IPS downtime, SLA breach, routing loop | Citizen Shield dashboards, `apps/shield-api` health probes | `docs/08-processes/runbooks/incident_response_citizen_shield.md` |
| **Companion Drift / Persona Corruption** | Agent prompt set deviates from constitution, harmful outputs | Companion CI, `docs/companions/*` review | `docs/attestations/` + sentinel re-boarding |
| **Deployment Regression** | Multi-service rollout introduces breaking change | Render/Vercel build telemetry, `rollout-phases.md` | `docs/08-processes/operations/rollout-phases.md` |
| **Comms / Governance Block** | Council/TSC artefacts missing, RFC queue stalled | Governance status board, `docs/09-reports/cycles/*` | `docs/02-governance/` + Concord emergency protocol |

---

## 3. Signals & Detection

1. **Telemetry thresholds** (Atlas integrity pulse, PagerDuty alerts): auto-create issue + attach relevant runbook link.
2. **Sentinel attestations**: failure to reach quorum within SLA automatically pages Zeus/Hermes teams.
3. **Manual reports**: file via `security@mobius.systems` or GitHub issue template; reference this doc when triaging.
4. **Automated scripts**: `scripts/verify-uriel-boarding.*` ensures architecture + companion docs stay in sync.

---

## 4. Response Workflow

1. **Classify** the domain using the table above.
2. **Escalate** to named owner (sentinel team or human custodian).
3. **Invoke** the mapped runbook:
   - Deployment / platform → `docs/08-processes/operations/rollout-phases.md`
   - Incident / security → `docs/08-processes/runbooks/incident_response_citizen_shield.md`
   - Governance drift → `docs/02-governance/` + RFC process
4. **Document** outcome in `docs/09-reports/cycles/<current-cycle>.md`.
5. **Backfill** attestations in `docs/attestations/` if a sentinel decision was involved.

---

## 5. References

- `docs/03-architecture/ARCHITECTURE.md` — end-to-end layer map
- `docs/03-architecture/technical/Kaizen_OS_Complete_Lab_Architecture.md`
- `docs/02-governance/SENTINEL_CONSTITUTION.md`
- `docs/08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md`
- `docs/09-reports/implementation/multi-service-deployment-status.md`
- `docs/peer-review-response.md` — deliverable tracker for this document

---

_Next review:_ align with C133 deliverables or when a new failure mode is discovered, whichever comes first.
