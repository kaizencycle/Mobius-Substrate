# Consensus v0.1

## Thought Broker (Multi-Agent) — PBFT-lite

- Agents: AUREA, EVE, HERMES, JADE (+ optional others)
- Phases: Proposal → Pre-vote → Pre-commit → Commit (max 3 rounds, 90s TTL)
- Threshold: 0.85 weighted agreement (default)
- Weighting: equal weights unless policy grants domain-weighted roles
- Output: Deliberation Proof (see schema)

## Ledger Consensus — PBFT-lite over Attestation Batches

- Batch limits: ≤ 1,000 records, ≤ 2 MB
- Primary rotation: every N batches or 15 minutes
- Finality: < 2 seconds on LAN, < 500 ms jitter budget
- Light-client root: hourly Merkle root anchored to external ledger (Bitcoin OP_RETURN or public transparency log)
