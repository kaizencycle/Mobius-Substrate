/**
 * @fileoverview Sentinel Registry - Agent Discovery and Management
 * @description Provides utilities for discovering, registering, and managing sentinels
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface SentinelInfo {
  agent: string;
  role: string;
  version: string;
  status: 'active' | 'inactive' | 'pending' | 'deprecated' | 'maintenance';
  provider?: string;
  path: string;
  hasCodex: boolean;
  hasManifest: boolean;
  lastSeen?: Date;
  endpoint?: string;
}

export interface RegistryConfig {
  rootPath: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
}

// ============================================================================
// Registry Class
// ============================================================================

export class SentinelRegistry {
  private sentinels: Map<string, SentinelInfo> = new Map();
  private config: RegistryConfig;
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: RegistryConfig) {
    this.config = {
      refreshInterval: 60000, // 1 minute default
      autoRefresh: false,
      ...config,
    };
  }

  /**
   * Initialize the registry by discovering all sentinels
   */
  async initialize(): Promise<void> {
    await this.refresh();

    if (this.config.autoRefresh && this.config.refreshInterval) {
      this.startAutoRefresh();
    }
  }

  /**
   * Refresh the registry by re-scanning the sentinels directory
   */
  async refresh(): Promise<void> {
    const sentinelsPath = this.config.rootPath;
    
    if (!fs.existsSync(sentinelsPath)) {
      throw new Error(`Sentinels root path does not exist: ${sentinelsPath}`);
    }

    const entries = fs.readdirSync(sentinelsPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        const sentinelPath = path.join(sentinelsPath, entry.name);
        const manifestPath = path.join(sentinelPath, 'manifest.json');
        const codexPath = path.join(sentinelPath, 'CODEX.md');

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            const info: SentinelInfo = {
              agent: manifest.agent || entry.name.toUpperCase(),
              role: manifest.role || 'Unknown',
              version: manifest.version || '0.0.0',
              status: manifest.status || 'inactive',
              provider: manifest.provider,
              path: sentinelPath,
              hasCodex: fs.existsSync(codexPath),
              hasManifest: true,
              lastSeen: new Date(),
            };
            this.sentinels.set(info.agent, info);
          } catch (e) {
            console.error(`Failed to load manifest for ${entry.name}:`, e);
          }
        }
      }
    }
  }

  /**
   * Start auto-refresh timer
   */
  private startAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    this.refreshTimer = setInterval(() => this.refresh(), this.config.refreshInterval);
  }

  /**
   * Stop auto-refresh timer
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  /**
   * Get all registered sentinels
   */
  getAll(): SentinelInfo[] {
    return Array.from(this.sentinels.values());
  }

  /**
   * Get a specific sentinel by agent name
   */
  get(agent: string): SentinelInfo | undefined {
    return this.sentinels.get(agent.toUpperCase());
  }

  /**
   * Get active sentinels only
   */
  getActive(): SentinelInfo[] {
    return this.getAll().filter(s => s.status === 'active');
  }

  /**
   * Get sentinels by status
   */
  getByStatus(status: SentinelInfo['status']): SentinelInfo[] {
    return this.getAll().filter(s => s.status === status);
  }

  /**
   * Get sentinels with CODEX documentation
   */
  getWithCodex(): SentinelInfo[] {
    return this.getAll().filter(s => s.hasCodex);
  }

  /**
   * Check if a sentinel is registered
   */
  has(agent: string): boolean {
    return this.sentinels.has(agent.toUpperCase());
  }

  /**
   * Register or update a sentinel endpoint
   */
  registerEndpoint(agent: string, endpoint: string): void {
    const info = this.sentinels.get(agent.toUpperCase());
    if (info) {
      info.endpoint = endpoint;
      info.lastSeen = new Date();
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number;
    active: number;
    withCodex: number;
    withEndpoint: number;
  } {
    const all = this.getAll();
    return {
      total: all.length,
      active: all.filter(s => s.status === 'active').length,
      withCodex: all.filter(s => s.hasCodex).length,
      withEndpoint: all.filter(s => !!s.endpoint).length,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let defaultRegistry: SentinelRegistry | null = null;

/**
 * Get or create the default sentinel registry
 */
export function getSentinelRegistry(config?: Partial<RegistryConfig>): SentinelRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new SentinelRegistry({
      rootPath: config?.rootPath || path.join(__dirname, '..'),
      ...config,
    });
  }
  return defaultRegistry;
}

/**
 * Initialize the default registry
 */
export async function initializeRegistry(config?: Partial<RegistryConfig>): Promise<SentinelRegistry> {
  const registry = getSentinelRegistry(config);
  await registry.initialize();
  return registry;
}
