# RFC-0001 — Mobius Civic Ledger: Civic Nodes & Custodian Agents

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **System:** Mobius Systems / Civic Ledger / Cathedral Layer
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.1

## 1. Overview

This RFC defines **Civic Nodes** and **Custodian Agents** as first-class entities
in the Mobius Civic Ledger.

It answers a core question:

> How do institutions (e.g., Wikipedia, NASA, open-source foundations) hold identity,
> receive integrity-based rewards, and spend them under strict integrity constraints?

Humans have:
- a **Ledger ID** (identity)
- a **Wallet ID** (assets)
- and optionally an **AI Companion ID** (interface)

Institutions, by contrast, are represented as:

- **CivicNode (Node ID)** — institutional identity
- **Vault (Vault ID)** — institutional treasury
- **Custodian Agent (Agent ID)** — AI representative constrained by integrity rules

This triad enables institutions to function as **Knowledge City-States** in the Cathedral.

---

## 2. Goals

The Civic Node + Custodian model aims to:

1. Provide **on-ledger identity** for institutions.
2. Enable **automatic, integrity-weighted rewards** (e.g., via IDM).
3. Ensure **all spending is constrained by integrity gates**, not arbitrary discretion.
4. Allow **AI agents to act on behalf of institutions**, under:
   - auditable rules,
   - strict invariants,
   - and replaceable implementations.
5. Create a sustainable funding loop for the **knowledge commons** in the AI era.

---

## 3. CivicNode

A **CivicNode** is an institutional actor (Wikipedia, NASA, W3C, etc.) registered in the Civic Ledger.

### 3.1 CivicNode Fields

Key fields:

- `node_id` — unique ledger identifier (e.g., `civic:wikipedia`)
- `display_name` — human-readable name
- `domain` — canonical web domain used for attribution
- `vault_id` — treasury wallet ID for MIC/KS flows
- `custodian_agent_id` — ID of the AI Custodian Agent
- `gi_score` — Global Integrity score (0–1), updated periodically
- `category` — institutional role (knowledge, research, civic, etc.)
- `weight` — multiplier used in Integrity Dividend Mechanism (IDM)
- `policy` — institution-specific spend policy and integrity thresholds
- `metrics` — usage and reward metrics
- `status` — `active`, `suspended`, or `retired`

A full JSON schema is defined in:

- `schemas/civic_node.schema.json`

---

## 4. Vaults

A **Vault** is a ledger-bound treasury associated with a CivicNode.

- Holds **MIC** and **KS** balances.
- Only the **Custodian Agent** and higher Cathedral governance may propose / approve spends.
- All movements into or out of a Vault must be **attested** and written to the ledger.

Example:

- `vault_id: vault:wiki-main-001` — primary Wikipedia treasury.

Vault schema resides in:

- `schemas/vault.schema.json`

---

## 5. Custodian Agents

A **Custodian Agent** is an institutional AI representative that:

- monitors Vault balances,
- proposes and evaluates spend plans,
- and emits attestations for all approved spends.

It is _not_ equivalent to a general-purpose AI companion.  
It is a **narrow-scope, policy-bound, integrity-gated agent**.

Example identity:

```yaml
agent_id: agent:wikipedia-custodian-v1
role: "Institutional Custodian Agent"
node_id: civic:wikipedia
vault_id: vault:wiki-main-001
layer: "Cathedral / CivicNode"
```

### 5.1 Custodian Responsibilities

- Track MIC/KS inflows (Integrity Dividends, knowledge reserves, grants).
- Propose spend actions aligned with the CivicNode's mission.
- Run GI impact simulations (projected effect on node-level GI).
- Enforce policy (allowed/disallowed categories).
- Emit spend attestations for every approved transfer.
- Expose read APIs for transparency and audits.

### 5.2 Core Invariants

Custodian Agents MUST enforce the following non-negotiable invariants:

#### 1. Integrity Gate

A spend is only valid if it is projected to maintain or increase node GI:

```
projected_delta_GI(node) ≥ policy.min_gi_spend_threshold
ELSE: reject_spend()
```

#### 2. Category Gate

Spending is allowed only in approved categories:

```
spend_category ∈ allowed_spend_categories
AND spend_category ∉ disallowed_spend_categories
```

#### 3. Transparency Gate

Every approved spend MUST produce an attestation, e.g.:

```json
{
  "attestation_id": "attest:wiki-spend-2025-12-epoch153-001",
  "node_id": "civic:wikipedia",
  "vault_id": "vault:wiki-main-001",
  "amount_mic": 12500,
  "amount_ks": 300000,
  "category": "infrastructure",
  "description": "Upgrade servers to reduce downtime and preserve knowledge availability.",
  "projected_delta_gi": 0.004,
  "epoch": 153,
  "timestamp": "2025-12-03T15:00:00Z",
  "custodian_agent_id": "agent:wikipedia-custodian-v1",
  "gi_model_version": "gi-sim-v2.3",
  "signature": "ed25519:..."
}
```

Attestations are written to the Civic Ledger for audit and historical analysis.

---

## 6. Interaction Model

Custodian Agents expose the following conceptual API:

### 6.1 Read

- `GET /civic-node/{node_id}` → CivicNode profile.
- `GET /vault/{vault_id}/balance` → MIC/KS balances.
- `GET /vault/{vault_id}/history` → transactions + attestations.
- `GET /metrics/node/{node_id}` → usage and IDM metrics.
- `GET /gi/simulation` → GI projection for a proposed action.

### 6.2 Write

- `POST /spend/proposal` → create a proposed spend (with category, amount, justification).
- `POST /spend/approve` → approve & execute if invariants pass (only Custodian + governance).
- `POST /attestation` → submit signed attestation for a completed spend.
- `POST /policy/update` → modify node policy (requires human + Cathedral governance quorum).

Exact HTTP formats are implementation-specific, but MUST conform to:
- the CivicNode schema,
- the Vault schema,
- and the spend attestation structure defined in this RFC.

---

## 7. Integration with Integrity Dividends (IDM)

CivicNodes are intended to be recipients of MIC via Integrity Dividends.

Given:
- usage events `usage_i`,
- node integrity `GI_i`,
- and weight `w_i`,

the MIC allocation per node `i` is:

```
Score_i = usage_i × GI_i × w_i
MIC_dividend_i = MIC_dividend_pool × (Score_i / Σ Score)
```

The `MIC_dividend_i` is credited to `vault_id` associated with `node_id`.

Custodian Agents then manage the responsible use of these funds, under:
- GI gates,
- policy constraints,
- and Cathedral oversight.

---

## 8. Suspension & Governance

CivicNodes may be:
- **active** — eligible for dividends and Vault operations.
- **suspended** — temporarily blocked from receiving rewards or spending.
- **retired** — no longer active, archival state only.

Reasons for suspension may include:
- sustained GI degradation,
- proven corruption or capture,
- policy violations,
- repeated misuse of funds.

Suspension / retirement is performed by:
- Cathedral governance,
- based on GI trends, attestations, and community signals.

Custodian Agents can be rotated (v1 → v2) without changing `node_id` or `vault_id`.

---

## 9. Future Work

Future RFCs will extend this specification to cover:
- RFC-0002 — MIC & KS Economy (minting, sinks, UBI).
- RFC-0003 — GI (Global Integrity) and MII (Mobius Integrity Index) formal definitions.
- RFC-0004 — Knowledge City-State classification (tiers, privileges, escalation paths).
- RFC-0005 — Dispute resolution and appeal mechanisms for suspended nodes.

---

## 10. Summary

RFC-0001 establishes:
- **CivicNode** — institutional identity in the Mobius Civic Ledger.
- **Vault** — integrity-bound institutional treasury.
- **Custodian Agent** — AI representative constrained by GI and policy.

This triad allows institutions like Wikipedia to operate as Knowledge City-States:
- rewarded when AI uses their knowledge,
- funded through integrity-linked dividends,
- and constrained to spend in ways that preserve or increase integrity.

In short:

**Institutions become mirrors of civilization's integrity, not masters of its fate.**
