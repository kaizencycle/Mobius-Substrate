import type { ChaosCheck } from "./random_service_kill.test";

export const packetLossPlan: ChaosCheck = {
  scenario: "Inject 5% packet loss between services and databases",
  objective:
    "Demonstrate that Mobius retries, circuit breakers, and telemetry buffering maintain integrity during degraded networks.",
  steps: [
    "Apply network shaping (tc/netem) to introduce 5% bidirectional packet loss between apps and postgres/redis layers.",
    "Enable verbose logging for retry middleware to capture behavior.",
    "Run standard integration smoke tests plus MIC mint operations.",
    "Monitor Grafana panel `Mobius Ops › Networking` for retransmission spikes.",
    "Remove packet loss after 20 minutes and compare backlog drainage times."
  ],
  metrics: [
    { name: "Retry count", target: "≤ 3 per request", alert: "Warn @ 3, critical @ 4" },
    { name: "Message backlog", target: "≤ 200 events", alert: "Warn @ 150, critical @ 200" },
    { name: "Ledger consistency", target: "0 mismatched entries", alert: "Critical if >0" }
  ],
  failureSignals: [
    "Ledger diverges from indexer",
    "Citizen Shield heartbeat missing",
    "Retry storms saturate CPU (>80%)"
  ],
  remediation: [
    "Scale message brokers",
    "Switch replication mode to fully synchronous until packet loss clears",
    "Escalate to NetOps vendor if underlying infra is root cause"
  ]
};

export default packetLossPlan;
