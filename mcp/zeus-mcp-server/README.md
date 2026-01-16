# ZEUS MCP Server

> The circuit breaker for agentic AI — threshold monitoring with teeth.

## Overview

ZEUS (Zero-tolerance Escalation and Uncertainty Surveillance) is an MCP server that provides threshold monitoring and circuit-breaking capabilities for AI agent systems. It monitors system integrity, detects pre-instability patterns, and can halt agent actions when critical thresholds are crossed.

**Core Principle:** No system should continue operating when it can no longer guarantee its own integrity.

## Installation

```bash
npm install
npm run build
```

## Running

### stdio Transport (Local)
```bash
node dist/index.js
```

### With Environment Variables
```bash
ZEUS_DEFAULT_STATUS=NOMINAL node dist/index.js
```

## Status Levels

| Level | Code | Meaning | Agent Behavior |
|-------|------|---------|----------------|
| NOMINAL | 0 | All systems normal | Full autonomy |
| WATCH | 1 | Minor anomalies | Full autonomy with logging |
| ADVISORY | 2 | Significant deviation | Restricted autonomy |
| WARNING | 3 | Critical threshold approached | Human approval required |
| CRITICAL | 4 | System integrity compromised | All actions halted |

## Tools

### `zeus_check_status`
Check the current ZEUS status before taking action.

### `zeus_request_permission`
Request permission to perform an action. ZEUS evaluates risk and status.

### `zeus_report_outcome`
Report action outcome for pattern detection and threshold adjustment.

### `zeus_get_circuit_status`
Get the status of circuit breakers.

### `zeus_trigger_circuit`
Manually trigger (open) or reset a circuit breaker.

### `zeus_register_threshold`
Register a new threshold to monitor.

### `zeus_report_metric`
Report a metric value for threshold evaluation.

### `zeus_set_status`
Manually set system status (admin only).

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ZEUS_DEFAULT_STATUS` | NOMINAL | Initial system status |
| `ZEUS_STORAGE_PATH` | (memory) | Persistent storage path |
| `ZEUS_EVALUATION_INTERVAL_MS` | 5000 | Threshold evaluation interval |
| `ZEUS_CIRCUIT_AUTO_RESET_MINUTES` | 30 | Circuit breaker auto-reset |

## Integration with EPICON

ZEUS integrates with EPICON for comprehensive accountability:

```typescript
// 1. Check ZEUS status
const status = await mcp.call("zeus_check_status", {
  context: { agent_id: "my-agent", action_type: "commit" }
});

if (!status.permissions.can_proceed) {
  throw new Error(`ZEUS: ${status.message}`);
}

// 2. Declare intent with EPICON
const intent = await mcp.call("epicon_declare_intent", { ... });

// 3. Request ZEUS permission (links to intent)
const permission = await mcp.call("zeus_request_permission", {
  agent_id: "my-agent",
  action: { type: "commit", ... },
  context: { intent_token: intent.intent_token }
});

// 4. Execute with EPICON
const result = await mcp.call("epicon_execute_with_intent", { ... });

// 5. Report outcome to ZEUS
await mcp.call("zeus_report_outcome", {
  permission_token: permission.permission_token,
  outcome: { status: result.status }
});
```

## License

CC0 1.0 Universal — Public Domain Dedication

---

*ZEUS: Because systems should know when to stop.*
