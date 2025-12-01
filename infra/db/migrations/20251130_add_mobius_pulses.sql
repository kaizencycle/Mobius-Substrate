-- ═══════════════════════════════════════════════════════════════════
-- Mobius Pulses Table
-- Stores Sentinel-ready JSON snapshots of the repository state
-- 
-- Migration: 20251130_add_mobius_pulses.sql
-- Purpose: Enable AI agents to query historical repo states
-- ═══════════════════════════════════════════════════════════════════

-- Create the mobius_pulses table
CREATE TABLE IF NOT EXISTS mobius_pulses (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timing
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pulse_timestamp TIMESTAMPTZ, -- Timestamp from the pulse itself
    
    -- Cycle information
    cycle_label VARCHAR(32),
    mii_estimate NUMERIC(5,4), -- MII scores like 0.9725
    
    -- Git information
    head_commit VARCHAR(64) NOT NULL,
    branch_name VARCHAR(256),
    
    -- Repository information
    repo_root TEXT,
    repo_name VARCHAR(256),
    
    -- Pulse metadata
    pulse_version VARCHAR(16) DEFAULT '1.0',
    source_tag VARCHAR(64), -- "nightly", "manual", "pr", etc.
    sentinel_hint VARCHAR(256), -- Which sentinels should process
    
    -- Statistics
    tracked_files_count INTEGER,
    branches_count INTEGER,
    packages_count INTEGER,
    apps_count INTEGER,
    changed_files_count INTEGER,
    recent_commits_count INTEGER,
    workflows_count INTEGER,
    
    -- Full payload (for complete reconstruction)
    payload JSONB NOT NULL,
    
    -- Computed fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_mii_estimate CHECK (mii_estimate IS NULL OR (mii_estimate >= 0 AND mii_estimate <= 1))
);

-- ═══════════════════════════════════════════════════════════════════
-- Indexes for efficient querying
-- ═══════════════════════════════════════════════════════════════════

-- Query by cycle label (e.g., "C-150")
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_cycle_label
    ON mobius_pulses (cycle_label);

-- Query by commit hash (find pulse for specific commit)
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_head_commit
    ON mobius_pulses (head_commit);

-- Query by MII estimate (find high/low integrity periods)
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_mii_estimate
    ON mobius_pulses (mii_estimate);

-- Query by time (most recent first)
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_received_at
    ON mobius_pulses (received_at DESC);

-- Query by source (nightly vs manual vs pr)
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_source_tag
    ON mobius_pulses (source_tag);

-- Query by branch
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_branch_name
    ON mobius_pulses (branch_name);

-- Full-text search on cycle label and branch
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_text_search
    ON mobius_pulses USING gin (to_tsvector('english', 
        COALESCE(cycle_label, '') || ' ' || 
        COALESCE(branch_name, '') || ' ' || 
        COALESCE(repo_name, '')
    ));

-- JSONB index for querying payload fields
CREATE INDEX IF NOT EXISTS idx_mobius_pulses_payload_gin
    ON mobius_pulses USING gin (payload jsonb_path_ops);

-- ═══════════════════════════════════════════════════════════════════
-- Helper views
-- ═══════════════════════════════════════════════════════════════════

-- Latest pulse view (for quick access)
CREATE OR REPLACE VIEW v_latest_mobius_pulse AS
SELECT *
FROM mobius_pulses
ORDER BY received_at DESC
LIMIT 1;

-- Pulse summary view (for dashboard)
CREATE OR REPLACE VIEW v_mobius_pulse_summary AS
SELECT
    id,
    received_at,
    cycle_label,
    mii_estimate,
    head_commit,
    branch_name,
    source_tag,
    tracked_files_count,
    changed_files_count,
    recent_commits_count,
    workflows_count
FROM mobius_pulses
ORDER BY received_at DESC;

-- Daily pulse statistics
CREATE OR REPLACE VIEW v_mobius_pulse_daily_stats AS
SELECT
    DATE_TRUNC('day', received_at) AS pulse_date,
    COUNT(*) AS pulse_count,
    AVG(mii_estimate) AS avg_mii,
    MIN(mii_estimate) AS min_mii,
    MAX(mii_estimate) AS max_mii,
    AVG(tracked_files_count) AS avg_tracked_files,
    AVG(changed_files_count) AS avg_changed_files
FROM mobius_pulses
GROUP BY DATE_TRUNC('day', received_at)
ORDER BY pulse_date DESC;

-- ═══════════════════════════════════════════════════════════════════
-- Utility functions
-- ═══════════════════════════════════════════════════════════════════

-- Function to get pulse by cycle label
CREATE OR REPLACE FUNCTION get_pulse_by_cycle(p_cycle_label VARCHAR)
RETURNS SETOF mobius_pulses AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM mobius_pulses
    WHERE cycle_label = p_cycle_label
    ORDER BY received_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get pulses in a time range
CREATE OR REPLACE FUNCTION get_pulses_in_range(
    p_start TIMESTAMPTZ,
    p_end TIMESTAMPTZ DEFAULT NOW()
)
RETURNS SETOF mobius_pulses AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM mobius_pulses
    WHERE received_at BETWEEN p_start AND p_end
    ORDER BY received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get MII trend over time
CREATE OR REPLACE FUNCTION get_mii_trend(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    pulse_date DATE,
    avg_mii NUMERIC,
    pulse_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(received_at) AS pulse_date,
        AVG(mii_estimate) AS avg_mii,
        COUNT(*) AS pulse_count
    FROM mobius_pulses
    WHERE received_at >= NOW() - (p_days || ' days')::INTERVAL
      AND mii_estimate IS NOT NULL
    GROUP BY DATE(received_at)
    ORDER BY pulse_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════
-- Comments for documentation
-- ═══════════════════════════════════════════════════════════════════

COMMENT ON TABLE mobius_pulses IS 'Stores Sentinel-ready JSON snapshots of repository state for AI agent synchronization';
COMMENT ON COLUMN mobius_pulses.pulse_version IS 'Version of the pulse format (e.g., "1.0")';
COMMENT ON COLUMN mobius_pulses.cycle_label IS 'Mobius cycle identifier (e.g., "C-150")';
COMMENT ON COLUMN mobius_pulses.mii_estimate IS 'Estimated Mobius Integrity Index at time of pulse';
COMMENT ON COLUMN mobius_pulses.head_commit IS 'Git HEAD commit hash at time of pulse';
COMMENT ON COLUMN mobius_pulses.source_tag IS 'Origin of pulse: "nightly", "manual", "pr", etc.';
COMMENT ON COLUMN mobius_pulses.sentinel_hint IS 'Pipe-separated list of sentinels that should process this pulse';
COMMENT ON COLUMN mobius_pulses.payload IS 'Complete JSON pulse payload for full reconstruction';
