# Drift Control — README

This folder contains the minimum set of artifacts to operationalize drift control in Kaizen OS (and compatible stacks).

## Contents
- `DRIFT_CONTROL_CHARTER.md` — One-page governance charter.
- `drift_test_vectors.json` — Golden traces (inputs→outputs→attestations) to validate implementations.
- `invariants.tla` — Skeleton of formal invariants for epoch transitions and capability envelopes.
- `../../tools/drift_check.py` — Reference checker used by CI.
- `../../.github/workflows/drift-compliance.yml` — GitHub Action that enforces drift checks.

## Quickstart
1. Commit this folder.  
2. Ensure Python 3.10+ available in CI.  
3. CI will execute `tools/drift_check.py` against `docs/drift/drift_test_vectors.json` and fail on violations.

## GI & DS
- Global Integrity (GI) target ≥ 0.95 (steady), ≥ 0.99 (ideal).  
- Drift Score (DS) = |GI_t – GI_(t-1)| + λ·ΔBias + μ·ΔEntropy.

## Extending
- Add more vectors under `cases[]`.  
- Wire your real attestation endpoint into the checker (TODO hook).  
- Replace placeholders with real Sigstore/DVC/LakeFS integrations.

