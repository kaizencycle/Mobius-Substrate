-- Database schema for Civic Ledger Service
-- Supports attestations, epoch tracking, and balance management

-- Attestations table (immutable proof-of-integrity records)
CREATE TABLE IF NOT EXISTS attestations (
  id BIGSERIAL PRIMARY KEY,
  hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 hash
  action VARCHAR(20) NOT NULL,  -- 'mint' or 'burn'
  amount_shards NUMERIC(78, 0) NOT NULL,  -- BigInt precision
  human_signature TEXT NOT NULL,
  sentinel_signature TEXT NOT NULL,
  gi_at_action NUMERIC(5, 3) NOT NULL,  -- GI score at time of action
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_attestations_hash (hash),
  INDEX idx_attestations_action (action),
  INDEX idx_attestations_created_at (created_at)
);

-- Epoch tracking table
CREATE TABLE IF NOT EXISTS epochs (
  id SERIAL PRIMARY KEY,
  epoch_number INTEGER UNIQUE NOT NULL,
  start_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp TIMESTAMP WITH TIME ZONE,
  burn_executed BOOLEAN DEFAULT FALSE,
  burn_tx_hash VARCHAR(66),  -- Transaction hash from burn attestation
  total_decayed_shards NUMERIC(78, 0) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_epochs_number ON epochs(epoch_number);
CREATE INDEX IF NOT EXISTS idx_epochs_burn_executed ON epochs(burn_executed);

-- Balance ledger (account balances in shards)
CREATE TABLE IF NOT EXISTS balances (
  address VARCHAR(66) PRIMARY KEY,  -- DID or wallet address
  shards NUMERIC(78, 0) DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_balances_last_activity ON balances(last_activity);

-- Integrity pool (reabsorbed shards)
CREATE TABLE IF NOT EXISTS integrity_pool (
  id BIGSERIAL PRIMARY KEY,
  amount_shards NUMERIC(78, 0) NOT NULL,
  source_epoch INTEGER,
  reabsorption_tx_hash VARCHAR(66),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrity_pool_epoch ON integrity_pool(source_epoch);

-- Migration log
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert genesis epoch
INSERT INTO epochs (epoch_number, start_timestamp, burn_executed)
VALUES (1, NOW(), FALSE)
ON CONFLICT (epoch_number) DO NOTHING;

