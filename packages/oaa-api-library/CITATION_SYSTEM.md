# Citation and Provenance System

This system implements first-class citations and verifiable provenance across E.O.M.M. (memory) and the Civic Ledger (attestations).

## Features

### 1. Schema Extensions

**Attestation Schema** (`schemas/attestation.schema.json`):
- `citation`: Array of source citations with @type, name, url, hash, note
- `isBasedOn`: Array of URLs/URNs that this work is based on
- `prov`: Provenance block with generatedAtTime, wasAttributedTo, used resources

**E.O.M.M. Entry Schema** (`schemas/eomm-entry.schema.json`):
- `sources`: Array of source objects with type, name, url, hash, note
- `links`: Object with ledgerProof and beaconUrl for cross-references

### 2. Ingest Endpoint

The `//api/eomm/ingest` endpoint now:
- Validates `sources` field as array
- Builds JSON-LD with proper citations from sources
- Returns both the saved E.O.M.M. file and generated JSON-LD

### 3. Sync Script

The `scripts/eomm-sync.mjs` script:
- Generates JSON-LD with citations and provenance
- Posts to Civic Ledger
- Writes back ledger proof and beacon URL to memory files
- Maintains cross-links between all artifacts

### 4. Proof Proxy

The `//api/proof/[id]` endpoint:
- Fetches proof details from Civic Ledger
- Enriches with back-links to E.O.M.M. and beacon files
- Provides cached, safe access to proof information

### 5. Citation Hygiene

The `scripts/citation-hygiene.sh` script:
- Quarantines entries with ethics/security keywords that lack citations
- Ensures high-quality, verifiable content

## Usage

### Creating an E.O.M.M. Entry with Citations

```json
{
  "title": "C-109 G Gate v0 plan",
  "timestamp": "2025-10-18T13:20:00Z",
  "agent": "eve",
  "cycle": "C-109",
  "content": "Ship ethics soft-gate, attach citations to beacons.",
  "sources": [
    {
      "type": "url",
      "name": "Virtue Accords",
      "url": "/specs/03-agent-ethics.md",
      "note": "Core ethics framework"
    },
    {
      "type": "repo",
      "name": "PR #42 G Beacon writer",
      "url": "https://github.com/kaizencycle/OAA-API-Library/pull/42",
      "hash": "7fa92e8b5a9d6f4f0b"
    }
  ]
}
```

### Generated JSON-LD

The system automatically generates JSON-LD with:
- Proper schema.org citation format
- isBasedOn relationships
- Provenance tracking (prov)
- Cross-links to ledger proofs and beacons

### Proof Card Component

Use the `ProofCard` component to display proof information:

```tsx
import { ProofCard } from '../components/ProofCard';

<ProofCard id="3f2e8b5a-9d6f-4f0b-b0fd-1f6d6b3c1a77" />
```

## Environment Variables

- `LEDGER_BASE_URL`: Base URL for Civic Ledger
- `LEDGER_ADMIN_TOKEN`: Authentication token for ledger access
- `PROOF_CACHE_SECONDS`: Cache TTL for proof proxy (default: 60)

## File Structure

```
schemas/
  attestation.schema.json     # JSON-LD attestation schema
  eomm-entry.schema.json      # E.O.M.M. entry schema

pages//api/
  eomm/ingest.ts              # Enhanced ingest with citations
  proof/[id].ts               # Proof proxy endpoint

scripts/
  eomm-sync.mjs               # Sync with citation support
  citation-hygiene.sh         # Citation quality check

components/
  ProofCard.tsx               # Proof display component

data/eomm/
  *.json                      # E.O.M.M. entries with sources/links
  _quarantine/                # Quarantined entries
  _invalid/                   # Invalid entries
```

## Benefits

1. **Verifiable Provenance**: Every artifact traces back to its sources
2. **Cross-References**: Seamless links between E.O.M.M., ledger, and beacons
3. **Quality Control**: Automated citation hygiene for important topics
4. **Schema Compliance**: Proper JSON-LD with schema.org standards
5. **Audit Trail**: Complete lineage tracking for all contributions

