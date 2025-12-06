# Technical Specifications

This section is the **single source of truth** for:

- Protocol definitions
- API contracts
- Cryptographic formats
- Consensus mechanisms
- Schemas and manifests

**If a question starts with "Exactly how…", the answer should live here.**

---

## Contents

Recommended structure (to be populated in Phase 2):

### `protocols/`
- `masl.md` — Model-Agnostic Sovereignty Layer
- `boarding-protocol.md` — How LLMs mount Mobius state
- `deliberation-proof.md` — Thought Broker consensus protocol
- `supersede-protocol.md` — Knowledge evolution mechanism
- `integrity-propagation.md` — How GI flows through the system

### `cryptography/`
- `mii-signature-spec.md` — Ed25519 MII signatures (existing)
- `integrity-proofs.md` — Cryptographic integrity attestations
- `key-management.md` — How keys are generated and stored

### `consensus/`
- `thought-broker-consensus.md` — Multi-agent deliberation (existing)
- `tri-sentinel-review.md` — ECHO Layer peer review
- `sentinel-voting.md` — How sentinels reach decisions

### `apis/`
- `rest-api-reference.md` — Complete REST API documentation
- `mobius-mount-endpoint.md` — `GET /api/mobius/mount` specification
- `integrity-check-endpoint.md` — Health and GI verification
- `attestation-api.md` — How to submit attestations
- `websocket-events.md` — Real-time event streaming

### `schemas/`
- `manifests.md` — `.mobius/` file format specifications
- `biodna.md` — Bio-DNA identity schema
- `virtue-accords.md` — YAML covenant schema
- `civic-ledger-blocks.md` — Block structure
- `learn-blocks.md` — ECHO Layer knowledge blocks

---

## Specification Principles

All specifications in this section follow these rules:

1. **Precision** — Exact formats, no ambiguity
2. **Versioning** — Every spec includes version number
3. **Reference Implementations** — Link to canonical code
4. **Test Cases** — Include validation examples
5. **Backwards Compatibility** — Note breaking changes explicitly

---

## Key Specifications

**MASL (Model-Agnostic Sovereignty Layer)**  
Enables any LLM to board Mobius by calling `/api/mobius/mount`, which returns:
- `.mobius/atlas.manifest.json` — System state & integrity
- `.mobius/biodna.json` — Identity DNA
- `.mobius/virtue_accords.yaml` — Moral & civic laws
- `mii_signature` — Cryptographic integrity proof

**Deliberation Proof**  
Cryptographic attestation that multi-agent consensus was achieved under constitutional constraints. Includes:
- Sentinel votes
- GI scores
- Constitutional compliance checks
- Timestamp and cycle number

**Supersede Protocol**  
Knowledge evolution system allowing verified improvements to replace outdated information while preserving history (Kintsugi principle).

---

## Specification Status

| Spec | Status | Version | Last Updated |
|------|--------|---------|--------------|
| MII Signature Spec | ✅ Complete | v1.0 | C-145 |
| Thought Broker Consensus | ✅ Complete | v1.0 | C-146 |
| MASL Protocol | 🚧 In Progress | v0.9 | C-147 |
| Supersede Protocol | 📋 Planned | - | - |
| Tri-Sentinel Review | 📋 Planned | - | - |

---

## Using These Specifications

**For Implementers:**  
These specs are contractual — implementations must match exactly.

**For Integrators:**  
Use these to build compatible services or connect external systems.

**For Researchers:**  
These provide formal definitions for academic analysis.

---

## Relationship to Other Sections

- See [`02-architecture/`](../02-architecture/README.md) for high-level design context
- See [`04-guides/developers/`](../04-guides/developers/README.md) for implementation tutorials
- See [`08-research/`](../08-research/README.md) for theoretical foundations

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
