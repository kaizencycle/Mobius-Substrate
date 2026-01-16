# EPICON MCP Server

> The integrity layer for agentic AI — memory with teeth.

## Overview

EPICON (Explicit Purpose and Intent for Code Operations Network) is an MCP server that provides integrity verification for AI agent actions, particularly code operations. It requires structured intent documentation before consequential actions, creating an auditable trail that connects decisions to outcomes.

**Core Principle:** No consequential action without explicit, recorded intent.

## Why EPICON Exists

As AI agents gain the ability to execute code, make commits, deploy systems, and take real-world actions, the question becomes: *How do we ensure accountability?*

EPICON answers this by requiring agents to:
1. **Declare intent** before acting
2. **Specify scope** of the action
3. **Acknowledge risks** they're aware of
4. **Create immutable records** of the decision chain

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
EPICON_TOKEN_EXPIRY_MINUTES=30 node dist/index.js
```

## Tools

### `epicon_declare_intent`
Declare intent before a consequential action. Returns an intent token required for execution.

### `epicon_execute_with_intent`
Execute an action with a valid intent token. The action is logged and associated with the declared intent.

### `epicon_validate_intent`
Check if an intent token is valid and what actions it permits.

### `epicon_audit_query`
Query the audit trail for past intents and executions.

### `epicon_revoke_intent`
Revoke an intent token before it's used or expires.

### `epicon_get_integrity_status`
Get the current integrity status of the EPICON system and recent activity summary.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `EPICON_TOKEN_EXPIRY_MINUTES` | 30 | How long intent tokens last |
| `EPICON_STORAGE_PATH` | (memory) | Where audit records are stored |
| `EPICON_REQUIRE_HUMAN_APPROVAL_THRESHOLD` | high | Impact level requiring human approval |

## Example Usage

```typescript
// 1. Declare intent
const intent = await mcp.call("epicon_declare_intent", {
  action_type: "commit",
  description: "Add user authentication module",
  rationale: "Implementing OAuth2 flow as specified in ticket AUTH-123",
  scope: {
    files: ["src/auth/oauth.ts", "src/auth/middleware.ts"],
    estimated_impact: "medium"
  },
  risks_acknowledged: [
    "Changes authentication flow - existing sessions may be invalidated"
  ],
  rollback_plan: "Revert commit and restore previous auth middleware"
});

// 2. Execute with intent
if (intent.status === "approved") {
  const result = await mcp.call("epicon_execute_with_intent", {
    intent_token: intent.intent_token,
    action_payload: {
      type: "commit",
      files: [...],
      message: "feat(auth): Add OAuth2 authentication module"
    },
    execution_context: {
      agent_id: "claude-code",
      session_id: "sess-123",
      timestamp: new Date().toISOString()
    }
  });
}
```

## License

CC0 1.0 Universal — Public Domain Dedication

---

*EPICON: Because accountability shouldn't be optional.*
