# Appendix C — Data Schemas

This appendix contains references to JSON/YAML schemas for core Mobius data structures.

---

## Overview

All Mobius data structures are formally defined using JSON Schema (draft 2020-12) or YAML specifications. These schemas ensure:

- **Consistency** across implementations
- **Validation** of data integrity
- **Interoperability** between systems
- **Documentation** of expected formats

---

## Schema Locations

Full schemas available at: `/specs/civic-ledger/schemas/`

---

## Core Schemas

### CivicNode Schema

**File:** `civic_node.schema.json`  
**Purpose:** Defines institutional identity and properties

**Key Fields:**
- `node_id` — Unique identifier (e.g., `civic:wikipedia`)
- `vault_id` — Treasury wallet
- `custodian_agent_id` — AI steward
- `gi_score` — Current integrity score
- `tier` — Governance tier (0-3)
- `weight` — IDM multiplier
- `policy` — Spending constraints
- `metrics` — Usage and reward statistics

**Example:**
```json
{
  "node_id": "civic:wikipedia",
  "display_name": "Wikipedia Foundation",
  "domain": "wikipedia.org",
  "vault_id": "vault:wiki-main-001",
  "custodian_agent_id": "agent:wikipedia-custodian-v3",
  "gi_score": 0.992,
  "category": "knowledge",
  "tier": 0,
  "weight": 2.0
}
```

---

### Custodian Agent Schema

**File:** `custodian_agent.schema.json`  
**Purpose:** Defines AI agent responsible for institutional stewardship

**Key Fields:**
- `agent_id` — Unique identifier
- `version` — Agent version (v1, v2, v3)
- `node_id` — Associated CivicNode
- `vault_id` — Associated Vault
- `capabilities` — Autonomy level and permissions
- `invariants` — Non-negotiable constraints
- `gi_model_version` — GI-Sim version used

**Example:**
```json
{
  "agent_id": "agent:wikipedia-custodian-v3",
  "version": "v3",
  "node_id": "civic:wikipedia",
  "vault_id": "vault:wiki-main-001",
  "capabilities": {
    "autonomous_spend_limit_percent": 10,
    "gi_simulation": true,
    "emergency_fund_access": true
  }
}
```

---

### Vault Schema

**File:** `vault.schema.json`  
**Purpose:** Defines institutional treasury structure

**Key Fields:**
- `vault_id` — Unique identifier
- `node_id` — Associated CivicNode
- `balances` — Current MIC and KS holdings
- `limits` — Maximum capacities by tier
- `access_control` — Who can manage vault
- `transaction_history` — Recent activity
- `metrics` — Lifetime statistics

**Example:**
```json
{
  "vault_id": "vault:wiki-main-001",
  "node_id": "civic:wikipedia",
  "balances": {
    "mic": 2500000,
    "ks": 85000000
  },
  "access_control": {
    "custodian_agent_id": "agent:wikipedia-custodian-v3",
    "emergency_access": true
  }
}
```

---

## Additional Schemas

### Citizen Identity

**Format:** JSON  
**Location:** (To be published in RFC-0007 implementation)

**Key Fields:**
- `ledger_id` — Soul-bound identity
- `wallet_id` — Primary economic account
- `companion_agent_id` — Personal AI
- `reputation` — Merit score
- `gi_score` — Personal integrity
- `contributions` — Civic action history

---

### Agent Sovereignty Record

**Format:** JSON  
**Location:** (To be published in RFC-0008 implementation)

**Key Fields:**
- `agent_id` — Unique identifier
- `sovereignty_level` — 0-5 classification
- `bound_to` — Human or institution (if applicable)
- `promotion_history` — Level progression
- `gi_performance` — Historical integrity scores

---

### City-State Record

**Format:** JSON  
**Location:** (To be published in RFC-0009 implementation)

**Key Fields:**
- `state_id` — Unique identifier
- `vault_id` — State treasury
- `custodian_agent_id` — State Agent (Level 4)
- `citizen_population` — Active count
- `gi_state` — State-level integrity
- `tier` — State tier (0-3)
- `culture` — Themes, festivals, values

---

### Integrity Event

**Format:** JSON  
**Purpose:** Record of actions affecting GI scores

**Key Fields:**
```json
{
  "event_id": "gi-event-20251203-001234",
  "entity_id": "civic:wikipedia",
  "entity_type": "civicnode",
  "event_type": "fact_check_verification",
  "gi_delta": 0.05,
  "timestamp": "2025-12-03T14:30:00Z",
  "evidence_hash": "sha256:abcd1234...",
  "model_version": "gi-v1.2",
  "witnesses": ["verifier:factcheck-org"]
}
```

---

### Spend Attestation

**Format:** JSON  
**Purpose:** Transparency record for vault spending

**Key Fields:**
```json
{
  "attestation_id": "attest:wiki-spend-2025-12-epoch153-001",
  "node_id": "civic:wikipedia",
  "vault_id": "vault:wiki-main-001",
  "amount_mic": 12500,
  "amount_ks": 300000,
  "category": "infrastructure",
  "description": "Server upgrades",
  "projected_delta_gi": 0.004,
  "epoch": 153,
  "timestamp": "2025-12-03T15:00:00Z",
  "custodian_agent_id": "agent:wikipedia-custodian-v3",
  "gi_model_version": "gi-sim-v2.3",
  "signature": "ed25519:..."
}
```

---

### MIC Mint Attestation

**Format:** JSON  
**Purpose:** Record of epoch MIC minting events

**Key Fields:**
```json
{
  "epoch": 153,
  "mii": 96.8,
  "gi_global": 0.968,
  "mic_minted": 500000,
  "allocations": {
    "dividend": 300000,
    "governance": 125000,
    "reserve": 75000
  },
  "timestamp": "2025-12-03T23:59:59Z",
  "signature": "ed25519:..."
}
```

---

### IDM Allocation

**Format:** JSON  
**Purpose:** Record of Integrity Dividend distribution

**Key Fields:**
```json
{
  "epoch": 153,
  "mic_dividend_pool": 300000,
  "allocations": [
    {
      "node_id": "civic:wikipedia",
      "gi_score": 0.992,
      "usage_events": 8750000,
      "weight": 2.0,
      "score": 17336000,
      "dividend_mic": 45000
    }
  ],
  "total_score": 60377280,
  "computed_at": "2025-12-03T23:59:59Z"
}
```

---

## Schema Validation

All data submitted to Mobius systems must:

1. **Conform to schema** — Pass JSON Schema validation
2. **Include signatures** — Cryptographically signed where applicable
3. **Have timestamps** — ISO 8601 format
4. **Reference versions** — Schema and model versions specified

---

## Schema Evolution

Schemas may evolve through:

### Minor Updates (backward-compatible)
- Adding optional fields
- Expanding enums
- Clarifying descriptions

### Major Updates (breaking changes)
- Removing fields
- Changing types
- Restructuring format

All schema changes require:
- RFC proposal
- GI-Sim evaluation
- Elder approval
- Migration period

---

## Implementation Notes

### Validation Libraries

Recommended validators:
- **JavaScript/TypeScript:** `ajv` (Another JSON Schema Validator)
- **Python:** `jsonschema`, `pydantic`
- **Go:** `gojsonschema`
- **Rust:** `jsonschema`

### Example Validation (TypeScript)

```typescript
import Ajv from 'ajv';
import civicNodeSchema from './schemas/civic_node.schema.json';

const ajv = new Ajv();
const validate = ajv.compile(civicNodeSchema);

const node = {
  node_id: "civic:wikipedia",
  // ... other fields
};

if (validate(node)) {
  console.log("Valid CivicNode");
} else {
  console.error("Validation errors:", validate.errors);
}
```

---

## Full Schema Repository

Complete schemas with examples available at:

**GitHub:** `/specs/civic-ledger/schemas/`  
**Examples:** `/specs/civic-ledger/examples/`

---

**Last Updated:** 2025-12-03  
**Schema Version:** v1.0  
**Total Schemas:** 3 (published), 6+ (in development)
