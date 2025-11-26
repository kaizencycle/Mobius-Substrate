# Agent CI — Mobius Systems

Agent CI guarantees every agent is **valid**, **sandboxed**, **attested**, and **integrity-gated**.

## What it checks
1. **Manifest validity** against `agents/agent.schema.json`
2. **Sandbox tests** (deterministic mini-scenarios)
3. **Deliberation proof** artifact
4. **MII gate** via `mobius:mii:deficit_1m` (must be 0 → MII ≥ 0.95)

## How to add a new agent
1. Create `agents/<your-agent>/agent.manifest.json`
2. Add a simple runner (`run.py` or container)
3. Open a PR — CI will run automatically

Artifacts: `agent-ci-report.json`, `deliberation_proof.json`, `junit.xml` in CI artifacts.
