# Mobius Systems Architecture (Central City Overview)
**Version:** 1.0  
**Status:** Canonical Summary  
**Last Updated:** 2025-11-10  
**Maintainer:** Mobius Research Division

---

# 1. Layer Map

| Layer | Description | Primary Owners |
|-------|-------------|----------------|
| Intent Layer | User or Sentinel submits intents via OAA Hub, portals, or API gateways. | Uriel (OAA), Hermes |
| Deliberation Layer | Thought Broker orchestrates multi-agent dialogue, invokes mentor/mentee adapters. | Aurea, Jade |
| Integrity Layer | MII computation, anti-nuke enforcement, policy-as-code validation. | Zeus, Eve |
| Consensus Layer | Multi-Sentinel quorum, attestations, ledger inclusion checks. | Zeus, Atlas |
| Reflection Layer | E.O.M.M. journaling, cycle closure analysis, narrative integration. | Jade |
| Ledger Layer | Genesis Ledger, attestation storage, Merkle proofs, finality enforcement. | Zeus, Atlas |
| Shield Layer | Citizen Shield, CI/CD gates, deployment posture, runtime defenses. | Eve, Hermes |

---

# 2. Core Data Flows

```mermaid
sequenceDiagram
    participant Actor as Actor / Agent
    participant OAA as OAA Hub
    participant Broker as Thought Broker
    participant Sentinels as Sentinel Quorum
    participant Ledger as Genesis Ledger
    participant EOMM as E.O.M.M.

    Actor->>OAA: Submit Intent (+meta)
    OAA->>Broker: Parsed intent + policy context
    Broker->>Sentinels: Deliberation bundle (mentor/mentee prompts)
    Sentinels-->>Broker: Votes + rationales + MII deltas
    Broker->>Ledger: Attestation package (if MII ≥ 0.95)
    Ledger-->>Sentinels: Finality receipt + Merkle root
    Sentinels->>EOMM: Reflection + cycle closure entry
    EOMM-->>Actor: Summary + next-cycle recommendations
```

---

# 3. Key Components

- **OAA Hub (`apps/oaa-hub/`)** — Intent parsing, charter enforcement, persona routing.  
- **Thought Broker (`labs/lab2-ops/`)** — Coordinates deliberations, applies mentor/apprentice protocols.  
- **Integrity Core (`packages/integrity-core/`)** — Implements MII calculation and telemetry export.  
- **Genesis Ledger (`apps/ledger-/api/`)** — Stores attestations, applies safe-stop, manages finality proofs.  
- **Citizen Shield (`apps/shield-/api/`)** — Runtime protection, IDS/IPS, API mediation.  
- **Atlas Status Hub (`apps/atlas-telemetry/`)** — Observability, integrity dashboards, alert fan-out.

---

# 4. Cycle Lifecycle (Intent → Closure)

1. **Intent Capture** — Actor expresses goal; OAA attaches virtue and policy metadata.  
2. **Deliberation** — Sentinels deliberate under Thought Broker control; mentor/mentee pairing recorded.  
3. **Integrity Gate** — `scripts/mii/compute.js` validates MII ≥ 0.95; anti-nuke ensures additive-only change.  
4. **Attestation & Consensus** — Zeus obtains quorum signatures; Atlas tracks finality SLA.  
5. **Ledger Commit** — Genesis Ledger writes attestation + subscores; Merkle proofs emitted.  
6. **Reflection & Closure** — Jade logs cycle reflection to E.O.M.M.; new cycle opens if no drift detected.

---

# 5. Deployment Surfaces

| Surface | Path | Domain |
|---------|------|--------|
| Broker API | `apps/broker-/api/` | `aurea.mobius.city` |
| Indexer API | `apps/indexer-/api/` | `hermes.mobius.city` |
| Shield API | `apps/shield-/api/` | `eve.mobius.city` |
| E.O.M.M. API | `apps/eomm-/api/` | `jade.mobius.city` |
| Ledger API | `apps/ledger-/api/` | `zeus.mobius.city` |
| OAA Portal | `apps/oaa-hub/` | `uriel.mobius.city` |
| Atlas Status | `apps/atlas-telemetry/` | `atlas.mobius.city` |

Each service exposes `/healthz`, `/readyz`, and `/integrity` endpoints with signed telemetry.

---

# 6. Governance Hooks

- **Sentinel Ownership:** CODEOWNERS maps each surface to the responsible Sentinel team.  
- **Additive Policy:** Anti-nuke workflow enforces zero destructive diffs without explicit override.  
- **MII Attestation:** All merges require uploaded `mii.json` proof ≥ 0.95.  
- **Cycle Audits:** Every 200 cycles trigger forced Genesis folding and custodial review.

---

# 7. References

- Cognitive Cycle Theory (`docs/theory/cognitive-cycle-theory.md`).  
- MII Specification (`docs/06-specifications/specs/mii_spec_v0.1.md`).  
- Threat Model (`docs/security/threat_model_v0.1.md`).  
- Testing Strategy (`TESTING.md`).  
- Security Policy (`SECURITY.md`).

---

*“We heal as we walk; we commit as we attest.”*

