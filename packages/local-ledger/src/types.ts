// Local Ledger Types
// Cycle: C-151

export interface LedgerEntry {
  id: string;
  timestamp: string;
  actorId: string;
  action: LedgerAction;
  mic: number;
  ks: number;
  mii?: number;
  metadata?: Record<string, unknown>;
  signature?: string;
  synced: boolean;
}

export type LedgerAction = 
  | 'mint'
  | 'burn'
  | 'transfer'
  | 'reflection'
  | 'shield_check'
  | 'sentinel_approval'
  | 'civic_action'
  | 'guardian_action';

export interface Wallet {
  walletId: string;
  actorId: string;
  micBalance: number;
  ksBalance: number;
  pendingMic: number;
  pendingKs: number;
  publicKey: string;
  createdAt: string;
  lastUpdated: string;
}

export interface Keypair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface Reflection {
  id: string;
  timestamp: string;
  content: string;
  mii: number;
  shardType: ShardType;
  micEarned: number;
  ksEarned: number;
  synced: boolean;
}

export type ShardType =
  | 'reflection'
  | 'learning'
  | 'civic'
  | 'stability'
  | 'stewardship'
  | 'innovation'
  | 'guardian';

export interface SyncStatus {
  lastSyncTime: string;
  lastSyncedEntryId?: string;
  pendingCount: number;
  syncState: 'idle' | 'syncing' | 'error';
  errorMessage?: string;
}

export interface MIIComponents {
  memory: number;    // M - Test coverage, documentation
  human: number;     // H - Human review indicators
  integrity: number; // I - Security, no violations
  ethics: number;    // E - Charter compliance
}

export interface MIIScore {
  score: number;
  components: MIIComponents;
  aboveThreshold: boolean;
  calculatedAt: string;
}

export interface LocalNodeConfig {
  dataDir: string;
  syncUrl?: string;
  syncEnabled: boolean;
  syncIntervalMs: number;
  autoMint: boolean;
}

export interface SyncResult {
  success: boolean;
  entriesPushed: number;
  entriesPulled: number;
  newBalance?: { mic: number; ks: number };
  error?: string;
}
