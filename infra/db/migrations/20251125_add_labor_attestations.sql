-- 20251125_add_labor_attestations.sql
-- Civic OS Labor Rights module schema

CREATE TABLE IF NOT EXISTS labor_attestations (
  attestation_id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             TEXT NOT NULL CHECK (type = 'labor_event'),
  org_id           TEXT NOT NULL,
  worker_id        TEXT NOT NULL,
  
  event_kind       TEXT NOT NULL CHECK (event_kind IN 
    ('workload_analysis', 'contract_audit', 'wage_fairness', 'dispute', 'other')),
  event_payload    JSONB NOT NULL,
  
  gi_score         NUMERIC(3,2) CHECK (gi_score BETWEEN 0 AND 1),
  
  timestamp        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  meta             JSONB,
  
  -- Link to main civic ledger
  ledger_tx_id     TEXT
);

CREATE INDEX IF NOT EXISTS idx_labor_org_worker ON labor_attestations(org_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_labor_timestamp ON labor_attestations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_labor_low_gi ON labor_attestations(gi_score) WHERE gi_score < 0.95;

COMMENT ON TABLE labor_attestations IS 'Civic OS: Immutable labor rights attestations';

