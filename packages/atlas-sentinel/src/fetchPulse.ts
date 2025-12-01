/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║ Mobius Pulse Fetcher                                             ║
 * ║ Sentinel-side helper for fetching and analyzing repo pulses      ║
 * ║                                                                   ║
 * ║ Usage:                                                           ║
 * ║   const fetcher = new PulseFetcher({ baseUrl: 'http://...' });  ║
 * ║   const pulse = await fetcher.fetchLatest();                    ║
 * ║   const analysis = fetcher.analyzePulse(pulse);                 ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────
// Types (aligned with packages/integrity-core/src/pulse/mobiusPulse.ts)
// ─────────────────────────────────────────────────────────────────────

export interface MobiusPulseCommit {
  hash?: string;
  short?: string;
  date?: string;
  subject?: string;
}

export interface MobiusPulse {
  pulseVersion: string;
  repo: {
    root: string;
    name?: string;
    head: string;
    branch?: string;
    remoteUrl?: string;
    trackedFiles: number;
    branchesCount: number;
    packagesCount?: number;
    appsCount?: number;
    latestTag?: string;
    tagsCount?: number;
  };
  meta: {
    timestamp: string;
    sentinelHint?: string;
    cycleLabel?: string | null;
    miiEstimate?: string | null;
    sourceTag?: string;
  };
  git: {
    head: string;
    branch?: string;
    recentCommits: MobiusPulseCommit[];
    changedFiles: string[];
    stagedFiles?: string[];
  };
  structure: {
    dirTree: string;
    workflows: string[];
    sentinelFiles?: string[];
  };
  buildGraph: {
    turboDryRun: string;
  };
}

export interface PulseResponse {
  id: string;
  receivedAt: string;
  cycleLabel: string | null;
  miiEstimate: number | null;
  headCommit: string;
  branchName: string | null;
  pulseVersion: string;
  sourceTag: string;
  summary?: {
    trackedFiles: number;
    changedFiles: number;
    recentCommits: number;
    workflows: number;
  };
  payload: MobiusPulse;
}

export interface PulseHistoryResponse {
  pulses: Array<Omit<PulseResponse, "payload">>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface PulseStatsResponse {
  totalPulses: number;
  latestCycle: string | null;
  latestHead: string;
  latestReceivedAt: string;
  averageMii: number | null;
  minMii: number | null;
  maxMii: number | null;
  sourceBreakdown: Record<string, number>;
  uniqueCycles: number;
  cycleBreakdown: Record<string, number>;
}

export interface PulseFetcherConfig {
  /** Base URL for the indexer API (e.g., http://localhost:4002) */
  baseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}

// ─────────────────────────────────────────────────────────────────────
// Pulse Analysis Types
// ─────────────────────────────────────────────────────────────────────

export interface PulseAnalysis {
  /** Pulse ID */
  pulseId: string;
  /** Analysis timestamp */
  analyzedAt: string;
  /** Which sentinel performed the analysis */
  sentinel: string;
  /** Overall health score (0-1) */
  healthScore: number;
  /** Health status */
  healthStatus: "healthy" | "degraded" | "unhealthy";
  /** Detected issues */
  issues: PulseIssue[];
  /** Recommendations */
  recommendations: string[];
  /** Commit velocity metrics */
  velocity: {
    commitsInWindow: number;
    avgFilesPerCommit: number;
    activeBranch: string;
  };
  /** Structure metrics */
  structure: {
    workflowCount: number;
    packageCount: number;
    appCount: number;
    trackedFileCount: number;
  };
}

export interface PulseIssue {
  severity: "info" | "warning" | "error" | "critical";
  category: string;
  message: string;
  details?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Pulse Fetcher Class
// ─────────────────────────────────────────────────────────────────────

export class PulseFetcher {
  private config: PulseFetcherConfig;

  constructor(config: PulseFetcherConfig) {
    this.config = {
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Get the base headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  /**
   * Make a fetch request with timeout
   */
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fetch the latest pulse from the indexer API
   */
  async fetchLatest(): Promise<PulseResponse> {
    const url = `${this.config.baseUrl}/api/v1/pulse/latest`;
    return this.fetchWithTimeout<PulseResponse>(url);
  }

  /**
   * Fetch a specific pulse by ID
   */
  async fetchById(pulseId: string): Promise<PulseResponse> {
    const url = `${this.config.baseUrl}/api/v1/pulse/${encodeURIComponent(pulseId)}`;
    return this.fetchWithTimeout<PulseResponse>(url);
  }

  /**
   * Fetch pulse history with optional filters
   */
  async fetchHistory(options?: {
    limit?: number;
    offset?: number;
    source?: string;
    cycle?: string;
  }): Promise<PulseHistoryResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.offset) params.set("offset", String(options.offset));
    if (options?.source) params.set("source", options.source);
    if (options?.cycle) params.set("cycle", options.cycle);

    const url = `${this.config.baseUrl}/api/v1/pulse/history?${params.toString()}`;
    return this.fetchWithTimeout<PulseHistoryResponse>(url);
  }

  /**
   * Fetch pulse statistics
   */
  async fetchStats(): Promise<PulseStatsResponse> {
    const url = `${this.config.baseUrl}/api/v1/pulse/stats`;
    return this.fetchWithTimeout<PulseStatsResponse>(url);
  }

  /**
   * Find pulses by commit hash
   */
  async fetchByCommit(
    commit: string
  ): Promise<{ commit: string; pulses: Array<Omit<PulseResponse, "payload">> }> {
    const url = `${this.config.baseUrl}/api/v1/pulse/by-commit/${encodeURIComponent(commit)}`;
    return this.fetchWithTimeout<{
      commit: string;
      pulses: Array<Omit<PulseResponse, "payload">>;
    }>(url);
  }

  /**
   * Ingest a new pulse to the API
   */
  async ingestPulse(
    pulse: MobiusPulse,
    source: string = "manual"
  ): Promise<{
    status: string;
    pulseId: string;
    head: string;
    cycleLabel: string | null;
    miiEstimate: number | null;
    source: string;
    receivedAt: string;
  }> {
    const url = `${this.config.baseUrl}/api/v1/pulse/ingest?source=${encodeURIComponent(source)}`;
    return this.fetchWithTimeout(url, {
      method: "POST",
      body: JSON.stringify(pulse),
    });
  }

  /**
   * Analyze a pulse and return insights for Sentinel processing
   */
  analyzePulse(
    pulse: PulseResponse,
    sentinelName: string = "ATLAS"
  ): PulseAnalysis {
    const issues: PulseIssue[] = [];
    const recommendations: string[] = [];

    // Check MII estimate
    if (pulse.miiEstimate !== null && pulse.miiEstimate < 0.95) {
      issues.push({
        severity: pulse.miiEstimate < 0.9 ? "error" : "warning",
        category: "integrity",
        message: `MII estimate below threshold: ${pulse.miiEstimate}`,
        details: "MII should be ≥ 0.95 for healthy repository state",
      });
      recommendations.push("Review recent changes for integrity violations");
    }

    // Check for staged but uncommitted files
    const stagedFiles = pulse.payload.git.stagedFiles || [];
    if (stagedFiles.length > 0) {
      issues.push({
        severity: "info",
        category: "git",
        message: `${stagedFiles.length} staged files not yet committed`,
        details: stagedFiles.slice(0, 5).join(", "),
      });
    }

    // Check for large number of changed files
    const changedFilesCount = pulse.payload.git.changedFiles.length;
    if (changedFilesCount > 50) {
      issues.push({
        severity: "warning",
        category: "scope",
        message: `Large change set: ${changedFilesCount} files modified`,
        details: "Consider breaking into smaller commits",
      });
      recommendations.push("Break large changes into smaller, focused commits");
    }

    // Check workflow count
    const workflowCount = pulse.payload.structure.workflows.length;
    if (workflowCount === 0) {
      issues.push({
        severity: "warning",
        category: "ci",
        message: "No GitHub workflows detected",
        details: "CI/CD workflows ensure code quality",
      });
      recommendations.push("Add GitHub Actions workflows for CI/CD");
    }

    // Calculate health score
    let healthScore = 1.0;

    // Deduct for issues
    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          healthScore -= 0.3;
          break;
        case "error":
          healthScore -= 0.15;
          break;
        case "warning":
          healthScore -= 0.05;
          break;
        case "info":
          healthScore -= 0.01;
          break;
      }
    }

    // Factor in MII estimate
    if (pulse.miiEstimate !== null) {
      healthScore = (healthScore + pulse.miiEstimate) / 2;
    }

    healthScore = Math.max(0, Math.min(1, healthScore));

    // Determine health status
    let healthStatus: "healthy" | "degraded" | "unhealthy";
    if (healthScore >= 0.9) {
      healthStatus = "healthy";
    } else if (healthScore >= 0.7) {
      healthStatus = "degraded";
    } else {
      healthStatus = "unhealthy";
    }

    // Calculate velocity metrics
    const recentCommits = pulse.payload.git.recentCommits;
    const avgFilesPerCommit =
      recentCommits.length > 0
        ? changedFilesCount / Math.max(1, recentCommits.length)
        : 0;

    return {
      pulseId: pulse.id,
      analyzedAt: new Date().toISOString(),
      sentinel: sentinelName,
      healthScore: parseFloat(healthScore.toFixed(3)),
      healthStatus,
      issues,
      recommendations,
      velocity: {
        commitsInWindow: recentCommits.length,
        avgFilesPerCommit: parseFloat(avgFilesPerCommit.toFixed(1)),
        activeBranch: pulse.branchName || "unknown",
      },
      structure: {
        workflowCount,
        packageCount: pulse.payload.repo.packagesCount || 0,
        appCount: pulse.payload.repo.appsCount || 0,
        trackedFileCount: pulse.payload.repo.trackedFiles,
      },
    };
  }

  /**
   * Compare two pulses to detect drift
   */
  comparePulses(
    older: PulseResponse,
    newer: PulseResponse
  ): {
    headChanged: boolean;
    branchChanged: boolean;
    miiDelta: number | null;
    fileCountDelta: number;
    newFiles: string[];
    removedFiles: string[];
    commitsBetween: number;
  } {
    const olderChangedFiles = new Set(older.payload.git.changedFiles);
    const newerChangedFiles = new Set(newer.payload.git.changedFiles);

    const newFiles = [...newerChangedFiles].filter(
      (f) => !olderChangedFiles.has(f)
    );
    const removedFiles = [...olderChangedFiles].filter(
      (f) => !newerChangedFiles.has(f)
    );

    let miiDelta: number | null = null;
    if (older.miiEstimate !== null && newer.miiEstimate !== null) {
      miiDelta = newer.miiEstimate - older.miiEstimate;
    }

    // Estimate commits between by looking at commit lists
    const olderCommitHashes = new Set(
      older.payload.git.recentCommits.map((c) => c.hash || c.short)
    );
    const commitsBetween = newer.payload.git.recentCommits.filter(
      (c) => !olderCommitHashes.has(c.hash || c.short)
    ).length;

    return {
      headChanged: older.headCommit !== newer.headCommit,
      branchChanged: older.branchName !== newer.branchName,
      miiDelta,
      fileCountDelta: newer.payload.repo.trackedFiles - older.payload.repo.trackedFiles,
      newFiles,
      removedFiles,
      commitsBetween,
    };
  }

  /**
   * Check if pulse is stale (older than specified hours)
   */
  isPulseStale(pulse: PulseResponse, maxAgeHours: number = 24): boolean {
    const pulseTime = new Date(pulse.receivedAt).getTime();
    const now = Date.now();
    const ageMs = now - pulseTime;
    const ageHours = ageMs / (1000 * 60 * 60);
    return ageHours > maxAgeHours;
  }

  /**
   * Parse sentinel hint string into array
   */
  parseSentinelHint(pulse: PulseResponse): string[] {
    const hint = pulse.payload.meta.sentinelHint;
    if (!hint) return [];
    return hint
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Factory function for convenience
// ─────────────────────────────────────────────────────────────────────

/**
 * Create a PulseFetcher with default configuration
 */
export function createPulseFetcher(
  baseUrl: string = "http://localhost:4002",
  apiKey?: string
): PulseFetcher {
  return new PulseFetcher({ baseUrl, apiKey });
}

// Default export
export default PulseFetcher;
