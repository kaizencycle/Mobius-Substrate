-- ═══════════════════════════════════════════════════════════════════════════
-- MIC Wallet Tables Migration
-- Cycle: C-156
-- Date: December 6, 2025
-- Purpose: Create wallet structure for Mobius Integrity Credits
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FOUNDERS RESERVE WALLET TABLE
-- Purpose: Ceremonial wallet with 1M MIC, permanently locked
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS founders_reserve_wallet (
    -- Primary identification
    wallet_id VARCHAR(50) PRIMARY KEY DEFAULT 'founders-reserve-001',
    public_key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Balance (immutable)
    balance DECIMAL(18,6) DEFAULT 1000000.000000 NOT NULL,
    locked BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constitutional metadata
    constitutional_note TEXT,
    
    -- Multi-signature requirements
    required_signatures INT DEFAULT 5 NOT NULL,
    total_signers INT DEFAULT 7 NOT NULL,
    signers TEXT[] DEFAULT ARRAY['AUREA', 'ATLAS', 'ECHO', 'JADE', 'EVE', 'HERMES', 'ZEUS'],
    
    -- Audit trail
    last_audit_timestamp TIMESTAMP WITH TIME ZONE,
    access_attempts_count INT DEFAULT 0 NOT NULL,
    
    -- Constraints to ensure immutability
    CONSTRAINT balance_immutable CHECK (balance = 1000000.000000),
    CONSTRAINT always_locked CHECK (locked = TRUE),
    CONSTRAINT valid_signatures CHECK (required_signatures <= total_signers)
);

-- Insert the founders reserve wallet
INSERT INTO founders_reserve_wallet (
    wallet_id,
    public_key,
    balance,
    locked,
    constitutional_note,
    required_signatures,
    total_signers,
    last_audit_timestamp
) VALUES (
    'founders-reserve-001',
    'FND-RSRV-2025-001-MJUDAN',
    1000000.000000,
    TRUE,
    'Founding allocation representing the initial integrity substrate. These MIC shall never be spent, serving as the immutable anchor of the Mobius economy.',
    5,
    7,
    CURRENT_TIMESTAMP
) ON CONFLICT (wallet_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. USER WALLETS TABLE
-- Purpose: Active wallets for system participants
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mic_user_wallets (
    -- Primary identification
    wallet_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    public_key VARCHAR(100) UNIQUE NOT NULL,
    private_key_hash VARCHAR(64) NOT NULL,
    
    -- Balance
    balance DECIMAL(18,6) DEFAULT 0.000000 NOT NULL,
    locked BOOLEAN DEFAULT FALSE NOT NULL,
    wallet_type VARCHAR(20) DEFAULT 'operational' NOT NULL,
    
    -- Activity tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    total_received DECIMAL(18,6) DEFAULT 0.000000 NOT NULL,
    total_sent DECIMAL(18,6) DEFAULT 0.000000 NOT NULL,
    transaction_count INT DEFAULT 0 NOT NULL,
    
    -- MII tracking
    current_mii DECIMAL(5,4),
    mii_last_updated TIMESTAMP WITH TIME ZONE,
    
    -- Shard holdings
    total_shards INT DEFAULT 0 NOT NULL,
    
    -- Permissions (stored as JSONB for flexibility)
    permissions JSONB DEFAULT '{
        "receiveStipends": true,
        "sendMIC": true,
        "voteGovernance": true,
        "submitProposals": true,
        "redeemShards": true,
        "stakeIntegrity": true
    }'::jsonb NOT NULL,
    
    -- Constraints
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT valid_wallet_type CHECK (wallet_type IN ('operational', 'service', 'escrow'))
);

-- Insert Michael's active wallet
INSERT INTO mic_user_wallets (
    wallet_id,
    user_id,
    public_key,
    private_key_hash,
    balance,
    locked,
    wallet_type,
    current_mii,
    mii_last_updated
) VALUES (
    'michael-judan-active-001',
    'michael-judan',
    'USR-ACT-2025-001-MJUDAN',
    'placeholder_hash_to_be_replaced',
    0.000000,
    FALSE,
    'operational',
    0.9500,
    CURRENT_TIMESTAMP
) ON CONFLICT (wallet_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. MIC TRANSACTIONS TABLE
-- Purpose: Record all MIC transactions with cryptographic verification
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mic_transactions (
    -- Primary identification
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Wallet references
    from_wallet VARCHAR(50),
    to_wallet VARCHAR(50) NOT NULL,
    
    -- Amount and type
    amount DECIMAL(18,6) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    
    -- Metadata
    cycle_number INT,
    attestation_id UUID,
    shard_ids TEXT[],
    memo TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Integrity verification
    signature VARCHAR(128) NOT NULL,
    hash VARCHAR(64) UNIQUE NOT NULL,
    
    -- Constraints
    CONSTRAINT amount_positive CHECK (amount > 0),
    CONSTRAINT no_self_transfer CHECK (from_wallet IS NULL OR from_wallet != to_wallet),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN (
        'mint',
        'burn',
        'transfer',
        'stipend',
        'shard_redemption',
        'governance_stake',
        'fee',
        'reward'
    ))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. STIPEND RULES TABLE
-- Purpose: Define rules for automatic stipend distribution
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mic_stipend_rules (
    rule_id VARCHAR(50) PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    amount DECIMAL(18,6) NOT NULL,
    frequency VARCHAR(20) NOT NULL,
    condition_type VARCHAR(50) NOT NULL,
    condition_params JSONB,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT valid_frequency CHECK (frequency IN ('daily', 'per_cycle', 'per_event', 'per_attestation'))
);

-- Insert default stipend rules
INSERT INTO mic_stipend_rules (rule_id, rule_name, amount, frequency, condition_type, condition_params) VALUES
    ('daily_reflection', 'Daily Reflection', 1.0, 'daily', 'eomm_completed', '{"required_score": 0.8}'::jsonb),
    ('cycle_documentation', 'Cycle Documentation', 5.0, 'per_cycle', 'cycle_summary_published', '{}'::jsonb),
    ('shard_redemption', 'Shard Redemption', 10.0, 'per_event', 'shard_set_complete', '{"shards_required": 7}'::jsonb),
    ('governance_vote', 'Governance Vote', 0.5, 'per_event', 'vote_cast', '{}'::jsonb),
    ('guardian_attestation', 'Guardian Attestation', 2.0, 'per_attestation', 'valid_attestation', '{"min_mii": 0.9}'::jsonb)
ON CONFLICT (rule_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. WALLET ACCESS LOG TABLE
-- Purpose: Track all access attempts to wallets (especially reserve)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mic_wallet_access_log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id VARCHAR(50) NOT NULL,
    accessor_id VARCHAR(50) NOT NULL,
    access_type VARCHAR(50) NOT NULL,
    access_granted BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    reason TEXT,
    signatures_provided TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT valid_access_type CHECK (access_type IN ('view', 'transfer', 'unlock', 'audit', 'constitutional_amendment'))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- User wallets indexes
CREATE INDEX IF NOT EXISTS idx_mic_user_wallets_user_id ON mic_user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_mic_user_wallets_balance ON mic_user_wallets(balance);
CREATE INDEX IF NOT EXISTS idx_mic_user_wallets_mii ON mic_user_wallets(current_mii);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_mic_transactions_from_wallet ON mic_transactions(from_wallet);
CREATE INDEX IF NOT EXISTS idx_mic_transactions_to_wallet ON mic_transactions(to_wallet);
CREATE INDEX IF NOT EXISTS idx_mic_transactions_type ON mic_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_mic_transactions_created_at ON mic_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_mic_transactions_cycle ON mic_transactions(cycle_number);

-- Access log indexes
CREATE INDEX IF NOT EXISTS idx_mic_wallet_access_log_wallet_id ON mic_wallet_access_log(wallet_id);
CREATE INDEX IF NOT EXISTS idx_mic_wallet_access_log_created_at ON mic_wallet_access_log(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to prevent modification of founders reserve wallet
CREATE OR REPLACE FUNCTION prevent_reserve_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Only allow updating access_attempts_count and last_audit_timestamp
        IF NEW.balance != OLD.balance OR 
           NEW.locked != OLD.locked OR 
           NEW.wallet_id != OLD.wallet_id OR
           NEW.public_key != OLD.public_key THEN
            RAISE EXCEPTION 'Founders reserve wallet cannot be modified';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Founders reserve wallet cannot be deleted';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reserve protection
DROP TRIGGER IF EXISTS protect_founders_reserve ON founders_reserve_wallet;
CREATE TRIGGER protect_founders_reserve
    BEFORE UPDATE OR DELETE ON founders_reserve_wallet
    FOR EACH ROW
    EXECUTE FUNCTION prevent_reserve_modification();

-- Function to update wallet balance on transaction confirmation
CREATE OR REPLACE FUNCTION update_wallet_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct from sender (if not a mint)
    IF NEW.from_wallet IS NOT NULL THEN
        UPDATE mic_user_wallets 
        SET 
            balance = balance - NEW.amount,
            total_sent = total_sent + NEW.amount,
            transaction_count = transaction_count + 1,
            last_transaction_at = CURRENT_TIMESTAMP
        WHERE wallet_id = NEW.from_wallet;
    END IF;
    
    -- Add to recipient
    UPDATE mic_user_wallets 
    SET 
        balance = balance + NEW.amount,
        total_received = total_received + NEW.amount,
        transaction_count = transaction_count + 1,
        last_transaction_at = CURRENT_TIMESTAMP
    WHERE wallet_id = NEW.to_wallet;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for transactions inserted as already confirmed
DROP TRIGGER IF EXISTS update_balance_on_insert ON mic_transactions;
CREATE TRIGGER update_balance_on_insert
    AFTER INSERT ON mic_transactions
    FOR EACH ROW
    WHEN (NEW.confirmed_at IS NOT NULL)
    EXECUTE FUNCTION update_wallet_balance_on_transaction();

-- Trigger for transactions confirmed via UPDATE (pending -> confirmed)
-- This handles the typical flow where transactions are inserted as pending
-- and later confirmed by setting confirmed_at
DROP TRIGGER IF EXISTS update_balance_on_confirmation ON mic_transactions;
CREATE TRIGGER update_balance_on_confirmation
    AFTER UPDATE OF confirmed_at ON mic_transactions
    FOR EACH ROW
    WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
    EXECUTE FUNCTION update_wallet_balance_on_transaction();

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- System overview view
CREATE OR REPLACE VIEW mic_system_overview AS
SELECT
    (SELECT balance FROM founders_reserve_wallet WHERE wallet_id = 'founders-reserve-001') as reserve_balance,
    (SELECT SUM(balance) FROM mic_user_wallets) as circulating_balance,
    (SELECT COUNT(*) FROM mic_user_wallets) as total_wallets,
    (SELECT COUNT(*) FROM mic_transactions) as total_transactions,
    (SELECT SUM(amount) FROM mic_transactions WHERE transaction_type = 'stipend') as total_stipends_distributed;

-- Wallet summary view
CREATE OR REPLACE VIEW mic_wallet_summary AS
SELECT 
    wallet_id,
    user_id,
    balance,
    current_mii,
    total_received,
    total_sent,
    transaction_count,
    total_shards,
    created_at,
    last_transaction_at
FROM mic_user_wallets
ORDER BY balance DESC;

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════

-- Record migration
INSERT INTO founders_reserve_wallet (
    wallet_id,
    public_key,
    constitutional_note,
    last_audit_timestamp
)
SELECT 
    'founders-reserve-001',
    'FND-RSRV-2025-001-MJUDAN',
    'C-156 Migration: MIC wallet tables created',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM founders_reserve_wallet WHERE wallet_id = 'founders-reserve-001'
);

COMMENT ON TABLE founders_reserve_wallet IS 'Ceremonial wallet with 1M MIC, permanently locked. Created C-156.';
COMMENT ON TABLE mic_user_wallets IS 'Active wallets for system participants. Created C-156.';
COMMENT ON TABLE mic_transactions IS 'Record of all MIC transactions. Created C-156.';
COMMENT ON TABLE mic_stipend_rules IS 'Rules for automatic stipend distribution. Created C-156.';
COMMENT ON TABLE mic_wallet_access_log IS 'Audit trail for wallet access attempts. Created C-156.';
