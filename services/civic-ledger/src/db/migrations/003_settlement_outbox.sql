CREATE TYPE settlement_status AS ENUM ('queued','dispatched','acked','failed');

CREATE TABLE IF NOT EXISTS settlement_outbox (
  id BIGSERIAL PRIMARY KEY,
  run_id BIGINT NOT NULL REFERENCES ubi_runs(id) ON DELETE CASCADE,
  payout_id BIGINT NOT NULL REFERENCES ubi_payouts(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  amount_shards NUMERIC(40,0) NOT NULL,
  payload JSONB NOT NULL,
  status settlement_status NOT NULL DEFAULT 'queued',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payout_id)
);
CREATE INDEX IF NOT EXISTS idx_settlement_outbox_status ON settlement_outbox(status);
CREATE INDEX IF NOT EXISTS idx_settlement_outbox_run ON settlement_outbox(run_id);

CREATE TABLE IF NOT EXISTS settlement_deliveries (
  id BIGSERIAL PRIMARY KEY,
  outbox_id BIGINT NOT NULL REFERENCES settlement_outbox(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider_response JSONB
);

