# Data Governance

## Principles

1. **Minimal Collection**: Attestations must be minimal, signed, and free of personal data
2. **Transparency**: All data schemas publicly documented
3. **Integrity**: Cryptographic signatures on all ledger entries
4. **Provenance**: Clear chain of custody for all data

## Dataset Requirements

Datasets used for model work must declare:
- **License**: Clear open-source or usage rights
- **Provenance**: Source and collection methodology
- **Hashes**: Cryptographic verification (SHA-256 minimum)
- **Manifest**: DVC or similar versioning

**Unsigned datasets are rejected by CI.**

## Ledger Data

### Required Fields
- `timestamp`: ISO 8601 format
- `agent_id`: System/agent identifier (not human)
- `mii_value`: Integrity metric
- `signature`: Cryptographic attestation
- `payload_hash`: SHA-256 of attested data

### Prohibited Data
- Personal identifiable information (PII)
- Behavioral profiles of individuals
- Biometric data
- Social credit scores of persons
- Location tracking of humans

## Retention

- **Ledger**: Permanent (cryptographically immutable)
- **Logs**: 90 days (operational)
- **Metrics**: Aggregated only, 1 year
- **CI Artifacts**: 30 days

## Access Control

- Public: Aggregated metrics, system status
- Authenticated: Full attestation history
- Privileged: Operational logs (TSC/Security only)
- Private: Security reports (encrypted)

## Audit Trail

All data access logged with:
- Timestamp
- Accessor identity
- Data accessed
- Purpose

## Compliance

Aligns with:
- Data minimization (GDPR Article 5)
- Purpose limitation principles
- Privacy by design
- Open data standards
