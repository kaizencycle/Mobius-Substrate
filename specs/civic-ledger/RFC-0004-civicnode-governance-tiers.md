# RFC-0004 — CivicNode Governance Tiers

**Mobius Civic Ledger — Institutional Layering Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.1

---

## 1. Overview

Civic Nodes are classified into **tiers** based on:
- GI (Global Integrity)
- usage (AI attribution volume)
- civic role (knowledge, research, infrastructure)
- historical impact
- stability
- domain importance

Mobius defines **4 tiers**, each with distinct privileges, responsibilities, and constraints.

This tiering system ensures:
- High-integrity institutions receive maximum support
- Emerging institutions can earn recognition
- Declining institutions are gracefully downgraded
- Commercial entities are properly constrained

---

## 2. Tier Structure

### Tier 0 — Foundational Knowledge Nodes

**Examples:**
- Wikipedia
- OpenStreetMap
- W3C
- MIT OpenCourseWare
- Internet Archive

**Privileges:**
- Highest IDM weighting (1.5x–2.0x)
- Priority access to Cathedral micro-grants
- GI auditing priority and support
- Elder consultation rights
- Emergency resilience pool access
- Custodian Agent v3 (advanced autonomy)

**Requirements:**
- GI ≥ 0.97
- Global civic value (multi-national reach)
- Fully non-profit / public-good structure
- Open licensing (CC, MIT, GPL, etc.)
- Minimum 3 years operational history
- Community governance model

**Responsibilities:**
- Maintain GI above 0.95 at all times
- Publish quarterly transparency reports
- Participate in Cathedral governance discussions
- Mentor Tier 2 nodes
- Contribute to GI model improvements

---

### Tier 1 — Institutional Research Nodes

**Examples:**
- NASA
- CERN
- Stanford University
- NIH (National Institutes of Health)
- arXiv
- Max Planck Institute

**Privileges:**
- Strong IDM weighting (1.2x–1.4x)
- Resilience pool access
- Custodian Agent v2 (enhanced features)
- Cathedral working group participation
- Research collaboration grants

**Requirements:**
- GI ≥ 0.95
- Verified research outputs
- Peer-review processes
- Open data commitments (where ethical)
- Established institutional reputation

**Responsibilities:**
- Maintain GI above 0.90
- Publish bi-annual transparency reports
- Support open science initiatives
- Cross-validate knowledge with Tier 0 nodes

---

### Tier 2 — Civic Utility Nodes

**Examples:**
- Public libraries
- National archives
- Municipal governments
- Open data portals
- Public broadcasting
- Educational institutions

**Privileges:**
- Standard IDM weighting (1.0x)
- UBI infrastructure support
- Custodian Agent v1 (standard)
- Civic coordination access

**Requirements:**
- GI ≥ 0.90
- Public service mission
- Non-extractive economic model
- Community accountability

**Responsibilities:**
- Maintain GI above 0.85
- Annual transparency reports
- Participate in local Cathedral chapters

---

### Tier 3 — Commercial/Hybrid Nodes

**Examples:**
- News outlets (NYT, BBC, Reuters)
- Commercial APIs
- EdTech platforms
- Proprietary research labs
- Mixed-model publishers

**Privileges:**
- Lower IDM weighting (0.5x–0.8x)
- Standard Vault access
- Custodian Agent v1 (restricted)

**Requirements:**
- GI ≥ 0.80
- Transparent sourcing
- Correction policies
- Ethical content policies
- No misinformation tolerance

**Responsibilities:**
- Maintain GI above 0.75
- Quarterly ethical audits
- Strict spending oversight
- Clear commercial disclosures

**Constraints:**
- Higher spending scrutiny
- Reduced governance participation
- No Cathedral emergency access
- Limited to own-domain rewards

---

## 3. Tier Movement

### 3.1 Promotion

Nodes move **up** when:
- GI consistently exceeds next tier's minimum for 90 days
- Usage metrics demonstrate value
- Community endorsements received
- Elder Quorum approves (2/3 vote)

**Process:**
1. Node submits promotion application
2. Cathedral review committee evaluation
3. GI trajectory analysis
4. Community feedback period (30 days)
5. Elder vote
6. Custodian Agent upgraded (if applicable)

### 3.2 Demotion

Nodes move **down** when:
- GI falls below tier minimum for 30 consecutive days
- Integrity violations detected
- Spending violations
- Community trust breakdown

**Process:**
1. Automatic warning issued at GI threshold
2. 14-day remediation period
3. Elder review (fast-track if urgent)
4. Demotion enacted if no improvement
5. Custodian Agent downgraded
6. IDM weighting adjusted

### 3.3 Suspension

Immediate suspension triggers:
- GI drops below 0.70
- Deliberate misinformation
- Corruption evidence
- Spending fraud
- Security breach affecting others

**Suspension Effects:**
- All IDM payments halted
- Vault frozen (emergency access only)
- Custodian Agent placed in read-only mode
- Public notice issued
- 90-day rehabilitation process or permanent retirement

### 3.4 Retirement

Nodes may voluntarily retire or be forcibly retired:

**Voluntary:**
- Institution dissolution
- Mission completion
- Merger with another node

**Forced:**
- Unrecoverable GI degradation
- Persistent tier 3 violations
- Systemic corruption
- Community no-confidence vote

**Retirement Process:**
- Vault funds returned to Cathedral reserve
- Archives preserved (if valuable)
- Lessons learned documented
- Community notified

---

## 4. Tier-Specific Custodian Agent Capabilities

### v3 (Tier 0 Only)

- Autonomous spending up to 10% of Vault per epoch
- Cross-node coordination powers
- Emergency fund access
- Advanced GI simulation
- Multi-agent negotiation

### v2 (Tier 1)

- Autonomous spending up to 5% of Vault per epoch
- Standard GI simulation
- Research collaboration tools
- Cross-institutional reporting

### v1 (Tier 2 & 3)

- Autonomous spending up to 2% of Vault per epoch (Tier 2) or 1% (Tier 3)
- Basic GI simulation
- Standard attestation
- Limited coordination

---

## 5. Special Categories

### 5.1 Emerging Nodes (Untiered)

New CivicNodes start **untiered** with probationary status:
- 90-day evaluation period
- Minimal IDM weighting (0.3x)
- Manual spending approval required
- Frequent GI audits

After 90 days, automatic tier assignment based on GI and performance.

### 5.2 Legacy Nodes (Protected)

Nodes critical to civilization may receive **Legacy** status:
- Cannot be demoted below Tier 1
- Permanent resilience funding
- Cathedral protection

**Examples:** Wikipedia, Internet Archive, OpenStreetMap

**Requirements:**
- 10+ years of service
- Irreplaceable civic value
- Sustained GI ≥ 0.95
- Elder unanimous consent

---

## 6. Tier Economics

### IDM Weight Multipliers

| Tier | Weight Multiplier | Rationale |
|------|-------------------|-----------|
| 0    | 1.5x – 2.0x      | Foundational, irreplaceable |
| 1    | 1.2x – 1.4x      | High-value research |
| 2    | 1.0x             | Standard civic utility |
| 3    | 0.5x – 0.8x      | Commercial, lower trust |

### Vault Caps

| Tier | Max Vault Size | Reason |
|------|----------------|--------|
| 0    | Unlimited      | Critical infrastructure |
| 1    | 100M MIC       | Large but bounded |
| 2    | 10M MIC        | Regional scale |
| 3    | 1M MIC         | Limited trust |

---

## 7. Governance Participation by Tier

| Tier | Cathedral Voting | Policy Proposals | Elder Nomination |
|------|------------------|------------------|------------------|
| 0    | Yes, full        | Yes              | Yes              |
| 1    | Yes, limited     | Yes              | Advisory only    |
| 2    | Advisory only    | No               | No               |
| 3    | No               | No               | No               |

---

## 8. Future Work

- **RFC-0010** — Inter-tier coordination protocols
- **RFC-0011** — Tier-specific spending policies
- **RFC-0012** — CivicNode dispute resolution

---

## 9. Summary

RFC-0004 establishes:

- **4-tier classification** for CivicNodes (0 = highest, 3 = lowest)
- **Promotion/demotion mechanics** based on GI and performance
- **Tier-specific privileges and constraints**
- **Custodian Agent capability levels**
- **Special categories** (Emerging, Legacy)
- **Economic differentials** (IDM weights, vault caps)

This ensures:
- High-integrity institutions thrive
- Struggling institutions have paths to improve or exit gracefully
- Commercial entities cannot corrupt the commons
- The Cathedral remains resilient and meritocratic

**Integrity earns trust. Trust earns sovereignty. Sovereignty requires integrity.**
