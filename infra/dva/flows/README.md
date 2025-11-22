# DVA Flows — Mobius Systems

This directory contains the **Dynamic Virtual Architecture (DVA)** flow definitions for Mobius Systems. These flows are designed to run on a general-purpose workflow orchestration engine (n8n, Temporal, Airflow, Prefect, custom schedulers) while remaining tool-agnostic and constitutionally governed.

## DVA Tier Overview

- **UNIVERSAL** — The Mobius Universal Orchestrator
- **DVA.LITE** — Monitoring tier (observe, log, detect anomalies)
- **DVA.ONE** — Learning tier (feedback and adaptation for a single node)
- **DVA.FULL** — Multi-agent tier (complex tasks and recovery)
- **DVA.HIVE** — Network tier (cross-node consensus and global attestation)
- **Templates** — Starter flow skeletons to keep new work constitutional

Each subdirectory contains JSON flow definitions, Markdown specs, and a README describing responsibilities.

## Integration Points

All flows are designed to integrate with:

- **Thought Broker API** (Mobius routing and Sentinel consensus)
- **Civic Ledger API** (attestation and GI scoring)
- **External engines** (Claude, GPT, Gemini, DeepSeek, etc.)
- **Human channels** (Telegram, Discord, Substack, GitHub, LivePatch)

## Status

- JSON files ship as templates/skeletons and can be adapted to any orchestrator
- This directory defines the canonical DVA flow structure for Mobius Systems
- All flows are constitutionally compliant and GI-gated by design

See `docs/architecture/DVA_FLOWS_OVERVIEW.md` for the system diagram.
