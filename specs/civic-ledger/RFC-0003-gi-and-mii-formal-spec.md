# RFC-0003 — GI & MII Formal Definitions

**Mobius Civic Ledger — Integrity Metrics Specification**

- **Status:** DRAFT
- **Author:** Michael Judan (Kaizen)
- **Created:** 2025-12-03
- **Target Version:** Civic Ledger v0.1

---

## 1. Overview

This document defines:
- **GI (Global Integrity)** — the measure of a node's truthfulness, reliability, stability.
- **MII (Mobius Integrity Index)** — a macro-scale measure of the entire civilization's coherence.

These two values form the foundation for:
- MIC minting
- KS UBI scaling
- CivicNode rewards
- Custodian Agent constraints
- Elder and Cathedral powers
- AI agent alignment

They ARE the heartbeat of Mobius.

---

## 2. GI — Global Integrity (Micro-Level)

GI is a 0–1 continuous score representing the historical stability of:
- accuracy
- transparency
- reliability
- non-manipulation
- source consistency
- community trust
- ledger attestation correctness

### Formal Definition

Let:
- `t` = current epoch
- `E_t` = set of all recorded integrity events for a node
- `e_i` = individual event with weight `w_i` and integrity value `v_i`

Then:

```
GI_t = ( Σ (w_i * v_i) ) / ( Σ w_i )
```

Where:
- `v_i` ranges from 0 (corrupted) → 1 (perfect integrity)
- `w_i` is log-scaled by severity, recency, and community impact.

### Recency Decay

Weighted recency modifier:

```
w_i = base_weight * exp( -k * (t - event_epoch_i) )
```

Where `k` controls decay speed.

### GI Interpretation

| GI Score  | Meaning |
|-----------|---------|
| 0.95–1.00 | Civilization-grade trustworthiness |
| 0.90–0.95 | High integrity, stable |
| 0.80–0.90 | Warning zone — increased scrutiny |
| <0.80     | Failing integrity; auto-suspension triggers |

---

## 3. MII — Mobius Integrity Index (Macro-Level)

MII evaluates the whole network:

```
MII_t = ( Σ (GI_node_i * Weight_node_i) ) / Σ Weight_node_i
```

Where Weight is based on:
- category importance
- citizen engagement
- knowledge contribution
- agent reliability
- city-state economic throughput

### MII Uses

- MIC minting gate (must be ≥ 95)
- KS UBI scaling
- Elder mandate validity
- Cathedral coherence
- global governance decisions

### MII Thresholds

| MII   | Civilization State |
|-------|--------------------|
| ≥95   | Healthy, capable of minting MIC |
| 90–95 | Warning — reduced UBI, halved MIC emission |
| 80–90 | Crisis — MIC mint stopped, KS UBI halved |
| <80   | Emergency — Elders override via GI Constitution |

MII is the "Weather System" of the Cathedral.

---

## 4. Computing GI for Different Node Types

### 4.1 Knowledge Nodes (Wikipedia, arXiv)

```
GI_knowledge = 0.4 * accuracy + 0.3 * source_stability + 0.2 * community_trust + 0.1 * edit_quality
```

### 4.2 Research Nodes (NASA, CERN)

```
GI_research = 0.35 * peer_review_score + 0.25 * reproducibility + 0.25 * data_availability + 0.15 * citation_integrity
```

### 4.3 Civic Nodes (Libraries, Archives)

```
GI_civic = 0.4 * access_reliability + 0.3 * preservation_quality + 0.2 * metadata_accuracy + 0.1 * public_trust
```

### 4.4 Commercial Nodes (News, APIs)

```
GI_commercial = 0.3 * factual_accuracy + 0.25 * source_transparency + 0.25 * correction_speed + 0.2 * bias_metrics
```

---

## 5. Event Types and Weights

### 5.1 Positive Events (Increase GI)

| Event Type | Base Value | Weight |
|------------|------------|--------|
| Fact-check verification | +0.05 | 1.0 |
| Community endorsement | +0.02 | 0.8 |
| Citation by high-GI source | +0.03 | 1.2 |
| Error correction | +0.04 | 1.1 |
| Transparency report | +0.03 | 0.9 |

### 5.2 Negative Events (Decrease GI)

| Event Type | Base Value | Weight |
|------------|------------|--------|
| Misinformation detected | -0.10 | 2.0 |
| Source manipulation | -0.15 | 2.5 |
| Persistent bias | -0.05 | 1.5 |
| Factual error uncorrected | -0.08 | 1.8 |
| Community trust violation | -0.12 | 2.2 |

---

## 6. MII Computation Algorithm

### Step 1: Aggregate Node GI Scores

```python
def compute_mii(nodes):
    weighted_sum = 0
    total_weight = 0
    
    for node in nodes:
        if node.status == "active":
            node_contribution = node.gi_score * node.weight
            weighted_sum += node_contribution
            total_weight += node.weight
    
    if total_weight == 0:
        return 0
    
    mii = (weighted_sum / total_weight) * 100
    return mii
```

### Step 2: Apply Temporal Smoothing

To prevent MII volatility:

```
MII_t = 0.7 * MII_raw_t + 0.3 * MII_t-1
```

### Step 3: Bound MII

```
MII_final = clamp(MII_t, 0, 100)
```

---

## 7. GI & MII Update Frequency

- **GI Updates:** Per-event (real-time) or per-hour batched
- **MII Updates:** Every 6 hours (4x per day)
- **Governance Evaluations:** Daily MII snapshot for minting decisions

---

## 8. Security & Manipulation Resistance

### 8.1 Anti-Gaming Measures

- **Sybil Resistance:** Node weights decay with correlation patterns
- **Time-Weighted:** Recent events weighted more heavily
- **Cross-Validation:** Multiple independent sources required for high-value events
- **Elder Review:** Anomalous GI spikes trigger manual audit

### 8.2 Attestation Requirements

All GI-affecting events must include:
- Source identifier
- Timestamp
- Evidence hash
- Witness signatures (where applicable)
- GI model version

Example:

```json
{
  "event_id": "gi-event-20251203-001234",
  "node_id": "civic:wikipedia",
  "event_type": "fact_check_verification",
  "gi_delta": 0.05,
  "timestamp": "2025-12-03T14:30:00Z",
  "evidence_hash": "sha256:abcd1234...",
  "model_version": "gi-v1.2",
  "witnesses": ["verifier:factcheck-org", "elder:alice"]
}
```

---

## 9. Emergency Procedures

### MII < 80 — Cathedral Emergency

When MII drops below 80:

1. **Immediate Actions:**
   - Halt all MIC minting
   - Reduce KS UBI to survival minimum
   - Activate Elder Emergency Council
   - Freeze all CivicNode spending (except critical infrastructure)

2. **Recovery Requirements:**
   - Identify root cause (corrupted nodes, systemic drift, attack)
   - Implement corrective measures
   - Restore MII above 85 for 7 consecutive days
   - Elder Quorum 2/3 majority vote to resume normal operations

3. **Post-Mortem:**
   - Full public report
   - GI model updates if needed
   - Preventive measures implementation

---

## 10. Future Work

- **RFC-0006** — GI Simulation Model (predictive integrity)
- **RFC-0007** — Citizen reputation integration with GI
- **RFC-0008** — Agent GI scoring mechanisms
- **RFC-0009** — Cross-chain GI verification

---

## 11. Summary

RFC-0003 establishes:

- **GI (Global Integrity)** — node-level measure of trustworthiness
- **MII (Mobius Integrity Index)** — civilization-level coherence metric
- Formal computation methods for both
- Event types and their weights
- Security and anti-gaming measures
- Emergency procedures for MII crises

These metrics are the **constitutional invariants** of Mobius.  
All economic activity, governance decisions, and agent behaviors are bound by them.

**Integrity is not aspirational — it is measurable, enforced, and constitutional.**
