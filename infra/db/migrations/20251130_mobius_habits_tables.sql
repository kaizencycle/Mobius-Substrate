-- C-150: Mobius Habits - Testnet App Schema
-- Creates tables for habit profiles, Citizen Shield runs, and testnet rewards

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HABIT PROFILES: User preferences and settings for Mobius Habits
-- ============================================================================

CREATE TABLE IF NOT EXISTS habit_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  timezone VARCHAR(64) DEFAULT 'America/New_York',
  notification_window_start TIME DEFAULT '08:00',
  notification_window_end TIME DEFAULT '22:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_habit_profiles_user_id
  ON habit_profiles (user_id);

-- ============================================================================
-- CITIZEN SHIELD RUNS: Weekly cybersecurity checklist completions
-- ============================================================================

CREATE TABLE IF NOT EXISTS citizen_shield_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  week_start_date DATE NOT NULL,
  step_update_devices BOOLEAN DEFAULT FALSE,
  step_router_hygiene BOOLEAN DEFAULT FALSE,
  step_browser_lockdown BOOLEAN DEFAULT FALSE,
  step_2fa_check BOOLEAN DEFAULT FALSE,
  step_backup_essentials BOOLEAN DEFAULT FALSE,
  completion_score NUMERIC(4,2) DEFAULT 0.0,
  gi_estimate NUMERIC(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_citizen_shield_user_week
  ON citizen_shield_runs (user_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_citizen_shield_week
  ON citizen_shield_runs (week_start_date DESC);

-- ============================================================================
-- TESTNET REWARDS: MIC points and Kaizen Shards for testnet participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS testnet_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mic_points_awarded INTEGER DEFAULT 0,
  kaizen_shards_awarded TEXT[],
  reason TEXT,
  mii_snapshot NUMERIC(4,3),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testnet_rewards_user_date
  ON testnet_rewards (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_testnet_rewards_user
  ON testnet_rewards (user_id);

-- Trigger to update updated_at timestamp for habit_profiles
CREATE OR REPLACE FUNCTION update_habit_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_habit_profiles_updated_at
  BEFORE UPDATE ON habit_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_profiles_updated_at();

-- Trigger to update updated_at timestamp for citizen_shield_runs
CREATE OR REPLACE FUNCTION update_citizen_shield_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_citizen_shield_runs_updated_at
  BEFORE UPDATE ON citizen_shield_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_citizen_shield_runs_updated_at();

-- Comments for documentation
COMMENT ON TABLE habit_profiles IS 'User preferences and settings for Mobius Habits app';
COMMENT ON TABLE citizen_shield_runs IS 'Weekly cybersecurity checklist completions for Citizen Shield ritual';
COMMENT ON TABLE testnet_rewards IS 'MIC points and Kaizen Shards awarded during Mobius Habits testnet';

COMMENT ON COLUMN citizen_shield_runs.completion_score IS 'Completion score: 0.0 to 1.0 (1.0 = all 5 steps complete)';
COMMENT ON COLUMN citizen_shield_runs.gi_estimate IS 'Estimated GI score for this Shield completion';
COMMENT ON COLUMN testnet_rewards.mic_points_awarded IS 'MIC (Mobius Integrity Credits) points awarded (testnet only)';
COMMENT ON COLUMN testnet_rewards.kaizen_shards_awarded IS 'Array of Kaizen Shard badges earned (e.g., ["Consistency", "Shieldbearer"])';
