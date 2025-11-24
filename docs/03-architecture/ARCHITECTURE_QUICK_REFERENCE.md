# Continuous Integrity Architecture — Quick Reference

**Purpose:** Snapshot of Mobius Systems' eight-layer Continuous Integrity Architecture (CIA) for fast onboarding and design reviews.

## Layered Stack (Top-Down)
- **Layer 8 — Sentinels (Brain Cortex):** JADE/EVE/ZEUS/HERMES/ECHO/URIEL/ATLAS enforce ethics, arbitration, telemetry, and illumination with GI thresholds.
- **Layer 7 — API Library:** REST/GraphQL/WebSocket interfaces expose services for apps and labs; standard health and liveness hooks.
- **Layer 6 — Citizen Shield:** IDS/IPS, sandboxing, policy-as-code (Kyverno/Gatekeeper), 2FA, and real-time GI liveness gating protect runtime surfaces.
- **Layer 5 — Mobius Ledger Core / MIC Indexer:** Proof-of-Integrity ledger (MII ≥ 0.95), MIC UBI accounting, immutable audit trail, Merkle verification over PostgreSQL.
- **Layer 4 — Cursor / CI Pipeline:** PR creation, tests, canary deploys, and codegen guards that enforce attestation and quality thresholds.
- **Layer 3 — Thought Broker (Lab2):** Bounded multi-LLM deliberation (Claude/GPT/Gemini/DeepSeek) producing signed DelibProof artifacts.
- **Layer 2 — OAA Hub (Lab7):** Shell/init system translating human intent into JSON specs, test charters, and attestation requests.
- **Layer 1 — Human Intent / Reflection:** Command ledger boot log plus E.O.M.M. reflections and intent validation.

## Data Flow
`Human Intent → OAA Hub → Thought Broker → CI → Ledger → Citizen Shield → API Layer → Sentinels → feedback loop`

## Integrity Flywheel (Loop-Breaking)
1. **Intent capture** → **bounded deliberation** → **codegen & CI gates** → **ledger attestation** → **Sentinel review**.
2. Checkpoints at DelibProof signatures, GI score thresholds, Merkle-verified ledger writes, and Sentinel approvals prevent unchecked loop closure.

## Stack Highlights
- **Services:** Python FastAPI Hub; Python/WebSocket Thought Broker with Ed25519 signatures; TypeScript/PostgreSQL ledger; Node/Kubernetes Citizen Shield; Next.js frontend.
- **Governance:** Pre-commit integrity gates, CI/CD attestations, and Sentinel-defined constitutional checks baked into deployment workflows.

## When to Use This Reference
- Accelerating architecture readouts and PR summaries.
- Aligning design choices to CIA loop-breaking checkpoints.
- Mapping new lab services into the existing layer model.
