/**
 * ZEUS Storage Layer
 * 
 * In-memory storage for thresholds, circuits, and permissions
 * Production implementations should use persistent storage
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ZeusStatus,
  CircuitStatus,
  ImpactLevel,
  StoredThreshold,
  StoredCircuit,
  StoredPermission,
  StoredAlert,
  RegisterThresholdInput,
  ActionDetails,
  RequestPermissionInput,
  OutcomeDetails,
  CircuitHistoryEntry
} from './types.js';
import { StatusCode } from './types.js';

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CIRCUITS: Array<{ id: string; name: string; actions: string[] }> = [
  { id: 'action-type', name: 'Action Type Circuit', actions: ['commit', 'deploy', 'delete'] },
  { id: 'domain-production', name: 'Production Domain Circuit', actions: ['deploy:production', 'delete:production'] },
  { id: 'cascade', name: 'Cascade Prevention Circuit', actions: ['*'] },
  { id: 'rate-limit', name: 'Rate Limiting Circuit', actions: ['*'] }
];

const STATUS_MESSAGES: Record<ZeusStatus, string> = {
  NOMINAL: 'All systems operating within normal parameters. Full autonomy permitted.',
  WATCH: 'Minor anomalies detected. Proceed with enhanced logging.',
  ADVISORY: 'Significant deviation detected. Restricted autonomy, human notification recommended.',
  WARNING: 'Critical threshold approached. Minimal autonomy, human approval required.',
  CRITICAL: 'System integrity compromised. All agent actions halted.'
};

const STATUS_PERMISSIONS: Record<ZeusStatus, {
  can_proceed: boolean;
  requires_approval: boolean;
  restricted_actions: string[];
  allowed_actions: string[];
}> = {
  NOMINAL: { can_proceed: true, requires_approval: false, restricted_actions: [], allowed_actions: ['*'] },
  WATCH: { can_proceed: true, requires_approval: false, restricted_actions: [], allowed_actions: ['*'] },
  ADVISORY: { can_proceed: true, requires_approval: false, restricted_actions: ['deploy:production', 'delete'], allowed_actions: ['read', 'modify', 'commit'] },
  WARNING: { can_proceed: false, requires_approval: true, restricted_actions: ['*'], allowed_actions: ['read', 'diagnostic'] },
  CRITICAL: { can_proceed: false, requires_approval: true, restricted_actions: ['*'], allowed_actions: ['diagnostic', 'recovery'] }
};

// =============================================================================
// Store Class
// =============================================================================

export class ZeusStore {
  private status: ZeusStatus = 'NOMINAL';
  private statusReason: string = 'Initial state';
  private statusSetAt: Date = new Date();
  private statusExpiresAt?: Date;
  
  private thresholds: Map<string, StoredThreshold> = new Map();
  private circuits: Map<string, StoredCircuit> = new Map();
  private permissions: Map<string, StoredPermission> = new Map();
  private alerts: Map<string, StoredAlert> = new Map();
  
  private readonly startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.initializeDefaultCircuits();
  }

  private initializeDefaultCircuits(): void {
    for (const circuit of DEFAULT_CIRCUITS) {
      this.circuits.set(circuit.id, {
        id: circuit.id,
        name: circuit.name,
        status: 'closed',
        affected_actions: circuit.actions,
        failure_count: 0,
        success_count: 0,
        history: [{
          timestamp: new Date().toISOString(),
          status: 'closed',
          reason: 'Initial state'
        }]
      });
    }
  }

  // ==========================================================================
  // Status Operations
  // ==========================================================================

  getStatus(): ZeusStatus {
    // Check if status has expired
    if (this.statusExpiresAt && new Date() > this.statusExpiresAt) {
      this.status = 'NOMINAL';
      this.statusReason = 'Status reset after expiration';
      this.statusExpiresAt = undefined;
    }
    return this.status;
  }

  getStatusCode(): number {
    return StatusCode[this.getStatus()];
  }

  getMessage(): string {
    return STATUS_MESSAGES[this.getStatus()];
  }

  getPermissions(): typeof STATUS_PERMISSIONS[ZeusStatus] {
    return STATUS_PERMISSIONS[this.getStatus()];
  }

  setStatus(
    status: ZeusStatus,
    reason: string,
    durationMinutes?: number
  ): { previous: ZeusStatus; new: ZeusStatus; expiresAt?: string } {
    const previous = this.status;
    this.status = status;
    this.statusReason = reason;
    this.statusSetAt = new Date();
    
    if (durationMinutes) {
      this.statusExpiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    } else {
      this.statusExpiresAt = undefined;
    }

    // Create alert for status change
    if (StatusCode[status] >= StatusCode.WARNING) {
      this.createAlert(
        status === 'CRITICAL' ? 'critical' : 'warning',
        `Status changed to ${status}: ${reason}`,
        'zeus-status'
      );
    }

    return {
      previous,
      new: status,
      expiresAt: this.statusExpiresAt?.toISOString()
    };
  }

  // ==========================================================================
  // Threshold Operations
  // ==========================================================================

  registerThreshold(config: RegisterThresholdInput): StoredThreshold {
    const threshold: StoredThreshold = {
      id: config.threshold_id,
      config,
      current_value: 0,
      current_status: 'ok',
      last_evaluated: new Date().toISOString(),
      values: []
    };
    
    this.thresholds.set(config.threshold_id, threshold);
    return threshold;
  }

  getThreshold(id: string): StoredThreshold | undefined {
    return this.thresholds.get(id);
  }

  getAllThresholds(): StoredThreshold[] {
    return Array.from(this.thresholds.values());
  }

  reportMetric(
    metricId: string,
    value: number,
    timestamp?: string
  ): { recorded: boolean; status?: string; alerts?: string[] } {
    const threshold = this.thresholds.get(metricId);
    if (!threshold) {
      return { recorded: false };
    }

    const ts = timestamp || new Date().toISOString();
    
    // Add value to history
    threshold.values.push({ value, timestamp: ts });
    
    // Keep only values within evaluation window
    const windowMs = threshold.config.evaluation.window_seconds * 1000;
    const cutoff = Date.now() - windowMs;
    threshold.values = threshold.values.filter(
      v => new Date(v.timestamp).getTime() > cutoff
    );

    // Calculate aggregated value
    const values = threshold.values.map(v => v.value);
    let aggregated: number;
    switch (threshold.config.evaluation.aggregation) {
      case 'avg':
        aggregated = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'max':
        aggregated = Math.max(...values);
        break;
      case 'min':
        aggregated = Math.min(...values);
        break;
      case 'sum':
        aggregated = values.reduce((a, b) => a + b, 0);
        break;
      case 'last':
      default:
        aggregated = value;
    }

    threshold.current_value = aggregated;
    threshold.last_evaluated = ts;

    // Evaluate threshold
    const { warning, critical, direction } = threshold.config.conditions;
    const alerts: string[] = [];
    let newStatus: 'ok' | 'warning' | 'critical' = 'ok';

    if (direction === 'above') {
      if (aggregated >= critical) {
        newStatus = 'critical';
      } else if (aggregated >= warning) {
        newStatus = 'warning';
      }
    } else {
      if (aggregated <= critical) {
        newStatus = 'critical';
      } else if (aggregated <= warning) {
        newStatus = 'warning';
      }
    }

    // Create alert if status changed to worse
    if (newStatus !== threshold.current_status) {
      if (StatusCode[this.mapThresholdStatusToZeus(newStatus)] > 
          StatusCode[this.mapThresholdStatusToZeus(threshold.current_status)]) {
        const alertId = this.createAlert(
          newStatus === 'critical' ? 'critical' : 'warning',
          `Threshold ${metricId} changed to ${newStatus}: ${aggregated} (${direction} ${newStatus === 'critical' ? critical : warning})`,
          metricId
        );
        alerts.push(alertId);
      }
    }

    threshold.current_status = newStatus;

    return {
      recorded: true,
      status: newStatus,
      alerts: alerts.length > 0 ? alerts : undefined
    };
  }

  private mapThresholdStatusToZeus(status: 'ok' | 'warning' | 'critical'): ZeusStatus {
    switch (status) {
      case 'critical': return 'WARNING';
      case 'warning': return 'ADVISORY';
      default: return 'NOMINAL';
    }
  }

  // ==========================================================================
  // Circuit Breaker Operations
  // ==========================================================================

  getCircuit(id: string): StoredCircuit | undefined {
    return this.circuits.get(id);
  }

  getAllCircuits(): StoredCircuit[] {
    return Array.from(this.circuits.values());
  }

  triggerCircuit(
    circuitId: string,
    action: 'open' | 'close' | 'half-open',
    reason: string,
    durationMinutes?: number
  ): { success: boolean; status: CircuitStatus; expiresAt?: string } {
    const circuit = this.circuits.get(circuitId);
    if (!circuit) {
      return { success: false, status: 'closed' };
    }

    // Update circuit status
    circuit.status = action;
    
    const historyEntry: CircuitHistoryEntry = {
      timestamp: new Date().toISOString(),
      status: action,
      reason
    };
    circuit.history.push(historyEntry);

    if (action === 'open') {
      circuit.opened_at = new Date().toISOString();
      circuit.opened_reason = reason;
      
      if (durationMinutes) {
        circuit.auto_reset_at = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      }

      // Create alert for circuit open
      this.createAlert(
        'warning',
        `Circuit ${circuitId} opened: ${reason}`,
        'circuit-breaker'
      );
    }

    return {
      success: true,
      status: action,
      expiresAt: circuit.auto_reset_at
    };
  }

  recordCircuitOutcome(circuitId: string, success: boolean): void {
    const circuit = this.circuits.get(circuitId);
    if (!circuit) return;

    if (success) {
      circuit.success_count++;
      circuit.last_success = new Date().toISOString();
      
      // Half-open circuits close on success
      if (circuit.status === 'half-open') {
        this.triggerCircuit(circuitId, 'close', 'Successful operation in half-open state');
      }
    } else {
      circuit.failure_count++;
      circuit.last_failure = new Date().toISOString();
      
      // Auto-open on consecutive failures (simple strategy)
      if (circuit.failure_count >= 3 && circuit.status === 'closed') {
        this.triggerCircuit(circuitId, 'open', 'Consecutive failures threshold exceeded', 30);
      }
    }
  }

  isActionBlocked(actionType: string): boolean {
    for (const circuit of this.circuits.values()) {
      if (circuit.status === 'open') {
        if (circuit.affected_actions.includes('*') || 
            circuit.affected_actions.includes(actionType)) {
          return true;
        }
      }
    }
    return false;
  }

  // ==========================================================================
  // Permission Operations
  // ==========================================================================

  requestPermission(
    agentId: string,
    action: ActionDetails,
    context?: RequestPermissionInput['context']
  ): {
    granted: boolean;
    token?: string;
    conditions?: string[];
    denialReason?: string;
  } {
    const currentStatus = this.getStatus();
    const permissions = this.getPermissions();

    // Check if action is blocked by circuit
    if (this.isActionBlocked(action.type)) {
      return {
        granted: false,
        denialReason: 'Action blocked by circuit breaker'
      };
    }

    // Check if current status allows proceeding
    if (!permissions.can_proceed && !permissions.allowed_actions.includes(action.type)) {
      return {
        granted: false,
        denialReason: `Current ZEUS status (${currentStatus}) does not permit this action`
      };
    }

    // Check if action is restricted
    if (permissions.restricted_actions.includes(action.type) || 
        permissions.restricted_actions.includes('*')) {
      if (!permissions.allowed_actions.includes(action.type)) {
        return {
          granted: false,
          denialReason: `Action ${action.type} is restricted under current status`
        };
      }
    }

    // Check impact level
    const conditions: string[] = [];
    if (action.estimated_impact === 'critical' && currentStatus !== 'NOMINAL') {
      return {
        granted: false,
        denialReason: 'Critical impact actions require NOMINAL status'
      };
    }

    if (action.estimated_impact === 'high' && !action.reversible) {
      conditions.push('High-impact irreversible action - enhanced logging enabled');
    }

    // Generate permission token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const permission: StoredPermission = {
      token,
      agent_id: agentId,
      action,
      context,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      conditions
    };

    this.permissions.set(token, permission);

    return {
      granted: true,
      token,
      conditions: conditions.length > 0 ? conditions : undefined
    };
  }

  getPermission(token: string): StoredPermission | undefined {
    const permission = this.permissions.get(token);
    if (!permission) return undefined;

    // Check expiration
    if (new Date(permission.expires_at) < new Date()) {
      return undefined;
    }

    return permission;
  }

  recordOutcome(token: string, outcome: OutcomeDetails): boolean {
    const permission = this.permissions.get(token);
    if (!permission) return false;

    permission.outcome = outcome;

    // Record to relevant circuits
    const success = outcome.status === 'success';
    this.recordCircuitOutcome('action-type', success);
    
    if (permission.action.type.includes('production')) {
      this.recordCircuitOutcome('domain-production', success);
    }

    // Update status if failures detected
    if (!success) {
      if (outcome.anomalies && outcome.anomalies.length > 0) {
        // Escalate status if anomalies detected
        const currentCode = this.getStatusCode();
        if (currentCode < StatusCode.ADVISORY) {
          this.setStatus('ADVISORY', `Anomalies detected: ${outcome.anomalies.join(', ')}`);
        }
      }
    }

    return true;
  }

  // ==========================================================================
  // Alert Operations
  // ==========================================================================

  createAlert(
    level: 'info' | 'warning' | 'error' | 'critical',
    message: string,
    source: string
  ): string {
    const id = uuidv4();
    const alert: StoredAlert = {
      id,
      level,
      message,
      source,
      created_at: new Date().toISOString()
    };
    this.alerts.set(id, alert);
    return id;
  }

  getActiveAlerts(): StoredAlert[] {
    const now = new Date();
    return Array.from(this.alerts.values()).filter(alert => {
      if (alert.acknowledged_at) return false;
      if (alert.suppressed_until && new Date(alert.suppressed_until) > now) return false;
      return true;
    });
  }

  acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
    suppressMinutes?: number
  ): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged_at = new Date().toISOString();
    alert.acknowledged_by = acknowledgedBy;

    if (suppressMinutes) {
      alert.suppressed_until = new Date(Date.now() + suppressMinutes * 60 * 1000).toISOString();
    }

    return true;
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  getUptime(): string {
    const uptimeMs = Date.now() - this.startTime.getTime();
    const hours = Math.floor(uptimeMs / 3600000);
    const minutes = Math.floor((uptimeMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  getThresholdStatuses(): Record<string, { value: number; threshold: number; status: string }> {
    const result: Record<string, { value: number; threshold: number; status: string }> = {};
    
    for (const [id, threshold] of this.thresholds) {
      const thresholdValue = threshold.current_status === 'critical' 
        ? threshold.config.conditions.critical 
        : threshold.config.conditions.warning;
      
      result[id] = {
        value: threshold.current_value,
        threshold: thresholdValue,
        status: threshold.current_status
      };
    }
    
    return result;
  }

  getPatternSignals(): string[] {
    // In production, this would detect patterns
    // For now, return based on circuit status and alert count
    const signals: string[] = [];
    
    const openCircuits = Array.from(this.circuits.values()).filter(c => c.status === 'open');
    if (openCircuits.length > 0) {
      signals.push(`${openCircuits.length} circuit(s) open`);
    }

    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.level === 'critical');
    if (criticalAlerts.length > 0) {
      signals.push(`${criticalAlerts.length} critical alert(s) active`);
    }

    return signals;
  }
}

// Singleton instance
export const store = new ZeusStore();
