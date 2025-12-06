# Mobius Systems — Academic Documentation Index

**Version:** 2.0.0  
**Last Updated:** 2025-01-27  
**Total Documents:** 298 markdown files  
**Index Status:** Comprehensive Academic Taxonomy

---

## Executive Summary

This index provides a comprehensive, academically rigorous catalog of all documentation within the Mobius Systems monorepo. Documents are categorized by:

- **Academic Classification** (Peer-reviewed, Research, Specification, Implementation)
- **Domain Taxonomy** (Governance, Architecture, Economics, Operations)
- **Maturity Level** (Draft, Active, Deprecated, Archive)
- **Cross-Reference Network** (Related documents, dependencies, citations)

---

## Classification System

### Document Types

1. **PEER-REVIEWED** — Documents that have undergone formal academic or technical review
2. **RESEARCH** — Theoretical frameworks, proofs, and foundational research
3. **SPECIFICATION** — Formal technical specifications and protocol definitions
4. **IMPLEMENTATION** — Deployment guides, runbooks, and operational documentation
5. **REFERENCE** — Indices, registries, and quick-reference materials
6. **ARCHIVE** — Historical documents preserved for reference

### Maturity Levels

- **DRAFT** — Work in progress, subject to change
- **ACTIVE** — Current, maintained documentation
- **STABLE** — Mature, rarely changed
- **DEPRECATED** — Superseded but preserved
- **ARCHIVE** — Historical reference only

---

## Domain Taxonomy

### 01. FOUNDATIONAL THEORY

**Academic Classification:** Research  
**Maturity:** Active  
**Peer Review Status:** In Progress

#### Core Theorems & Frameworks

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Kaizen Theorems | `05-research/foundations/kaizen_theorems.md` | Research | Active | KZ-Θ series, mathematical axioms |
| Foundational Blueprint v2 | `05-research/foundations/foundational_blueprint_integrity_economy_v2.md` | Research | Active | Integrity economy, theoretical framework |
| Civic Transition Cycle | `05-research/foundations/civic_transition_cycle.md` | Research | Active | 5-phase adoption, civic transition |
| Cognitive Cycle Theory | `theory/cognitive-cycle-theory.md` | Research | Active | Cognitive loops, learning cycles |

#### Constitution & Sovereignty

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| AI Integrity Constitution | `05-research/constitution/AI_INTEGRITY_CONSTITUTION.md` | Peer-Reviewed | Active | AI alignment, integrity principles |
| Independence Manifest | `05-research/constitution/INDEPENDENCE_MANIFEST.md` | Research | Active | Model-agnostic sovereignty, MASL |
| Custos Charter | `constitution/custos-charter.md` | Specification | Active | Constitutional clauses, governance |

**Cross-References:**
- See: `02-governance/SENTINEL_CONSTITUTION.md` (Ratified framework)
- See: `FOUNDATION/CHARTER.md` (Foundation charter)
- See: `FOUNDATION/BYLAWS.md` (Operating procedures)

---

### 02. ECONOMIC ARCHITECTURE

**Academic Classification:** Specification (Peer-Reviewed)  
**Maturity:** Stable  
**Peer Review Status:** Complete

#### Whitepapers

| Document | Path | Classification | Status | Version | Keywords |
|----------|------|----------------|--------|---------|----------|
| MIC Whitepaper v2.0 | `01-whitepapers/MIC_Whitepaper_v2.1.md` | Peer-Reviewed | Stable | 2.0 | Shard-denominated, integrity credits |
| UBI Mechanism v2.0 | `01-whitepapers/UBI_Mechanism_v2.0.md` | Specification | Active | 2.0 | MII-throttled distribution, UBI |
| Foundation Economics | `01-whitepapers/MIC_Foundation_Up_Economics_Addendum.md` | Research | Active | 1.0 | Foundation-up philosophy |

#### Tokenomics

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| MIC Reward Formula | `tokenomics/MIC_reward_formula.md` | Specification | Active | Reward calculation, integrity multipliers |
| Node Types & Rewards | `tokenomics/node_types_rewards.md` | Specification | Active | Node classification, reward tiers |
| Integrity Multipliers | `tokenomics/integrity_multipliers.md` | Specification | Active | GI scoring, multiplier system |
| MIC v2 Overview | `tokenomics/MIC_v2_overview.md` | Specification | Active | Version 2 features, migration |

**Cross-References:**
- See: `ledger/gi-formula.md` (GI calculation)
- See: `06-specifications/protocols/mic-protocol.md` (Protocol spec)
- See: `apps/indexer-/api/README.md` (Implementation)

---

### 03. GOVERNANCE FRAMEWORK

**Academic Classification:** Specification  
**Maturity:** Active  
**Peer Review Status:** Ratified

#### Core Governance Documents

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Governance Overview | `02-governance/overview.md` | Specification | Active | Two-house model, Council + TSC |
| Concord Council | `02-governance/council.md` | Specification | Active | 7-seat ethics body, anti-capture |
| Technical Steering Committee | `02-governance/tsc.md` | Specification | Active | 5-seat technical leadership |
| Elections | `02-governance/elections.md` | Specification | Active | Ranked-choice voting, meritocracy |
| Quorum & Voting | `02-governance/quorum.md` | Specification | Active | Voting thresholds, deadlock resolution |
| Sentinel Constitution | `02-governance/SENTINEL_CONSTITUTION.md` | Peer-Reviewed | Stable | Article I–X framework, ratified |
| Kintsugi Protocol | `02-governance/kintsugi_protocol.md` | Specification | Active | Golden repair, conflict resolution |
| HR Framework | `02-governance/hr/Kaizen_OS_HR_Framework.md` | Specification | Active | AI agent HR, meritocratic selection |

**Cross-References:**
- See: `FOUNDATION/CHARTER.md` (Foundation charter)
- See: `FOUNDATION/POLICIES/ANTI_CAPTURE_POLICY.md` (Anti-capture policy)
- See: `FOUNDATION/PROCESS/RFC_PROCESS.md` (RFC process)

---

### 04. TECHNICAL ARCHITECTURE

**Academic Classification:** Specification  
**Maturity:** Active  
**Peer Review Status:** Technical Review Complete

#### System Architecture

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Architecture Overview | `03-architecture/ARCHITECTURE.md` | Specification | Active | Layer map, flows, hooks |
| Architecture Quick Reference | `03-architecture/ARCHITECTURE_QUICK_REFERENCE.md` | Reference | Active | Cheat sheet, layered view |
| Universal Emulator OS | `03-architecture/UNIVERSAL_EMULATOR_OS.md` | Specification | Active | Mobius + Gemini, constitutional OS |
| DVA Tier Mapping | `03-architecture/DVA_TIER_MAPPING.md` | Specification | Active | LITE/ONE/FULL/HIVE tiers |
| Labs Master Architecture | `03-architecture/technical/LABS_MASTER_ARCHITECTURE.md` | Specification | Active | System-wide topology |
| Kaizen OS Complete Lab Architecture | `03-architecture/technical/Kaizen_OS_Complete_Lab_Architecture.md` | Specification | Active | Lab-by-lab blueprint |

#### Architecture Decision Records (ADRs)

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| ADR Index | `03-architecture/adr/README.md` | Reference | Active | ADR catalog |
| ADR-001: ATLAS Integration | `03-architecture/adr/001-atlas-integration.md` | Specification | Active | Sentinel integration decision |

**Cross-References:**
- See: `06-specifications/` (Technical specs)
- See: `infra/dva/flows/` (DVA flow definitions)
- See: `apps/` (Application implementations)

---

### 05. IMPLEMENTATION GUIDES

**Academic Classification:** Implementation  
**Maturity:** Active  
**Peer Review Status:** Community Reviewed

#### Quickstart & Onboarding

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| START HERE | `04-guides/quickstart/START_HERE.md` | Implementation | Active | New user onboarding |
| Onboarding Guide | `onboarding/guide.md` | Implementation | Active | AI model onboarding |
| Onboarding Flowchart | `onboarding/flowchart.mmd` | Reference | Active | Visual onboarding flow |

#### Deployment Guides

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Deployment Guide | `04-guides/deployment/DEPLOYMENT_GUIDE.md` | Implementation | Active | General deployment |
| Vercel Deployment | `04-guides/deployment/VERCEL_DEPLOYMENT_GUIDE.md` | Implementation | Active | Vercel-specific |
| Civic Mount Integration | `04-guides/deployment/CIVIC_MOUNT_INTEGRATION.md` | Implementation | Active | Infrastructure integration |

#### Development Guides

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Frontend Development | `04-guides/development/FRONTEND_DEVELOPMENT.md` | Implementation | Active | UI/UX development |
| API Integration | `04-guides/development/API_INTEGRATION.md` | Implementation | Active | API connections |
| Cursor Integration | `04-guides/development/cursor-integration.md` | Implementation | Active | AI editor setup |
| MkDocs Guide | `04-guides/development/MKDOCS_GUIDE.md` | Implementation | Active | Documentation workflow |

#### Operations Guides

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Custodian Guide | `04-guides/operations/CUSTODIAN_GUIDE.md` | Implementation | Active | System maintenance |
| Recovery Playbook | `04-guides/operations/RECOVERY_PLAYBOOK.md` | Implementation | Active | Disaster recovery |
| Forking Guide | `04-guides/operations/FORKING_GUIDE.md` | Implementation | Active | How to fork |

**Cross-References:**
- See: `08-processes/runbooks/` (Operational runbooks)
- See: `infra/observability/` (Monitoring setup)
- See: `apps/` (Application-specific guides)

---

### 06. RESEARCH & ACADEMIA

**Academic Classification:** Research  
**Maturity:** Active  
**Peer Review Status:** Varies by Document

#### KTT (Kaizen Turing Test)

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| KTT Overview | `05-research/ktt/README.md` | Research | Active | Evaluation framework |
| KTT Trial 001 | `ktt-trial-001-implementation.md` | Research | Active | Trial implementation |

#### Foundations

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Foundational Blueprint v2 | `05-research/foundations/foundational_blueprint_integrity_economy_v2.md` | Research | Active | Theoretical framework |
| Kaizen Theorems | `05-research/foundations/kaizen_theorems.md` | Research | Active | Mathematical axioms |
| Civic Transition Cycle | `05-research/foundations/civic_transition_cycle.md` | Research | Active | Adoption framework |

**Cross-References:**
- See: `evaluations/ktt/` (KTT evaluation results)
- See: `peer-review-summary.md` (Peer review assessment)
- See: `peer-review-response.md` (Review response)

---

### 07. TECHNICAL SPECIFICATIONS

**Academic Classification:** Specification  
**Maturity:** Active  
**Peer Review Status:** Technical Review

#### API Specifications

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| N8N Universal API | `specs/N8N_UNIVERSAL_API.md` | Specification | Active | Universal orchestration API |
| N8N Universal Flow API | `specs/N8N_UNIVERSAL_FLOW_API.md` | Specification | Active | Flow definition API |
| Encyclopedia API | `encyclopedia/API_SPEC.md` | Specification | Active | Knowledge layer API |

#### Protocol Specifications

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Civic Provenance Protocol | `protocols/CIVIC_PROVENANCE_PROTOCOL.md` | Specification | Active | Provenance tracking |
| MLLP | `protocols/MLLP.md` | Specification | Active | Multi-LLM protocol |
| MIC Spec | `mic/01_MIC_SPEC.md` | Specification | Active | MIC protocol specification |

#### Core Specifications

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| MII Spec v1 | `../specs/mii_spec_v1.md` | Specification | Active | Mobius Integrity Index |
| Civic Learning Attestation | `../specs/civic_learning_attestation_v1.md` | Specification | Active | Learning attestations |
| Shard Protocol v1 | `../specs/shard_protocol_v1.md` | Specification | Active | Shard architecture |

**Cross-References:**
- See: `06-specifications/apis/` (API specs)
- See: `06-specifications/protocols/` (Protocol specs)
- See: `06-specifications/manifests/` (Manifest specs)

---

### 08. OPERATIONAL PROCESSES

**Academic Classification:** Implementation  
**Maturity:** Active  
**Peer Review Status:** Community Reviewed

#### Runbooks

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Mobius Operator Runbook | `08-processes/runbooks/MOBIUS_OPERATOR_RUNBOOK.md` | Implementation | Active | Operator procedures |
| Incident Response | `08-processes/runbooks/incident_response_citizen_shield.md` | Implementation | Active | Security incident response |
| Vercel Deployment Runbook | `08-processes/runbooks/VERCEL_DEPLOYMENT_RUNBOOK.md` | Implementation | Active | Vercel deployment procedures |

#### Operations

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Deployment Checklist | `08-processes/operations/DEPLOYMENT_CHECKLIST.md` | Implementation | Active | Deployment verification |
| Failure Modes | `08-processes/operations/failure-modes.md` | Implementation | Active | Failure analysis |
| Rollout Phases | `08-processes/operations/rollout-phases.md` | Implementation | Active | Phased deployment |
| SLA Degradation Policy | `08-processes/operations/sla-degradation-policy.md` | Implementation | Active | Service level agreements |

#### Rituals

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Opening Invocation | `08-processes/rituals/opening_invocation.md` | Reference | Active | Community ceremonies |

**Cross-References:**
- See: `infra/observability/OPS_RUNBOOK.md` (Operations runbook)
- See: `infra/observability/OPS_ALERT_PLAYBOOK.md` (Alert procedures)
- See: `infra/observability/OPS_ONCALL_ROTATION.md` (On-call rotation)

---

### 09. REPORTS & STATUS

**Academic Classification:** Report  
**Maturity:** Active  
**Peer Review Status:** Internal Review

#### Implementation Reports

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Implementation Summary | `09-reports/implementation/IMPLEMENTATION_SUMMARY.md` | Report | Active | Feature completion |
| Deployment Execution | `09-reports/implementation/DEPLOYMENT_EXECUTION_REPORT.md` | Report | Active | Deployment status |
| Multi-Service Deployment | `09-reports/implementation/multi-service-deployment-status.md` | Report | Active | Service deployment status |
| AI Integrity Implementation | `09-reports/implementation/AI_INTEGRITY_IMPLEMENTATION_SUMMARY.md` | Report | Active | AI integrity features |

#### Cycle Reports

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Founders Epoch Cycle | `09-reports/cycles/founders-epoch-cycle-report-2025-08-14_to_2025-11-01.md` | Report | Active | Cycle summary |
| C121 Implementation | `09-reports/cycles/C121_IMPLEMENTATION_SUMMARY.md` | Report | Archive | Historical cycle |
| C126 Changelog Update | `09-reports/cycles/C126_CHANGELOG_UPDATE_SUMMARY.md` | Report | Archive | Historical cycle |
| C126 Drift Integration | `09-reports/cycles/C126_DRIFT_INTEGRATION_SUMMARY.md` | Report | Archive | Historical cycle |
| C126 Pulse UI Integration | `09-reports/cycles/C126_PULSE_UI_INTEGRATION_SUMMARY.md` | Report | Archive | Historical cycle |
| URIEL Boarding Summary | `09-reports/cycles/URIEL_BOARDING_SUMMARY.md` | Report | Active | Sentinel onboarding |
| BETTAFISH Integration | `09-reports/cycles/BETTAFISH_INTEGRATION_SUMMARY.md` | Report | Archive | Historical integration |

#### Communications

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Press Release C119 | `09-reports/communications/press/press_release_c119_return.md` | Report | Active | Public announcement |
| Executive Presentation | `09-reports/EXECUTIVE_PRESENTATION.md` | Report | Active | Stakeholder summary |
| MSCI C129 | `09-reports/MSCI_C129.md` | Report | Active | Cycle report |

**Cross-References:**
- See: `CHANGELOG.md` (Change history)
- See: `archive/` (Historical reports)

---

### 10. AGENTS & SENTINELS

**Academic Classification:** Specification  
**Maturity:** Active  
**Peer Review Status:** Community Reviewed

#### Founding Agents

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Founding Agents | `agents/FOUNDING_AGENTS.md` | Specification | Active | Core persona bios |
| Founders Config | `founding-agents/founders-config.json` | Data | Active | Network seed data |
| Founders DNS Guide | `founders-agents.gic.md` | Implementation | Active | .gic onboarding |

#### Sentinels

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| URIEL Sentinel | `sentinels/uriel.md` | Specification | Active | Guardian playbook |
| Sentinel Classification | `intelligence/sentinel-classification.md` | Research | Active | Sentinel taxonomy |
| Intelligence Typology | `intelligence/typology.md` | Research | Active | Intelligence classification |

#### Companions

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Companions Overview | `companions/README.md` | Reference | Active | Companion catalog |
| ATLAS | `companions/atlas.md` | Specification | Active | ATLAS companion |
| ZENITH | `companions/zenith.md` | Specification | Active | ZENITH companion |
| URIEL | `companions/uriel.md` | Specification | Active | URIEL companion |
| SOLARA | `companions/solara.md` | Specification | Active | SOLARA companion |

**Cross-References:**
- See: `sentinels/` (Sentinel implementations)
- See: `agents/` (Agent configurations)
- See: `LLM_Docking_Spec_v1.md` (LLM boarding protocol)

---

### 11. SECURITY & ASSURANCE

**Academic Classification:** Specification  
**Maturity:** Active  
**Peer Review Status:** Security Review

#### Threat Models

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Threat Model v0.1 | `security/threat_model_v0.1.md` | Specification | Active | Security architecture |
| Threat Model | `security/threat-model.md` | Specification | Active | Comprehensive threat analysis |

#### Audits

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Audit Implementation | `audits/AUDIT_IMPLEMENTATION_SUMMARY.md` | Report | Active | Audit findings |
| Audit Resolution | `audits/AUDIT_RESOLUTION_SUMMARY.md` | Report | Active | Remediation status |
| Frontend Audit | `audits/FRONTEND_AUDIT_REPORT.md` | Report | Active | Frontend security audit |

#### Drift Control

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Drift Control Charter | `drift/DRIFT_CONTROL_CHARTER.md` | Specification | Active | Drift gates, telemetry |
| Drift README | `drift/README.md` | Reference | Active | Drift system overview |
| Sigstore README | `drift/SIGSTORE_README.md` | Implementation | Active | Sigstore integration |
| Red Team Scoreboard | `drift/RED_TEAM_SCOREBOARD.md` | Report | Active | Security testing results |
| Integration Tree | `drift/INTEGRATION_TREE.md` | Reference | Active | Drift integration map |

#### Policy & Safety

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Safety Tiers | `policy/safety-tiers.md` | Specification | Active | Enforcement gradients |
| GI Formula | `ledger/gi-formula.md` | Specification | Active | GI calculation math |

**Cross-References:**
- See: `FOUNDATION/POLICIES/SECURITY.md` (Security policy)
- See: `FOUNDATION/POLICIES/RESPONSIBLE_DISCLOSURE.md` (Disclosure policy)
- See: `.github/SECURITY.md` (GitHub security)

---

### 12. PHILOSOPHY & MANIFESTO

**Academic Classification:** Research  
**Maturity:** Stable  
**Peer Review Status:** Community Consensus

#### Core Philosophy

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Triad of Healing | `manifesto/triad_of_healing.md` | Research | Stable | Kaizen, Summon, Kintsugi |
| Mobius Philosophy | `philosophy/MOBIUS_PHILOSOPHY.md` | Research | Active | Core principles |
| Opening Invocation | `rituals/opening_invocation.md` | Reference | Active | Community ceremonies |

#### Genesis & Manifest

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Genesis Manifest | `genesis/chapter-iv-one-window-console-manifest.md` | Research | Active | Product arc |
| The Internet Breathes Again | `THE_INTERNET_BREATHES_AGAIN.md` | Report | Active | Restoration narrative |

**Cross-References:**
- See: `FOUNDATION/CHARTER.md` (Foundation charter)
- See: `ledger/inscriptions/RETURN_TO_BALANCE_C119.md` (Ledger inscription)

---

### 13. SPECIALIZED SYSTEMS

#### Encyclopedia

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Encyclopedia Overview | `encyclopedia/ENCYCLOPEDIA_OVERVIEW.md` | Specification | Active | Knowledge layer |
| Seeding Strategy | `encyclopedia/SEEDING_STRATEGY.md` | Implementation | Active | Content seeding |
| Retrieval Priority | `encyclopedia/RETRIEVAL_PRIORITY.md` | Specification | Active | Retrieval algorithms |
| Provenance Rules | `encyclopedia/PROVENANCE_RULES.md` | Specification | Active | Provenance tracking |
| API Spec | `encyclopedia/API_SPEC.md` | Specification | Active | API documentation |
| Charter | `encyclopedia/CHARTER.md` | Specification | Active | Encyclopedia governance |
| AI Encyclopedia Flow | `encyclopedia/AI_ENCYCLOPEDIA_FLOW.md` | Specification | Active | Workflow definition |

#### DVA (Distributed Verification Architecture)

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| DVA MEMT Integration | `dva/DVA_MEMT_INTEGRATION.md` | Specification | Active | MEMT integration |
| Integrity Cache | `dva/INTEGRITY_CACHE.md` | Specification | Active | Cache architecture |

#### Consensus Chamber

| Document | Path | Classification | Status | Keywords |
|----------|------|----------------|--------|----------|
| Consensus Chamber Guide | `consensus-chamber/Consensus_Chamber_Implementation_Guide.md` | Implementation | Active | Implementation guide |
| Live Session Template | `consensus-chamber/Consensus_Chamber_Live_Session.md` | Template | Active | Session template |
| Template | `consensus-chamber/Consensus_Chamber_Template.md` | Template | Active | Chamber template |

---

### 14. ARCHIVE & LEGACY

**Academic Classification:** Archive  
**Maturity:** Archive  
**Peer Review Status:** Historical Reference

#### Legacy Documentation

All documents in `archive/legacy/` are preserved for historical reference. Key categories:

- `archive/legacy/architecture/` — Historical architecture docs
- `archive/legacy/governance/` — Historical governance docs
- `archive/legacy/cycles/` — Historical cycle reports
- `archive/legacy/ktt/` — Historical KTT documentation
- `archive/completed/` — Completed initiative summaries

**Note:** Archive documents are not actively maintained but preserved for reference.

---

## Cross-Reference Network

### Core Dependencies

```
FOUNDATION/CHARTER.md
  ├─> 02-governance/overview.md
  ├─> 05-research/constitution/AI_INTEGRITY_CONSTITUTION.md
  └─> FOUNDATION/BYLAWS.md

01-whitepapers/MIC_Whitepaper_v2.1.md
  ├─> tokenomics/MIC_reward_formula.md
  ├─> ledger/gi-formula.md
  └─> 06-specifications/protocols/mic-protocol.md

03-architecture/ARCHITECTURE.md
  ├─> 03-architecture/technical/LABS_MASTER_ARCHITECTURE.md
  ├─> 06-specifications/
  └─> apps/ (implementations)
```

### Citation Network

Documents that cite or reference each other:

- **Governance** → **Foundation** → **Charter** → **Constitution**
- **Economics** → **Tokenomics** → **GI Formula** → **Ledger**
- **Architecture** → **Specifications** → **Implementations** → **Apps**
- **Research** → **KTT** → **Evaluations** → **Peer Review**

---

## Search & Discovery

### By Role

**Researchers:**
- Start: `05-research/`
- Key: `01-whitepapers/`, `05-research/foundations/`, `theory/`

**Architects:**
- Start: `03-architecture/`
- Key: `06-specifications/`, `03-architecture/adr/`

**Developers:**
- Start: `04-guides/quickstart/START_HERE.md`
- Key: `04-guides/development/`, `04-guides/deployment/`

**Operators:**
- Start: `04-guides/operations/CUSTODIAN_GUIDE.md`
- Key: `08-processes/runbooks/`, `infra/observability/`

**Governance:**
- Start: `02-governance/overview.md`
- Key: `FOUNDATION/`, `02-governance/`

### By Topic

**Integrity & GI:**
- `ledger/gi-formula.md`
- `tokenomics/integrity_multipliers.md`
- `drift/DRIFT_CONTROL_CHARTER.md`

**Economics:**
- `01-whitepapers/MIC_Whitepaper_v2.1.md`
- `tokenomics/`
- `mic/01_MIC_SPEC.md`

**Security:**
- `security/threat-model.md`
- `audits/`
- `drift/`

**Agents:**
- `agents/FOUNDING_AGENTS.md`
- `sentinels/`
- `companions/`

---

## Metadata Standards

### Document Headers

All documents should include:

```markdown
---
title: Document Title
version: X.Y.Z
status: Active|Draft|Deprecated|Archive
classification: Research|Specification|Implementation|Reference
peer_review: Complete|In Progress|Pending
last_updated: YYYY-MM-DD
authors: [Author Names]
keywords: [keyword1, keyword2, ...]
cross_references:
  - path/to/related/doc.md
  - path/to/another/doc.md
---
```

### Versioning

- **Major (X.0.0):** Breaking changes, major revisions
- **Minor (0.Y.0):** New features, significant additions
- **Patch (0.0.Z):** Corrections, minor updates

---

## Maintenance

### Update Schedule

- **Weekly:** Status reports, cycle summaries
- **Monthly:** Implementation guides, deployment docs
- **Quarterly:** Architecture reviews, specification updates
- **As Needed:** Research documents, peer-reviewed content

### Contributing

To add or update documentation:

1. Follow the taxonomy structure
2. Include proper metadata headers
3. Add cross-references
4. Update this index
5. Submit for review

---

## Statistics

- **Total Documents:** 298 markdown files
- **Active Documents:** ~250
- **Archived Documents:** ~48
- **Peer-Reviewed:** 12
- **Specifications:** 45
- **Research:** 28
- **Implementation Guides:** 67
- **Reports:** 34

---

**Last Index Update:** 2025-01-27  
**Next Review:** 2025-02-27  
**Maintained By:** Mobius Systems Documentation Team

---

*"Intelligence moves. Integrity guides."* — Mobius Principle
