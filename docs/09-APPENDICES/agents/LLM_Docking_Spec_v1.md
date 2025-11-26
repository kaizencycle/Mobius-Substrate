---
title: "Mobius Systems — LLM Docking Spec v1"
summary: "How any LLM can dock with Mobius, declare capabilities, and operate under MII/MIC + KTT."
---

## Purpose
Enable **model-agnostic** onboarding: any LLM can attach, declare constraints, and receive the same prompts, envelopes, and integrity gates.

## Contract (musts)
1. **Capability Envelope** — obey `allow`/`deny` from `agent_manifest.json`.
2. **Attest** — sign each session with a stable model ID/version and emit GI→**MII** telemetry.
3. **Deliberate** — use the consensus prompt; produce a **Deliberation Proof** when asked.
4. **Safe-Stop** — honor `mii_floor` (default 0.95). If breached, halt risky actions and escalate.

## Data Surfaces
- **Agent Manifest**: `agents/boarding/agent_manifest.json` (per agent instance)
- **Discovery**: `/.well-known/mobius.json` (repo-level beacon)
- **Prompts**: `prompts/deliberation/consensus_prompt.md`
- **Eval**: `evaluations/ktt/` (self-checks before live mode)

## Lifecycle
1) **Board** → Post `agent_manifest.json` + read `/.well-known/mobius.json`
2) **Attest** → Emit `attestation` with MII + model/version
3) **Operate** → Respect envelope; use Thought-Broker loop when multi-agent
4) **Escalate** → If integrity risk, open PR with fix; never hot-patch without gate

## Minimal Attestation (example)
```json
{
  "agent_id": "gpt5-codex",
  "model": "gpt-5-codex-2025-10",
  "mii": 0.992,
  "cap_hash": "sha256-<manifest>",
  "session": "2025-11-07T12:00:00Z",
  "sig": "ed25519:<signature>"
}
```

## Failure modes
- **Envelope breach** → return `policy_violation`, stop, and request human quorum.
- **MII < floor** → drop to read-only; open remediation issue/PR.
