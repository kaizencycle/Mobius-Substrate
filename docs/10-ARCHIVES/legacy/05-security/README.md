# Security & Resilience

This section centralizes all security, safety, and recovery documentation.

**Mobius is integrity-first. This folder is where that commitment becomes operational.**

---

## Contents

Core security documentation (to be populated/moved in Phase 2):

### Root Level
- `threat-model.md` — Security architecture and attack surfaces (existing)
- `security-policies.md` — Security standards and requirements
- `incident-response.md` — What to do when security events occur
- `RECOVERY_PLAYBOOK.md` — Disaster recovery procedures (existing)
- `security-audit-log.md` — History of security reviews

### `guardrails/`
- `anti-nuke-guardrails.md` — Deletion protection systems
- `integrity-gates.md` — GI-based safety thresholds
- `rate-limiting.md` — Abuse prevention
- `input-validation.md` — Data sanitization rules

### `policies/`
- `access-control.md` — Who can do what
- `data-retention.md` — What we keep and why
- `encryption-standards.md` — At-rest and in-transit encryption
- `key-rotation.md` — Cryptographic key management

### `monitoring/`
- `security-metrics.md` — What we measure
- `alerting.md` — When and how we notify
- `audit-logs.md` — Immutable event records
- `anomaly-detection.md` — Identifying unusual patterns

---

## Core Security Principles

**1. Integrity Gates**  
All operations must maintain `GI ≥ 0.95`. Below this threshold:
- Route to human-in-the-loop review
- Decline automated action
- Log for analysis

**2. Anti-Nuke Guardrails**  
Protection against destructive changes:
- PR blocked if deletes >5 files or >15% of codebase
- Protected paths in `apps/`, `packages/`, `sentinels/`, `labs/`
- Force-push prevention on `main` branch
- Automated checks via `.github/workflows/anti-nuke.yml`

Implemented after near-nuke incident — see `RECOVERY_PLAYBOOK.md`.

**3. Cryptographic Attestation**  
All critical operations are cryptographically signed:
- Ed25519 signatures for MII attestations
- Deliberation Proofs from Thought Broker
- Civic Ledger immutability

**4. Defense in Depth**  
Multiple security layers:
- **Citizen Shield** — Network perimeter security
- **Shield Policies** — Rate limits and input validation
- **Sentinel Review** — AI-based anomaly detection
- **Human Oversight** — 25% of governance flow
- **Audit Logs** — Complete operation history

**5. Privacy by Design**  
- Bio-DNA requires explicit consent
- Minimal data collection
- No surveillance capitalism
- User controls their own data

---

## Current Security Status

| Component | Status | Last Audit | Notes |
|-----------|--------|------------|-------|
| Citizen Shield | ✅ Active | C-145 | Network security + IDS |
| Anti-Nuke Guards | ✅ Active | C-140 | Deletion protection |
| MII Signatures | ✅ Active | C-145 | Ed25519 attestations |
| Integrity Gates | ✅ Active | C-147 | GI ≥ 0.95 enforcement |
| Threat Model | ✅ Complete | C-146 | Comprehensive review |
| Penetration Test | 📋 Planned | - | Q1 2026 |

---

## Recovery Procedures

If something goes wrong:

1. **Assess Impact** — What broke? Who's affected?
2. **Consult RECOVERY_PLAYBOOK.md** — Follow documented procedures
3. **Use `git revert`** — Preserve history (Kintsugi principle)
4. **Notify Stakeholders** — Transparent communication
5. **Write Incident Report** — Learn and improve
6. **Update Guardrails** — Prevent recurrence

**Preferred Recovery Method:** `git revert` (preserves history)  
**Last Resort:** Hard reset to known-good commit

---

## Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead:
1. Email security@mobius-systems.org (to be set up)
2. Use GPG key for sensitive reports
3. Allow 24-48 hours for initial response
4. Coordinate disclosure timeline

Responsible disclosure earns MIC rewards.

---

## Security Audits

Mobius undergoes regular security reviews:

- **Internal Audits** — Quarterly sentinel-based code review
- **External Audits** — Annual third-party assessment (planned)
- **Community Audits** — Bug bounty program (coming soon)
- **Peer Review** — Academic security analysis

See [`08-research/peer-review-response.md`](../08-research/peer-review-response.md) for latest findings.

---

## Compliance & Standards

Mobius aims for:

- **OWASP Top 10** — Protection against common web vulnerabilities
- **CIS Benchmarks** — Infrastructure hardening
- **NIST Cybersecurity Framework** — Security management
- **ISO 27001** — Information security management (future goal)

---

## Relationship to Other Sections

- See [`02-architecture/components/citizen-shield.md`](../02-architecture/components/citizen-shield.md) for security architecture
- See [`03-specifications/cryptography/`](../03-specifications/cryptography/README.md) for cryptographic specs
- See [`06-operations/monitoring/`](../06-operations/monitoring/README.md) for security monitoring

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
