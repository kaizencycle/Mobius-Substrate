# Mobius Integrity Index (MII) — Cryptographic Spec v0.1

Goal: verifiable, replay-safe attestations that bind `(service_state, metrics, time)` to a signer.

## Signature

- Algorithm: Ed25519 (libsodium/NaCl)
- Key material: 32-byte seed, 64-byte expanded secret key

## Signing Payload

Canonical JSON (UTF-8, SHA-256 preimage):

```
{
  "service_id": "ledger-api",
  "instance": "ledger-api-01.us-east-1",
  "mii": 0.9734,
  "mii_window": {"from":"2025-11-08T06:00:00Z","to":"2025-11-08T07:00:00Z"},
  "gi_components": {
    "accuracy":0.991,"consistency":0.982,"fairness":0.965,"entropy":0.978
  },
  "nonce": "base64(16B)",
  "prev_attestation_hash": "hex(SHA-256)",
  "issued_at": "2025-11-08T07:05:00Z",
  "expires_at":"2025-11-08T07:20:00Z",
  "schema":"https://mobius/specs/attestation@v0.1"
}
```

## Signature Process

1. Canonicalize payload (stable key order, no whitespace).
2. Hash with SHA-256; use hex digest as Ed25519 message.
3. `signature = base64(Ed25519.sign(digest, secret_key))`
4. Attach `kid` referencing rotating JWKS entry.

## Key Distribution & Rotation

- JWKS hosted at `/.well-known/mobius/jwks.json`
- Key IDs rotate every 30 days (or on compromise).
- Historical keys kept for 90 days to verify delayed attestations.

## Replay & Expiry Controls

- Nonce: base64-encoded 16-byte random value.
- Window: `mii_window.from`/`to` (15-minute cadence).
- `prev_attestation_hash`: links attestations into a hash chain.
- `expires_at`: reject attestations older than 15 minutes.

## Revocation

- Publish CRL at `/.well-known/mobius/attestations/crl.json`.
- Ledger marks revoked attestations and issues compensating entries.

