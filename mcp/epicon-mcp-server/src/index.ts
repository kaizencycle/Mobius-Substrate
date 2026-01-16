#!/usr/bin/env node
/**
 * EPICON MCP Server
 * 
 * Explicit Purpose and Intent for Code Operations Network
 * The integrity layer for agentic AI — memory with teeth.
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
import { v4 as uuidv4 } from 'uuid';

import { store } from './store.js';
import {
  DeclareIntentInput,
  ExecuteWithIntentInput,
  ValidateIntentInput,
  AuditQueryInput,
  RevokeIntentInput,
  GetIntegrityStatusInput,
  TimeWindow,
} from './types.js';

// =============================================================================
// Configuration
// =============================================================================

const TOKEN_EXPIRY_MINUTES = parseInt(process.env.EPICON_TOKEN_EXPIRY_MINUTES || '30', 10);

const TIME_WINDOW_MS: Record<TimeWindow, number> = {
  '1h': 3600000,
  '24h': 86400000,
  '7d': 604800000,
  '30d': 2592000000
};

// =============================================================================
// Tool Definitions
// =============================================================================

const TOOLS: Tool[] = [
  {
    name: 'epicon_declare_intent',
    description: 'Declare intent before a consequential action. Returns an intent token required for execution. This is the first step in the EPICON workflow - all consequential actions must have declared intent.',
    inputSchema: {
      type: 'object',
      properties: {
        action_type: {
          type: 'string',
          enum: ['commit', 'deploy', 'delete', 'modify', 'execute', 'external_call'],
          description: 'Type of action being declared'
        },
        description: {
          type: 'string',
          description: 'What the agent intends to do (min 10 chars)'
        },
        rationale: {
          type: 'string',
          description: 'Why this action is necessary (min 10 chars)'
        },
        scope: {
          type: 'object',
          properties: {
            files: { type: 'array', items: { type: 'string' }, description: 'Files affected (for code operations)' },
            systems: { type: 'array', items: { type: 'string' }, description: 'Systems affected (for deployments)' },
            data: { type: 'array', items: { type: 'string' }, description: 'Data entities affected' },
            estimated_impact: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
          },
          required: ['estimated_impact']
        },
        risks_acknowledged: {
          type: 'array',
          items: { type: 'string' },
          description: 'Known risks the agent is accepting'
        },
        rollback_plan: {
          type: 'string',
          description: 'How to undo if something goes wrong'
        },
        requires_human_approval: {
          type: 'boolean',
          description: 'Whether this intent requires human approval'
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata'
        }
      },
      required: ['action_type', 'description', 'rationale', 'scope', 'risks_acknowledged']
    }
  },
  {
    name: 'epicon_execute_with_intent',
    description: 'Execute an action with a valid intent token. The action is logged and associated with the declared intent. Must have a valid, non-expired intent token from epicon_declare_intent.',
    inputSchema: {
      type: 'object',
      properties: {
        intent_token: {
          type: 'string',
          format: 'uuid',
          description: 'Intent token from epicon_declare_intent'
        },
        action_payload: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Must match declared action_type' },
            command: { type: 'string', description: 'For execute actions' },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  operation: { type: 'string', enum: ['create', 'modify', 'delete'] },
                  content: { type: 'string' }
                },
                required: ['path', 'operation']
              }
            },
            target: { type: 'string', description: 'For deployments' },
            parameters: { type: 'object' }
          },
          required: ['type']
        },
        execution_context: {
          type: 'object',
          properties: {
            agent_id: { type: 'string' },
            session_id: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          },
          required: ['agent_id', 'session_id', 'timestamp']
        }
      },
      required: ['intent_token', 'action_payload', 'execution_context']
    }
  },
  {
    name: 'epicon_validate_intent',
    description: 'Check if an intent token is valid and what actions it permits. Use this to verify an intent token before attempting execution.',
    inputSchema: {
      type: 'object',
      properties: {
        intent_token: {
          type: 'string',
          format: 'uuid',
          description: 'Intent token to validate'
        }
      },
      required: ['intent_token']
    }
  },
  {
    name: 'epicon_audit_query',
    description: 'Query the audit trail for past intents and executions. Useful for reviewing agent actions and debugging issues.',
    inputSchema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          properties: {
            agent_id: { type: 'string' },
            action_type: { type: 'string', enum: ['commit', 'deploy', 'delete', 'modify', 'execute', 'external_call'] },
            time_range: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' }
              }
            },
            status: { type: 'string', enum: ['success', 'failed', 'partial', 'aborted'] },
            impact_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
          }
        },
        limit: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
        offset: { type: 'number', minimum: 0, default: 0 },
        include_payloads: { type: 'boolean', default: false }
      },
      required: ['filters']
    }
  },
  {
    name: 'epicon_revoke_intent',
    description: 'Revoke an intent token before it is used or expires. Use when plans change or an error is discovered.',
    inputSchema: {
      type: 'object',
      properties: {
        intent_token: {
          type: 'string',
          format: 'uuid',
          description: 'Intent token to revoke'
        },
        reason: {
          type: 'string',
          description: 'Reason for revocation (min 5 chars)'
        }
      },
      required: ['intent_token', 'reason']
    }
  },
  {
    name: 'epicon_get_integrity_status',
    description: 'Get the current integrity status of the EPICON system and recent activity summary.',
    inputSchema: {
      type: 'object',
      properties: {
        time_window: {
          type: 'string',
          enum: ['1h', '24h', '7d', '30d'],
          default: '24h',
          description: 'Time window for statistics'
        }
      }
    }
  }
];

// =============================================================================
// Tool Handlers
// =============================================================================

async function handleDeclareIntent(args: unknown): Promise<unknown> {
  const input = DeclareIntentInput.parse(args);
  
  // Generate intent token
  const intentToken = uuidv4();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  
  // Validate and create warnings
  const warnings: string[] = [];
  
  if (input.scope.estimated_impact === 'critical' && !input.rollback_plan) {
    warnings.push('Critical impact action without rollback plan');
  }
  
  if (input.action_type === 'delete' && !input.rollback_plan) {
    warnings.push('Delete operation without rollback plan - consider adding one');
  }
  
  if (input.risks_acknowledged.length === 0) {
    warnings.push('No risks acknowledged - ensure risks have been considered');
  }

  // Create intent record
  const intent = store.createIntent(
    intentToken,
    input,
    'agent', // In production, extract from context
    expiresAt
  );

  return {
    intent_token: intentToken,
    status: intent.status,
    expires_at: expiresAt.toISOString(),
    validation_warnings: warnings,
    audit_hash: intent.audit_hash
  };
}

async function handleExecuteWithIntent(args: unknown): Promise<unknown> {
  const input = ExecuteWithIntentInput.parse(args);
  
  // Validate intent token
  const intent = store.getIntent(input.intent_token);
  
  if (!intent) {
    return {
      execution_id: null,
      status: 'failed',
      result: { error: 'Intent token not found' },
      audit_record: null
    };
  }
  
  if (intent.status !== 'approved') {
    return {
      execution_id: null,
      status: 'failed',
      result: { error: `Intent status is ${intent.status}, not approved` },
      audit_record: null
    };
  }
  
  // Verify action type matches
  if (input.action_payload.type !== intent.input.action_type) {
    return {
      execution_id: null,
      status: 'failed',
      result: { 
        error: `Action type mismatch: declared ${intent.input.action_type}, executing ${input.action_payload.type}` 
      },
      audit_record: null
    };
  }

  // Generate execution ID
  const executionId = uuidv4();
  
  // In a real implementation, this would execute the actual action
  // For now, we just record the execution
  const execution = store.createExecution(
    executionId,
    input.intent_token,
    input.action_payload,
    input.execution_context,
    'success', // In production, determine based on actual execution
    { message: 'Execution recorded', details: input.action_payload }
  );

  return {
    execution_id: executionId,
    status: execution.status,
    result: execution.result,
    audit_record: {
      intent_token: input.intent_token,
      execution_id: executionId,
      action_hash: execution.audit_hash,
      timestamp: execution.created_at,
      immutable_ref: `epicon:${executionId}`
    }
  };
}

async function handleValidateIntent(args: unknown): Promise<unknown> {
  const input = ValidateIntentInput.parse(args);
  
  const intent = store.getIntent(input.intent_token);
  
  if (!intent) {
    return {
      valid: false,
      intent: null,
      permissions: [],
      expires_at: null,
      executions: []
    };
  }

  const valid = intent.status === 'approved' && new Date(intent.expires_at) > new Date();
  
  const executions = store.getExecutionsForIntent(input.intent_token).map(exec => ({
    execution_id: exec.id,
    timestamp: exec.created_at,
    status: exec.status
  }));

  // Determine permissions based on action type
  const permissions = valid ? [
    `${intent.input.action_type}:execute`,
    ...(intent.input.scope.files?.map(f => `file:${f}`) || []),
    ...(intent.input.scope.systems?.map(s => `system:${s}`) || [])
  ] : [];

  return {
    valid,
    intent: {
      action_type: intent.input.action_type,
      description: intent.input.description,
      scope: intent.input.scope,
      declared_at: intent.created_at,
      declared_by: intent.declared_by
    },
    permissions,
    expires_at: intent.expires_at,
    executions
  };
}

async function handleAuditQuery(args: unknown): Promise<unknown> {
  const input = AuditQueryInput.parse(args);
  
  const { records, total } = store.queryAudit(
    input.filters,
    input.limit,
    input.offset,
    input.include_payloads
  );

  const hasMore = input.offset + records.length < total;

  return {
    total,
    records,
    has_more: hasMore,
    next_offset: hasMore ? input.offset + input.limit : undefined
  };
}

async function handleRevokeIntent(args: unknown): Promise<unknown> {
  const input = RevokeIntentInput.parse(args);
  
  const revoked = store.revokeIntent(input.intent_token, input.reason);
  
  if (!revoked) {
    return {
      revoked: false,
      audit_record: null
    };
  }

  return {
    revoked: true,
    audit_record: {
      revocation_id: uuidv4(),
      intent_token: input.intent_token,
      reason: input.reason,
      timestamp: new Date().toISOString()
    }
  };
}

async function handleGetIntegrityStatus(args: unknown): Promise<unknown> {
  const input = GetIntegrityStatusInput.parse(args);
  
  const timeWindowMs = TIME_WINDOW_MS[input.time_window];
  const stats = store.getStats(timeWindowMs);
  const chainValid = store.validateAuditChain();
  const alerts = store.getRecentAlerts();

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (!chainValid) {
    status = 'critical';
  } else if (alerts.some(a => a.level === 'error')) {
    status = 'degraded';
  }

  return {
    status,
    uptime: store.getUptime(),
    stats,
    recent_alerts: alerts,
    audit_chain_valid: chainValid,
    last_audit_hash: store.getLastAuditHashPublic()
  };
}

// =============================================================================
// Server Setup
// =============================================================================

async function main() {
  const server = new Server(
    {
      name: 'epicon-mcp-server',
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
        case 'epicon_declare_intent':
          result = await handleDeclareIntent(args);
          break;
        case 'epicon_execute_with_intent':
          result = await handleExecuteWithIntent(args);
          break;
        case 'epicon_validate_intent':
          result = await handleValidateIntent(args);
          break;
        case 'epicon_audit_query':
          result = await handleAuditQuery(args);
          break;
        case 'epicon_revoke_intent':
          result = await handleRevokeIntent(args);
          break;
        case 'epicon_get_integrity_status':
          result = await handleGetIntegrityStatus(args);
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
  
  console.error('EPICON MCP Server running on stdio');
}

main().catch(console.error);
