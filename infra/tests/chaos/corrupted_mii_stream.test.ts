import type { ChaosCheck } from "./random_service_kill.test";

export const corruptedMiiStreamPlan: ChaosCheck = {
  scenario: "Feed malformed or adversarial MII telemetry into the integrity pipeline",
  objective:
    "Ensure oracle hardening (median-of-three) freezes minting/burning when telemetry is corrupted or adversarial.",
  steps: [
    "Replay historical reflections but tamper with 15% of MII samples (set to 0.40 or 1.10).",
    "Disable one sentinel at a time to simulate partial oracle compromise.",
    "Run `npm run sim:mii -- --corrupt` to pipe data through integrity-core.",
    "Record how quickly the system halts tokenomics sinks (ETX/IRB/CLL).",
    "Capture ZEUS escalation logs and verify they reference corrupted hashes."
  ],
  metrics: [
    { name: "Detection latency", target: "≤ 2 blocks", alert: "Warn @ 2, critical @ 3" },
    { name: "Frozen sinks", target: "100%", alert: "Critical if any sink continues" },
    { name: "Attestation coverage", target: "≥ 2 sentinels", alert: "Critical if <2" }
  ],
  failureSignals: [
    "Tokenomics sinks continue while oracles disagree",
    "Integrity core accepts readings outside [0,1] range",
    "ZEUS does not emit alert when median deviation >25 bps"
  ],
  remediation: [
    "Rotate sentinel signing keys",
    "Recompute MII from raw reflections and backfill ledger",
    "Document event in `.gi/consensus-*` for audit"
  ]
};

export default corruptedMiiStreamPlan;
