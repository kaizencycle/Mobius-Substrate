-- Negentropic Economics Database Schema
-- Cycle C-148 | 2025-11-28
-- Adds tables for entropy tracking, negentropy generation, and debt reduction

-- System entropy tracking
CREATE TABLE IF NOT EXISTS system_entropy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(64) NOT NULL,              -- governance, health, finance, etc.
  entropy_score NUMERIC(5,4) NOT NULL,       -- 0.0000 - 1.0000
  measurement_time TIMESTAMPTZ NOT NULL,
  contributing_factors JSONB,               -- Structured factors contributing to entropy
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for time-series queries
  CONSTRAINT valid_entropy_score CHECK (entropy_score >= 0 AND entropy_score <= 1)
);

CREATE INDEX idx_system_entropy_domain_time ON system_entropy (domain, measurement_time DESC);
CREATE INDEX idx_system_entropy_time ON system_entropy (measurement_time DESC);

-- Negentropy generation events
CREATE TABLE IF NOT EXISTS negentropy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action_type VARCHAR(64) NOT NULL,          -- reflection, governance, validation, etc.
  integrity_score NUMERIC(3,2) NOT NULL,     -- MII: 0.00 - 1.00
  negentropy_value NUMERIC(10,2) NOT NULL,   -- Calculated negentropy
  mic_minted NUMERIC(10,2),                  -- MIC minted from this event
  ledger_attestation_id VARCHAR(255),        -- Link to Civic Ledger entry
  domain VARCHAR(64),                        -- Which domain this affects
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_integrity_score CHECK (integrity_score >= 0 AND integrity_score <= 1),
  CONSTRAINT valid_negentropy CHECK (negentropy_value >= 0),
  CONSTRAINT valid_mic CHECK (mic_minted IS NULL OR mic_minted >= 0)
);

CREATE INDEX idx_negentropy_events_user ON negentropy_events (user_id, created_at DESC);
CREATE INDEX idx_negentropy_events_type ON negentropy_events (action_type, created_at DESC);
CREATE INDEX idx_negentropy_events_domain ON negentropy_events (domain, created_at DESC);
CREATE INDEX idx_negentropy_events_ledger ON negentropy_events (ledger_attestation_id) WHERE ledger_attestation_id IS NOT NULL;

-- Debt reduction tracking
CREATE TABLE IF NOT EXISTS debt_reductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id VARCHAR(255) NOT NULL,          -- nation, city, organization
  entity_type VARCHAR(64) NOT NULL,         -- nation, city, organization, etc.
  initial_debt NUMERIC(15,2) NOT NULL,
  negentropy_applied NUMERIC(15,2) NOT NULL, -- Total negentropy applied
  debt_reduced NUMERIC(15,2) NOT NULL,       -- Amount of debt reduced
  integrity_improvement NUMERIC(3,2),        -- MII improvement
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_debt CHECK (initial_debt >= 0 AND debt_reduced >= 0 AND debt_reduced <= initial_debt),
  CONSTRAINT valid_integrity_improvement CHECK (integrity_improvement IS NULL OR (integrity_improvement >= 0 AND integrity_improvement <= 1)),
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

CREATE INDEX idx_debt_reductions_entity ON debt_reductions (entity_id, entity_type, period_start DESC);
CREATE INDEX idx_debt_reductions_period ON debt_reductions (period_start, period_end);

-- Comments for documentation
COMMENT ON TABLE system_entropy IS 'Tracks entropy (disorder) across different domains of civilization';
COMMENT ON TABLE negentropy_events IS 'Records events that generate negentropy (order creation) and mint MIC';
COMMENT ON TABLE debt_reductions IS 'Tracks debt reduction achieved through negentropy (order creation)';

COMMENT ON COLUMN system_entropy.domain IS 'Domain: governance, health, finance, climate, infrastructure, security, knowledge, education';
COMMENT ON COLUMN system_entropy.entropy_score IS 'Entropy score: 0.0 = perfect order, 1.0 = maximum chaos';
COMMENT ON COLUMN negentropy_events.action_type IS 'Type: reflection, governance, validation, coordination, etc.';
COMMENT ON COLUMN negentropy_events.integrity_score IS 'Mobius Integrity Index (MII) for this action';
COMMENT ON COLUMN negentropy_events.negentropy_value IS 'Calculated negentropy: N = kI where I is integrity score';
COMMENT ON COLUMN debt_reductions.debt_reduced IS 'Amount of debt reduced via order creation: ΔD = λN';
