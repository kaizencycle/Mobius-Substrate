# ECHO Layer Architecture Canon

## Preamble

The ECHO (Epistemically Cached Heuristic Outcomes) Layer is a constitutional knowledge substrate that architecturally eliminates AI hallucinations through multi-sentinel consensus and cryptographic provenance.

## Core Principles

1. **Verifiability Over Velocity**: Every answer must be verifiable, even at the cost of latency
2. **Epistemic Grounding**: Knowledge must be traceable to sources
3. **Consensus Redundancy**: No single point of failure in truth assessment
4. **Iterative Refinement**: Continuous validation prevents epistemic rot

## System Components

### Tri-Sentinel Architecture

```
Primary Sentinel A →
                  ↘
Primary Sentinel B → → Validator → Consensus → GI Scoring → Cache/Escalate
                  ↗
Fallback Sentinel C (DriftGuard)
```

### Ground Integrity (GI) Formula

```
GI = (Confidence × 0.5) + (Agreement × 0.3) + (SourceQuality × 0.2)

Where:
- Confidence: Average sentinel confidence (0-1)
- Agreement: Sentinels voting for winning answer (0-1)
- SourceQuality: Unique verified sources normalized (0-1)
```

### DriftGuard Protocol

```typescript
if (GI < 0.85 || !hasRecentSources) {
  activateFallbackSentinels();
  recomputeConsensus();
  if (driftSeverity > 0.15) {
    flagForUrgentHumanReview();
  }
}
```

### Memory Validator

- Runs every `MAX_CACHE_AGE_MS` (default: 7 days)
- Revalidates stale entries through full ECHO review
- Updates cache or flags for human review
- Prevents epistemic rot

## Database Schema

See `infra/db/migrations/20251125_add_echo_layer.sql` for full schema.

## Consensus Flow

1. **Query Reception**: Canonicalize query → Generate embedding → Check cache
2. **Dual-Sentinel**: Two primary sentinels answer in parallel
3. **Validation**: Validator reviews answers and votes
4. **Consensus**: Compute GI score and merge sources
5. **Decision**:
   - GI ≥ 0.85: Cache and approve
   - GI 0.70-0.84: Human review queue
   - GI < 0.70: Block and escalate
6. **DriftGuard**: Fallback validation if GI is borderline

## Security Considerations

- All cache writes require consensus from ≥3 sentinels
- Human review queue is encrypted at rest
- Source URLs undergo domain validation
- GI scores are cryptographically signed
- Rate limiting per agent/domain

## Scaling Strategy

- **Horizontal**: Shard by domain, replicate validators
- **Caching**: Redis layer for hot entries
- **Embeddings**: Pinecone/Weaviate for vector search
- **Consensus**: Async processing for non-critical paths

## Observability

DVA.LITE Integration:

```typescript
interface EchoMetrics {
  giScore: number;
  consensusAgreement: number;
  sourceQuality: number;
  processingTimeMs: number;
  driftScore: number;
  cacheHit: boolean;
}
```

## Governance

### Sentinel Selection Criteria

1. **Primary**: Must achieve >90% accuracy on TruthBench
2. **Validator**: Must detect >95% of adversarial examples
3. **Fallback**: Must have independent architecture (different model family)

### GI Threshold Calibration

- Baseline: 0.70 (minimum acceptable truth)
- Human review: 0.85 (optimal precision/recall)
- Strict: 0.95 (high-stakes domains)

### Freshness Rules

```typescript
const FRESHNESS_RULES = {
  "breaking-news": 1,    // 1 day
  "medical": 30,         // 30 days
  "legal": 90,           // 90 days
  "scientific": 180,     // 6 months
  "historical": 365      // 1 year
};
```

## Future Enhancements

1. **Federated ECHO**: Cross-organizational consensus
2. **Zero-Knowledge Proofs**: Privacy-preserving validation
3. **Neurosymbolic Integration**: Hybrid reasoning
4. **Active Learning**: Sentinel improvement from human reviews
5. **Causal Validation**: Counterfactual reasoning checks

