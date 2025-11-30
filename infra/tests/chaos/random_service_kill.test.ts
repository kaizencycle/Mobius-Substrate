export interface ChaosCheck {
  scenario: string;
  objective: string;
  steps: string[];
  metrics: { name: string; target: string; alert: string }[];
  failureSignals: string[];
  remediation: string[];
}

export const randomServiceKill: ChaosCheck = {
  scenario: "Random service termination across ledger, broker, shield, and sentinel pods",
  objective:
    "Validate that self-healing + GI gating keep the platform available when core services crash without notice.",
  steps: [
    "Select a target service every 5 minutes using weighted random (ledger weight = 2).",
    "Kill the container or process via orchestration API (e.g., docker compose stop, k8s delete pod).",
    "Observe sentinel pings and ensure Anti-Nuke blocks risky writes while replicas restart.",
    "Record time-to-recovery (TTR) and compare against SLA (≤ 90s for API, ≤ 180s for ledger).",
    "After 30 minutes, generate a summary event for Echo + Grafana annotations."
  ],
  metrics: [
    { name: "Recovery Time (API)", target: "≤ 90s", alert: "Warn @ 75s, critical @ 90s" },
    { name: "Recovery Time (Ledger)", target: "≤ 180s", alert: "Warn @ 150s, critical @ 180s" },
    { name: "Dropped requests", target: "≤ 0.2%", alert: "Warn @ 0.15%, critical @ 0.2%" }
  ],
  failureSignals: [
    "Recovery exceeds thresholds",
    "Sentinels fail to fence writes (GI < 0.95 during outage)",
    "Citizen Shield health endpoint unavailable > 2 minutes"
  ],
  remediation: [
    "Trigger ZEUS failover runbook",
    "Escalate to Ops On-Call (infra/observability/OPS_ONCALL_ROTATION.md)",
    "File incident in labs/safety-assays with chaos metadata"
  ]
};

export default randomServiceKill;
