# Mobius Governance (v0.1)

Mobius is a memory-and-accountability substrate for socio-technical systems using AI. Governance exists to keep the substrate legible, contestable, and hard to capture.

This document defines:
- Who can change core specs (EPICON, MII, MIC, Sentinel Protocol)
- How changes are proposed and accepted
- How disputes and forks are handled
- What "legitimacy" means operationally (not philosophically)

---

## 1) Governance Objects

Mobius governance operates over these change surfaces:

1. **Protocol Specs**
   - EPICON schemas
   - MIC rules and utilities
   - MII scoring weights and thresholds
   - Sentinel evaluation protocol

2. **Operational Defaults**
   - Default MII threshold (e.g., 0.95)
   - Required sign-offs per workflow class
   - Circuit breaker semantics

3. **Sentinel Council Configuration**
   - Which agents are used
   - Prompt templates
   - Temperature/model settings
   - Flag severity taxonomy

---

## 2) Roles

### Maintainers

Maintainers can merge changes that affect governance objects.

Default maintainers:
- `kaizencycle`
- `michaeljudan`
- `mobius:AUREA` (bot/agent reviewer identity)

### Contributors

Any contributor may propose changes via PR + RFC.

### Sentinels (AI Reviewers)

Sentinels provide structured review outputs (flags, risks, contestations) but do not have final authority.

**Humans remain the decision authority.** Sentinel outputs are advisory and recorded for traceability.

---

## 3) Decision Rule for Governance Changes

Governance changes require:

- ✅ **Two human approvals** from maintainers
- ✅ **Sentinel Council review attached** (or recorded) for traceability
- ✅ **An EPICON** describing intent, risks, and rollback plan

When in doubt: prefer slower merges for governance objects.

---

## 4) RFC Process (High-Signal Changes)

A change is considered "high-signal" if it modifies:
- MIC issuance/slashing
- MII formula/weights
- Default thresholds
- Circuit breaker semantics
- Sentinel evaluation pass criteria

High-signal changes require an RFC:
- File: `docs/11-SUPPLEMENTARY/rfcs/RFC-YYYYMMDD-<slug>.md`
- Minimum review window: 72 hours (unless urgent/security)

See `docs/RFC_PROCESS.md` for details.

---

## 5) Disputes, Forks, and Exit Rights

Mobius assumes legitimacy is socially constructed. Therefore:
- **Forking is a first-class right.**
- **Exit is always permitted.**

If contributors disagree on governance:
- They may fork and publish alternate specs.
- The ecosystem can compare forks by audit quality, adoption, and pilot outcomes.

Mobius does not "enforce" legitimacy. It **records** how legitimacy was claimed and contested.

---

## 6) No Capture Principle (Anti-Bureaucracy Guardrail)

Mobius governance should not become a gatekeeping bureaucracy.

Therefore:
- Keep defaults minimal and auditable.
- Avoid adding rules without a demonstrated failure mode.
- Prefer "publish + measure" over "debate endlessly."

---

## 7) Versioning

Governance docs and specs are versioned:
- `v0.x` = experimental, subject to iteration
- `v1.0` = requires at least one published pilot case study demonstrating value

---

## 8) Safety and Scope Boundary

Mobius governance explicitly **does not** claim:
- AGI containment
- Alignment guarantees
- Cryptographic immutability (unless implemented)

Mobius is a legitimacy-preservation system for humans and institutions using AI.

---

## 9) Authority Hierarchy

### Tier 1: Core Protocol (Highest Friction)

Changes to EPICON schema, MII formula, MIC issuance rules.

- RFC required
- 72-hour minimum review
- ≥2 maintainer approvals
- EPICON required

### Tier 2: Operational Defaults (Medium Friction)

Changes to thresholds, sign-off requirements, workflow configs.

- EPICON required
- ≥2 maintainer approvals
- No RFC required (unless contested)

### Tier 3: Documentation/Process (Lower Friction)

Clarifications, examples, formatting.

- ≥1 maintainer approval
- EPICON optional

---

## 10) Transparency Requirements

All governance decisions are recorded with:

- Decision rationale
- Dissenting opinions (if any)
- Vote tally
- EPICON reference

Recorded in `docs/governance/decisions/` or linked from PR.

---

## 11) Emergency Procedures

For urgent security or safety issues:

1. Emergency EPICON with `mode: emergency`
2. Single maintainer may merge with post-merge review
3. Post-mortem required within 72 hours
4. Documented in `docs/governance/emergencies/`

---

## 12) Amendment Process

This governance document may be amended via:

1. RFC filed in `rfcs/`
2. 72-hour review window
3. ≥2 maintainer approvals
4. EPICON documenting rationale

---

*"We heal as we walk." — Mobius Substrate*
