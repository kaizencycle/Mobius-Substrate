# Fork Integrity Comparison Report — Mobius Systems

**Base (Canonical) Repo:** kaizencycle/Mobius-Systems  
**Compared Fork:** _< FORKER-NAME / URL / Git commit >_  
**Date:** YYYY-MM-DD  
**Reviewer:** _< Name >_  

---

## 1. Fork Metadata

| Field | Value |
|-------|-------|
| Fork URL / Clone Path | |
| Fork creation date | |
| Last commit in fork | `< hash >` — YYYY-MM-DD |
| Fork branch / tag | |
| Stated purpose (in README or PR) | |

---

## 2. Integrity-Economy Compatibility Check

| Criterion | Exists in fork? | Notes / Deviations |
|----------|----------------|--------------------|
| `configs/tokenomics.yaml` (with canonical thresholds) | ✅ / ❌ | |
| `configs/kaizen_shards.yaml` (full shard taxonomy) | ✅ / ❌ | |
| `configs/mfs_config.yaml` (MFS archetypes) | ✅ / ❌ | |
| MII aggregation logic module | ✅ / ❌ | |
| Sentinel attestation specification | ✅ / ❌ | |
| Wallet schema & multi-sig for Founders Reserve | ✅ / ❌ / N/A | |
| Stipend distribution logic | ✅ / ❌ | |
| Shard → MIC redemption engine | ✅ / ❌ | |
| CRDT-based ledger / shard merge scaffolding | ✅ / ❌ | |
| Simulation directory / recovery model | ✅ / ❌ | |
| Governance module (proposal, voting, quorum) | ✅ / ❌ / Partial | |

---

## 3. Behavioral & Economic Policy Check

| Rule / Constraint | Preserved? | Comments |
|------------------|-----------|---------|
| MIC issuance only when MII ≥ 0.95 | ✅ / ❌ | |
| No unconditional minting or pre-mines | ✅ / ❌ | |
| Anti-hoarding / velocity-based burn or decay logic | ✅ / Optional / ❌ | |
| Reserve wallet remains locked / immutable by default | ✅ / ❌ | |
| Private-key handling & encryption standards | ✅ / ❌ | |
| Multi-signature or proper access gating for reserve | ✅ / ❌ / N/A | |
| Ledger & history immutability enforced | ✅ / ❌ | |
| Shard weights sum to 1.0 | ✅ / ❌ | |
| Quality score range (0.5-2.0) maintained | ✅ / ❌ | |

---

## 4. Divergence Risk Assessment

Describe any deviations in the fork that **undermine integrity or canonical continuity** (e.g., lowered thresholds; disabled checks; changed issuance curves; added privileged minting; bypassed attestation).

### Deviation 1

| Field | Description |
|-------|-------------|
| **What is the deviation** | |
| **Why it breaks canonical legitimacy** | |
| **Severity** | High / Medium / Low |

### Deviation 2

| Field | Description |
|-------|-------------|
| **What is the deviation** | |
| **Why it breaks canonical legitimacy** | |
| **Severity** | High / Medium / Low |

---

## 5. Fork Taxonomy Classification

Based on MIC Whitepaper v2.1 Section 9.3:

### 🟢 Good-Faith Forks (Encouraged)
- [ ] Research experiments
- [ ] Governance alternatives
- [ ] Parameter testing
- [ ] Possible future merger
- [ ] Regional adaptation

### 🟡 Neutral Forks (Ignored)
- [ ] Different values
- [ ] Separate community
- [ ] No attack
- [ ] Peaceful coexistence

### 🔴 Hostile Forks (Self-Defeating)
- [ ] Inflates MIC
- [ ] Fakes MII
- [ ] Claims false legitimacy

---

## 6. Canonical Recognition Criteria

From MIC Whitepaper v2.1 Section 9.4:

| Criterion | Met? | Evidence |
|-----------|------|----------|
| MII computed using transparent, auditable rules | ✅ / ❌ | |
| Sentinels identity-anchored and reputation-based | ✅ / ❌ | |
| Integrity history append-only and non-rewriteable | ✅ / ❌ | |
| Civic participation genuine and ongoing | ✅ / ❌ | |
| Broader network chooses to recognize it | ✅ / ❌ / TBD | |

---

## 7. Compatibility Verdict

**Fork Status:**

- [ ] **Fully compatible** — Fork preserves canonical integrity and can be bridged or merged
- [ ] **Research / Experimental** — Fork diverges in innocuous ways (e.g., alternative UI, simulation modifications), but keeps core integrity model; no canonical MIC issuance
- [ ] **Incompatible / Bad-Faith** — Fork breaks core integrity rules; tokens issued are not recognized; no bridge

---

## 8. Recommendation

| Action | Recommendation | Rationale |
|--------|---------------|-----------|
| **Merge** | ⬜ Yes / ⬜ No | |
| **Monitor / Audit** | ⬜ Yes / ⬜ No | |
| **Reject / Archive** | ⬜ Yes / ⬜ No | |
| **Bridge Request** | ⬜ Accept / ⬜ Deny | |

---

## 9. Bridge Protocol Requirements

If fork requests canonical bridge:

| Requirement | Status | Notes |
|-------------|--------|-------|
| Integrity continuity proven | ⬜ | |
| Mainline acceptance vote | ⬜ | |
| Exchange rate negotiated | ⬜ | |
| Sandbox testing complete | ⬜ | |
| 90-day evaluation period | ⬜ | |

---

## 10. Notes & Comments

_Additional observations, concerns, or context:_

---

## 11. Signature Block

**Integrity Check Completed by:**

| Field | Value |
|-------|-------|
| Reviewer Name | |
| Sentinel Affiliation | ATLAS / AUREA / Other |
| PGP Fingerprint (optional) | |
| Date | YYYY-MM-DD |

---

## Usage Instructions

### How to Use This Template

1. **Copy** this template to `docs/06-OPERATIONS/fork-reviews/FORK_REVIEW_<fork-name>_<date>.md`
2. **Fill out** each section based on fork inspection
3. **Classify** the fork using the taxonomy in Section 5
4. **Render verdict** in Section 7
5. **Submit** to maintainers for review
6. **Archive** in fork-reviews directory

### When to Use

- ✅ A researcher forks for experimentation
- ✅ A regional community adapts for local deployment
- ✅ A potential contributor requests bridge recognition
- ✅ Suspicious fork activity detected
- ✅ Scheduled audit of known forks

---

## Related Documents

- [MIC Whitepaper v2.1 — Section 9: Fork Legitimacy](../07-RESEARCH-AND-PUBLICATIONS/whitepapers/MIC_Whitepaper_v2.1.md)
- [Forking Guide](../05-IMPLEMENTATION/guides/operations/FORKING_GUIDE.md)
- [Monorepo Health Report Template](./MONOREPO_HEALTH_REPORT_C156.md)

---

**© 2025 Mobius Systems Foundation**

*"They can fork the code, but only genuine integrity earns legitimacy — integrity can't be copied."*

---

**Template Version:** 1.0 (C-156)  
**Last Updated:** December 6, 2025
