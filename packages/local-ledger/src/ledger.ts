// Local Ledger - SQLite-based local integrity ledger
// Cycle: C-151

import { 
  LedgerEntry, 
  LedgerAction, 
  MIIScore, 
  MIIComponents 
} from './types';
import { 
  KS_PER_MIC, 
  MII_THRESHOLD, 
  MINT_COEFFICIENT, 
  BURN_COEFFICIENT,
  SCHEMA_VERSION 
} from './constants';

// Utility functions
function generateId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function micToKS(mic: number): number {
  return Math.round(mic * KS_PER_MIC);
}

function ksToMIC(ks: number): number {
  return ks / KS_PER_MIC;
}

/**
 * LocalLedger - SQLite-based local ledger for integrity tracking
 * Stores all MIC/KS transactions and reflections locally
 */
export class LocalLedger {
  private entries: Map<string, LedgerEntry> = new Map();
  private actorId: string;
  private balance: { mic: number; ks: number } = { mic: 0, ks: 0 };

  constructor(actorId: string) {
    this.actorId = actorId;
  }

  /**
   * Initialize the ledger (in production, this opens SQLite)
   */
  async init(): Promise<void> {
    // In production: Open SQLite database and create tables
    console.log(`[LocalLedger] Initialized for actor: ${this.actorId}`);
  }

  /**
   * Get current MIC/KS balance
   */
  getBalance(): { mic: number; ks: number } {
    return { ...this.balance };
  }

  /**
   * Mint MIC based on MII score and action
   */
  mint(params: {
    action: LedgerAction;
    mii: number;
    shardValue?: number;
    metadata?: Record<string, unknown>;
  }): LedgerEntry | null {
    const { action, mii, shardValue = 1.0, metadata } = params;

    // Check MII threshold
    if (mii < MII_THRESHOLD) {
      console.log(`[LocalLedger] MII ${mii} below threshold ${MII_THRESHOLD}, no mint`);
      return null;
    }

    // Calculate MIC: α × max(0, MII - τ) × ShardValue
    const delta = Math.max(0, mii - MII_THRESHOLD);
    const mic = MINT_COEFFICIENT * delta * shardValue;
    const ks = micToKS(mic);

    // Create entry
    const entry: LedgerEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      actorId: this.actorId,
      action,
      mic,
      ks,
      mii,
      metadata,
      synced: false
    };

    // Store entry
    this.entries.set(entry.id, entry);

    // Update balance
    this.balance.mic += mic;
    this.balance.ks += ks;

    console.log(`[LocalLedger] Minted ${mic.toFixed(6)} MIC (${ks} KS)`);
    return entry;
  }

  /**
   * Burn MIC due to integrity violation
   */
  burn(params: {
    reason: string;
    severity: number;
    metadata?: Record<string, unknown>;
  }): LedgerEntry | null {
    const { reason, severity, metadata } = params;

    // Calculate burn: Severity × β
    const mic = severity * BURN_COEFFICIENT;
    const ks = micToKS(mic);

    // Check sufficient balance
    if (this.balance.mic < mic) {
      console.log(`[LocalLedger] Insufficient balance for burn`);
      return null;
    }

    // Create entry
    const entry: LedgerEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      actorId: this.actorId,
      action: 'burn',
      mic: -mic,
      ks: -ks,
      metadata: { reason, severity, ...metadata },
      synced: false
    };

    // Store entry
    this.entries.set(entry.id, entry);

    // Update balance
    this.balance.mic -= mic;
    this.balance.ks -= ks;

    console.log(`[LocalLedger] Burned ${mic.toFixed(6)} MIC (${ks} KS)`);
    return entry;
  }

  /**
   * Record a reflection and mint MIC if eligible
   */
  recordReflection(params: {
    content: string;
    quality: number; // 0.0 - 1.0
    mii: number;
  }): LedgerEntry | null {
    const { content, quality, mii } = params;
    
    // Quality affects shard value (0.5 - 1.5 range)
    const shardValue = 0.5 + quality;

    return this.mint({
      action: 'reflection',
      mii,
      shardValue,
      metadata: { 
        contentPreview: content.substring(0, 100),
        quality 
      }
    });
  }

  /**
   * Get all entries (for sync)
   */
  getEntries(options?: {
    unsynced?: boolean;
    limit?: number;
    afterId?: string;
  }): LedgerEntry[] {
    let entries = Array.from(this.entries.values());

    if (options?.unsynced) {
      entries = entries.filter(e => !e.synced);
    }

    if (options?.afterId) {
      const afterIndex = entries.findIndex(e => e.id === options.afterId);
      if (afterIndex >= 0) {
        entries = entries.slice(afterIndex + 1);
      }
    }

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Mark entries as synced
   */
  markSynced(entryIds: string[]): void {
    for (const id of entryIds) {
      const entry = this.entries.get(id);
      if (entry) {
        entry.synced = true;
      }
    }
  }

  /**
   * Calculate local MII score
   */
  calculateMII(): MIIScore {
    const entries = this.getEntries();
    
    // Simple calculation based on recent activity
    const recentEntries = entries.slice(-30);
    const burnCount = recentEntries.filter(e => e.action === 'burn').length;
    const mintCount = recentEntries.filter(e => e.action !== 'burn').length;

    // Components (simplified)
    const components: MIIComponents = {
      memory: Math.min(1.0, 0.9 + (mintCount * 0.01)),
      human: 0.95,
      integrity: Math.max(0.8, 1.0 - (burnCount * 0.05)),
      ethics: 0.96
    };

    // MII = 0.25*M + 0.20*H + 0.30*I + 0.25*E
    const score = 
      0.25 * components.memory +
      0.20 * components.human +
      0.30 * components.integrity +
      0.25 * components.ethics;

    return {
      score: Math.min(1.0, Math.max(0.0, score)),
      components,
      aboveThreshold: score >= MII_THRESHOLD,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Get ledger statistics
   */
  getStats(): {
    totalEntries: number;
    totalMinted: number;
    totalBurned: number;
    unsyncedCount: number;
    currentBalance: { mic: number; ks: number };
  } {
    const entries = this.getEntries();
    
    let totalMinted = 0;
    let totalBurned = 0;
    let unsyncedCount = 0;

    for (const entry of entries) {
      if (entry.action === 'burn') {
        totalBurned += Math.abs(entry.mic);
      } else {
        totalMinted += entry.mic;
      }
      if (!entry.synced) {
        unsyncedCount++;
      }
    }

    return {
      totalEntries: entries.length,
      totalMinted,
      totalBurned,
      unsyncedCount,
      currentBalance: this.getBalance()
    };
  }

  /**
   * Close the ledger (cleanup)
   */
  async close(): Promise<void> {
    // In production: Close SQLite connection
    console.log(`[LocalLedger] Closed for actor: ${this.actorId}`);
  }
}
