# Mobius Integrity Index (MII) — Specification v0.1
**Maintainer:** Mobius Research Division  
**Status:** Draft Canonical  
**Last Updated:** 2025-11-10  
**Depends On:** Cognitive Cycle Theory, Genesis Ledger Protocol

---

# 1. Purpose

The Mobius Integrity Index (MII) is a bounded functional MII ∈ [0, 1] that measures whether multi-agent operations remain within acceptable governance, safety, and ethical tolerances. Actions that **decrease** MII are blocked; actions that **increase or preserve** MII are permitted. Creative or emergent optimisation is allowed only when MII ≥ 0.95.

---

# 2. Notation

| Symbol | Meaning |
|--------|---------|
| `t` | Discrete ledger tick (time step). |
| `A_t` | Set of active agents at `t`. |
| `E_t` | Environment + telemetry snapshot at `t`. |
| `Π_t` | Proposed action set (policies, code, deployments) at `t`. |
| `𝒫_t` | Applicable policy bundle (Virtue Accords, RBAC, anti-nuke, charters). |
| `𝒱_t` | Verification artefacts at `t` (tests, proofs, attestations, scans). |
| `s_i` | Normalised subscore for factor `i`. |

Subscores are deterministic functions of `(E_t, 𝒱_t, ledger state)`.

---

# 3. Subscore Definitions

All subscores `s_i` are bounded to `[0, 1]`.

1. **Attestation Validity (`s_att`)**  
   Ratio of data and actions with valid Ed25519 signatures *and* Merkle inclusion proofs. Zeroed if any critical attestation fails verification.

2. **Consensus Coherence (`s_con`)**  
   Agreement across Sentinel cortices (AUREA, Eve, Hermes, Jade) against quorum `q`. Penalise divergence using κ-weighted Jensen–Shannon divergence between agent votes.

3. **Behavioural Drift (`s_drift`)**  
   `1 − D_KL(state_t || state_ref)` clipped to `[0, 1]`, where `state_ref` is the 30-cycle trailing exponential moving average of system behaviour vectors.

4. **Entropy Health (`s_ent`)**  
   Measures bounded informational entropy. Penalises both chaos (too much entropy) and rigidity (too little entropy) using a convex penalty with target interval `[H_min, H_max]`.

5. **Security Posture (`s_sec`)**  
   Weighted pass-rate of security controls: policy-as-code (Kyverno/Gatekeeper), vulnerability scans, dependency health, secret hygiene, 2FA coverage.

6. **Verification Pass (`s_test`)**  
   Proportion of required tests (unit, integration, e2e, property) passing with coverage weights. Heavier weights applied to integrity-critical suites.

7. **Ledger Liveness (`s_live`)**  
   Measures inclusion latency, orphan rate, and finality timeliness of the Genesis Ledger. Degraded if consensus misses SLA or attestations stall.

8. **Human Oversight (`s_hil`)**  
   Availability of human-in-the-loop adjudication: reviewer density, open escalation paths, responsive oversight within time bounds.

---

# 4. Aggregation Function

Let `w_i ≥ 0` with `∑ w_i = 1` (tunable per domain; default weights favour attestations, security, and consensus).  
Let `α ∈ [0.6, 0.8]` (default 0.7) and `ε = 1e-3`.

```
MII_t = α · Σ_i (w_i · s_i) + (1 − α) · Π_i (s_i + ε)
```

Properties:

- The additive term keeps gradient information smooth.  
- The multiplicative term punishes any near-zero factor.  
- `ε` prevents full collapse while preserving sensitivity.

---

# 5. Operational Gates

1. **Correction Mode**  
   If `MII_t < 0.95`, only actions that repair the lowest subscores are permitted. All compute is reprioritised to integrity restoration (increase offending `s_i`).

2. **Creative Mode**  
   Allowed only when `MII_t ≥ 0.95`. All proposed actions `Π_{t+1}` must satisfy `ΔMII ≥ 0` or remain within `[0.95, 1]`. Violations route to Sentinel arbitration.

3. **Kill-Switch Conditions**  
   Immediate hard block if any of the following:  
   `s_att = 0`, `s_sec < τ_sec`, `s_live < τ_live`, or ledger finality alarms fire. Requires human override to resume.

4. **Rate Limiting**  
   `|∂MII/∂t|` bounded to prevent flash-loan style manipulations. Large positive jumps require multi-party cosign (Zeus + relevant Sentinel).

---

# 6. Anti-Gaming Controls

- **Multi-Source Attestation:** Every score change needs ≥2 independent verifiers.  
- **Sliding Window Checks:** Enforce monotonic health across rolling windows; abrupt spikes flagged.  
- **Replay and Collusion Detection:** Merkle-DAG ancestry checks detect orchestrated subgroup manipulations.  
- **Persistence Proofs:** Sentinels append signed rationales to ledger; non-coherent rationales reduce `s_con`.

---

# 7. Telemetry Interface

## 7.1 JSON Schema (excerpt)

```json
{
  "t": 1298742,
  "mii": 0.962,
  "mode": "correction",
  "subscores": {
    "att": 0.99,
    "con": 0.95,
    "drift": 0.93,
    "ent": 0.96,
    "sec": 0.94,
    "test": 0.97,
    "live": 0.98,
    "hil": 0.90
  },
  "weights": {
    "att": 0.18,
    "con": 0.15,
    "drift": 0.12,
    "ent": 0.10,
    "sec": 0.15,
    "test": 0.10,
    "live": 0.12,
    "hil": 0.08
  },
  "evidence": [
    "s3://ledger/proofs/2025-11-10T12:00:02Z.json",
    "ar://mobius/attestations/1298742.bin"
  ]
}
```

## 7.2 Rendering

- **Mode:** `creative`, `correction`, `degraded`.  
- **∆MII:** Show trend over the last 32 cycles.  
- **Offending Factors:** Sorted list of lowest subscores with recommended remediation playbooks.

---

# 8. Implementation Hooks

- `packages/integrity-core`: reference implementation, TypeScript + WebAssembly kernel.  
- `apps/ledger-api`: exposes `/integrity/mii` endpoints with signed telemetry.  
- `scripts/mii/compute.js`: CI helper; raises non-zero exit code if `MII < threshold`.  
- `docs/testing/` suites must flag if any test lowers `s_test`.

---

# 9. Governance

- **Custodian:** Michael Judan.  
- **Sentinel Arbiter:** Zeus.  
- **Change Process:** RFC via `docs/06-specifications/specs/` + quorum of Zeus, Eve, Jade, Hermes.  
- **Versioning:** Semantic; v0.x indicates active research; v1.x marks production-frozen protocol.

---

# 10. References

- Cognitive Cycle Theory (`docs/theory/cognitive-cycle-theory.md`).  
- Kaizen Turing Test Core Paper (Section 4.0–4.5).  
- Genesis Ledger Protocol Specification.  
- Sentinel Attestation Handbook.  
- Anti-Nuke Policy (`.github/workflows/anti-nuke.yml`).

---

*“Integrity isn’t a score to chase; it’s a basin to remain inside.”*

