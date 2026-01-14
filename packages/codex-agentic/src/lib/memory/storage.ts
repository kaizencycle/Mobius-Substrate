/**
 * Memory Storage Adapter
 * File-based storage for agent memories with query capabilities
 * Phase 2: Agent Memory & Learning Persistence
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  MemoryEntry,
  MemorySession,
  MemoryQuery,
  MemoryRetrievalResult,
  FoundingAgent,
} from '../../types';

/**
 * Storage configuration
 */
interface StorageConfig {
  baseDir: string;
  autoFlush: boolean;
  flushIntervalMs: number;
}

/**
 * In-memory cache for fast queries
 */
interface MemoryCache {
  entries: Map<string, MemoryEntry>;
  sessions: Map<string, MemorySession>;
  dirty: boolean;
  lastFlush: number;
}

/**
 * Memory storage class
 * Provides persistent storage with in-memory caching
 */
export class MemoryStorage {
  private config: StorageConfig;
  private cache: MemoryCache;
  private flushTimer?: NodeJS.Timeout;

  constructor(baseDir?: string) {
    this.config = {
      baseDir: baseDir || process.env.MEMORY_STORAGE_DIR || './.codex-memory',
      autoFlush: true,
      flushIntervalMs: 30000, // Flush every 30 seconds
    };

    this.cache = {
      entries: new Map(),
      sessions: new Map(),
      dirty: false,
      lastFlush: Date.now(),
    };
  }

  /**
   * Initialize storage (create directories, load existing data)
   */
  async initialize(): Promise<void> {
    // Create base directory
    await fs.mkdir(this.config.baseDir, { recursive: true });
    await fs.mkdir(path.join(this.config.baseDir, 'entries'), { recursive: true });
    await fs.mkdir(path.join(this.config.baseDir, 'sessions'), { recursive: true });

    // Load existing data
    await this.loadFromDisk();

    // Start auto-flush timer
    if (this.config.autoFlush) {
      this.startAutoFlush();
    }

    console.log(`[Memory] Storage initialized at ${this.config.baseDir}`);
  }

  /**
   * Store a memory entry
   */
  async storeEntry(entry: MemoryEntry): Promise<void> {
    this.cache.entries.set(entry.traceId, entry);
    this.cache.dirty = true;

    // Update session if provided
    if (entry.sessionId) {
      await this.updateSession(entry);
    }

    // Immediate flush for critical entries (low GI)
    if (entry.giScore < 0.95) {
      await this.flush();
    }
  }

  /**
   * Retrieve a memory entry by traceId
   */
  async getEntry(traceId: string): Promise<MemoryEntry | undefined> {
    return this.cache.entries.get(traceId);
  }

  /**
   * Query memories with filters
   */
  async query(query: MemoryQuery): Promise<MemoryRetrievalResult> {
    let entries = Array.from(this.cache.entries.values());

    // Apply filters
    if (query.agent) {
      entries = entries.filter((e) => e.agent === query.agent);
    }

    if (query.sessionId) {
      entries = entries.filter((e) => e.sessionId === query.sessionId);
    }

    if (query.tags && query.tags.length > 0) {
      entries = entries.filter((e) =>
        e.tags?.some((tag) => query.tags?.includes(tag))
      );
    }

    if (query.minAgreement !== undefined) {
      entries = entries.filter((e) => e.agreement >= query.minAgreement!);
    }

    if (query.maxAgreement !== undefined) {
      entries = entries.filter((e) => e.agreement <= query.maxAgreement!);
    }

    if (query.minGI !== undefined) {
      entries = entries.filter((e) => e.giScore >= query.minGI!);
    }

    if (query.maxGI !== undefined) {
      entries = entries.filter((e) => e.giScore <= query.maxGI!);
    }

    if (query.startTime) {
      entries = entries.filter((e) => e.timestamp >= query.startTime!);
    }

    if (query.endTime) {
      entries = entries.filter((e) => e.timestamp <= query.endTime!);
    }

    if (query.successOnly) {
      entries = entries.filter((e) => e.success);
    }

    // Sort
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';

    entries.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortBy) {
        case 'agreement':
          aVal = a.agreement;
          bVal = b.agreement;
          break;
        case 'giScore':
          aVal = a.giScore;
          bVal = b.giScore;
          break;
        default:
          aVal = a.timestamp;
          bVal = b.timestamp;
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    // Pagination
    const total = entries.length;
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    entries = entries.slice(offset, offset + limit);

    return {
      entries,
      total,
      query,
    };
  }

  /**
   * Get or create a session
   */
  async getSession(sessionId: string): Promise<MemorySession | undefined> {
    return this.cache.sessions.get(sessionId);
  }

  /**
   * Create a new session
   */
  async createSession(
    sessionId: string,
    agent: FoundingAgent,
    tags?: string[]
  ): Promise<MemorySession> {
    const session: MemorySession = {
      sessionId,
      agent,
      startTime: new Date().toISOString(),
      deliberationCount: 0,
      averageAgreement: 0,
      averageGI: 0,
      tags,
    };

    this.cache.sessions.set(sessionId, session);
    this.cache.dirty = true;

    return session;
  }

  /**
   * Update session with new deliberation
   */
  private async updateSession(entry: MemoryEntry): Promise<void> {
    if (!entry.sessionId) return;

    let session = this.cache.sessions.get(entry.sessionId);

    if (!session) {
      session = await this.createSession(entry.sessionId, entry.agent, entry.tags);
    }

    // Update metrics
    const newCount = session.deliberationCount + 1;
    session.averageAgreement =
      (session.averageAgreement * session.deliberationCount + entry.agreement) /
      newCount;
    session.averageGI =
      (session.averageGI * session.deliberationCount + entry.giScore) / newCount;
    session.deliberationCount = newCount;

    this.cache.sessions.set(entry.sessionId, session);
    this.cache.dirty = true;
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.cache.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date().toISOString();
      this.cache.sessions.set(sessionId, session);
      this.cache.dirty = true;
      await this.flush();
    }
  }

  /**
   * Get all sessions for an agent
   */
  async getAgentSessions(agent: FoundingAgent): Promise<MemorySession[]> {
    return Array.from(this.cache.sessions.values()).filter(
      (s) => s.agent === agent
    );
  }

  /**
   * Flush cache to disk
   */
  async flush(): Promise<void> {
    if (!this.cache.dirty) return;

    try {
      // Group entries by agent for efficient storage
      const entriesByAgent = new Map<FoundingAgent, MemoryEntry[]>();

      for (const entry of this.cache.entries.values()) {
        if (!entriesByAgent.has(entry.agent)) {
          entriesByAgent.set(entry.agent, []);
        }
        entriesByAgent.get(entry.agent)!.push(entry);
      }

      // Write entries for each agent (parallelized)
      await Promise.all(
        Array.from(entriesByAgent).map(([agent, entries]) =>
          fs.writeFile(
            path.join(this.config.baseDir, 'entries', `${agent}.json`),
            JSON.stringify(entries, null, 2)
          )
        )
      );

      // Write sessions
      const sessions = Array.from(this.cache.sessions.values());
      const sessionsPath = path.join(this.config.baseDir, 'sessions', 'all.json');
      await fs.writeFile(sessionsPath, JSON.stringify(sessions, null, 2));

      this.cache.dirty = false;
      this.cache.lastFlush = Date.now();

      console.log(
        `[Memory] Flushed ${this.cache.entries.size} entries and ${this.cache.sessions.size} sessions`
      );
    } catch (error) {
      console.error('[Memory] Flush failed:', error);
      throw error;
    }
  }

  /**
   * Load data from disk
   */
  private async loadFromDisk(): Promise<void> {
    try {
      // Load entries
      const entriesDir = path.join(this.config.baseDir, 'entries');
      const entryFiles = await fs.readdir(entriesDir).catch(() => []);

      // Parallelize file reads for better performance
      const allEntries = await Promise.all(
        entryFiles
          .filter((file: string) => file.endsWith('.json'))
          .map((file: string) =>
            fs.readFile(path.join(entriesDir, file), 'utf-8')
              .then((content: string) => JSON.parse(content) as MemoryEntry[])
          )
      );

      // Populate cache with all loaded entries
      for (const entries of allEntries) {
        for (const entry of entries) {
          this.cache.entries.set(entry.traceId, entry);
        }
      }

      // Load sessions
      const sessionsPath = path.join(this.config.baseDir, 'sessions', 'all.json');
      const sessionsContent = await fs.readFile(sessionsPath, 'utf-8').catch(() => '[]');
      const sessions: MemorySession[] = JSON.parse(sessionsContent);

      for (const session of sessions) {
        this.cache.sessions.set(session.sessionId, session);
      }

      console.log(
        `[Memory] Loaded ${this.cache.entries.size} entries and ${this.cache.sessions.size} sessions from disk`
      );
    } catch (error) {
      console.warn('[Memory] Load from disk failed (may be first run):', error);
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.cache.dirty) {
        this.flush().catch((err) =>
          console.error('[Memory] Auto-flush failed:', err)
        );
      }
    }, this.config.flushIntervalMs);
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Cleanup and flush on shutdown
   */
  async shutdown(): Promise<void> {
    this.stopAutoFlush();
    await this.flush();
    console.log('[Memory] Storage shutdown complete');
  }

  /**
   * Get storage statistics
   */
  getStats() {
    return {
      totalEntries: this.cache.entries.size,
      totalSessions: this.cache.sessions.size,
      dirty: this.cache.dirty,
      lastFlush: new Date(this.cache.lastFlush).toISOString(),
      baseDir: this.config.baseDir,
    };
  }
}

/**
 * Singleton instance
 */
let storageInstance: MemoryStorage | undefined;

/**
 * Get the global memory storage instance
 */
export async function getMemoryStorage(): Promise<MemoryStorage> {
  if (!storageInstance) {
    storageInstance = new MemoryStorage();
    await storageInstance.initialize();
  }
  return storageInstance;
}

/**
 * Shutdown the global storage instance
 */
export async function shutdownMemoryStorage(): Promise<void> {
  if (storageInstance) {
    await storageInstance.shutdown();
    storageInstance = undefined;
  }
}
