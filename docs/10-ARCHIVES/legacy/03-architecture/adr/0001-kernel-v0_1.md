# ADR 0001: Kernel v0.1 Scope and Invariants

- Status: Accepted
- Date: 2025-11-09

## Context

Mobius Kernel v0.1 powers the command-ledger, MIC economy, and attestation settlement pipeline. The Perplexity review surfaced a gap: the kernel responsibilities were implicit and scattered across lab notes. Without explicit scope and invariants we risk drift, divergent implementations, and inability to measure consensus guarantees.

## Decision

Define Kernel v0.1 as the minimal deterministic state machine that:

- ingests signed attestations and Deliberation Proofs,
- maintains the command ledger, MIC balances, and Mobius Financial Statements,
- produces hourly Merkle anchors for external verification.

The kernel **must** uphold the following invariants:

1. **Integrity:** All ledger mutations require valid attestation signatures and MII ≥ 0.95.
2. **Determinism:** Identical ordered inputs yield identical state transitions and Merkle roots.
3. **Replay Safety:** Nonces, windows, and previous hash links prevent double application.
4. **Auditability:** Every state change is reproducible from retained input events.

Non-kernel concerns (UI, orchestration, agent policy) remain out of scope until ADR supersedes this one.

## Consequences

- Provides an enforceable contract for kernel-facing services and tests.
- Enables spec-ci to gate kernel-affecting change sets against schema drift.
- Future revisions (v0.2+) must explicitly evolve these invariants rather than silently mutating behavior.
