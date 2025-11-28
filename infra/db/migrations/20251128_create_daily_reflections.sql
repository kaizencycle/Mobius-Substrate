-- C-148 • Strange Metamorphosis Loop
-- Create daily_reflections table for 3-question protocol

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  reflection_date DATE NOT NULL,

  worldview_text TEXT,
  worldview_embedding VECTOR(1536), -- adjust dimension to your embedding model
  worldview_sentiment VARCHAR(64),

  mood_label VARCHAR(64),
  mood_intensity NUMERIC(3,2), -- 0.00 - 1.00

  intent_text TEXT,
  intent_category VARCHAR(64),
  intent_confidence NUMERIC(3,2),

  echo_score NUMERIC(3,2),
  gi_score NUMERIC(3,2),
  echo_review_status VARCHAR(32) DEFAULT 'pending', -- e.g. 'pending', 'verified', 'flagged'

  ledger_attestation_id VARCHAR(255),

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_reflections_user_date
  ON daily_reflections (user_id, reflection_date);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_date
  ON daily_reflections (reflection_date);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_echo_score
  ON daily_reflections (echo_score);

CREATE INDEX IF NOT EXISTS idx_daily_reflections_gi_score
  ON daily_reflections (gi_score);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_reflections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_reflections_updated_at
  BEFORE UPDATE ON daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_reflections_updated_at();
