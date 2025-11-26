-- 20251126_create_encyclopedia_entries.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS encyclopedia_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    gi_score NUMERIC(4,3) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('CANONICAL', 'DRAFT', 'NEEDS_REVIEW')),
    engines JSONB NOT NULL,
    sources JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1,
    ledger_tx_id TEXT,
    created_by TEXT NOT NULL DEFAULT 'system',
    jurisdiction_id TEXT,
    UNIQUE (topic_id, version)
);

CREATE INDEX IF NOT EXISTS idx_encyclopedia_topic ON encyclopedia_entries (topic_id);
CREATE INDEX IF NOT EXISTS idx_encyclopedia_status ON encyclopedia_entries (status);
CREATE INDEX IF NOT EXISTS idx_encyclopedia_gi_score ON encyclopedia_entries (gi_score DESC);
