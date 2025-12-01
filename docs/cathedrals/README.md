# Cathedrals Documentation

**Version**: 1.0.0  
**Cycle**: C-151  
**Status**: Active

---

## Overview

Cathedrals are specialized documentation and governance domains within Mobius Systems. Each cathedral serves a distinct audience with tailored content, compliance requirements, and economic multipliers.

---

## Cathedral Directory

| Cathedral | Audience | Multiplier | Description |
|-----------|----------|------------|-------------|
| [FOR-ACADEMICS](./FOR-ACADEMICS/) | Researchers & Academia | 1.2× | Research papers, citations, peer review |
| [FOR-ECONOMISTS](./FOR-ECONOMISTS/) | Economic Analysts | 1.5× | Tokenomics, MIC economy, incentive design |
| [FOR-GOVERNMENTS](./FOR-GOVERNMENTS/) | Policy Makers | 2.0× | Regulatory compliance, legislative drafts |
| [FOR-PHILOSOPHERS](./FOR-PHILOSOPHERS/) | Ethicists & Thinkers | 1.0× | Philosophy, ethics, manifestos |

---

## C-151 Economics

As of C-151, cathedral assignments affect **MIC minting rewards** through the Coordination-Weighted MIC Economy:

```
Final Reward = Base Reward × Cathedral Multiplier
```

Higher multipliers compensate for increased compliance overhead in domains like government and economic analysis.

### Key Documents

- [MIC Coordination Economics](./FOR-ECONOMISTS/MIC_COORDINATION.md) — Full C-151 economic specification
- [CoordinationMIC Contract](../../packages/gic-registry-contracts/contracts/C151/CoordinationMIC.sol) — Smart contract

---

## Sentinel Assignments

Each sentinel is assigned to a primary cathedral:

| Sentinel | Cathedral | Role |
|----------|-----------|------|
| ATLAS | FOR-GOVERNMENTS | Architecture & Quality |
| AUREA | FOR-ECONOMISTS | Correctness & Logic |
| ECHO | FOR-ACADEMICS | Drift Detection |
| EVE | FOR-PHILOSOPHERS | Verifier/Reflector |
| HERMES | FOR-GOVERNMENTS | Auditor/Messenger |
| JADE | FOR-PHILOSOPHERS | Narrative & Culture |
| URIEL | FOR-ACADEMICS | Cosmic Illuminator |
| ZEUS | FOR-GOVERNMENTS | Governance Meta-Anchor |
| ZENITH | FOR-ECONOMISTS | Integration |
| DAEDALUS | FOR-ECONOMISTS | MII Sustainment |

---

## Contributing

When adding content to a cathedral:

1. Follow the cathedral's style guide
2. Include proper frontmatter with `cathedral` field
3. Cross-reference related documents
4. Submit for sentinel review

---

**Mobius Systems Foundation** • Cycle C-151 • December 2025
