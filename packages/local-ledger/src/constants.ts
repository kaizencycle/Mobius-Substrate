// Local Ledger Constants
// Cycle: C-151

// MIC/KS Denomination
export const KS_PER_MIC = 1_000_000;
export const MIC_DECIMALS = 6;

// MII Thresholds
export const MII_THRESHOLD = 0.95;
export const MII_MIN = 0.0;
export const MII_MAX = 1.0;

// Minting Coefficients
export const MINT_COEFFICIENT = 1.0;
export const BURN_COEFFICIENT = 0.05;

// Sync Settings
export const SYNC_INTERVAL_MS = 10_000; // 10 seconds
export const SYNC_BATCH_SIZE = 100;
export const SYNC_RETRY_DELAY_MS = 5_000;
export const SYNC_MAX_RETRIES = 3;

// Storage Paths (relative to home directory)
export const LOCAL_DATA_DIR = '.mobius';
export const LEDGER_DB_NAME = 'ledger.sqlite';
export const WALLET_FILE_NAME = 'wallet.json';
export const REFLECTIONS_FILE_NAME = 'reflections.json';
export const KEYPAIR_FILE_NAME = 'keypair.ed25519';

// Schema Version
export const SCHEMA_VERSION = 1;
