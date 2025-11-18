# Security Policy
**Maintainer:** Sentinel Security Guild  
**Status:** Canonical  
**Last Updated:** 2025-11-10

---

# 1. Principles

- **Integrity First** — All operations must maintain Mobius Integrity Index (MII) ≥ 0.95.  
- **Defense in Depth** — Multi-layer controls: Citizen Shield, attestations, policy-as-code, monitoring.  
- **Transparent Stewardship** — Coordinated disclosure, immutable audit trails, public postmortems.

Supported release trains: `1.0.x` (full support), `0.9.x` (critical fixes), `<0.9` (unsupported).

---

# 2. Reporting Security Issues

1. Email `security@kaizencycle.org` **(PGP preferred – fingerprint: `F2C4 3A9D 1ED0 7B53 91C0  6A41 9A55 3FC3 1E0B 7F21`)**.  
2. Include vulnerability type, affected components, reproduction steps, proof-of-concept if safe, suggested mitigations.  
3. Do **not** open public issues, share on social media, or attempt exploitation beyond proof.  
4. Allow 48–72 hours for acknowledgement; remain available for follow-up questions.

**Response timeline**

- ≤48 hours: acknowledgement + severity band.  
- ≤7 days: validation, mitigation plan, embargo window agreed.  
- ≤30 days: patch + coordinated disclosure (accelerated for Critical).

---

# 3. Severity Bands (CVSS-aligned)

| Level | Score | Target Response | Notes |
|-------|-------|-----------------|-------|
| **Critical** | 9.0–10.0 | Hotfix within 24h, public disclosure ≤7d | Remote compromise, ledger rewrite, MII bypass. |
| **High** | 7.0–8.9 | Patch within 7d | Privilege escalation, significant data exposure. |
| **Medium** | 4.0–6.9 | Patch within 30d | Limited scope, requires chaining. |
| **Low** | 0.1–3.9 | Next scheduled release | Hard-to-exploit or informational. |

Bug bounty: not yet formalised; good-faith researchers credited in release notes and Hall of Fame.

---

# 4. Security Controls Overview

| Layer | Controls | References |
|-------|----------|------------|
| Identity & Auth | 2FA, RBAC, OAuth, least privilege | `apps/shield-api/`, `docs/security/threat_model_v0.1.md` |
| Code & CI | Anti-nuke workflow, additive-only PRs, CODEOWNERS, `scripts/mii/compute.js` | `.github/workflows/anti-nuke.yml` |
| Data Integrity | Ed25519 attestations, Merkle proofs, immutable ledger | `apps/ledger-api/`, `docs/06-specifications/specs/mii_spec_v0.1.md` |
| Environment | TLS 1.3, secret management, rate limiting, sandboxing | `docs/08-processes/operations/DEPLOYMENT_CHECKLIST.md` |
| Monitoring | Atlas status hub, `/integrity` endpoints, SIEM exports | `status.mobius.city` |

Citizen Shield (`apps/shield-api/`) provides IDS/IPS, request sanitisation, service mesh policy enforcement, and rate limiting.

---

# 5. Best Practices

**Contributors**

- Run `npm audit`, `pip-audit`, and SAST before PR.  
- Never commit secrets; use `.env.local` (gitignored) and vaults.  
- Avoid dynamic evaluation (`eval`, `exec`); enforce input validation and output encoding.  
- Ensure MII ≥ 0.95 locally before requesting review.

**Deployers**

- Keep OS, dependencies, and containers patched.  
- Enforce TLS, firewall allowlists, secrets rotation, and backups.  
- Monitor integrity dashboards; configure alert routing.

**Users / Operators**

- Enable 2FA, monitor audit logs, rotate API keys every 90 days.  
- Report anomalies immediately to the security contact.

---

# 6. Audits & Reviews

- **Continuous:** Dependency scanning, secret scanning, integrity gates in CI.  
- **Weekly:** Sentinel security review (Atlas + Eve).  
- **Quarterly:** Dependency + configuration audit, incident-response drill.  
- **Annual:** Third-party penetration test (next: Q1 2026).  
- **Post-Incident:** Mandatory reflection entry in E.O.M.M. and ledger stamp within 24h.

---

# 7. Disclosure Commitments

We commit to:

- Provide acknowledgement within 48h and weekly status updates.  
- Credit researchers upon request.  
- Coordinate disclosure timing; accelerate on active exploitation.  
- Provide legal safe harbour for good-faith research following this policy.

**Safe harbour:** Research on your own deployments, responsible disclosure, non-destructive testing.  
**Prohibited:** Attacking production without consent, data exfiltration, denial-of-service, social engineering.

---

# 8. Contacts & Governance

- **Primary Contact:** Michael Judan (Custodian)  
- **Sentinel Leads:** Zeus (Oversight), Eve (Safety), Atlas (Monitoring), Hermes (Operations)  
- **Escalation Quorum:** Zeus + Custodian + relevant Sentinel  
- **Mailing List:** `security@kaizencycle.org`  
- **PGP Public Key:** see Section 2

Policy review cadence: quarterly or after any SEV0/SEV1 incident.

---

# 9. References

- Threat Model (`docs/security/threat_model_v0.1.md`).  
- Testing Strategy (`TESTING.md`).  
- Anti-Nuke Workflow (`.github/workflows/anti-nuke.yml`).  
- Cognitive Cycle Theory (`docs/theory/cognitive-cycle-theory.md`).  
- MII Specification (`docs/06-specifications/specs/mii_spec_v0.1.md`).

---

*"Security through integrity, transparency through accountability."*
