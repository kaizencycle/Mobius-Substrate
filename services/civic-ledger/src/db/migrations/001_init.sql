-- Schema: durable storage for GI samples + epoch attestations

CREATE TABLE IF NOT EXISTS gi_samples (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gi NUMERIC(6,3) NOT NULL CHECK (gi >= 0 AND gi <= 1),
  source TEXT NOT NULL DEFAULT 'unknown'
);
CREATE INDEX IF NOT EXISTS gi_samples_ts_idx ON gi_samples (ts DESC);

-- Weighted average convenience view (per-day buckets nearby now)
-- (kept simple; TWA is computed in code for flexibility)

CREATE TABLE IF NOT EXISTS epoch_attestations (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  epoch INTEGER NOT NULL,
  gi_used NUMERIC(6,3) NOT NULL CHECK (gi_used >= 0 AND gi_used <= 1),
  decay_decayed_shards NUMERIC(40,0) NOT NULL,
  decay_reabsorbed_shards NUMERIC(40,0) NOT NULL,
  ubi_pool_total NUMERIC(40,0) NOT NULL,
  ubi_per_capita NUMERIC(40,0) NOT NULL,
  ubi_recipients BIGINT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted_signers TEXT[] NOT NULL DEFAULT '{}'
);
CREATE UNIQUE INDEX IF NOT EXISTS epoch_attestations_epoch_uq ON epoch_attestations (epoch);
CREATE INDEX IF NOT EXISTS epoch_attestations_ts_idx ON epoch_attestations (ts DESC);

