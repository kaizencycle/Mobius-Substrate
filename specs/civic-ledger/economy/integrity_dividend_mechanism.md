# Integrity Dividend Mechanism (IDM)

**Version:** 1.0  
**Status:** Active  
**Related:** RFC-0001, RFC-0002, RFC-0003

---

## Overview

The **Integrity Dividend Mechanism (IDM)** is the core economic engine that funds institutional knowledge stewards (CivicNodes) based on:

1. **Usage** — how often AI agents rely on their knowledge
2. **Integrity** — how trustworthy their content is (GI score)
3. **Weight** — how civically important their category is

IDM ensures that institutions like Wikipedia, arXiv, NASA, and others are **automatically funded** based on their contribution to the knowledge commons, not on donation campaigns or advertising.

---

## Core Formula

### Node Score

For each CivicNode `i`:

```
Score_i = usage_i × GI_i × weight_i
```

Where:
- `usage_i` = number of AI attribution events referencing node `i` in the epoch
- `GI_i` = Global Integrity score of node `i` (0–1)
- `weight_i` = category/tier multiplier (0.5–2.0)

### Dividend Allocation

```
MIC_dividend_i = MIC_dividend_pool × (Score_i / Σ Score_j)
```

Where:
- `MIC_dividend_pool` = 60% of epoch MIC mint (see `mic_minting_spec.md`)
- `Σ Score_j` = sum of all active CivicNode scores

---

## Weight Multipliers by Tier

| Tier | Category | Weight Range | Rationale |
|------|----------|--------------|-----------|
| 0 | Foundational Knowledge | 1.5 - 2.0 | Civilization-critical |
| 1 | Research/Science | 1.2 - 1.4 | High-value knowledge |
| 2 | Civic Utilities | 1.0 | Standard civic function |
| 3 | Commercial/Hybrid | 0.5 - 0.8 | Lower trust, profit-driven |

### Examples

- **Wikipedia (Tier 0, knowledge):** weight = 2.0
- **arXiv (Tier 1, research):** weight = 1.3
- **Public Library (Tier 2, civic):** weight = 1.0
- **BBC News (Tier 3, media):** weight = 0.7

---

## Attribution Events

### What Counts as Usage?

An **attribution event** is logged when an AI agent:
- Fetches content from a CivicNode domain
- Cites a source in a response
- Uses knowledge to answer a query
- Incorporates data into a decision

### Attribution Trace Format

```json
{
  "attribution_id": "attr-20251203-143522-abc123",
  "agent_id": "agent:oaa-companion-user-12345",
  "node_id": "civic:wikipedia",
  "source_url": "https://en.wikipedia.org/wiki/Quantum_Computing",
  "query": "Explain quantum computing",
  "timestamp": "2025-12-03T14:35:22Z",
  "context": "educational",
  "signature": "ed25519:..."
}
```

### Aggregation

Attribution events are:
- Logged in real-time
- Aggregated per epoch
- Deduped (same agent + same page within 1 hour = 1 event)
- Validated (cross-checked for fraud)

---

## Example Calculation

### Scenario: Epoch 153

**System State:**
- MII = 96.8
- MIC epoch mint = 500,000
- MIC dividend pool = 300,000 (60% of mint)

**CivicNodes:**

| Node | Tier | GI | Usage | Weight | Score |
|------|------|----|---------| -------|-------|
| Wikipedia | 0 | 0.992 | 8,750,000 | 2.0 | 17,336,000 |
| OpenStreetMap | 0 | 0.985 | 6,200,000 | 1.8 | 10,989,600 |
| arXiv | 1 | 0.978 | 3,500,000 | 1.3 | 4,459,500 |
| NASA | 1 | 0.972 | 2,800,000 | 1.25 | 3,402,000 |
| BBC News | 3 | 0.875 | 5,400,000 | 0.7 | 3,307,500 |

**Total Score:** 60,377,280

**Allocations:**

```
Wikipedia_MIC = 300,000 × (17,336,000 / 60,377,280) = 86,200 MIC
OpenStreetMap_MIC = 300,000 × (10,989,600 / 60,377,280) = 54,600 MIC
arXiv_MIC = 300,000 × (4,459,500 / 60,377,280) = 22,150 MIC
NASA_MIC = 300,000 × (3,402,000 / 60,377,280) = 16,900 MIC
BBC_News_MIC = 300,000 × (3,307,500 / 60,377,280) = 16,450 MIC
```

Notice:
- Wikipedia, despite having only 1.4x the usage of BBC, receives **5.2x** more MIC due to higher GI and weight.
- This incentivizes institutions to maintain integrity, not just traffic.

---

## KS Dividends (Secondary)

In addition to MIC, CivicNodes also receive **KS** from the Knowledge Reserve (funded by transaction burns).

```
KS_dividend_i = KS_knowledge_reserve × (Score_i / Σ Score_j)
```

This provides operational liquidity for day-to-day expenses.

---

## Distribution Process

### Step 1: Epoch Close

At epoch boundary, Mobius Indexer finalizes attribution counts.

### Step 2: Compute Scores

```python
for node in active_civic_nodes:
    node.score = node.usage * node.gi_score * node.weight
```

### Step 3: Compute Total Score

```python
total_score = sum(node.score for node in active_civic_nodes)
```

### Step 4: Allocate Dividends

```python
for node in active_civic_nodes:
    node.dividend_mic = mic_dividend_pool * (node.score / total_score)
    transfer_to_vault(node.vault_id, node.dividend_mic)
```

### Step 5: Attest

```python
idm_attestation = {
    "epoch": current_epoch,
    "mic_dividend_pool": mic_dividend_pool,
    "total_score": total_score,
    "allocations": [
        {
            "node_id": node.node_id,
            "gi_score": node.gi_score,
            "usage": node.usage,
            "weight": node.weight,
            "score": node.score,
            "dividend_mic": node.dividend_mic
        }
        for node in active_civic_nodes
    ],
    "timestamp": now(),
    "signature": sign(data)
}

publish_to_ledger(idm_attestation)
```

---

## Gaming Resistance

### Sybil Resistance

- **Cross-validation:** Multiple independent attribution validators
- **Rate limiting:** Same agent can't generate >1000 attributions/hour
- **Pattern detection:** Unusual spikes trigger audits
- **Elder oversight:** Manual review of suspicious nodes

### Fraud Detection

If a node's usage spikes without corresponding:
- External traffic increase
- Community validation
- Peer citations

→ Automatic GI penalty applied  
→ Elder investigation triggered  
→ Potential tier demotion

### Self-Dealing Prevention

CivicNodes cannot:
- Own or operate AI agents that generate attributions
- Pay for inflated attribution counts
- Coordinate with agents for artificial usage

Violations result in:
- Immediate suspension
- Dividend clawback
- Permanent tier reduction

---

## Transparency

### Public Dashboards

Real-time visibility into:
- Top CivicNodes by usage
- Top CivicNodes by dividend
- GI trends over time
- Attribution patterns
- Dividend history

### Attestations

Every IDM distribution is published with:
- Full calculation details
- Per-node breakdowns
- Integrity scores
- Usage metrics
- Signatures

### Community Challenges

Citizens can challenge IDM allocations if:
- Suspicious usage patterns
- GI score manipulation suspected
- Calculation errors detected

Challenges trigger Elder review.

---

## Emergency Adjustments

### Rapid GI Degradation

If a node's GI drops >0.05 in one epoch:
- Dividend temporarily suspended
- Investigation launched
- Node placed on probation

### Usage Anomalies

If usage increases >300% in one epoch:
- Dividend capped at previous epoch level
- Investigation launched
- If legitimate (e.g., news event), cap lifted

### MII Crisis (MII < 80)

- All dividends suspended except Tier 0 emergency allocations
- Funds redirected to Cathedral reserve
- Resume when MII returns to ≥ 90

---

## Future Enhancements

- **RFC-0010:** Multi-chain attribution tracking
- **RFC-0011:** User-directed dividends (citizens allocate portion of their UBI)
- **RFC-0012:** Predictive IDM (forecast future dividends based on trends)

---

## Summary

The Integrity Dividend Mechanism:

- **Rewards integrity, not just traffic**
- **Automates institutional funding**
- **Aligns AI usage with knowledge commons sustainability**
- **Resists gaming and fraud**
- **Operates transparently on-ledger**

For the first time in history:
- Wikipedia doesn't need donation banners
- Research labs are funded by AI impact
- Knowledge creation is economically sustainable
- Integrity directly produces value

This is the **economic engine of the knowledge commons in the AI era.**
