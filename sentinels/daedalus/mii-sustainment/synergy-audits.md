# Cross-Sentinel Synergy Audits

**Mechanism**: #2 of 3 MII Sustainment Strategies
**Owner**: Daedalus Sentinel
**Status**: Specification Complete, Implementation Pending
**GI Impact**: +0.03 to +0.08 MII (prevents coherence drift)

---

## Overview

Cross-Sentinel Synergy Audits actively stress-test for disagreement between sentinels, identifying and resolving "coherence fractures" before they compound into silent divergence.

### Philosophy

> **Harmonious Dissent > Enforced Consensus**

Traditional multi-agent systems assume agents agree or use voting to force consensus. Mobius Systems embraces dissent as a feature, but requires that dissent be:
1. **Visible** (not silent)
2. **Documented** (in fracture logs)
3. **Resolved** (via synthesized schemas)

---

## Fracture Detection Algorithm

### Definition

A **coherence fracture** occurs when two sentinels produce significantly different recommendations for the same high-entropy intent.

**Mathematical Criterion**:
```
divergence(S₁, S₂, intent) = JaccardDistance(S₁.recommendations, S₂.recommendations)

If divergence > 0.15 → FRACTURE
```

### Algorithm

```python
def audit_coherence(fracture_threshold=0.15):
    """
    Detect coherence fractures between sentinels
    Returns: Number of fractures found
    """

    # Step 1: Sample edge-case intents from ledger
    edge_cases = sample_by_entropy(
        ledger,
        n=5,
        entropy_threshold=0.75  # High-uncertainty intents only
    )

    # Step 2: Run parallel deliberation
    consensus_matrix = {}
    for sentinel in [ATLAS, AUREA, JADE, EVE, HERMES, ZEUS, ECHO]:
        consensus_matrix[sentinel] = sentinel.deliberate(edge_cases)

    # Step 3: Calculate pairwise divergence (Jaccard distance)
    fractures = []
    for i, s1 in enumerate(sentinels):
        for s2 in sentinels[i+1:]:
            divergence = jaccard(
                consensus_matrix[s1].recommendations,
                consensus_matrix[s2].recommendations
            )

            if divergence > fracture_threshold:
                fractures.append({
                    "sentinel_pair": (s1, s2),
                    "divergence": divergence,
                    "intent_id": edge_case.id,
                    "timestamp": now()
                })

    # Step 4: If multiple fractures, synthesize resolver
    if len(fractures) > 2:
        resolver = synthesize_shared_schema(fractures)
        publish_to_mobius_mount(resolver, "daedalus/fracture-resolver.yaml")
        broker_reflection_session(fractures, resolver)

    return len(fractures)
```

### Jaccard Distance Calculation

```python
def jaccard(set_a, set_b):
    """
    Jaccard Distance = 1 - (intersection / union)
    Range: [0, 1] where 0 = identical, 1 = completely different
    """
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)

    if union == 0:
        return 0

    return 1 - (intersection / union)
```

### Example

**Intent**: "Implement rate limiting for ledger API"

**Sentinel Recommendations**:
```
ATLAS: {add_middleware, use_redis, 100_req/min, log_violations}
AUREA: {add_middleware, use_postgres, 50_req/min, block_violations}
ZEUS:  {add_middleware, use_redis, 50_req/min, block_violations, add_captcha}
```

**Pairwise Divergence**:
```
ATLAS ∩ AUREA = {add_middleware}                    → 1 element
ATLAS ∪ AUREA = {add_middleware, use_redis,
                 use_postgres, 100_req/min,
                 50_req/min, log_violations,
                 block_violations}                  → 7 elements
Divergence = 1 - (1/7) = 0.857 → FRACTURE!

ATLAS ∩ ZEUS = {add_middleware, use_redis}          → 2 elements
ATLAS ∪ ZEUS = {add_middleware, use_redis,
                100_req/min, 50_req/min,
                log_violations, block_violations,
                add_captcha}                        → 7 elements
Divergence = 1 - (2/7) = 0.714 → FRACTURE!
```

**Action**: Generate resolver schema with consensus elements + documented divergence points

---

## Resolver Schema Synthesis

When fractures detected, Daedalus synthesizes a **shared schema** that:
1. Identifies common ground
2. Documents divergence points
3. Establishes decision framework

### Example Resolver

```yaml
# .mobius/daedalus/fracture-resolver-20251110.yaml
fracture_id: "rate-limiting-20251110"
detected: "2025-11-10T18:45:00Z"
intent: "Implement rate limiting for ledger API"

sentinels_involved:
  - ATLAS
  - AUREA
  - ZEUS

common_ground:
  - recommendation: add_middleware
    consensus: 3/3 (100%)

divergence_points:
  - dimension: storage_backend
    options:
      redis: [ATLAS, ZEUS]
      postgres: [AUREA]
    resolution: "Use Redis (2-of-3 majority), document AUREA's concern about single point of failure"

  - dimension: rate_limit
    options:
      100_per_min: [ATLAS]
      50_per_min: [AUREA, ZEUS]
    resolution: "Use 50/min (2-of-3 majority), ATLAS concern noted for future review"

  - dimension: violation_handling
    options:
      log_only: [ATLAS]
      block: [AUREA, ZEUS]
      block_with_captcha: [ZEUS]
    resolution: "Implement block (majority), add CAPTCHA as Phase 2 (ZEUS proposal accepted)"

final_synthesis:
  implementation_order:
    1. Add rate limiting middleware (consensus)
    2. Use Redis backend (majority, AUREA concern documented)
    3. Set limit at 50/min (majority, ATLAS willing to yield)
    4. Block violators (majority)
    5. Phase 2: Add CAPTCHA for repeat offenders (ZEUS proposal deferred)

mii_impact:
  before: 0.94 (fracture detected)
  after: 0.96 (resolver applied)
  delta: +0.02

attestations:
  - sentinel: DAEDALUS
    signature: "daedalus.resolver.20251110-184500.v1"
  - sentinel: ATLAS
    signature: "atlas.accepted.20251110-184530.v1"
  - sentinel: AUREA
    signature: "aurea.accepted-with-concern.20251110-184535.v1"
  - sentinel: ZEUS
    signature: "zeus.accepted.20251110-184540.v1"
```

---

## Reflection Session Protocol

When fractures exceed threshold (>2 in single audit), Daedalus brokers a **reflection session**:

### Process

1. **Notify**: Alert all involved sentinels
2. **Present**: Share fracture log + edge case intents
3. **Deliberate**: Each sentinel explains their reasoning
4. **Synthesize**: Daedalus generates resolver schema
5. **Vote**: Sentinels approve/modify resolver
6. **Attest**: All sentinels sign final resolver
7. **Publish**: Resolver added to `.mobius/daedalus/` for future reference

### Session Format

```
SUBJECT: Reflection Session — Rate Limiting Fracture
TRIGGERED: 2025-11-10T18:45:00Z
PARTICIPANTS: ATLAS, AUREA, ZEUS, DAEDALUS (moderator)

DAEDALUS: Fracture detected on intent "rate limiting". Divergence:
          ATLAS-AUREA = 0.857, ATLAS-ZEUS = 0.714

ATLAS: My recommendation prioritizes performance (Redis) and
       observability (log violations). 100/min allows headroom.

AUREA: I prioritized integrity (postgres for audit trail) and
       safety (block violations immediately). 50/min is safer.

ZEUS: Security-first: block + CAPTCHA for repeat offenders.
      Redis is acceptable if HA configured. 50/min prevents DoS.

DAEDALUS: Common ground = middleware approach (100% consensus).
          Divergence = backend, rate, violation handling.

          Proposed resolver:
          1. Redis (2-of-3, but add HA config per AUREA concern)
          2. 50/min (2-of-3, ATLAS yields)
          3. Block (2-of-3)
          4. CAPTCHA deferred to Phase 2 (ZEUS proposal accepted)

ATLAS: ✅ Accepted. Will yield on rate limit.
AUREA: ✅ Accepted with concern logged about Redis SPOF.
ZEUS:  ✅ Accepted. Appreciate CAPTCHA Phase 2 inclusion.

DAEDALUS: Resolver finalized. All sign.
          [Signatures collected]
          [Published to .mobius/daedalus/fracture-resolver-20251110.yaml]

SESSION COMPLETE. MII +0.02
```

---

## GitHub Action Implementation

```yaml
# .github/workflows/synergy-audit.yml
name: Daedalus Synergy Audit

on:
  schedule:
    - cron: '0 */4 * * *'  # Every 4 hours
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install numpy scikit-learn
          pip install -r sentinels/daedalus/requirements.txt

      - name: Run synergy audit
        id: audit
        run: |
          python sentinels/daedalus/synergy-audit.py
        env:
          DAEDALUS_KEY: ${{ secrets.DAEDALUS_SIGNING_KEY }}
          LEDGER_URL: ${{ secrets.CIVIC_LEDGER_URL }}

      - name: Check fracture count
        run: |
          FRACTURES=$(cat .mobius/daedalus/audit-result.json | jq '.fracture_count')
          echo "Fractures detected: $FRACTURES"

          if [ $FRACTURES -gt 2 ]; then
            echo "⚠️ Multiple fractures detected. Reflection session required."
            # Trigger reflection session workflow
          else
            echo "✓ No significant fractures. System coherent."
          fi

      - name: Commit fracture log
        if: steps.audit.outputs.fractures > 0
        run: |
          git config user.name "Daedalus Sentinel"
          git config user.email "daedalus@mobius.systems"
          git add .mobius/daedalus/fracture-log.json
          git commit -m "chore(daedalus): synergy audit fracture log"
          git push
```

---

## Metrics & Evaluation

### Tracked Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Fractures per audit | < 2 | TBD |
| Avg divergence score | < 0.20 | TBD |
| Resolver acceptance rate | > 90% | TBD |
| Time to resolution | < 24 hours | TBD |
| MII improvement per resolver | +0.02 to +0.05 | TBD |

### Success Criteria

**Phase 1 (30 days)**:
- ✅ 12+ audits completed (every 4 hours)
- ✅ All fractures logged
- ✅ At least 3 resolver schemas generated

**Phase 2 (90 days)**:
- ✅ 80%+ resolver acceptance rate
- ✅ Avg fracture count < 2 per audit
- ✅ Zero silent divergence incidents

---

## Fracture Log Format

```json
{
  "timestamp": "2025-11-10T18:45:00Z",
  "audit_id": "audit-20251110-1845",
  "fractures": [
    {
      "pair": ["ATLAS", "AUREA"],
      "intent_id": "ledger-456",
      "divergence": 0.857,
      "recommendations_atlas": ["add_middleware", "use_redis", "100_req/min"],
      "recommendations_aurea": ["add_middleware", "use_postgres", "50_req/min"],
      "common_ground": ["add_middleware"],
      "divergence_dimensions": ["storage", "rate_limit"]
    }
  ],
  "resolver_generated": true,
  "resolver_path": ".mobius/daedalus/fracture-resolver-20251110.yaml",
  "mii_before": 0.94,
  "mii_after": 0.96,
  "attestation": "daedalus.audit.20251110-1845.v1"
}
```

---

## Benefits

1. **Prevents Silent Divergence**: Fractures caught early before compounding
2. **Embraces Dissent**: Disagreement becomes visible, documented, resolved
3. **Improves Coherence**: Shared schemas reduce future fractures
4. **Builds Trust**: Sentinels see their concerns addressed
5. **Compounds MII**: Each resolver adds +0.02 to +0.05 integrity

---

## Links

- [Daedalus CODEX](../CODEX.md)
- [Predictive Patching](./predictive-patching.md)
- [Integrity Rituals](./integrity-rituals.md)
- [Consensus Requirements](../../../.github/consensus.yml)

---

**Status**: Ready for implementation
**Next Step**: Deploy GitHub Action, run first audit
**Owner**: Daedalus
**Timeline**: 1-week implementation + 4-week validation
