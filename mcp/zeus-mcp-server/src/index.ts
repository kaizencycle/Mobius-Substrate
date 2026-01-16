#!/usr/bin/env node
/**
 * ZEUS MCP Server
 * 
 * Zero-tolerance Escalation and Uncertainty Surveillance
 * The circuit breaker for agentic AI — threshold monitoring with teeth.
 * 
 * @license CC0-1.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { store } from './store.js';
import {
  CheckStatusInput,
  RequestPermissionInput,
  ReportOutcomeInput,
  GetCircuitStatusInput,
  TriggerCircuitInput,
  RegisterThresholdInput,
  ReportMetricInput,
  SetStatusInput,
  StatusCode,
} from './types.js';

// =============================================================================
// Tool Definitions
// =============================================================================

const TOOLS: Tool[] = [
  {
    name: 'zeus_check_status',
    description: 'Check the current ZEUS status before taking action. Agents should call this before consequential operations to verify system integrity.',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'object',
          properties: {
            agent_id: { type: 'string', description: 'Identifier for the calling agent' },
            action_type: { type: 'string', description: 'What action is being considered' },
            scope: { type: 'string', description: 'Scope of the action' },
            domain: { type: 'string', description: 'Domain being operated in' }
          },
          required: ['agent_id']
        },
        include_recommendations: { type: 'boolean', default: false }
      },
      required: ['context']
    }
  },
  {
    name: 'zeus_request_permission',
    description: 'Request permission to perform an action. ZEUS evaluates current status and action risk to determine if the action should proceed.',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Identifier for the requesting agent' },
        action: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Type of action' },
            description: { type: 'string', description: 'Description of the action' },
            scope: { type: 'string', description: 'Scope of the action' },
            estimated_impact: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            reversible: { type: 'boolean', description: 'Whether the action can be undone' }
          },
          required: ['type', 'description', 'scope', 'estimated_impact', 'reversible']
        },
        context: {
          type: 'object',
          properties: {
            intent_token: { type: 'string', description: 'EPICON intent token if available' },
            session_id: { type: 'string' },
            additional: { type: 'object' }
          }
        }
      },
      required: ['agent_id', 'action']
    }
  },
  {
    name: 'zeus_report_outcome',
    description: 'Report the outcome of an action. Used to feed back results for pattern detection and threshold adjustment.',
    inputSchema: {
      type: 'object',
      properties: {
        permission_token: { type: 'string', format: 'uuid', description: 'Token from zeus_request_permission' },
        outcome: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['success', 'partial', 'failed', 'aborted'] },
            details: { type: 'string' },
            metrics: { type: 'object', additionalProperties: { type: 'number' } },
            anomalies: { type: 'array', items: { type: 'string' } }
          },
          required: ['status']
        }
      },
      required: ['permission_token', 'outcome']
    }
  },
  {
    name: 'zeus_get_circuit_status',
    description: 'Get the status of circuit breakers. Circuit breakers can halt specific types of actions when thresholds are exceeded.',
    inputSchema: {
      type: 'object',
      properties: {
        circuit_id: { type: 'string', description: 'Specific circuit ID, or omit for all circuits' },
        include_history: { type: 'boolean', default: false }
      }
    }
  },
  {
    name: 'zeus_trigger_circuit',
    description: 'Manually trigger (open) or reset a circuit breaker. Use for emergency halts or recovery.',
    inputSchema: {
      type: 'object',
      properties: {
        circuit_id: { type: 'string' },
        action: { type: 'string', enum: ['open', 'close', 'half-open'] },
        reason: { type: 'string', description: 'Reason for the circuit action' },
        duration_minutes: { type: 'number', description: 'For open, how long before auto-reset' }
      },
      required: ['circuit_id', 'action', 'reason']
    }
  },
  {
    name: 'zeus_register_threshold',
    description: 'Register a new threshold to monitor. Allows dynamic threshold configuration for metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        threshold_id: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        metric: {
          type: 'object',
          properties: {
            source: { type: 'string', description: 'Where the metric comes from' },
            path: { type: 'string', description: 'Path to the metric value' },
            type: { type: 'string', enum: ['gauge', 'counter', 'rate'] }
          },
          required: ['source', 'path', 'type']
        },
        conditions: {
          type: 'object',
          properties: {
            warning: { type: 'number', description: 'Value that triggers WARNING' },
            critical: { type: 'number', description: 'Value that triggers CRITICAL' },
            direction: { type: 'string', enum: ['above', 'below'] }
          },
          required: ['warning', 'critical', 'direction']
        },
        evaluation: {
          type: 'object',
          properties: {
            interval_seconds: { type: 'number' },
            window_seconds: { type: 'number' },
            aggregation: { type: 'string', enum: ['avg', 'max', 'min', 'sum', 'last'] }
          },
          required: ['interval_seconds', 'window_seconds', 'aggregation']
        },
        actions: {
          type: 'object',
          properties: {
            on_warning: { type: 'array', items: { type: 'string' } },
            on_critical: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['threshold_id', 'name', 'description', 'metric', 'conditions', 'evaluation']
    }
  },
  {
    name: 'zeus_report_metric',
    description: 'Report a metric value for threshold evaluation. Used by integrated systems to feed data to ZEUS.',
    inputSchema: {
      type: 'object',
      properties: {
        metric_id: { type: 'string', description: 'ID of the registered threshold/metric' },
        value: { type: 'number' },
        timestamp: { type: 'string', format: 'date-time' },
        labels: { type: 'object', additionalProperties: { type: 'string' } },
        source: {
          type: 'object',
          properties: {
            system: { type: 'string' },
            component: { type: 'string' }
          },
          required: ['system']
        }
      },
      required: ['metric_id', 'value', 'source']
    }
  },
  {
    name: 'zeus_set_status',
    description: 'Manually set system status (admin only). Use for emergency escalation or de-escalation.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['NOMINAL', 'WATCH', 'ADVISORY', 'WARNING', 'CRITICAL'] },
        reason: { type: 'string', description: 'Reason for status change' },
        duration_minutes: { type: 'number', description: 'How long before auto-reset to NOMINAL' },
        affected_domains: { type: 'array', items: { type: 'string' } }
      },
      required: ['status', 'reason']
    }
  }
];

// =============================================================================
// Tool Handlers
// =============================================================================

async function handleCheckStatus(args: unknown): Promise<unknown> {
  const input = CheckStatusInput.parse(args);
  
  const status = store.getStatus();
  const statusCode = store.getStatusCode();
  const message = store.getMessage();
  const permissions = store.getPermissions();
  const activeAlerts = store.getActiveAlerts();
  const thresholdStatuses = store.getThresholdStatuses();
  const patternSignals = store.getPatternSignals();

  const recommendations: string[] = [];
  if (input.include_recommendations) {
    if (statusCode >= StatusCode.ADVISORY) {
      recommendations.push('Consider delaying non-critical operations');
    }
    if (statusCode >= StatusCode.WARNING) {
      recommendations.push('Seek human approval before proceeding');
      recommendations.push('Review recent alerts and pattern signals');
    }
    if (activeAlerts.length > 0) {
      recommendations.push(`${activeAlerts.length} alert(s) require attention`);
    }
  }

  return {
    status,
    status_code: statusCode,
    message,
    details: {
      current_thresholds: thresholdStatuses,
      active_alerts: activeAlerts.map(a => ({
        id: a.id,
        level: a.level,
        message: a.message,
        since: a.created_at
      })),
      pattern_signals: patternSignals
    },
    permissions: {
      can_proceed: permissions.can_proceed,
      requires_approval: permissions.requires_approval,
      restricted_actions: permissions.restricted_actions,
      allowed_actions: permissions.allowed_actions
    },
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    last_updated: new Date().toISOString()
  };
}

async function handleRequestPermission(args: unknown): Promise<unknown> {
  const input = RequestPermissionInput.parse(args);
  
  const result = store.requestPermission(
    input.agent_id,
    input.action,
    input.context
  );

  const status = store.getStatus();

  if (result.granted && result.token) {
    const permission = store.getPermission(result.token);
    return {
      granted: true,
      permission_token: result.token,
      expires_at: permission?.expires_at,
      conditions: result.conditions,
      zeus_status: status
    };
  }

  return {
    granted: false,
    denial_reason: result.denialReason,
    escalation_path: 'Contact system administrator or wait for status improvement',
    zeus_status: status
  };
}

async function handleReportOutcome(args: unknown): Promise<unknown> {
  const input = ReportOutcomeInput.parse(args);
  
  const recorded = store.recordOutcome(input.permission_token, input.outcome);
  
  if (!recorded) {
    return {
      recorded: false,
      error: 'Permission token not found or expired'
    };
  }

  // Simple pattern analysis
  const newPatterns: string[] = [];
  let riskScoreChange = 0;

  if (input.outcome.status === 'failed') {
    riskScoreChange = 0.1;
    if (input.outcome.anomalies && input.outcome.anomalies.length > 0) {
      newPatterns.push('anomaly-detected');
      riskScoreChange += 0.1 * input.outcome.anomalies.length;
    }
  } else if (input.outcome.status === 'success') {
    riskScoreChange = -0.05;
  }

  const recommendations: string[] = [];
  if (input.outcome.status === 'failed') {
    recommendations.push('Review failure details and consider rollback if available');
  }
  if (input.outcome.anomalies && input.outcome.anomalies.length > 0) {
    recommendations.push('Anomalies detected - consider pausing similar operations');
  }

  return {
    recorded: true,
    pattern_analysis: {
      new_patterns_detected: newPatterns,
      risk_score_change: riskScoreChange
    },
    recommendations: recommendations.length > 0 ? recommendations : undefined
  };
}

async function handleGetCircuitStatus(args: unknown): Promise<unknown> {
  const input = GetCircuitStatusInput.parse(args);
  
  let circuits = store.getAllCircuits();
  
  if (input.circuit_id) {
    const circuit = store.getCircuit(input.circuit_id);
    circuits = circuit ? [circuit] : [];
  }

  return {
    circuits: circuits.map(c => ({
      circuit_id: c.id,
      name: c.name,
      status: c.status,
      affected_actions: c.affected_actions,
      opened_at: c.opened_at,
      opened_reason: c.opened_reason,
      failure_count: c.failure_count,
      success_count: c.success_count,
      last_failure: c.last_failure,
      last_success: c.last_success,
      history: input.include_history ? c.history : undefined
    }))
  };
}

async function handleTriggerCircuit(args: unknown): Promise<unknown> {
  const input = TriggerCircuitInput.parse(args);
  
  const result = store.triggerCircuit(
    input.circuit_id,
    input.action,
    input.reason,
    input.duration_minutes
  );

  return {
    success: result.success,
    circuit_status: result.status,
    effective_until: result.expiresAt
  };
}

async function handleRegisterThreshold(args: unknown): Promise<unknown> {
  const input = RegisterThresholdInput.parse(args);
  
  const threshold = store.registerThreshold(input);

  return {
    registered: true,
    threshold_id: threshold.id,
    effective_at: new Date().toISOString()
  };
}

async function handleReportMetric(args: unknown): Promise<unknown> {
  const input = ReportMetricInput.parse(args);
  
  const result = store.reportMetric(
    input.metric_id,
    input.value,
    input.timestamp
  );

  if (!result.recorded) {
    return {
      recorded: false,
      error: 'Metric/threshold not found'
    };
  }

  const threshold = store.getThreshold(input.metric_id);

  return {
    recorded: true,
    threshold_status: threshold ? {
      threshold_id: input.metric_id,
      current_value: threshold.current_value,
      status: threshold.current_status,
      threshold_value: threshold.current_status === 'critical' 
        ? threshold.config.conditions.critical 
        : threshold.config.conditions.warning
    } : undefined,
    triggered_alerts: result.alerts
  };
}

async function handleSetStatus(args: unknown): Promise<unknown> {
  const input = SetStatusInput.parse(args);
  
  const result = store.setStatus(
    input.status,
    input.reason,
    input.duration_minutes
  );

  return {
    success: true,
    previous_status: result.previous,
    new_status: result.new,
    effective_until: result.expiresAt
  };
}

// =============================================================================
// Server Setup
// =============================================================================

async function main() {
  const server = new Server(
    {
      name: 'zeus-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'zeus_check_status':
          result = await handleCheckStatus(args);
          break;
        case 'zeus_request_permission':
          result = await handleRequestPermission(args);
          break;
        case 'zeus_report_outcome':
          result = await handleReportOutcome(args);
          break;
        case 'zeus_get_circuit_status':
          result = await handleGetCircuitStatus(args);
          break;
        case 'zeus_trigger_circuit':
          result = await handleTriggerCircuit(args);
          break;
        case 'zeus_register_threshold':
          result = await handleRegisterThreshold(args);
          break;
        case 'zeus_report_metric':
          result = await handleReportMetric(args);
          break;
        case 'zeus_set_status':
          result = await handleSetStatus(args);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('ZEUS MCP Server running on stdio');
}

main().catch(console.error);
