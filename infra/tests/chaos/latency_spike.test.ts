import type { ChaosCheck } from "./random_service_kill.test";

export const latencySpikePlan: ChaosCheck = {
  scenario: "Inject 1000 ms latency into broker and ledger APIs",
  objective:
    "Verify rate-limiters, retries, and GI monitors keep the system stable when core services hang but do not crash.",
  steps: [
    "Use tc/netem or envoy fault injection to add 1000±200 ms latency to broker-api and ledger-api.",
    "Sustain the spike for 15 minutes while running synthetic workloads (npm run loadtest:broker).",
    "Track citizen-facing latency via Grafana dashboards and capture percentile shifts.",
    "Ensure integrity gating pauses non-essential writes once P95 > 1200 ms.",
    "Gradually remove latency and observe recovery shape (target: exponential decay)."
  ],
  metrics: [
    { name: "API P95 latency", target: "≤ 1200 ms", alert: "Warn @ 1100 ms, critical @ 1200 ms" },
    { name: "Retry success rate", target: "≥ 98%", alert: "Warn @ 97%, critical @ 98%" },
    { name: "GI floor during spike", target: ">= 0.95", alert: "Critical if < 0.95" }
  ],
  failureSignals: [
    "Citizen workflows time out (>2% failures)",
    "Sentinel telemetry backlog > 3 cycles",
    "GI dips below 0.95 while latency injection active"
  ],
  remediation: [
    "Throttle ingress via API gateway",
    "Promote standby replicas for broker + ledger",
    "Engage Ops runbook `infra/observability/OPS_ALERT_PLAYBOOK.md`"
  ]
};

export default latencySpikePlan;
