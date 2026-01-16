/**
 * EPICON MCP Server Types
 * 
 * Type definitions for the Explicit Purpose and Intent for Code Operations Network
 */

import { z } from 'zod';

// =============================================================================
// Action Types
// =============================================================================

export const ActionType = z.enum([
  'commit',
  'deploy',
  'delete',
  'modify',
  'execute',
  'external_call'
]);
export type ActionType = z.infer<typeof ActionType>;

export const ImpactLevel = z.enum(['low', 'medium', 'high', 'critical']);
export type ImpactLevel = z.infer<typeof ImpactLevel>;

export const IntentStatus = z.enum(['approved', 'pending_review', 'rejected', 'expired', 'revoked']);
export type IntentStatus = z.infer<typeof IntentStatus>;

export const ExecutionStatus = z.enum(['success', 'failed', 'partial', 'aborted']);
export type ExecutionStatus = z.infer<typeof ExecutionStatus>;

// =============================================================================
// Intent Declaration
// =============================================================================

export const IntentScope = z.object({
  files: z.array(z.string()).optional(),
  systems: z.array(z.string()).optional(),
  data: z.array(z.string()).optional(),
  estimated_impact: ImpactLevel
});
export type IntentScope = z.infer<typeof IntentScope>;

export const DeclareIntentInput = z.object({
  action_type: ActionType,
  description: z.string().min(10, 'Description must be at least 10 characters'),
  rationale: z.string().min(10, 'Rationale must be at least 10 characters'),
  scope: IntentScope,
  risks_acknowledged: z.array(z.string()),
  rollback_plan: z.string().optional(),
  requires_human_approval: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});
export type DeclareIntentInput = z.infer<typeof DeclareIntentInput>;

export const DeclareIntentOutput = z.object({
  intent_token: z.string().uuid(),
  status: IntentStatus,
  expires_at: z.string().datetime(),
  validation_warnings: z.array(z.string()),
  audit_hash: z.string()
});
export type DeclareIntentOutput = z.infer<typeof DeclareIntentOutput>;

// =============================================================================
// Intent Execution
// =============================================================================

export const FileOperation = z.object({
  path: z.string(),
  operation: z.enum(['create', 'modify', 'delete']),
  content: z.string().optional()
});
export type FileOperation = z.infer<typeof FileOperation>;

export const ActionPayload = z.object({
  type: z.string(),
  command: z.string().optional(),
  files: z.array(FileOperation).optional(),
  target: z.string().optional(),
  parameters: z.record(z.any()).optional()
});
export type ActionPayload = z.infer<typeof ActionPayload>;

export const ExecutionContext = z.object({
  agent_id: z.string(),
  session_id: z.string(),
  timestamp: z.string().datetime()
});
export type ExecutionContext = z.infer<typeof ExecutionContext>;

export const ExecuteWithIntentInput = z.object({
  intent_token: z.string().uuid(),
  action_payload: ActionPayload,
  execution_context: ExecutionContext
});
export type ExecuteWithIntentInput = z.infer<typeof ExecuteWithIntentInput>;

export const AuditRecord = z.object({
  intent_token: z.string().uuid(),
  execution_id: z.string().uuid(),
  action_hash: z.string(),
  timestamp: z.string().datetime(),
  immutable_ref: z.string()
});
export type AuditRecord = z.infer<typeof AuditRecord>;

export const ExecuteWithIntentOutput = z.object({
  execution_id: z.string().uuid(),
  status: ExecutionStatus,
  result: z.any(),
  audit_record: AuditRecord
});
export type ExecuteWithIntentOutput = z.infer<typeof ExecuteWithIntentOutput>;

// =============================================================================
// Intent Validation
// =============================================================================

export const ValidateIntentInput = z.object({
  intent_token: z.string().uuid()
});
export type ValidateIntentInput = z.infer<typeof ValidateIntentInput>;

export const IntentRecord = z.object({
  action_type: ActionType,
  description: z.string(),
  scope: IntentScope,
  declared_at: z.string().datetime(),
  declared_by: z.string()
});
export type IntentRecord = z.infer<typeof IntentRecord>;

export const ExecutionSummary = z.object({
  execution_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  status: ExecutionStatus
});
export type ExecutionSummary = z.infer<typeof ExecutionSummary>;

export const ValidateIntentOutput = z.object({
  valid: z.boolean(),
  intent: IntentRecord.optional(),
  permissions: z.array(z.string()),
  expires_at: z.string().datetime().optional(),
  executions: z.array(ExecutionSummary)
});
export type ValidateIntentOutput = z.infer<typeof ValidateIntentOutput>;

// =============================================================================
// Audit Query
// =============================================================================

export const AuditQueryFilters = z.object({
  agent_id: z.string().optional(),
  action_type: ActionType.optional(),
  time_range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  status: ExecutionStatus.optional(),
  impact_level: ImpactLevel.optional()
});
export type AuditQueryFilters = z.infer<typeof AuditQueryFilters>;

export const AuditQueryInput = z.object({
  filters: AuditQueryFilters,
  limit: z.number().min(1).max(1000).optional().default(100),
  offset: z.number().min(0).optional().default(0),
  include_payloads: z.boolean().optional().default(false)
});
export type AuditQueryInput = z.infer<typeof AuditQueryInput>;

export const AuditQueryRecord = z.object({
  intent_token: z.string().uuid(),
  execution_id: z.string().uuid().optional(),
  action_type: ActionType,
  description: z.string(),
  status: z.string(),
  timestamp: z.string().datetime(),
  agent_id: z.string(),
  audit_hash: z.string(),
  payload: z.any().optional()
});
export type AuditQueryRecord = z.infer<typeof AuditQueryRecord>;

export const AuditQueryOutput = z.object({
  total: z.number(),
  records: z.array(AuditQueryRecord),
  has_more: z.boolean(),
  next_offset: z.number().optional()
});
export type AuditQueryOutput = z.infer<typeof AuditQueryOutput>;

// =============================================================================
// Revocation
// =============================================================================

export const RevokeIntentInput = z.object({
  intent_token: z.string().uuid(),
  reason: z.string().min(5, 'Reason must be at least 5 characters')
});
export type RevokeIntentInput = z.infer<typeof RevokeIntentInput>;

export const RevocationRecord = z.object({
  revocation_id: z.string().uuid(),
  intent_token: z.string().uuid(),
  reason: z.string(),
  timestamp: z.string().datetime()
});
export type RevocationRecord = z.infer<typeof RevocationRecord>;

export const RevokeIntentOutput = z.object({
  revoked: z.boolean(),
  audit_record: RevocationRecord
});
export type RevokeIntentOutput = z.infer<typeof RevokeIntentOutput>;

// =============================================================================
// Integrity Status
// =============================================================================

export const TimeWindow = z.enum(['1h', '24h', '7d', '30d']);
export type TimeWindow = z.infer<typeof TimeWindow>;

export const GetIntegrityStatusInput = z.object({
  time_window: TimeWindow.optional().default('24h')
});
export type GetIntegrityStatusInput = z.infer<typeof GetIntegrityStatusInput>;

export const IntegrityStats = z.object({
  intents_declared: z.number(),
  intents_executed: z.number(),
  intents_rejected: z.number(),
  intents_expired: z.number(),
  actions_by_type: z.record(z.number()),
  actions_by_impact: z.record(z.number())
});
export type IntegrityStats = z.infer<typeof IntegrityStats>;

export const Alert = z.object({
  level: z.enum(['warning', 'error', 'critical']),
  message: z.string(),
  timestamp: z.string().datetime()
});
export type Alert = z.infer<typeof Alert>;

export const GetIntegrityStatusOutput = z.object({
  status: z.enum(['healthy', 'degraded', 'critical']),
  uptime: z.string(),
  stats: IntegrityStats,
  recent_alerts: z.array(Alert),
  audit_chain_valid: z.boolean(),
  last_audit_hash: z.string()
});
export type GetIntegrityStatusOutput = z.infer<typeof GetIntegrityStatusOutput>;

// =============================================================================
// Internal Storage Types
// =============================================================================

export interface StoredIntent {
  token: string;
  input: DeclareIntentInput;
  status: IntentStatus;
  created_at: string;
  expires_at: string;
  declared_by: string;
  audit_hash: string;
  executions: string[];
}

export interface StoredExecution {
  id: string;
  intent_token: string;
  payload: ActionPayload;
  context: ExecutionContext;
  status: ExecutionStatus;
  result: unknown;
  created_at: string;
  audit_hash: string;
}

export interface AuditChainEntry {
  record_id: string;
  previous_hash: string;
  timestamp: string;
  type: 'intent_declared' | 'intent_executed' | 'intent_revoked' | 'intent_expired';
  data: unknown;
  hash: string;
}
