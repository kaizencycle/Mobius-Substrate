-- ═══════════════════════════════════════════════════════════════════
-- Mobius Pulses Table v2 (C-151)
-- Stores Sentinel-ready JSON snapshots with GI/MII scores
-- 
-- Migration: 20251130_add_mobius_pulses_v2.sql
-- Purpose: Enable AI agents to query historical repo states with integrity metrics
-- ═══════════════════════════════════════════════════════════════════

-- Create the mobius_pulses table (if not exists, add columns if it does)
DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mobius_pulses') THEN
        CREATE TABLE mobius_pulses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            hash TEXT UNIQUE NOT NULL,          -- sha256(raw_json) or similar

            version TEXT NOT NULL,                 -- e.g. "1.0"
            generated_at TIMESTAMPTZ NOT NULL,
            cycle TEXT NOT NULL,
            branch TEXT NOT NULL,

            commit_sha TEXT NOT NULL,
            commit_author TEXT NOT NULL,
            commit_message TEXT NOT NULL,

            gi_score NUMERIC(4,3) NOT NULL,
            mii_score NUMERIC(4,3) NOT NULL,

            total_files INTEGER NOT NULL,
            total_lines INTEGER NOT NULL,
            apps_count INTEGER NOT NULL,
            packages_count INTEGER NOT NULL,
            workflows_count INTEGER NOT NULL,

            raw_json JSONB NOT NULL,                -- full MobiusPulse JSON

            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    ELSE
        -- Table exists, add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'hash') THEN
            ALTER TABLE mobius_pulses ADD COLUMN hash TEXT UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'gi_score') THEN
            ALTER TABLE mobius_pulses ADD COLUMN gi_score NUMERIC(4,3);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'mii_score') THEN
            ALTER TABLE mobius_pulses ADD COLUMN mii_score NUMERIC(4,3);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'commit_sha') THEN
            ALTER TABLE mobius_pulses ADD COLUMN commit_sha TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'commit_author') THEN
            ALTER TABLE mobius_pulses ADD COLUMN commit_author TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'commit_message') THEN
            ALTER TABLE mobius_pulses ADD COLUMN commit_message TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'total_lines') THEN
            ALTER TABLE mobius_pulses ADD COLUMN total_lines INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'raw_json') THEN
            ALTER TABLE mobius_pulses ADD COLUMN raw_json JSONB;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mobius_pulses' AND column_name = 'generated_at') THEN
            ALTER TABLE mobius_pulses ADD COLUMN generated_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;

-- Fast "what's the latest?" queries
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_generated_at
  ON mobius_pulses (generated_at DESC);

-- Filter by cycle quickly
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_cycle_generated_at
  ON mobius_pulses (cycle, generated_at DESC);

-- Integrity analytics
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_gi_mii
  ON mobius_pulses (gi_score, mii_score);

-- Hash lookup
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_hash
  ON mobius_pulses (hash);
