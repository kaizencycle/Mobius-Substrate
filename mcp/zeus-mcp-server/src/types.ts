/**
 * ZEUS MCP Server Types
 * 
 * Type definitions for Zero-tolerance Escalation and Uncertainty Surveillance
 */

import { z } from 'zod';

// =============================================================================
// Status Levels
// =============================================================================

export const ZeusStatus = z.enum(['NOMINAL', 'WATCH', 'ADVISORY', 'WARNING', 'CRITICAL']);
export type ZeusStatus = z.infer<typeof ZeusStatus>;

export const StatusCode: Record<ZeusStatus, number> = {
  NOMINAL: 0,
  WATCH: 1,
  ADVISORY: 2,
  WARNING: 3,
  CRITICAL: 4
};

export const ImpactLevel = z.enum(['low', 'medium', 'high', 'critical']);
export type ImpactLevel = z.infer<typeof ImpactLevel>;

export const CircuitStatus = z.enum(['closed', 'open', 'half-open']);
export type CircuitStatus = z.infer<typeof CircuitStatus>;

export const OutcomeStatus = z.enum(['success', 'partial', 'failed', 'aborted']);
export type OutcomeStatus = z.infer<typeof OutcomeStatus>;

// =============================================================================
// Check Status
// =============================================================================

export const CheckStatusContext = z.object({
  agent_id: z.string(),
  action_type: z.string().optional(),
  scope: z.string().optional(),
  domain: z.string().optional()
});
export type CheckStatusContext = z.infer<typeof CheckStatusContext>;

export const CheckStatusInput = z.object({
  context: CheckStatusContext,
  include_recommendations: z.boolean().optional().default(false)
});
export type CheckStatusInput = z.infer<typeof CheckStatusInput>;

export const ThresholdStatus = z.object({
  value: z.number(),
  threshold: z.number(),
  status: z.string()
});
export type ThresholdStatus = z.infer<typeof ThresholdStatus>;

export const ActiveAlert = z.object({
  id: z.string(),
  level: z.string(),
  message: z.string(),
  since: z.string().datetime()
});
export type ActiveAlert = z.infer<typeof ActiveAlert>;

export const CheckStatusOutput = z.object({
  status: ZeusStatus,
  status_code: z.number(),
  message: z.string(),
  details: z.object({
    current_thresholds: z.record(ThresholdStatus),
    active_alerts: z.array(ActiveAlert),
    pattern_signals: z.array(z.string())
  }),
  permissions: z.object({
    can_proceed: z.boolean(),
    requires_approval: z.boolean(),
    restricted_actions: z.array(z.string()),
    allowed_actions: z.array(z.string())
  }),
  recommendations: z.array(z.string()).optional(),
  last_updated: z.string().datetime()
});
export type CheckStatusOutput = z.infer<typeof CheckStatusOutput>;

// =============================================================================
// Request Permission
// =============================================================================

export const ActionDetails = z.object({
  type: z.string(),
  description: z.string(),
  scope: z.string(),
  estimated_impact: ImpactLevel,
  reversible: z.boolean()
});
export type ActionDetails = z.infer<typeof ActionDetails>;

export const RequestPermissionInput = z.object({
  agent_id: z.string(),
  action: ActionDetails,
  context: z.object({
    intent_token: z.string().optional(),
    session_id: z.string().optional(),
    additional: z.record(z.any()).optional()
  }).optional()
});
export type RequestPermissionInput = z.infer<typeof RequestPermissionInput>;

export const RequestPermissionOutput = z.object({
  granted: z.boolean(),
  permission_token: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
  conditions: z.array(z.string()).optional(),
  denial_reason: z.string().optional(),
  escalation_path: z.string().optional(),
  zeus_status: ZeusStatus
});
export type RequestPermissionOutput = z.infer<typeof RequestPermissionOutput>;

// =============================================================================
// Report Outcome
// =============================================================================

export const OutcomeDetails = z.object({
  status: OutcomeStatus,
  details: z.string().optional(),
  metrics: z.record(z.number()).optional(),
  anomalies: z.array(z.string()).optional()
});
export type OutcomeDetails = z.infer<typeof OutcomeDetails>;

export const ReportOutcomeInput = z.object({
  permission_token: z.string().uuid(),
  outcome: OutcomeDetails
});
export type ReportOutcomeInput = z.infer<typeof ReportOutcomeInput>;

export const ReportOutcomeOutput = z.object({
  recorded: z.boolean(),
  pattern_analysis: z.object({
    new_patterns_detected: z.array(z.string()),
    risk_score_change: z.number()
  }).optional(),
  recommendations: z.array(z.string()).optional()
});
export type ReportOutcomeOutput = z.infer<typeof ReportOutcomeOutput>;

// =============================================================================
// Circuit Breaker
// =============================================================================

export const GetCircuitStatusInput = z.object({
  circuit_id: z.string().optional(),
  include_history: z.boolean().optional().default(false)
});
export type GetCircuitStatusInput = z.infer<typeof GetCircuitStatusInput>;

export const CircuitHistoryEntry = z.object({
  timestamp: z.string().datetime(),
  status: CircuitStatus,
  reason: z.string()
});
export type CircuitHistoryEntry = z.infer<typeof CircuitHistoryEntry>;

export const CircuitInfo = z.object({
  circuit_id: z.string(),
  name: z.string(),
  status: CircuitStatus,
  affected_actions: z.array(z.string()),
  opened_at: z.string().datetime().optional(),
  opened_reason: z.string().optional(),
  failure_count: z.number(),
  success_count: z.number(),
  last_failure: z.string().datetime().optional(),
  last_success: z.string().datetime().optional(),
  history: z.array(CircuitHistoryEntry).optional()
});
export type CircuitInfo = z.infer<typeof CircuitInfo>;

export const GetCircuitStatusOutput = z.object({
  circuits: z.array(CircuitInfo)
});
export type GetCircuitStatusOutput = z.infer<typeof GetCircuitStatusOutput>;

export const TriggerCircuitInput = z.object({
  circuit_id: z.string(),
  action: z.enum(['open', 'close', 'half-open']),
  reason: z.string(),
  duration_minutes: z.number().optional()
});
export type TriggerCircuitInput = z.infer<typeof TriggerCircuitInput>;

export const TriggerCircuitOutput = z.object({
  success: z.boolean(),
  circuit_status: CircuitStatus,
  effective_until: z.string().datetime().optional()
});
export type TriggerCircuitOutput = z.infer<typeof TriggerCircuitOutput>;

// =============================================================================
// Threshold Registration
// =============================================================================

export const MetricConfig = z.object({
  source: z.string(),
  path: z.string(),
  type: z.enum(['gauge', 'counter', 'rate'])
});
export type MetricConfig = z.infer<typeof MetricConfig>;

export const ThresholdConditions = z.object({
  warning: z.number(),
  critical: z.number(),
  direction: z.enum(['above', 'below'])
});
export type ThresholdConditions = z.infer<typeof ThresholdConditions>;

export const EvaluationConfig = z.object({
  interval_seconds: z.number(),
  window_seconds: z.number(),
  aggregation: z.enum(['avg', 'max', 'min', 'sum', 'last'])
});
export type EvaluationConfig = z.infer<typeof EvaluationConfig>;

export const ThresholdActions = z.object({
  on_warning: z.array(z.string()).optional(),
  on_critical: z.array(z.string()).optional()
});
export type ThresholdActions = z.infer<typeof ThresholdActions>;

export const RegisterThresholdInput = z.object({
  threshold_id: z.string(),
  name: z.string(),
  description: z.string(),
  metric: MetricConfig,
  conditions: ThresholdConditions,
  evaluation: EvaluationConfig,
  actions: ThresholdActions.optional()
});
export type RegisterThresholdInput = z.infer<typeof RegisterThresholdInput>;

export const RegisterThresholdOutput = z.object({
  registered: z.boolean(),
  threshold_id: z.string(),
  effective_at: z.string().datetime()
});
export type RegisterThresholdOutput = z.infer<typeof RegisterThresholdOutput>;

// =============================================================================
// Metric Reporting
// =============================================================================

export const MetricSource = z.object({
  system: z.string(),
  component: z.string().optional()
});
export type MetricSource = z.infer<typeof MetricSource>;

export const ReportMetricInput = z.object({
  metric_id: z.string(),
  value: z.number(),
  timestamp: z.string().datetime().optional(),
  labels: z.record(z.string()).optional(),
  source: MetricSource
});
export type ReportMetricInput = z.infer<typeof ReportMetricInput>;

export const ReportMetricOutput = z.object({
  recorded: z.boolean(),
  threshold_status: z.object({
    threshold_id: z.string(),
    current_value: z.number(),
    status: z.string(),
    threshold_value: z.number()
  }).optional(),
  triggered_alerts: z.array(z.string()).optional()
});
export type ReportMetricOutput = z.infer<typeof ReportMetricOutput>;

// =============================================================================
// Set Status (Admin)
// =============================================================================

export const SetStatusInput = z.object({
  status: ZeusStatus,
  reason: z.string(),
  duration_minutes: z.number().optional(),
  affected_domains: z.array(z.string()).optional()
});
export type SetStatusInput = z.infer<typeof SetStatusInput>;

export const SetStatusOutput = z.object({
  success: z.boolean(),
  previous_status: ZeusStatus,
  new_status: ZeusStatus,
  effective_until: z.string().datetime().optional()
});
export type SetStatusOutput = z.infer<typeof SetStatusOutput>;

// =============================================================================
// Internal Storage Types
// =============================================================================

export interface StoredThreshold {
  id: string;
  config: RegisterThresholdInput;
  current_value: number;
  current_status: 'ok' | 'warning' | 'critical';
  last_evaluated: string;
  values: Array<{ value: number; timestamp: string }>;
}

export interface StoredCircuit {
  id: string;
  name: string;
  status: CircuitStatus;
  affected_actions: string[];
  failure_count: number;
  success_count: number;
  opened_at?: string;
  opened_reason?: string;
  last_failure?: string;
  last_success?: string;
  auto_reset_at?: string;
  history: CircuitHistoryEntry[];
}

export interface StoredPermission {
  token: string;
  agent_id: string;
  action: ActionDetails;
  context?: RequestPermissionInput['context'];
  granted_at: string;
  expires_at: string;
  conditions: string[];
  outcome?: OutcomeDetails;
}

export interface StoredAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  suppressed_until?: string;
}
