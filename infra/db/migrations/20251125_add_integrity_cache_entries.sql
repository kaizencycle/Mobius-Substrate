-- Migration: Add ECHO Layer (Epistemically Cached Heuristic Outcomes) for Mobius Systems
-- Date: 2025-11-25
-- Purpose: Enable high-GI answer caching to reduce hallucinations and drift

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ECHO Layer Entries Table
CREATE TABLE IF NOT EXISTS echo_layer_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_key    TEXT NOT NULL,
  question_raw     TEXT NOT NULL,
  question_norm    TEXT NOT NULL,
  answer_text      TEXT NOT NULL,
  answer_format    TEXT NOT NULL DEFAULT 'markdown',
  gi_score         NUMERIC(4,3) NOT NULL CHECK (gi_score >= 0 AND gi_score <= 1),
  ledger_tx_id     TEXT,
  ledger_hash      TEXT,
  sources_json     JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentinels_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding        vector(1536),
  domain           TEXT NOT NULL DEFAULT 'general',
  locale           TEXT NOT NULL DEFAULT 'en-US',
  jurisdiction     TEXT,
  freshness_tag    TEXT,
  valid_until      TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'superseded')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_echo_layer_key 
  ON echo_layer_entries(canonical_key);

CREATE INDEX IF NOT EXISTS idx_echo_layer_status 
  ON echo_layer_entries(status);

CREATE INDEX IF NOT EXISTS idx_echo_layer_gi 
  ON echo_layer_entries(gi_score DESC);

CREATE INDEX IF NOT EXISTS idx_echo_layer_domain 
  ON echo_layer_entries(domain);

CREATE INDEX IF NOT EXISTS idx_echo_layer_valid_until 
  ON echo_layer_entries(valid_until) WHERE valid_until IS NOT NULL;

-- Vector index for semantic search (IVFFlat for initial implementation)
-- Note: Requires at least 100 rows for IVFFlat. Use HNSW for production at scale.
CREATE INDEX IF NOT EXISTS idx_echo_layer_embedding 
  ON echo_layer_entries 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Human Review Queue Table
CREATE TABLE IF NOT EXISTS human_review_queue (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliberation_id  TEXT NOT NULL,
  question          TEXT NOT NULL,
  answer_candidate  TEXT NOT NULL,
  gi_score          NUMERIC(4,3) NOT NULL,
  sources_json      JSONB NOT NULL DEFAULT '[]'::jsonb,
  sentinels_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  flagged_reason     TEXT,
  priority          TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'superseded')),
  editor_notes      TEXT,
  editor_id         TEXT,
  resolved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_human_review_queue_status 
  ON human_review_queue(status);

CREATE INDEX IF NOT EXISTS idx_human_review_queue_priority 
  ON human_review_queue(priority DESC, created_at ASC);

-- Cache Statistics View (for DVA.LITE monitoring)
CREATE OR REPLACE VIEW echo_layer_stats AS
SELECT 
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE status = 'active') as active_entries,
  AVG(gi_score) as avg_gi_score,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as entries_last_24h,
  COUNT(*) FILTER (WHERE valid_until IS NOT NULL AND valid_until < NOW()) as expired_entries,
  COUNT(DISTINCT domain) as unique_domains
FROM echo_layer_entries;

-- Comments for documentation
COMMENT ON TABLE echo_layer_entries IS 'ECHO Layer: High-GI answer cache to reduce hallucinations and drift';
COMMENT ON COLUMN echo_layer_entries.canonical_key IS 'SHA-256 hash of normalized question for exact lookup';
COMMENT ON COLUMN echo_layer_entries.embedding IS 'Vector embedding (1536-dim) for semantic similarity search';
COMMENT ON COLUMN echo_layer_entries.freshness_tag IS 'Freshness policy: static, law, news, general';
COMMENT ON COLUMN echo_layer_entries.gi_score IS 'Global Integrity score (0-1). Must be >= 0.95 to cache.';

COMMENT ON TABLE human_review_queue IS 'Queue for low-GI answers requiring human review before caching';

