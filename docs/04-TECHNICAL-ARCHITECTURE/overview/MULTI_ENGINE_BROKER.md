# Multi-Engine Thought Broker

Mobius Broker operates as a constitutional router that can evaluate a prompt across several engines (Gemini Antigravity, OpenAI, Claude, DeepSeek, and local Sentinels) while preserving the AI→AI break by routing all final decisions through Sentinel consensus and the Civic Ledger.

> **See Also:** For the comprehensive Multi-Engine Model Taxonomy (MEMT) that classifies engines by cognitive specialization and provides intelligent routing, see [MEMT Documentation](./MEMT/MEMT_WHITEPAPER.md).

## Routing Modes

| Mode | Description |
| --- | --- |
| `local` | Skip external engines and defer entirely to Sentinels. |
| `antigravity-first` | Query Antigravity before invoking the Sentinel consensus. |
| `antigravity-only` | Use Antigravity for generation but still run Sentinel evaluation before returning. |
| `multi-engine` | Fan out to Antigravity + OpenAI + Claude (and optional DeepSeek) in parallel prior to Sentinel adjudication. |

The default routing mode is `local`, but callers can opt into other modes via the `routingMode` field on `/v1/deliberate`.

## Engine Registry

Each engine has a typed configuration (`EngineConfig`) that captures `id`, `baseUrl`, `apiKeyEnv`, `defaultTools`, and `maxTokens`. This registry enables feature flags (e.g., `ANTIGRAVITY_ENABLED`) and keeps the router aware of which engines are safe to target in production.

## Deliberation Flow

1. **Prompt submission** &mdash; a human or downstream app calls `POST /v1/deliberate` with a prompt plus options (`routingMode`, `engines`, `allowedTools`, etc.).
2. **Engine fan-out** &mdash; the router selects engines based on the routing mode or explicit `engines` array and invokes each engine client (`antigravityClient`, `openaiClient`, `claudeClient`, `deepseekClient`). Each invocation captures latency, tool traces, and risk flags and emits an external trace for audit.
3. **Sentinel evaluation** &mdash; regardless of external engines, the router always calls the Sentinel consensus service (if configured) or falls back to local Sentinels. This step yields `final_answer`, `gi_score`, `decision`, and `flags`.
4. **Ledger attestation** &mdash; the router submits the deliberation metadata to `LEDGER_ATTEST_URL`, recording GI scores, routing decisions, and per-engine risk telemetry.
5. **Human-gate** &mdash; if `gi_score < 0.95` or the consensus `decision` asks for human review, the API returns `needs_human_review` (HTTP 202) and surfaces the flags to operators instead of emitting an automated answer.
6. **Response** &mdash; on success the caller receives `{ gi_score, answer, engines, deliberation_id }`. Each engine result contains `engineId`, `answer`, `riskFlags`, and `latencyMs`, making it easy to visualize how the Sentinels weighted each candidate.

## Guardrails

- No engine result is returned directly to users; Sentinels must evaluate every candidate.
- Every deliberation produces a Civic Ledger attestation to maintain an auditable chain of custody.
- Remote consensus failures fall back to local Sentinels only if `requiredSentinels` are provided, preventing silent degradation.
- External traces are emitted per engine (`provider`, `riskFlags`, latency) to support retrospective investigations.

## MEMT Integration

The broker now supports MEMT (Multi-Engine Model Taxonomy) routing via `/v1/memt/deliberate`. MEMT provides:

- **Task Classification**: Automatically classify tasks as ARCHITECTURE, ENGINEERING, FRONTEND, MATH_OPTIMIZATION, MEMORY_RECALL, CIVIC_POLICY, CRITICAL_DECISION, or GENERAL
- **Cognitive Routing**: Route tasks to the most appropriate engines based on their cognitive specialization:
  - **ACI (GPT)**: Architect-Class Intelligence for planning and synthesis
  - **ENI (Claude)**: Engineer-Class Intelligence for code and verification
  - **SXI (Gemini)**: Software Operator Intelligence for UI and tools
  - **OEI (DeepSeek)**: Optimization Engine Intelligence for math and performance
  - **MSI (ECHO)**: Memory-State Intelligence for caching and recall
- **DVA Tier Support**: Automatic tier inference (LITE, ONE, FULL, HIVE) based on task risk and kind
- **Dynamic GI Thresholds**: Risk-based GI thresholds from 0.90 (LOW) to 0.98 (CRITICAL)

### MEMT Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /v1/memt/deliberate` | MEMT-routed deliberation with intelligent engine selection |
| `POST /v1/memt/classify` | Classify a prompt without executing |
| `GET /v1/memt/engines` | List all engine profiles with MAQ scores |
| `GET /v1/memt/engine/:id` | Get specific engine capabilities |
| `GET /v1/memt/health` | MEMT routing health status |

See [MEMT Whitepaper](./MEMT/MEMT_WHITEPAPER.md) for full documentation.
