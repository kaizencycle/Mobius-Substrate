// Sync Engine - Syncs local ledger with remote Civic Ledger
// Cycle: C-151

import { LocalLedger } from './ledger';
import { WalletManager } from './wallet';
import { SyncStatus, SyncResult, LedgerEntry } from './types';
import { 
  SYNC_INTERVAL_MS, 
  SYNC_BATCH_SIZE, 
  SYNC_RETRY_DELAY_MS,
  SYNC_MAX_RETRIES 
} from './constants';

/**
 * SyncEngine - Manages synchronization between local and remote ledger
 */
export class SyncEngine {
  private ledger: LocalLedger;
  private wallet: WalletManager;
  private syncUrl: string;
  private status: SyncStatus;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(params: {
    ledger: LocalLedger;
    wallet: WalletManager;
    syncUrl: string;
  }) {
    this.ledger = params.ledger;
    this.wallet = params.wallet;
    this.syncUrl = params.syncUrl;
    this.status = {
      lastSyncTime: '',
      pendingCount: 0,
      syncState: 'idle'
    };
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    const entries = this.ledger.getEntries({ unsynced: true });
    this.status.pendingCount = entries.length;
    return { ...this.status };
  }

  /**
   * Start automatic sync loop
   */
  start(intervalMs: number = SYNC_INTERVAL_MS): void {
    if (this.isRunning) {
      console.log('[SyncEngine] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[SyncEngine] Starting sync loop (interval: ${intervalMs}ms)`);

    // Initial sync
    this.sync().catch(console.error);

    // Set up interval
    this.syncInterval = setInterval(() => {
      this.sync().catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop automatic sync loop
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('[SyncEngine] Stopped');
  }

  /**
   * Perform a single sync operation
   */
  async sync(): Promise<SyncResult> {
    if (this.status.syncState === 'syncing') {
      return {
        success: false,
        entriesPushed: 0,
        entriesPulled: 0,
        error: 'Sync already in progress'
      };
    }

    this.status.syncState = 'syncing';
    console.log('[SyncEngine] Starting sync...');

    try {
      // 1. Push local entries
      const pushed = await this.pushEntries();

      // 2. Pull remote entries
      const pulled = await this.pullEntries();

      // 3. Update balance from remote
      const balance = await this.fetchRemoteBalance();

      this.status.syncState = 'idle';
      this.status.lastSyncTime = new Date().toISOString();
      this.status.errorMessage = undefined;

      console.log(`[SyncEngine] Sync complete: pushed=${pushed}, pulled=${pulled}`);

      return {
        success: true,
        entriesPushed: pushed,
        entriesPulled: pulled,
        newBalance: balance
      };
    } catch (error) {
      this.status.syncState = 'error';
      this.status.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('[SyncEngine] Sync failed:', error);

      return {
        success: false,
        entriesPushed: 0,
        entriesPulled: 0,
        error: this.status.errorMessage
      };
    }
  }

  /**
   * Push unsynced local entries to remote
   */
  private async pushEntries(): Promise<number> {
    const unsyncedEntries = this.ledger.getEntries({ 
      unsynced: true, 
      limit: SYNC_BATCH_SIZE 
    });

    if (unsyncedEntries.length === 0) {
      return 0;
    }

    console.log(`[SyncEngine] Pushing ${unsyncedEntries.length} entries...`);

    let retries = 0;
    while (retries < SYNC_MAX_RETRIES) {
      try {
        // In production: Make actual HTTP request
        // const response = await fetch(`${this.syncUrl}/v1/local/ledger/push`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ entries: unsyncedEntries })
        // });

        // Simulate successful push
        await this.simulateNetworkDelay();

        // Mark entries as synced
        const entryIds = unsyncedEntries.map(e => e.id);
        this.ledger.markSynced(entryIds);

        // Update last synced entry
        if (unsyncedEntries.length > 0) {
          this.status.lastSyncedEntryId = unsyncedEntries[unsyncedEntries.length - 1].id;
        }

        return unsyncedEntries.length;
      } catch (error) {
        retries++;
        if (retries < SYNC_MAX_RETRIES) {
          console.log(`[SyncEngine] Push retry ${retries}/${SYNC_MAX_RETRIES}...`);
          await this.delay(SYNC_RETRY_DELAY_MS);
        }
      }
    }

    throw new Error('Failed to push entries after retries');
  }

  /**
   * Pull new entries from remote
   */
  private async pullEntries(): Promise<number> {
    console.log('[SyncEngine] Pulling remote entries...');

    try {
      // In production: Make actual HTTP request
      // const response = await fetch(`${this.syncUrl}/v1/local/ledger/pull?after=${this.status.lastSyncedEntryId}`);
      // const { entries } = await response.json();

      // Simulate empty pull (no new remote entries)
      await this.simulateNetworkDelay();
      const entries: LedgerEntry[] = [];

      // In production: Add pulled entries to local ledger
      // for (const entry of entries) {
      //   // Add to local ledger if not already present
      // }

      return entries.length;
    } catch (error) {
      console.error('[SyncEngine] Pull failed:', error);
      return 0;
    }
  }

  /**
   * Fetch remote balance
   */
  private async fetchRemoteBalance(): Promise<{ mic: number; ks: number } | undefined> {
    try {
      const wallet = this.wallet.getWallet();
      if (!wallet) return undefined;

      // In production: Make actual HTTP request
      // const response = await fetch(`${this.syncUrl}/v1/mic/balance/${wallet.actorId}`);
      // const { mic, ks } = await response.json();

      // Simulate response with local balance
      await this.simulateNetworkDelay();
      const balance = this.ledger.getBalance();

      return balance;
    } catch (error) {
      console.error('[SyncEngine] Balance fetch failed:', error);
      return undefined;
    }
  }

  /**
   * Calculate hash of local ledger state (for verification)
   */
  calculateStateHash(): string {
    const entries = this.ledger.getEntries();
    const stateString = entries.map(e => `${e.id}:${e.mic}:${e.ks}`).join('|');
    
    // Simple hash (in production: use proper cryptographic hash)
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Verify local ledger against remote
   */
  async verify(): Promise<{ valid: boolean; localHash: string; remoteHash?: string }> {
    const localHash = this.calculateStateHash();

    try {
      // In production: Fetch remote hash and compare
      // const response = await fetch(`${this.syncUrl}/v1/local/ledger/verify`);
      // const { hash: remoteHash } = await response.json();

      await this.simulateNetworkDelay();
      const remoteHash = localHash; // Simulate match

      return {
        valid: localHash === remoteHash,
        localHash,
        remoteHash
      };
    } catch (error) {
      return {
        valid: false,
        localHash,
        remoteHash: undefined
      };
    }
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private simulateNetworkDelay(): Promise<void> {
    return this.delay(50 + Math.random() * 100);
  }
}
