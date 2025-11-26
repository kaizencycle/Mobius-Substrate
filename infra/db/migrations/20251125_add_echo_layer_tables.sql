-- ECHO Layer: Epistemic Cache & Heuristic Orchestrator
-- Migration: Add core tables for peer review, integrity cache, and drift detection
-- Mobius Systems - Constitutional Knowledge Substrate

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- INTEGRITY CACHE: Core verified knowledge storage
-- ============================================================================

CREATE TABLE IF NOT EXISTS integrity_cache_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_key    TEXT NOT NULL,
  question_raw     TEXT NOT NULL,
  question_norm    TEXT NOT NULL,

  answer_text      TEXT NOT NULL,
  answer_format    TEXT NOT NULL DEFAULT 'markdown',

  gi_score         NUMERIC(4,3) NOT NULL,
  ledger_tx_id     TEXT,
  ledger_hash      TEXT,

  sources_json     JSONB NOT NULL,
  sentinels_json   JSONB NOT NULL,

  embedding        vector(1536),

  domain           TEXT NOT NULL,
  locale           TEXT NOT NULL,
  jurisdiction     TEXT,

  freshness_tag    TEXT,
  valid_until      TIMESTAMPTZ,

  status           TEXT NOT NULL DEFAULT 'active',

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrity_cache_key
  ON integrity_cache_entries(canonical_key);

CREATE INDEX IF NOT EXISTS idx_integrity_cache_status
  ON integrity_cache_entries(status);

CREATE INDEX IF NOT EXISTS idx_integrity_cache_gi
  ON integrity_cache_entries(gi_score DESC);

CREATE INDEX IF NOT EXISTS idx_integrity_cache_domain
  ON integrity_cache_entries(domain);

-- Vector index for semantic search (adjust lists based on expected corpus size)
CREATE INDEX IF NOT EXISTS idx_integrity_cache_embedding
  ON integrity_cache_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- PEER REVIEW: Multi-sentinel deliberation records
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_peer_review_results (
  id               SERIAL PRIMARY KEY,
  query            TEXT NOT NULL,
  context          JSONB,
  
  -- Primary sentinels
  sentinel_1_name   TEXT NOT NULL,
  sentinel_1_answer TEXT NOT NULL,
  sentinel_1_sources JSONB,
  sentinel_1_confidence DOUBLE PRECISION,
  
  sentinel_2_name   TEXT NOT NULL,
  sentinel_2_answer TEXT NOT NULL,
  sentinel_2_sources JSONB,
  sentinel_2_confidence DOUBLE PRECISION,
  
  -- Validator sentinel
  validator_name    TEXT NOT NULL,
  validator_answer  TEXT NOT NULL,
  validator_sources JSONB,
  validator_confidence DOUBLE PRECISION,
  
  -- Consensus result
  final_answer      TEXT NOT NULL,
  gi_score          DOUBLE PRECISION NOT NULL,
  status            TEXT NOT NULL DEFAULT 'APPROVED',
  
  -- Metadata
  cache_key         TEXT,
  ledger_tx_id      TEXT,
  processing_time_ms INTEGER,
  
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_peer_review_status
  ON echo_peer_review_results(status);

CREATE INDEX IF NOT EXISTS idx_echo_peer_review_gi
  ON echo_peer_review_results(gi_score DESC);

CREATE INDEX IF NOT EXISTS idx_echo_peer_review_created
  ON echo_peer_review_results(created_at DESC);

-- ============================================================================
-- SENTINEL VOTES: Individual votes for detailed analysis
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_sentinel_votes (
  id               SERIAL PRIMARY KEY,
  peer_review_id   INTEGER REFERENCES echo_peer_review_results(id) ON DELETE CASCADE,
  sentinel_name    TEXT NOT NULL,
  vote             TEXT NOT NULL,           -- 'APPROVE' | 'REJECT' | 'UNCERTAIN'
  confidence       DOUBLE PRECISION NOT NULL,
  reasoning        TEXT,
  sources          JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_votes_review
  ON echo_sentinel_votes(peer_review_id);

-- ============================================================================
-- CACHE METADATA: Tracking for validation and hit counting
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_cache_meta (
  id                 SERIAL PRIMARY KEY,
  cache_key          TEXT UNIQUE NOT NULL,
  query              TEXT NOT NULL,
  context            JSONB,
  last_validated_at  TIMESTAMPTZ DEFAULT NOW(),
  gi_score           DOUBLE PRECISION NOT NULL,
  hit_count          BIGINT NOT NULL DEFAULT 0,
  miss_count         BIGINT NOT NULL DEFAULT 0,
  freshness_tag      TEXT,
  valid_until        TIMESTAMPTZ,
  status             TEXT NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_meta_key
  ON echo_cache_meta(cache_key);

CREATE INDEX IF NOT EXISTS idx_echo_meta_validated
  ON echo_cache_meta(last_validated_at ASC);

-- ============================================================================
-- HUMAN REVIEW QUEUE: Low-GI answers awaiting approval
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_human_review_queue (
  id               SERIAL PRIMARY KEY,
  peer_review_id   INTEGER REFERENCES echo_peer_review_results(id) ON DELETE SET NULL,
  query            TEXT NOT NULL,
  context          JSONB,
  
  -- All candidate answers
  candidate_answers JSONB NOT NULL,
  
  -- Consensus attempt
  proposed_answer  TEXT NOT NULL,
  gi_score         DOUBLE PRECISION NOT NULL,
  
  -- Review status
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | modified
  reviewer_id      TEXT,
  reviewer_notes   TEXT,
  final_answer     TEXT,
  final_gi_score   DOUBLE PRECISION,
  
  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_echo_review_status
  ON echo_human_review_queue(status);

CREATE INDEX IF NOT EXISTS idx_echo_review_created
  ON echo_human_review_queue(created_at DESC);

-- ============================================================================
-- DRIFT DETECTION: Track answer consistency over time
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_drift_log (
  id               SERIAL PRIMARY KEY,
  cache_key        TEXT NOT NULL,
  query            TEXT NOT NULL,
  
  -- Previous state
  previous_answer  TEXT NOT NULL,
  previous_gi      DOUBLE PRECISION NOT NULL,
  previous_sources JSONB,
  
  -- New state
  new_answer       TEXT NOT NULL,
  new_gi           DOUBLE PRECISION NOT NULL,
  new_sources      JSONB,
  
  -- Drift analysis
  drift_type       TEXT NOT NULL,           -- 'semantic' | 'source' | 'confidence' | 'factual'
  drift_severity   DOUBLE PRECISION NOT NULL, -- 0.0 to 1.0
  drift_reason     TEXT,
  
  -- Resolution
  resolution       TEXT,                    -- 'accepted' | 'reverted' | 'human_review'
  resolved_at      TIMESTAMPTZ,
  
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_drift_key
  ON echo_drift_log(cache_key);

CREATE INDEX IF NOT EXISTS idx_echo_drift_severity
  ON echo_drift_log(drift_severity DESC);

-- ============================================================================
-- STATISTICS: Aggregated metrics for monitoring
-- ============================================================================

CREATE TABLE IF NOT EXISTS echo_stats (
  id               SERIAL PRIMARY KEY,
  period_start     TIMESTAMPTZ NOT NULL,
  period_end       TIMESTAMPTZ NOT NULL,
  
  -- Cache metrics
  cache_hits       BIGINT NOT NULL DEFAULT 0,
  cache_misses     BIGINT NOT NULL DEFAULT 0,
  cache_hit_rate   DOUBLE PRECISION,
  
  -- GI metrics
  avg_gi_score     DOUBLE PRECISION,
  min_gi_score     DOUBLE PRECISION,
  max_gi_score     DOUBLE PRECISION,
  
  -- Review metrics
  total_reviews    BIGINT NOT NULL DEFAULT 0,
  approved_reviews BIGINT NOT NULL DEFAULT 0,
  human_reviews    BIGINT NOT NULL DEFAULT 0,
  
  -- Drift metrics
  drift_events     BIGINT NOT NULL DEFAULT 0,
  avg_drift_severity DOUBLE PRECISION,
  
  -- Processing metrics
  avg_processing_time_ms DOUBLE PRECISION,
  
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_echo_stats_period
  ON echo_stats(period_start DESC);

