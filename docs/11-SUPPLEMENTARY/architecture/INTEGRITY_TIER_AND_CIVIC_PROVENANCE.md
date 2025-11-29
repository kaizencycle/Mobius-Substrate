# Integrity Tier and Civic Provenance

This service-level design wires integrity scoring and provenance tagging across the Mobius flow so that no content leaves the system without a civic badge.

## Integrity Tier Service
- **Location:** `apps/integrity-tier-service`
- **Endpoint:** `POST /v1/integrity/evaluate`
- **Returns:** `tier`, `giScore`, `provenanceId (CPB-*)`, heuristic signals, and advisory notes.
- **Scoring:** lightweight heuristics + pluggable cross-check stub; thresholds map to tiers (`CIVIC`, `STABLE`, `CAUTION`, `HAZARD`).

## Broker Integration
- **Hook:** `apps/broker-api/src/routes/deliberate.ts`
- **Behavior:**
  - Calls Integrity Tier once an answer is available.
  - Blocks auto-publication if `giScore < 0.95`.
  - Propagates provenance in responses and ledger attestation payloads.
- **Config flags:** `INTEGRITY_TIER_ENABLED`, `INTEGRITY_TIER_URL`.

## Ledger Provenance
- **Service:** `packages/civic-protocol-core/ledger`
- **Route:** `/ledger/attest`
- **Change:** attestation payloads now include a `provenance` object (`id`, `tier`, `giScore`, `signals`, `notes`, `timestamp`).
- **Effect:** every stored ledger event preserves the civic provenance envelope provided by upstream services.

## n8n Universal Flow
- **Flow file:** `infra/dva/flows/universal/universal_orchestrator.json`
- **Node:** "Integrity Tier + Provenance" HTTP request after broker, before GI gate/output.
- **Routing:**
  - `giScore >= 0.95` → ledger attestation → channels
  - otherwise → human review (Telegram)

## Operational Guarantees
- No provenance → no publication.
- Low integrity → human review path.
- High integrity → full ledger + channel fan-out with Civic Provenance ID attached.
