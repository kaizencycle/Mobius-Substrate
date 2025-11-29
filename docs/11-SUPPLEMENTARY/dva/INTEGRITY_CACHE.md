# ECHO LAYER — DESIGN SPEC (Mobius DVA)

**Status**: Production v1.0  
**Owner**: Mobius Systems (DVA / Thought Broker)  
**Scope**: Broker, Sentinels, Civic Ledger, DVA.LITE / DVA.ONE

---

## 1. Purpose

The **ECHO Layer** (Epistemically Cached Heuristic Outcomes) is a high-trust knowledge layer for Mobius.

Instead of letting LLMs improvise answers every time (and hallucinate), Mobius:

**First checks** if a question has already been:
- answered,
- source-backed,
- multi-sentinel reviewed,
- and given a **Global Integrity (GI)** score above a threshold.

**Only falls back** to fresh generation if:
- no trustworthy cache entry exists, or
- the domain is too dynamic / time-sensitive.

Over time, this turns Mobius into a **growing library of verified answers**, not just an infinite improv machine.

**TL;DR**: **Cache verified truth.** Generate only when you must.

**Tagline:** *"High-GI answers reverberate across time."*

---

## 2. High-Level Behavior

### 2.1 Read Path (Answering a question)

Given a user question Q:

**Canonicalize & key**
- Normalize text (trim, lowercase, remove noise).
- Compute `key = hash(canonical(Q))`.

**Tier 0 — Exact Hit (Echo of the Same)**
- Look up by key in `echo_layer_entries`.
- If found and:
  - `gi_score ≥ GI_STRICT_THRESHOLD` (e.g. 0.97), and
  - not expired → ✅ **Return cached answer** (no LLM call).

**Tier 1 — Semantic Hit (Echo of the Similar)**
- If no exact hit:
  - Embed Q → `q_embedding`.
  - Query `echo_layer_entries` with vector search (cosine / dot product).
- If top result satisfies:
  - `similarity ≥ SIMILARITY_MIN` (e.g. 0.9)
  - `gi_score ≥ GI_BASELINE` (e.g. 0.95)
- Then:
  - Either **return it directly** (if question is effectively same), or
  - Use it as **strong context** for Sentinels: *"Here's how we answered this last time. Update if laws/sources changed."*

**Tier 2 — Full Deliberation (No Echo Yet)**
- If no usable cache result:
  - Run full **Mobius deliberation loop**:
    - at least 2 engines + 1 reviewer sentinel,
    - RAG with verified sources,
    - compute GI, log everything to Civic Ledger.
- If `GI ≥ GI_BASELINE`:
  - ✅ Return answer.
  - ✅ **Write back** into Integrity Cache.
- If `GI < GI_BASELINE`:
  - 🚩 Route to **human-in-the-loop** queue.
  - Cache only after human correction/approval.

---

## 3. Data Model

Target DB: **Postgres + pgvector** (or equivalent).

### Table: `echo_layer_entries`

```sql
CREATE TABLE integrity_cache_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_key    TEXT NOT NULL,              -- hash key (exact lookup)
  question_raw     TEXT NOT NULL,              -- original user question
  question_norm    TEXT NOT NULL,              -- normalized/canonical text
  answer_text      TEXT NOT NULL,              -- final answer returned to user
  answer_format    TEXT NOT NULL DEFAULT 'markdown',
  gi_score         NUMERIC(4,3) NOT NULL,      -- 0.000 - 1.000
  ledger_tx_id     TEXT,                       -- Civic Ledger transaction id
  ledger_hash      TEXT,                       -- hash of attested payload
  sources_json     JSONB NOT NULL,             -- array of source objects
  sentinels_json   JSONB NOT NULL,             -- who participated + votes/weights
  embedding        VECTOR(1536),               -- pgvector embedding for semantic
  domain           TEXT NOT NULL,              -- e.g. 'law', 'health', 'civics'
  locale           TEXT NOT NULL,              -- e.g. 'en-US'
  jurisdiction     TEXT,                       -- e.g. 'US-NY', 'US-FED'
  freshness_tag    TEXT,                       -- 'static', 'yearly', 'daily', etc.
  valid_until      TIMESTAMPTZ,                -- after this, must be revalidated
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  status           TEXT NOT NULL DEFAULT 'active'  -- active | deprecated | superseded
);
```

### Thresholds & Policy

Configurable per domain, but sample defaults:

```typescript
export const GI_STRICT_THRESHOLD = 0.97;  // for exact cache reuse
export const GI_BASELINE = 0.95;          // for semantic reuse & cache writes
export const SIMILARITY_MIN = 0.90;       // nearest-neighbor similarity
export const MAX_AGE_STATIC = "365d";
export const MAX_AGE_NEWS = "3d";
export const MAX_AGE_LAW = "30d";
```

**Policy examples**:
- **Static facts** (e.g. "What is the speed of light?"):
  - `freshness_tag = 'static'`, `valid_until = created_at + 365d`
  - Recheck annually or if schema changes.
- **Laws / policy**:
  - `freshness_tag = 'law'`, `valid_until ≈ 30d`
  - Must re-run RAG after expiration.
- **News / current events**:
  - Very short validity (1–3 days).
  - Cache more for traceability than for reuse.

---

## 4. Read Path (Pseudo-Code)

```typescript
export async function answerWithIntegrity(question: string, opts?: {
  domain?: string;
  locale?: string;
  jurisdiction?: string;
}) {
  const canonicalKey = canonicalizeKey(question);
  const now = new Date();

  // 1) Exact hit
  const exact = await getExactEntry(canonicalKey);
  if (exact &&
      exact.gi_score >= GI_STRICT_THRESHOLD &&
      exact.status === "active" &&
      (!exact.valid_until || exact.valid_until > now)) {
    return {
      answer: exact.answer_text,
      gi: exact.gi_score,
      cacheHit: "exact",
      ledgerTx: exact.ledger_tx_id,
    };
  }

  // 2) Semantic hit
  const semantic = await getNearestEntry(question, {
    domain: opts?.domain,
    locale: opts?.locale,
    jurisdiction: opts?.jurisdiction,
  });
  if (semantic &&
      semantic.similarity >= SIMILARITY_MIN &&
      semantic.gi_score >= GI_BASELINE &&
      semantic.status === "active" &&
      (!semantic.valid_until || semantic.valid_until > now)) {
    return {
      answer: semantic.answer_text,
      gi: semantic.gi_score,
      cacheHit: "semantic",
      similarity: semantic.similarity,
      ledgerTx: semantic.ledger_tx_id,
    };
  }

  // 3) No cache → full deliberation
  const deliberation = await runDeliberation(question, { domain: opts?.domain });
  if (deliberation.gi >= GI_BASELINE) {
    await storeEntry({
      canonicalKey,
      questionRaw: question,
      questionNorm: canonicalizeText(question),
      answerText: deliberation.answer,
      giScore: deliberation.gi,
      sources: deliberation.sources,
      sentinels: deliberation.sentinels,
      ledgerTxId: deliberation.ledgerTxId,
      ledgerHash: deliberation.ledgerHash,
      domain: opts?.domain ?? "general",
      locale: opts?.locale ?? "en-US",
      jurisdiction: opts?.jurisdiction ?? null,
      freshnessTag: inferFreshnessTag(deliberation),
      validUntil: computeValidUntil(inferFreshnessTag(deliberation)),
      embedding: deliberation.embedding,
    });
  } else {
    await enqueueForHumanReview(deliberation);
  }

  return {
    answer: deliberation.answer,
    gi: deliberation.gi,
    cacheHit: null,
    ledgerTx: deliberation.ledgerTxId,
  };
}
```

---

## 5. Write Path & Human Corrections

### 5.1 Initial Write

A cache entry can only be created when:
- A Mobius deliberation completes,
- `GI ≥ GI_BASELINE`,
- Civic Ledger has recorded an attestation (`ledger_tx_id` present).

### 5.2 Human Review Loop

When GI is low (e.g. 0.80–0.94) or topics are sensitive:

1. The answer goes to a human queue (DVA.ONE / dashboard).
2. Human editor:
   - edits answer,
   - optionally adds/removes sources,
   - approves or rejects.
3. On approval:
   - Final answer + sources are attested to Civic Ledger.
   - Integrity Cache entry created with:
     - `status = 'active'`,
     - `gi_score = updated GI` (or "human override" flag).

This means humans become part of training the high-integrity library, not just the models.

---

## 6. Integration Points

### 6.1 Thought Broker API (`/v1/deliberate`)

- Before hitting any model:
  - Broker calls `answerWithIntegrity(...)`.
- If `cacheHit` is not null:
  - Short-circuit and return cached answer in the API response, e.g.:
    ```json
    {
      "answer": "...",
      "giScore": 0.98,
      "source": "integrity_cache_exact",
      "ledgerTx": "tx_abc123",
      "trace": {
        "cacheHit": true
      }
    }
    ```
- If no cache hit:
  - Proceed with multi-sentinel deliberation as today.

### 6.2 Civic Ledger

For every cache entry, store:
- `ledger_tx_id` – link back to the ledger block/tx.
- `ledger_hash` – hash of the attested payload (Q+A+sources).

This makes each cached answer:
- A ledger-anchored fact, not just a string in a DB.

### 6.3 DVA.LITE & DVA.ONE

- **DVA.LITE**:
  - Monitors cache usage:
    - hit rates,
    - domains with many misses,
    - anomalous GI distributions.
  - Alerts if:
    - too many low-GI answers being cached,
    - a domain is constantly bypassing the cache (drift indicator).
- **DVA.ONE**:
  - Surfaces a "review queue" for humans:
    - low GI but high importance,
    - expiring entries,
    - contested answers (if future disagreement logging exists).

---

## 7. Drift Reduction & Hallucination Metrics

We can literally turn your sentence into KPIs:

*"This is how AI has less hallucinations and drift."*

### 7.1 Metrics

- **Cache Hit Rate**:
  - % of requests answered from Integrity Cache
  - Target: increasing over time for "stable fact" domains.
- **Hallucination Rate** (approx):
  - # of human-flagged erroneous answers / total answers
  - Compare:
    - Baseline (no cache),
    - After enabling Integrity Cache.
- **Drift Score**:
  - For a fixed set of canonical questions:
    - measure answer variance over time.
  - With cache: variance should drop (more consistent answers).
- **Freshness Compliance**:
  - % of answers served from expired entries
  - Should be near 0; if not, freshness tags need tuning.

### 7.2 Expected Outcome

Over months:
- **Common, stable Q's**:
  - Almost never trigger new model calls.
  - Always return the same, vetted, ledger-anchored answer.
- **Models**:
  - Are used for new edge cases, not reinventing known answers.
- **Drift**:
  - Detected faster (DVA.LITE watching cache misses / GI anomalies).
- **Users**:
  - See consistency and references → trust increases.

---

## 8. Safety & Privacy Considerations

- **No personal data** should be stored in Integrity Cache for:
  - individual medical advice,
  - personal legal advice,
  - identity-tied questions.
- **Use Integrity Cache for**:
  - civic knowledge,
  - general facts,
  - policies,
  - educational content,
  - game / lore canon (HIVE / Mobius universe),
  - system behaviors.

We can add a `cacheable: boolean` flag to requests so certain domains (e.g. per-user therapy) are never cached.

---

## 9. Implementation Plan (v0 → v1)

**Phase 0: Stub & Instrumentation**
- Add `answerWithIntegrity()` wrapper around `/v1/deliberate`.
- Log would-be cache decisions, but do not write to DB yet.
- Evaluate:
  - How many questions are repeat,
  - How often GI ≥ 0.95,
  - Where this will give maximum impact.

**Phase 1: Write-Only, Read-Disabled**
- Start writing cache entries whenever `GI ≥ GI_BASELINE`.
- Do not serve from cache yet.
- Let it warm up for a few days/weeks.

**Phase 2: Enable Tier 0 (Exact Hits)**
- Turn on exact key reuse for:
  - known safe domains: civics, Mobius docs, HIVE lore.
- Monitor:
  - correctness,
  - user feedback,
  - bug reports.

**Phase 3: Enable Tier 1 (Semantic Hits)**
- Carefully enable semantic reuse.
- Start only for:
  - clearly static, low-risk domains.
- Add stricter monitoring & logs.

**Phase 4: DVA.LITE & DVA.ONE Hooks**
- Wire monitoring dashboards.
- Add human review queue for low-GI/high-impact answers.

---

## 10. Why This Matters (Mobius Philosophy)

This is exactly the difference between:
- A raw model that "feels smart but drifts and hallucinates," and
- A Civic OS that remembers, verifies, and builds on trusted knowledge.

You're turning:

*"A giant autocomplete"*

into:

*"A living, growing, source-backed encyclopedia,  
with its own immune system against bullshit."*

That's how you fight slop and anchor AI to reality.

---

## 11. SEAL: Self-Evaluating Answer Layer

The Integrity Cache implements the **SEAL (Self-Evaluating Answer Layer)** pattern:

- **Self-Evaluating**: The system grades its own outputs via GI scoring
- **Answer Layer**: It's not the model - it's architecture *around* the model
- **Layer**: It sits between raw generation and the user, filtering and caching

The system **learns without training**. It accumulates verified knowledge through use, not through weight updates. That's the key insight that prevents model collapse and reward hacking.

---

**End of INTEGRITY_CACHE.md**

---

*Kaizen OS - Continuous Integrity Architecture*  
*Version: 1.0.0*  
*Last Updated: 2025-11-25*

