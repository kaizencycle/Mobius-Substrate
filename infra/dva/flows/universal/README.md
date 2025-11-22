# Universal Orchestrator Flows

This directory defines the **Mobius Universal Orchestrator** — the top-level routing and governance shell that coordinates:

- Multiple AI engines (Claude, GPT, Gemini, DeepSeek, code agents)
- The Thought Broker API (routing + Sentinel consensus)
- The Civic Ledger (attestation + GI scoring)
- Human-in-the-loop review channels
- Output channels (GitHub, Substack, Discord, Telegram, LivePatch, Apps/Labs)

## Contents

- `universal_orchestrator.json` — Orchestrator-agnostic flow skeleton
- `universal_orchestrator.md` — Architecture and governance notes

Everything in this directory must uphold the constitutional pipeline:

`User → Thought Broker → Sentinels → GI Gate → Civic Ledger → Channels`
