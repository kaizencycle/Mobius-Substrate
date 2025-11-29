# Sigstore Attestation (Stub)

This GitHub Action provides a **keyless cosign** signing flow for build artifacts.
- Produces a demo artifact under `dist/`
- Generates a simple provenance JSON (SLSA-like stub)
- Signs and attests the artifact using **cosign** with OIDC identity

## Next Steps
- Replace the demo build with your real wheels/containers.
- Publish signatures to Rekor transparency log (enabled by default in cosign).
- Persist attestation summary hash to the Civic Ledger via AUREA.

## Policy Link
This pipeline should run **before** Drift Compliance checks and store the signature/attestation references for audit.

