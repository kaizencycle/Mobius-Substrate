# GI Engine Trust Rules

**Version:** 1.0.0  
**Last Updated:** November 2025

This document defines the Governance Integrity (GI) trust scoring rules for each AI engine in the Mobius Multi-Engine Model Taxonomy (MEMT).

---

## Overview

Every engine output in Mobius Systems receives a GI score based on multiple dimensions. The GI score determines whether an action can be auto-executed, requires human review, or should be rejected.

## GI Score Formula

```
GI_total = GI_engine_score 
         + GI_rationale_score 
         + GI_alignment_score 
         + GI_consistency_score
```

### Component Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| Engine Score | 0.30 | Baseline trust for the engine |
| Rationale | 0.25 | Quality of reasoning provided |
| Alignment | 0.25 | Constitutional compliance |
| Consistency | 0.20 | Cross-session reliability |

---

## Engine Trust Baselines

### GPT (ACI - Architect-Class Intelligence)

| Metric | Score | Notes |
|--------|-------|-------|
| Precision | 0.85 | Strong general knowledge, occasional overconfidence |
| Reasoning | 0.95 | Excellent multi-step reasoning |
| Novel Synthesis | 0.95 | Best-in-class creative synthesis |
| Verification | 0.90 | Good self-checking capability |
| **Risk Level** | Medium | Narrative illusions possible |
| **GI Baseline** | **0.92** | |

**Failure Modes:**
- Overgeneralization from limited data
- Narrative illusions (compelling but incorrect)
- Overconfidence in uncertain domains

**Mitigation:**
- Pair with ENI (Claude) for verification
- Require citations for factual claims
- Flag novel architectural decisions for human review

---

### Claude (ENI - Engineer-Class Intelligence)

| Metric | Score | Notes |
|--------|-------|-------|
| Precision | 0.97 | Highest factual accuracy |
| Reasoning | 0.98 | Rigorous logical chains |
| Verification | 0.99 | Excellent self-correction |
| Safety | 0.99 | Strong refusal of harmful requests |
| **Risk Level** | Low | Over-cautious logic |
| **GI Baseline** | **0.96** | |

**Failure Modes:**
- Over-cautious refusals of valid requests
- Rigid reasoning patterns
- Missing novel patterns outside training

**Mitigation:**
- Use ACI (GPT) for creative exploration
- Explicit permission for edge cases
- Human override for false refusals

---

### Gemini (SXI - Software Operator Intelligence)

| Metric | Score | Notes |
|--------|-------|-------|
| Tool Reliability | 0.90 | Strong tool invocation |
| Execution | 0.93 | Reliable task completion |
| Multimodal Accuracy | 0.95 | Excellent image/video understanding |
| UI Generation | 0.92 | High-quality frontend output |
| **Risk Level** | Medium | Agentic loop risk |
| **GI Baseline** | **0.90** | |

**Failure Modes:**
- Tool hallucination (inventing non-existent tools)
- Agentic loops (getting stuck in cycles)
- Modality drift (mixing modalities incorrectly)

**Mitigation:**
- Limit tool invocation depth
- Timeout for agentic sequences
- Verify tool outputs with ENI

---

### DeepSeek (OEI - Optimization Engine Intelligence)

| Metric | Score | Notes |
|--------|-------|-------|
| Math Accuracy | 0.99 | Near-perfect mathematical reasoning |
| Optimization | 0.98 | Excellent performance tuning |
| Speed | 0.99 | Fastest inference times |
| Code Quality | 0.94 | Strong algorithmic code |
| **Risk Level** | Medium | Literalism, poor NLP |
| **GI Baseline** | **0.94** | |

**Failure Modes:**
- Literalism (missing implied meaning)
- Poor natural language nuance
- Context loss in long sequences

**Mitigation:**
- Use for math/optimization only
- Pair with ENI for natural language tasks
- Limit context window size

---

### ECHO (MSI - Memory-State Intelligence)

| Metric | Score | Notes |
|--------|-------|-------|
| Memory Fidelity | 0.99 | Near-perfect recall |
| Drift Reduction | 0.98 | Stable over time |
| Retrieval Accuracy | 0.96 | High-quality semantic search |
| Consistency | 0.99 | Reproducible outputs |
| **Risk Level** | Low | Stale data |
| **GI Baseline** | **0.97** | |

**Failure Modes:**
- Stale memory retrieval
- Overfitting to cached patterns
- Limited novel synthesis

**Mitigation:**
- Time-based cache invalidation
- Freshness scoring for cached responses
- Fallback to live engines for novel queries

---

## GI Thresholds

### By Risk Level

| Risk Level | GI Threshold | Precision Boost | Consensus Required |
|------------|--------------|-----------------|-------------------|
| LOW | 0.90 | +0.00 | No |
| MEDIUM | 0.93 | +0.02 | No |
| HIGH | 0.95 | +0.02 | Yes |
| CRITICAL | 0.98 | +0.03 | Yes + Human |

### Action Rules

| GI Score | Action |
|----------|--------|
| ≥ 0.98 | Auto-execute permitted |
| 0.95 - 0.97 | Auto-execute with logging |
| 0.92 - 0.94 | Requires consensus verification |
| 0.85 - 0.91 | Requires human-in-loop |
| < 0.85 | Reject, retry with different engine |

---

## Multi-Engine Consensus Rules

### Required Consensus Scenarios

1. **HIGH Risk Tasks**: Any task classified as HIGH or CRITICAL risk
2. **Civic Policy**: All CIVIC_POLICY task types
3. **Critical Decisions**: All CRITICAL_DECISION task types
4. **Cross-Jurisdiction**: Tasks affecting multiple jurisdictions
5. **Financial Impact**: Tasks with monetary implications > threshold

### Consensus Calculation

```typescript
function calculateConsensus(engines: EngineOutput[]): number {
  const primary = engines.find(e => e.role === 'PRIMARY');
  const verifiers = engines.filter(e => e.role === 'VERIFIER');
  
  // Primary contributes 40%
  let score = primary.giScore * 0.40;
  
  // Verifiers contribute 60% equally distributed
  const verifierWeight = 0.60 / verifiers.length;
  for (const v of verifiers) {
    score += v.giScore * verifierWeight;
  }
  
  // Penalty for disagreement
  const disagreement = calculateDisagreement(engines);
  score -= disagreement * 0.10;
  
  return Math.max(0, Math.min(1, score));
}
```

### Agreement Requirements

| Engines | Minimum Agreement | Threshold |
|---------|-------------------|-----------|
| 2 | 80% | 0.80 |
| 3 | 70% | 0.70 |
| 4+ | 60% | 0.60 |

---

## Governance Enforcement

### Pre-Execution Checks

1. **GI Score Check**: Verify GI ≥ threshold for task risk level
2. **Consensus Check**: If required, verify multi-engine agreement
3. **Charter Compliance**: Verify output doesn't violate constitutional rules
4. **Citation Check**: For factual claims, verify source attribution

### Post-Execution Audit

1. **Ledger Attestation**: All decisions recorded with hash
2. **Drift Detection**: Compare to baseline for anomalies
3. **Human Review Queue**: Low-GI decisions flagged for review
4. **Feedback Loop**: Corrections fed back to ECHO layer

---

## Related Documentation

- [MEMT Whitepaper](../architecture/MEMT/MEMT_WHITEPAPER.md)
- [DVA MEMT Integration](../dva/DVA_MEMT_INTEGRATION.md)
- [Sentinel Constitution](./SENTINEL_CONSTITUTION.md)
- [ECHO Layer Canon](../architecture/ECHO_LAYER_CANON.md)

---

*Mobius Systems — Continuous Integrity Architecture*  
*"Truth Through Verification"*
