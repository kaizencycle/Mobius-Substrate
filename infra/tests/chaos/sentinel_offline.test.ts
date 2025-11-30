import type { ChaosCheck } from "./random_service_kill.test";

export const sentinelOfflineDrill: ChaosCheck = {
  scenario: "Sentinel (ATLAS, AUREA, or ZEUS) goes offline unexpectedly",
  objective:
    "Ensure consensus gates fail safe and route to human custodians when any sentinel is unreachable or returns stale data.",
  steps: [
    "Disable outbound network for the selected sentinel container or revoke its API token.",
    "Run `npm run consensus:simulate --scenario sentinel-offline` to mimic pending PRs.",
    "Observe Consensus Gate output: expected state = FAIL_SAFE within 1 minute.",
    "Confirm Slack/webhook alert delivered to #sentinel-ops and Echo log entry created.",
    "Bring sentinel back online via runbook and verify metrics return to nominal band."
  ],
  metrics: [
    { name: "Fail-safe latency", target: "≤ 60s", alert: "Warn @ 45s, critical @ 60s" },
    { name: "Notification latency", target: "≤ 120s", alert: "Warn @ 90s, critical @ 120s" },
    { name: "Backlog drainage", target: "≤ 5 PRs waiting", alert: "Warn @ 3, critical @ 5" }
  ],
  failureSignals: [
    "Consensus Gate allows merge without quorum",
    "Alerts fail to reach custodians",
    "Echo log missing sentinel outage entry"
  ],
  remediation: [
    "Activate manual review mode (ZEUS directive)",
    "Rotate sentinel credentials and rerun health checks",
    "Document outage in atlas-sentinel/INCIDENTS.md"
  ]
};

export default sentinelOfflineDrill;
