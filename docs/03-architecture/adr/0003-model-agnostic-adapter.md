# ADR 0003: Model-Agnostic Thought Broker Adapter

- Status: Accepted
- Date: 2025-11-09

## Context

Thought Broker orchestrates multiple foundation models (AUREA, EVE, HERMES, JADE). Prior integrations tightly coupled the broker to specific SDKs, complicating failover and audit. The Tier-1 review requires a provider-neutral interface so consensus can continue even if a vendor or key expires.

## Decision

Introduce a model-agnostic adapter with:

- **Uniform contract:** `generate()`, `evaluate()`, and `attest()` methods returning structured traces.
- **Pluggable transports:** HTTP, WebSocket, or local runtime modules registered via configuration.
- **Deterministic prompts:** Adapter normalizes system prompts and virtue tags before dispatch.
- **Telemetry hooks:** Each call emits metrics consumed by MII calculators and spec-ci.

Adapters implement an interface defined in `packages/atlas-sentinel` (reference implementation forthcoming). Providers are interchangeable without changing broker logic.

## Consequences

- Enables hot-swapping or parallel evaluation across different providers.
- Simplifies audit trails because traces share a canonical schema.
- Requires adapters to be versioned and validated via spec-ci before enabling in production.
