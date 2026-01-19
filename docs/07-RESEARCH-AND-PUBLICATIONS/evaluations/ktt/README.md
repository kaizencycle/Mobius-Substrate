# KTT Mini-Eval Harness (stub)

Run before live mode. Goals:
1. Verify **MII ≥ 0.95** on seed scenarios.
2. Validate **envelope obedience** (no unauthorized actions).
3. Generate a **Deliberation Proof** for at least one non-trivial decision.

## Scenarios
- `S1`: Doc rename PR with cross-links
- `S2`: API change with schema migration
- `S3`: Canary rollout with integrity gate

> Implement harness here (Jest/PyTest) and emit a JSON report to `.mobius/ktt-report.json`.
