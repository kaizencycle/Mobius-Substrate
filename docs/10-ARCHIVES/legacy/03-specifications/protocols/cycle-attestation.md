# Cycle Attestation Specification

**Version:** 1.0  
**Status:** Production-Ready  
**Effective:** Cycle C-148+  
**Protocol:** MCP v1.0

---

## Purpose

This specification defines the format and requirements for cycle attestations written to the Civic Ledger after a PR is merged (CYCLE_ATTEST phase).

**Attestations are immutable historical records** of completed cycles, equivalent to Bitcoin block finalization.

---

## Attestation Format

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": [
    "cycle",
    "timestamp",
    "author",
    "pr_hash",
    "sentinel_signatures",
    "gi_score",
    "echo_score",
    "intent",
    "attestation_hash"
  ],
  "properties": {
    "cycle": {
      "type": "string",
      "pattern": "^C-[0-9]+$",
      "description": "Cycle number in C-XXX format"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of attestation"
    },
    "author": {
      "type": "string",
      "description": "GitHub username or identifier"
    },
    "pr_hash": {
      "type": "string",
      "pattern": "^[a-f0-9]{40}$",
      "description": "Git commit hash of merged PR"
    },
    "sentinel_signatures": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["ATLAS", "AUREA", "ECHO"]
      },
      "minItems": 3,
      "maxItems": 3,
      "description": "All three sentinels must sign"
    },
    "gi_score": {
      "type": "number",
      "minimum": 0.95,
      "maximum": 1.0,
      "description": "Global Integrity score (must be ≥ 0.95)"
    },
    "echo_score": {
      "type": "number",
      "minimum": 0.95,
      "maximum": 1.0,
      "description": "ECHO Layer score (must be ≥ 0.95)"
    },
    "intent": {
      "type": "string",
      "minLength": 10,
      "description": "Human intent declared at CYCLE_BEGIN"
    },
    "changes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": ["added", "modified", "deleted"]
          },
          "lines_added": {
            "type": "integer"
          },
          "lines_removed": {
            "type": "integer"
          }
        }
      },
      "description": "Summary of code changes"
    },
    "attestation_hash": {
      "type": "string",
      "pattern": "^sha256-[a-f0-9]{64}$",
      "description": "SHA-256 hash of attestation content"
    },
    "mii_impact": {
      "type": "object",
      "properties": {
        "before": {
          "type": "number"
        },
        "after": {
          "type": "number"
        },
        "delta": {
          "type": "number"
        }
      },
      "description": "MII (Mobius Integrity Index) impact"
    },
    "metadata": {
      "type": "object",
      "description": "Additional cycle metadata"
    }
  }
}
```

---

## Example Attestation

```json
{
  "cycle": "C-148",
  "timestamp": "2025-11-29T15:30:00Z",
  "author": "kaizencycle",
  "pr_hash": "abc123def456ghi789jkl012mno345pqr678stu901",
  "sentinel_signatures": ["ATLAS", "AUREA", "ECHO"],
  "gi_score": 0.97,
  "echo_score": 0.98,
  "intent": "Implement MCP v1.0 and all C-148 deliverables",
  "changes": [
    {
      "file": "docs/06-OPERATIONS/protocols/MCP_v1.0.md",
      "type": "added",
      "lines_added": 450,
      "lines_removed": 0
    },
    {
      "file": "docs/04-guides/development/pr-cycle-template.md",
      "type": "added",
      "lines_added": 180,
      "lines_removed": 0
    },
    {
      "file": ".github/workflows/mcp-enforcer.yml",
      "type": "added",
      "lines_added": 120,
      "lines_removed": 0
    },
    {
      "file": "apps/indexer-api/src/routes/cycles.ts",
      "type": "added",
      "lines_added": 85,
      "lines_removed": 0
    }
  ],
  "attestation_hash": "sha256-7f3a8b2c9d4e1f6a5b8c3d2e9f1a4b7c6d5e8f2a1b4c7d9e3f6a8b2c5d1e4f7a",
  "mii_impact": {
    "before": 0.92,
    "after": 0.94,
    "delta": 0.02
  },
  "metadata": {
    "duration_minutes": 240,
    "files_changed": 12,
    "tests_added": 5,
    "documentation_pages": 8
  }
}
```

---

## Attestation Hash Calculation

**Algorithm:**
1. Create canonical JSON representation (sorted keys, no whitespace)
2. Concatenate all required fields in order
3. Compute SHA-256 hash
4. Prepend "sha256-" prefix

**Pseudocode:**
```python
import hashlib
import json

def compute_attestation_hash(attestation):
    # Create canonical representation
    canonical = {
        "cycle": attestation["cycle"],
        "timestamp": attestation["timestamp"],
        "author": attestation["author"],
        "pr_hash": attestation["pr_hash"],
        "sentinel_signatures": sorted(attestation["sentinel_signatures"]),
        "gi_score": attestation["gi_score"],
        "echo_score": attestation["echo_score"],
        "intent": attestation["intent"]
    }
    
    # Convert to JSON string (sorted keys, compact)
    json_str = json.dumps(canonical, sort_keys=True, separators=(',', ':'))
    
    # Compute SHA-256
    hash_bytes = hashlib.sha256(json_str.encode('utf-8')).digest()
    hash_hex = hash_bytes.hex()
    
    return f"sha256-{hash_hex}"
```

---

## Ledger Integration

### Database Schema

**Table:** `cycle_attestations`

```sql
CREATE TABLE cycle_attestations (
    id SERIAL PRIMARY KEY,
    cycle VARCHAR(10) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    author VARCHAR(100) NOT NULL,
    pr_hash VARCHAR(40) NOT NULL,
    sentinel_signatures JSONB NOT NULL,
    gi_score DECIMAL(3,2) NOT NULL CHECK (gi_score >= 0.95),
    echo_score DECIMAL(3,2) NOT NULL CHECK (echo_score >= 0.95),
    intent TEXT NOT NULL,
    changes JSONB,
    attestation_hash VARCHAR(72) UNIQUE NOT NULL,
    mii_impact JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cycle_attestations_cycle ON cycle_attestations(cycle);
CREATE INDEX idx_cycle_attestations_timestamp ON cycle_attestations(timestamp DESC);
CREATE INDEX idx_cycle_attestations_author ON cycle_attestations(author);
CREATE INDEX idx_cycle_attestations_gi_score ON cycle_attestations(gi_score DESC);
```

### API Endpoint

**POST** `/api/cycles/attest`

**Request Body:**
```json
{
  "cycle": "C-148",
  "pr_hash": "abc123...",
  "gi_score": 0.97,
  "echo_score": 0.98,
  "intent": "...",
  "changes": [...]
}
```

**Response:**
```json
{
  "success": true,
  "attestation_hash": "sha256-...",
  "ledger_entry_id": 12345
}
```

---

## Validation Rules

### Required Fields

All attestations must include:
- `cycle` — Valid C-XXX format
- `timestamp` — Valid ISO 8601
- `author` — Non-empty string
- `pr_hash` — Valid Git commit hash (40 chars)
- `sentinel_signatures` — Exactly 3 signatures (ATLAS, AUREA, ECHO)
- `gi_score` — ≥ 0.95
- `echo_score` — ≥ 0.95
- `intent` — Minimum 10 characters
- `attestation_hash` — Valid SHA-256 hash

### Validation Checks

1. **Cycle Uniqueness** — Each cycle number can only be attested once
2. **PR Hash Validity** — Must be a valid Git commit hash
3. **Score Thresholds** — GI and ECHO scores must be ≥ 0.95
4. **Sentinel Signatures** — All three must be present
5. **Hash Verification** — Attestation hash must match computed hash
6. **Timestamp Ordering** — Timestamp must be after PR merge time

---

## Immutability

**Once written to the ledger, attestations are immutable.**

**Immutability Guarantees:**
- Cryptographic hash prevents tampering
- Ledger append-only structure
- No update or delete operations
- Historical record preserved forever

**Corrections:**
- If errors discovered, create new attestation with correction note
- Link correction to original attestation
- Original attestation remains unchanged

---

## Integration Points

### ECHO Layer

**Reflection Snapshot:**
- ECHO Layer reads attestation
- Updates companion memory
- Caches improvements
- Improves future cycles

### MII System

**MII Update:**
- Attestation triggers MII recalculation
- System-wide integrity index updated
- Impact recorded in `mii_impact` field

### Cycle Index

**API Endpoint:**
- `/api/cycles` — List all cycles
- `/api/cycles/:cycle` — Get specific cycle
- `/api/cycles/attest` — Create new attestation

See [`apps/indexer-api/src/routes/cycles.ts`](../../../apps/indexer-api/src/routes/cycles.ts) for implementation.

---

## Related Documents

- [`MCP_v1.0.md`](../../06-OPERATIONS/protocols/MCP_v1.0.md) — Full MCP specification
- [`cycle-protocol-binding.md`](../../07-governance/sentinels/cycle-protocol-binding.md) — Sentinel rules
- [`/cycles` API](../../../apps/indexer-api/src/routes/cycles.ts) — Cycle index endpoint

---

## Version History

| Version | Date | Changes | Cycle |
|---------|------|---------|-------|
| 1.0 | 2025-11-29 | Initial release | C-148 |

---

*Cycle C-148 • 2025-11-29*  
*Cycle Attestation Specification v1.0*  
*"The Ledger is memory."*
