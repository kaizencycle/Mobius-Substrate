/**
 * EPICON Storage Layer
 * 
 * In-memory storage with audit chain integrity
 * Production implementations should use persistent storage (PostgreSQL, etc.)
 */

import { createHash } from 'crypto';
import type {
  StoredIntent,
  StoredExecution,
  AuditChainEntry,
  IntentStatus,
  ExecutionStatus,
  DeclareIntentInput,
  ActionPayload,
  ExecutionContext,
  AuditQueryFilters
} from './types.js';

export class EpiconStore {
  private intents: Map<string, StoredIntent> = new Map();
  private executions: Map<string, StoredExecution> = new Map();
  private auditChain: AuditChainEntry[] = [];
  private readonly startTime: Date;

  constructor() {
    this.startTime = new Date();
    // Initialize audit chain with genesis entry
    this.addAuditEntry('intent_declared', {
      type: 'genesis',
      message: 'EPICON audit chain initialized',
      timestamp: this.startTime.toISOString()
    });
  }

  // ==========================================================================
  // Hash Utilities
  // ==========================================================================

  private computeHash(data: unknown): string {
    const json = JSON.stringify(data, Object.keys(data as object).sort());
    return createHash('sha256').update(json).digest('hex');
  }

  private getLastAuditHash(): string {
    if (this.auditChain.length === 0) {
      return '0'.repeat(64);
    }
    return this.auditChain[this.auditChain.length - 1].hash;
  }

  private addAuditEntry(
    type: AuditChainEntry['type'],
    data: unknown
  ): AuditChainEntry {
    const previousHash = this.getLastAuditHash();
    const timestamp = new Date().toISOString();
    const recordId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const entry: AuditChainEntry = {
      record_id: recordId,
      previous_hash: previousHash,
      timestamp,
      type,
      data,
      hash: '' // Computed below
    };
    
    // Compute hash including previous hash for chain integrity
    entry.hash = this.computeHash({
      record_id: entry.record_id,
      previous_hash: entry.previous_hash,
      timestamp: entry.timestamp,
      type: entry.type,
      data: entry.data
    });
    
    this.auditChain.push(entry);
    return entry;
  }

  // ==========================================================================
  // Intent Operations
  // ==========================================================================

  createIntent(
    token: string,
    input: DeclareIntentInput,
    declaredBy: string,
    expiresAt: Date
  ): StoredIntent {
    const now = new Date().toISOString();
    const auditHash = this.computeHash({
      token,
      input,
      declared_by: declaredBy,
      timestamp: now
    });

    const intent: StoredIntent = {
      token,
      input,
      status: 'approved', // Default approval for now
      created_at: now,
      expires_at: expiresAt.toISOString(),
      declared_by: declaredBy,
      audit_hash: auditHash,
      executions: []
    };

    // Check if human approval is required
    if (input.requires_human_approval || input.scope.estimated_impact === 'critical') {
      intent.status = 'pending_review';
    }

    this.intents.set(token, intent);

    // Add to audit chain
    this.addAuditEntry('intent_declared', {
      intent_token: token,
      action_type: input.action_type,
      description: input.description,
      declared_by: declaredBy,
      scope: input.scope
    });

    return intent;
  }

  getIntent(token: string): StoredIntent | undefined {
    const intent = this.intents.get(token);
    
    // Check for expiration
    if (intent && intent.status === 'approved') {
      if (new Date(intent.expires_at) < new Date()) {
        intent.status = 'expired';
        this.addAuditEntry('intent_expired', { intent_token: token });
      }
    }
    
    return intent;
  }

  updateIntentStatus(token: string, status: IntentStatus): boolean {
    const intent = this.intents.get(token);
    if (!intent) return false;
    
    intent.status = status;
    return true;
  }

  revokeIntent(token: string, reason: string): boolean {
    const intent = this.intents.get(token);
    if (!intent) return false;
    if (intent.status !== 'approved' && intent.status !== 'pending_review') {
      return false;
    }

    intent.status = 'revoked';
    
    this.addAuditEntry('intent_revoked', {
      intent_token: token,
      reason,
      timestamp: new Date().toISOString()
    });

    return true;
  }

  // ==========================================================================
  // Execution Operations
  // ==========================================================================

  createExecution(
    id: string,
    intentToken: string,
    payload: ActionPayload,
    context: ExecutionContext,
    status: ExecutionStatus,
    result: unknown
  ): StoredExecution {
    const now = new Date().toISOString();
    const auditHash = this.computeHash({
      execution_id: id,
      intent_token: intentToken,
      payload,
      context,
      status,
      timestamp: now
    });

    const execution: StoredExecution = {
      id,
      intent_token: intentToken,
      payload,
      context,
      status,
      result,
      created_at: now,
      audit_hash: auditHash
    };

    this.executions.set(id, execution);

    // Link execution to intent
    const intent = this.intents.get(intentToken);
    if (intent) {
      intent.executions.push(id);
    }

    // Add to audit chain
    this.addAuditEntry('intent_executed', {
      execution_id: id,
      intent_token: intentToken,
      action_type: payload.type,
      status,
      agent_id: context.agent_id
    });

    return execution;
  }

  getExecution(id: string): StoredExecution | undefined {
    return this.executions.get(id);
  }

  getExecutionsForIntent(intentToken: string): StoredExecution[] {
    const intent = this.intents.get(intentToken);
    if (!intent) return [];
    
    return intent.executions
      .map(id => this.executions.get(id))
      .filter((e): e is StoredExecution => e !== undefined);
  }

  // ==========================================================================
  // Query Operations
  // ==========================================================================

  queryAudit(
    filters: AuditQueryFilters,
    limit: number,
    offset: number,
    includePayloads: boolean
  ): {
    records: Array<{
      intent_token: string;
      execution_id?: string;
      action_type: string;
      description: string;
      status: string;
      timestamp: string;
      agent_id: string;
      audit_hash: string;
      payload?: unknown;
    }>;
    total: number;
  } {
    let records: Array<{
      intent_token: string;
      execution_id?: string;
      action_type: string;
      description: string;
      status: string;
      timestamp: string;
      agent_id: string;
      audit_hash: string;
      payload?: unknown;
    }> = [];

    // Collect all intents with their executions
    for (const [token, intent] of this.intents) {
      // Apply filters
      if (filters.action_type && intent.input.action_type !== filters.action_type) {
        continue;
      }
      if (filters.impact_level && intent.input.scope.estimated_impact !== filters.impact_level) {
        continue;
      }
      if (filters.time_range) {
        const created = new Date(intent.created_at);
        const start = new Date(filters.time_range.start);
        const end = new Date(filters.time_range.end);
        if (created < start || created > end) {
          continue;
        }
      }

      // Add intent record
      records.push({
        intent_token: token,
        action_type: intent.input.action_type,
        description: intent.input.description,
        status: intent.status,
        timestamp: intent.created_at,
        agent_id: intent.declared_by,
        audit_hash: intent.audit_hash,
        payload: includePayloads ? intent.input : undefined
      });

      // Add execution records
      for (const execId of intent.executions) {
        const exec = this.executions.get(execId);
        if (!exec) continue;

        if (filters.agent_id && exec.context.agent_id !== filters.agent_id) {
          continue;
        }
        if (filters.status && exec.status !== filters.status) {
          continue;
        }

        records.push({
          intent_token: token,
          execution_id: execId,
          action_type: exec.payload.type,
          description: `Execution of ${intent.input.description}`,
          status: exec.status,
          timestamp: exec.created_at,
          agent_id: exec.context.agent_id,
          audit_hash: exec.audit_hash,
          payload: includePayloads ? exec.payload : undefined
        });
      }
    }

    // Sort by timestamp descending
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = records.length;
    records = records.slice(offset, offset + limit);

    return { records, total };
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  getStats(timeWindowMs: number): {
    intents_declared: number;
    intents_executed: number;
    intents_rejected: number;
    intents_expired: number;
    actions_by_type: Record<string, number>;
    actions_by_impact: Record<string, number>;
  } {
    const cutoff = new Date(Date.now() - timeWindowMs);
    let intents_declared = 0;
    let intents_executed = 0;
    let intents_rejected = 0;
    let intents_expired = 0;
    const actions_by_type: Record<string, number> = {};
    const actions_by_impact: Record<string, number> = {};

    for (const intent of this.intents.values()) {
      if (new Date(intent.created_at) < cutoff) continue;

      intents_declared++;
      
      const type = intent.input.action_type;
      actions_by_type[type] = (actions_by_type[type] || 0) + 1;
      
      const impact = intent.input.scope.estimated_impact;
      actions_by_impact[impact] = (actions_by_impact[impact] || 0) + 1;

      if (intent.executions.length > 0) intents_executed++;
      if (intent.status === 'rejected') intents_rejected++;
      if (intent.status === 'expired') intents_expired++;
    }

    return {
      intents_declared,
      intents_executed,
      intents_rejected,
      intents_expired,
      actions_by_type,
      actions_by_impact
    };
  }

  getUptime(): string {
    const uptimeMs = Date.now() - this.startTime.getTime();
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  validateAuditChain(): boolean {
    for (let i = 1; i < this.auditChain.length; i++) {
      const entry = this.auditChain[i];
      const previousEntry = this.auditChain[i - 1];
      
      // Verify chain linkage
      if (entry.previous_hash !== previousEntry.hash) {
        return false;
      }
      
      // Verify hash integrity
      const computedHash = this.computeHash({
        record_id: entry.record_id,
        previous_hash: entry.previous_hash,
        timestamp: entry.timestamp,
        type: entry.type,
        data: entry.data
      });
      
      if (computedHash !== entry.hash) {
        return false;
      }
    }
    
    return true;
  }

  getLastAuditHashPublic(): string {
    return this.getLastAuditHash();
  }

  getRecentAlerts(): Array<{
    level: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
  }> {
    // In a production system, this would track actual alerts
    // For now, return empty array
    return [];
  }
}

// Singleton instance
export const store = new EpiconStore();
