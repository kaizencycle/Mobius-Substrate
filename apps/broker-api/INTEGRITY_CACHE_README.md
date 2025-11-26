# Integrity Cache Implementation (SEAL Layer)

## Overview

The Integrity Cache is a **Self-Evaluating Answer Layer (SEAL)** that reduces hallucinations and drift by caching high-GI (Global Integrity) answers from multi-sentinel deliberations.

## Quick Start

### 1. Database Setup

Run the migration to create the Integrity Cache tables:

```bash
# Ensure Postgres is running with pgvector extension
psql -U postgres -d civic_ledger -f ../../infra/db/migrations/20251125_add_integrity_cache_entries.sql
```

Or if using Docker:

```bash
docker exec -i mobius-db psql -U civic -d civic_ledger < infra/db/migrations/20251125_add_integrity_cache_entries.sql
```

### 2. Environment Variables

Add to your `.env`:

```bash
# Integrity Cache Configuration
INTEGRITY_CACHE_ENABLED=true
INTEGRITY_CACHE_DB_URL=postgresql://civic:civic@localhost:5432/civic_ledger

# Or use existing DATABASE_URL
DATABASE_URL=postgresql://civic:civic@localhost:5432/civic_ledger
```

### 3. Install Dependencies

```bash
cd apps/broker-api
npm install
```

### 4. Enable Cache

The cache is enabled by default when `INTEGRITY_CACHE_ENABLED` is not set to `false`.

## API Endpoints

### Deliberation with Cache

```bash
POST /v1/deliberate
{
  "prompt": "What is the Kaizen Cycle?",
  "metadata": {
    "domain": "civics",
    "cacheable": true
  }
}
```

Response includes cache hit information:

```json
{
  "answer": "...",
  "gi_score": 0.98,
  "consensus_meta": {
    "cacheHit": "exact",
    "similarity": null
  }
}
```

### Cache Statistics

```bash
GET /v1/cache/stats
```

Returns:
- Total entries
- Active entries
- Average GI score
- Entries in last 24h
- Expired entries
- Unique domains

### Human Review Queue

```bash
# List pending reviews
GET /v1/cache/review/pending?limit=50&priority=high

# Approve a review
POST /v1/cache/review/:id/approve
{
  "editorId": "editor-123",
  "editorNotes": "Verified and approved",
  "finalAnswer": "...",
  "finalGiScore": 0.97
}

# Reject a review
POST /v1/cache/review/:id/reject
{
  "editorId": "editor-123",
  "editorNotes": "Incorrect information"
}

# Enqueue for review
POST /v1/cache/review/enqueue
{
  "deliberationId": "delib-123",
  "question": "...",
  "answerCandidate": "...",
  "giScore": 0.85,
  "priority": "high"
}
```

## How It Works

1. **Question arrives** → Check cache (exact key match)
2. **Cache hit** → Return cached answer (no LLM call)
3. **Cache miss** → Run full deliberation
4. **GI ≥ 0.95** → Cache the result
5. **GI < 0.95** → Enqueue for human review

## Configuration

Thresholds are configurable in `src/config/integrityCache.ts`:

- `GI_STRICT_THRESHOLD = 0.97` - Exact cache reuse
- `GI_BASELINE = 0.95` - Minimum to cache
- `SIMILARITY_MIN = 0.90` - Semantic similarity threshold

Freshness rules:
- Static facts: 365 days
- Law/policy: 30 days
- News: 3 days
- General: 90 days

## Monitoring

DVA.LITE can monitor cache performance via `/v1/cache/stats`:

- Cache hit rate trends
- Domain-specific miss patterns
- GI score distributions
- Expiration compliance

## Architecture

See `docs/dva/INTEGRITY_CACHE.md` for full design specification.

## Notes

- Cache is **write-only** initially (Phase 1)
- Semantic search requires embedding service integration
- Human review queue requires DVA.ONE dashboard integration
- All cached entries are linked to Civic Ledger attestations

