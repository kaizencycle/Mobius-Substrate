// Wallet Manager - Local wallet for MIC/KS
// Cycle: C-151

import { Wallet, Keypair } from './types';
import { KS_PER_MIC } from './constants';

// Polyfill for crypto (browser/Node compatibility)
const getRandomBytes = (size: number): Uint8Array => {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto.getRandomValues(new Uint8Array(size));
  }
  // Node.js fallback
  const { randomBytes } = require('crypto');
  return new Uint8Array(randomBytes(size));
};

/**
 * Generate a new Ed25519 keypair
 */
function generateKeypair(): Keypair {
  // Simplified keypair generation
  // In production: use tweetnacl.sign.keyPair()
  const seed = getRandomBytes(32);
  return {
    publicKey: seed.slice(0, 32),
    secretKey: seed
  };
}

/**
 * Convert Uint8Array to hex string
 */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a unique wallet ID
 */
function generateWalletId(): string {
  return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * WalletManager - Manages local MIC/KS wallet
 */
export class WalletManager {
  private wallet: Wallet | null = null;
  private keypair: Keypair | null = null;

  /**
   * Create a new wallet
   */
  createWallet(actorId: string): Wallet {
    this.keypair = generateKeypair();
    
    this.wallet = {
      walletId: generateWalletId(),
      actorId,
      micBalance: 0,
      ksBalance: 0,
      pendingMic: 0,
      pendingKs: 0,
      publicKey: toHex(this.keypair.publicKey),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    return this.wallet;
  }

  /**
   * Load wallet from storage
   */
  loadWallet(walletData: Wallet, keypairData?: Keypair): void {
    this.wallet = walletData;
    if (keypairData) {
      this.keypair = keypairData;
    }
  }

  /**
   * Get current wallet state
   */
  getWallet(): Wallet | null {
    return this.wallet;
  }

  /**
   * Get public key
   */
  getPublicKey(): string | null {
    return this.wallet?.publicKey || null;
  }

  /**
   * Get balance
   */
  getBalance(): { mic: number; ks: number } {
    if (!this.wallet) {
      return { mic: 0, ks: 0 };
    }
    return {
      mic: this.wallet.micBalance,
      ks: this.wallet.ksBalance
    };
  }

  /**
   * Get pending balance (unconfirmed)
   */
  getPendingBalance(): { mic: number; ks: number } {
    if (!this.wallet) {
      return { mic: 0, ks: 0 };
    }
    return {
      mic: this.wallet.pendingMic,
      ks: this.wallet.pendingKs
    };
  }

  /**
   * Add to balance (after mint confirmation)
   */
  addBalance(mic: number): void {
    if (!this.wallet) return;
    
    this.wallet.micBalance += mic;
    this.wallet.ksBalance = Math.round(this.wallet.micBalance * KS_PER_MIC);
    this.wallet.lastUpdated = new Date().toISOString();
  }

  /**
   * Subtract from balance (after transfer or burn)
   */
  subtractBalance(mic: number): boolean {
    if (!this.wallet) return false;
    
    if (this.wallet.micBalance < mic) {
      return false;
    }

    this.wallet.micBalance -= mic;
    this.wallet.ksBalance = Math.round(this.wallet.micBalance * KS_PER_MIC);
    this.wallet.lastUpdated = new Date().toISOString();
    return true;
  }

  /**
   * Add pending balance (unconfirmed transaction)
   */
  addPending(mic: number): void {
    if (!this.wallet) return;
    
    this.wallet.pendingMic += mic;
    this.wallet.pendingKs = Math.round(this.wallet.pendingMic * KS_PER_MIC);
    this.wallet.lastUpdated = new Date().toISOString();
  }

  /**
   * Confirm pending (move to confirmed balance)
   */
  confirmPending(mic: number): void {
    if (!this.wallet) return;
    
    const confirmAmount = Math.min(mic, this.wallet.pendingMic);
    this.wallet.pendingMic -= confirmAmount;
    this.wallet.pendingKs = Math.round(this.wallet.pendingMic * KS_PER_MIC);
    this.wallet.micBalance += confirmAmount;
    this.wallet.ksBalance = Math.round(this.wallet.micBalance * KS_PER_MIC);
    this.wallet.lastUpdated = new Date().toISOString();
  }

  /**
   * Sign a message with the wallet's secret key
   */
  sign(message: string): string | null {
    if (!this.keypair) return null;
    
    // Simplified signing - in production use tweetnacl.sign.detached
    const encoder = new TextEncoder();
    const messageBytes = encoder.encode(message);
    
    // Combine secret key with message for a simple signature
    // In production: use proper Ed25519 signing
    const combined = new Uint8Array(this.keypair.secretKey.length + messageBytes.length);
    combined.set(this.keypair.secretKey);
    combined.set(messageBytes, this.keypair.secretKey.length);
    
    return toHex(combined.slice(0, 64));
  }

  /**
   * Export wallet to JSON (for backup)
   */
  exportWallet(): { wallet: Wallet; keypair?: { publicKey: string; secretKey: string } } | null {
    if (!this.wallet) return null;
    
    const result: { wallet: Wallet; keypair?: { publicKey: string; secretKey: string } } = {
      wallet: { ...this.wallet }
    };

    if (this.keypair) {
      result.keypair = {
        publicKey: toHex(this.keypair.publicKey),
        secretKey: toHex(this.keypair.secretKey)
      };
    }

    return result;
  }

  /**
   * Get wallet summary for display
   */
  getSummary(): {
    walletId: string;
    actorId: string;
    balance: string;
    balanceKs: string;
    pending: string;
    publicKey: string;
    lastUpdated: string;
  } | null {
    if (!this.wallet) return null;

    return {
      walletId: this.wallet.walletId,
      actorId: this.wallet.actorId,
      balance: `${this.wallet.micBalance.toFixed(6)} MIC`,
      balanceKs: `${this.wallet.ksBalance.toLocaleString()} KS`,
      pending: `${this.wallet.pendingMic.toFixed(6)} MIC`,
      publicKey: this.wallet.publicKey.substring(0, 16) + '...',
      lastUpdated: this.wallet.lastUpdated
    };
  }
}
