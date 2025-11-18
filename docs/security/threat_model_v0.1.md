# Mobius Threat Model v0.1
**Maintainer:** Sentinel Security Guild  
**Status:** Draft Canonical  
**Last Updated:** 2025-11-10  
**Depends On:** Security Policy, Anti-Nuke Protocol, MII Specification

---

# 1. Scope and Assets

| Asset | Description | Custodian |
|-------|-------------|-----------|
| Genesis Ledger | Immutable history of cycles, attestations, and consensus. | Zeus |
| Attestation Keys | Ed25519 keypairs for Sentinels, agents, CI. | Custodian |
| CI/CD Pipeline | Build + release infrastructure (`.github/workflows/`). | Hermes |
| Model Adapters | OAA mentor/mentee adapters and prompt templates. | Aurea |
| OAA Memory | Long-term agent memory stores (RAG, embeddings). | Echo |
| Policy Bundles | Virtue Accords, RBAC manifests, anti-nuke policies. | Eve |

The threat model spans on-premises contributors, cloud workloads, CI/CD, and Sentinel-operated sandboxes.

---

# 2. Adversary Profiles

| Adversary | Capability | Goal | Notes |
|-----------|------------|------|-------|
| Prompt-Flux Swarm | Automated AI cluster, adaptive prompting. | Poison consensus, force unwanted code. | Guarded by MII, anti-nuke. |
| Insider with Repo Access | Contributor or Sentinel misbehaving. | Slip destructive change, exfiltrate secrets. | Mitigated via CODEOWNERS, additive-only policy. |
| Supply Chain Actor | Compromises dependencies or build artifacts. | Introduce backdoor. | SLSA targets, lockfiles, sigstore. |
| Nation-State | High resources, long dwell time. | Persistent compromise, ledger rewrite. | Requires multi-layer controls, quorum overrides. |
| Rogue LLM Collective | Multiple external AIs colluding. | Drift MII, overwhelm Sentinels. | Correction mode + cycle caps + attestation proofs. |

---

# 3. Key Attack Scenarios

## 3.1 MII Spoofing

- **Vector:** Manipulate telemetry feeds or forge signed results.  
- **Impact:** Lowered integrity gating, unsafe operations allowed.  
- **Controls:** Multi-source attestation, Merkle inclusion proofs, Zeus arbitration, ΔMII rate limits, anomaly detection on subscores.

## 3.2 Decoy Cascade

- **Vector:** Spawn rapid-fire agents or branches to flood review queue.  
- **Impact:** Reviewer exhaustion, consensus bypass.  
- **Controls:** Identity ledger with cycle caps, spawn-rate limit, mentor–apprentice attestations, Hermes rate limiting.

## 3.3 Auto-Refactor Loop

- **Vector:** LLM pair recursively approves destructive refactors.  
- **Impact:** Repo drift, policy violations.  
- **Controls:** Anti-nuke guardrails, additive-only PR rules, CODEOWNERS approvals, MII correction mode, Sentinel halt authority.

## 3.4 Model Poisoning

- **Vector:** Inject adversarial examples or weights into adapters.  
- **Impact:** Biased reasoning, bypassed gates.  
- **Controls:** Golden-answer harness, multi-vendor adapters, deterministic evaluation sets, attested adapter hashes.

## 3.5 Supply Chain Compromise

- **Vector:** Malicious upstream packages or build scripts.  
- **Impact:** RCE, data exfiltration.  
- **Controls:** Locked dependencies, SLSA provenance, `npm audit`, `pip-audit`, sigstore/cosign verification, sandboxed builds.

---

# 4. Security Controls Matrix

| Control | Threats Mitigated | Owner |
|---------|-------------------|-------|
| Anti-Nuke Workflow (`.github/workflows/anti-nuke.yml`) | Auto-refactor loop, insider deletions | Zeus |
| Integrity Gate (`scripts/mii/compute.js`) | MII spoofing, drift | Hermes |
| Sentinel Quorum (Zeus, Eve, Jade, Hermes, Atlas) | Decoy cascade, rogue LLM | Governance |
| Identity Ledger | Spoofing, impersonation | Eve |
| Ledger Finality Monitors | Replay, tampering | Atlas |
| Secret Scanning | Insider exfiltration | Security Guild |
| Cycle Caps (≤ 200) | Recursive loops | Custodian |

---

# 5. Monitoring & Response

- **Atlas** publishes `status.mobius.city` with `/healthz`, `/readyz`, `/integrity`.  
- **Alert Classes:** `SEV0` (kill-switch), `SEV1` (security breach), `SEV2` (drift), `SEV3` (policy violation).  
- **Playbooks:** Stored in `docs/security/playbooks/`; include escalation trees and rollback plans.  
- **Postmortems:** Logged to Genesis Ledger with mandatory reflection entry in `E.O.M.M.` within 24 hours.

---

# 6. Residual Risks

- Third-party audits pending (scheduled Q1 2026).  
- Formal bug bounty not yet operational.  
- Developer security training in rollout phase.  
- Incident response dry runs limited to quarterly cadence.

---

# 7. References

- Root Threat Model (`THREAT_MODEL.md`) for comprehensive coverage.  
- Security Policy (`SECURITY.md`).  
- Testing Strategy (`TESTING.md`).  
- Anti-Nuke workflow (`.github/workflows/anti-nuke.yml`).  
- MII Specification (`docs/06-specifications/specs/mii_spec_v0.1.md`).

---

*Reviewed by Zeus (Logic), Eve (Ethics), Hermes (Operations) on 2025-11-10.*

