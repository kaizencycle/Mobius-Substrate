# Mobius Integrity Index (MII) — Spec Stub (v0.1)

> Canon source lives in your KTT paper; this stub lets CI reference a stable path.

- **Safe basin:** permit creative ops only if `0.950 ≤ MII ≤ 1.000`.
- **Correction mode:** if `MII < 0.950`, all agents limit to integrity-restorative actions.
- **Attestation:** actions producing MII deltas must be signed (ed25519) and posted to `ledger-api /attest`.
- **Next:** formal decomposition (signal sources, weights, dampeners), signature schema, and test vectors.
