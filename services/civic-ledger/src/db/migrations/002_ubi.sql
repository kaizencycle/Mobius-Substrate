-- UBI run lifecycle + payouts (ledger-agnostic, settlement handled downstream)

CREATE TYPE ubi_run_status AS ENUM ('prepared', 'settled', 'canceled', 'failed');

CREATE TABLE IF NOT EXISTS ubi_runs (
  id BIGSERIAL PRIMARY KEY,
  epoch INTEGER NOT NULL,                -- 90-day epoch number
  month_key DATE NOT NULL,               -- calendar month anchor (e.g., 2025-11-01)
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status ubi_run_status NOT NULL DEFAULT 'prepared',
  gi_used NUMERIC(6,3) NOT NULL,
  pool_total_shards NUMERIC(40,0) NOT NULL,
  per_capita_shards NUMERIC(40,0) NOT NULL,
  recipients BIGINT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (epoch, month_key)
);
CREATE INDEX IF NOT EXISTS ubi_runs_started_idx ON ubi_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS ubi_runs_status_idx ON ubi_runs (status);

CREATE TYPE ubi_payout_status AS ENUM ('queued', 'sent', 'skipped');

CREATE TABLE IF NOT EXISTS ubi_payouts (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES ubi_runs(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  amount_shards NUMERIC(40,0) NOT NULL,
  status ubi_payout_status NOT NULL DEFAULT 'queued',
  reason TEXT,                            -- if skipped
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  idempotency_key TEXT,                   -- optional downstream usage
  UNIQUE (run_id, wallet)
);
CREATE INDEX IF NOT EXISTS ubi_payouts_run_idx ON ubi_payouts (run_id);
CREATE INDEX IF NOT EXISTS ubi_payouts_status_idx ON ubi_payouts (status);

-- Optional: store an eligibility snapshot used for the run
CREATE TABLE IF NOT EXISTS ubi_eligibility_snapshots (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES ubi_runs(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  eligible BOOLEAN NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, wallet)
);
CREATE INDEX IF NOT EXISTS ubi_elig_snap_run_idx ON ubi_eligibility_snapshots (run_id);

