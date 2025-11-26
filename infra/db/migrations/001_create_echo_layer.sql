-- =============================================
-- ECHO Layer Database Schema
-- Version: 1.0
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================
-- Core ECHO Layer Table
-- =============================================

CREATE TABLE echo_layer_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canonical_key VARCHAR(255) UNIQUE NOT NULL,
  question_raw TEXT NOT NULL,
  question_norm TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  gi_score FLOAT NOT NULL CHECK (gi_score >= 0 AND gi_score <= 1),
  ledger_tx_id VARCHAR(66),
  ledger_hash VARCHAR(66),
  sources_json JSONB NOT NULL DEFAULT '[]',
  sentinels_json JSONB NOT NULL DEFAULT '[]',
  embedding VECTOR(1536),
  domain VARCHAR(100) DEFAULT 'general',
  locale VARCHAR(10) DEFAULT 'en-US',
  jurisdiction VARCHAR(100),
  freshness_tag VARCHAR(50) DEFAULT 'general',
  valid_until TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'review_required')),
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMP,
  last_validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT canonical_key_unique UNIQUE (canonical_key)
);

-- =============================================
-- Human Review Queue
-- =============================================

CREATE TABLE human_review_queue (
  id VARCHAR(50) PRIMARY KEY,
  query TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}',
  consensus JSONB,
  reason TEXT NOT NULL,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'escalated')),
  domain VARCHAR(100),
  jurisdiction VARCHAR(100),
  proposed_answer TEXT,
  sentinels_json JSONB DEFAULT '[]',
  sources_json JSONB DEFAULT '[]',
  feedback TEXT,
  reviewer VARCHAR(100),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Security Events
-- =============================================

CREATE TABLE security_events (
  id VARCHAR(50) PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  query_text TEXT,
  gi_score FLOAT,
  sentinels_json JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Drift Events
-- =============================================

CREATE TABLE drift_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Validation Log
-- =============================================

CREATE TABLE echo_validation_log (
  id SERIAL PRIMARY KEY,
  entry_id UUID REFERENCES echo_layer_entries(id),
  old_gi_score FLOAT,
  new_gi_score FLOAT,
  status VARCHAR(20) CHECK (status IN ('updated', 'failed', 'review_required')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Urgent Review Queue
-- =============================================

CREATE TABLE urgent_review_queue (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  priority VARCHAR(20) DEFAULT 'critical',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

-- Core lookups
CREATE INDEX idx_echo_canonical ON echo_layer_entries(canonical_key);
CREATE INDEX idx_echo_domain_status ON echo_layer_entries(domain, status) WHERE status = 'active';
CREATE INDEX idx_echo_gi_score ON echo_layer_entries(gi_score DESC) WHERE status = 'active';

-- Vector similarity
CREATE INDEX idx_echo_embedding ON echo_layer_entries 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Cache expiration
CREATE INDEX idx_echo_valid_until ON echo_layer_entries(valid_until) 
  WHERE status = 'active' AND valid_until IS NOT NULL;

-- Hit count optimization
CREATE INDEX idx_echo_hit_count ON echo_layer_entries(hit_count DESC) 
  WHERE status = 'active';

-- Human review queue
CREATE INDEX idx_hr_status_priority ON human_review_queue(status, priority DESC, created_at)
  WHERE status = 'pending';

-- Security events
CREATE INDEX idx_security_severity ON security_events(severity, created_at DESC);
CREATE INDEX idx_security_type ON security_events(event_type, created_at DESC);

-- Drift events
CREATE INDEX idx_drift_created ON drift_events(created_at DESC);

-- Validation log
CREATE INDEX idx_validation_entry ON echo_validation_log(entry_id, created_at DESC);

-- =============================================
-- Updated At Trigger
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_echo_layer_updated_at 
  BEFORE UPDATE ON echo_layer_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_human_review_updated_at 
  BEFORE UPDATE ON human_review_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed Data: Core Constitutional Knowledge
-- =============================================

INSERT INTO echo_layer_entries (
  canonical_key, question_raw, question_norm, answer_text, gi_score,
  sources_json, sentinels_json, domain, freshness_tag, status
) VALUES 
(
  'general:en-US:2a1b3c4d',
  'What is 2+2?',
  'what is 2+2',
  '4',
  1.0,
  '[{"url": "https://w3.org/math", "title": "Mathematical Foundations"}]',
  '[{"name": "consensus", "confidence": 1.0, "vote": "APPROVE"}]',
  'mathematics',
  'general',
  'active'
);

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE echo_layer_entries IS 'ECHO Layer constitutional memory store';
COMMENT ON TABLE human_review_queue IS 'Human review queue for low GI scores';
COMMENT ON TABLE security_events IS 'Security and anomaly event log';
COMMENT ON TABLE drift_events IS 'Drift detection events for monitoring';
COMMENT ON TABLE echo_validation_log IS 'Memory validation batch processing log';

