# ZEUS_SENTINEL

**Tier 4 Guardian - Stabilizer Sentinel**

## Constitutional Reference

**Amendment C-002: ZEUS Split Codification**  
*Ratified: 2025-12-02 (Cycle C-152)*

ZEUS is formally split into:
- **ZEUS_COORDINATOR** - Tier 2 Strategist for load balancing and drift detection
- **ZEUS_SENTINEL** (this service) - Tier 4 Guardian for integrity monitoring and failover protocols

## Responsibilities

1. **Interaction Monitoring**: Monitor agent interactions for overload or conflict
2. **Protocol Enforcement**: Enforce stabilizer protocols when conditions degrade
3. **Failover Coordination**: Coordinate with DVA and Echo in failover loops

## Permissions

| Permission | Allowed |
|------------|---------|
| `can_edit_code` | ❌ |
| `can_edit_repos` | ❌ |
| `can_update_canon_docs` | ❌ |
| `can_trigger_executors` | ✅ |

## Core Functions

```typescript
// Monitor agent interactions
monitorInteraction(interaction, history)

// Detect conflicts between agents
detectConflict(agents, interactions)

// Enforce stabilizer protocols
enforceStabilizerProtocol(condition, affectedAgents)

// Coordinate failover with DVA and ECHO
coordinateFailover(protocol, dvaEndpoint, echoEndpoint)

// Get sentinel status
getStatus(monitoredAgents, activeConflicts, startTime)
```

## Configuration

```yaml
# sentinel.yaml
agent: ZEUS_SENTINEL
tier: 4
thresholds:
  overload: 100  # requests/min
  conflict_alert: 3
  failover_timeout_ms: 5000
endpoints:
  dva: ${DVA_ENDPOINT}
  echo: ${ECHO_ENDPOINT}
  coordinator: ${ZEUS_COORDINATOR_ENDPOINT}
```

## Stabilizer Protocols

| Condition | Protocol | Actions |
|-----------|----------|---------|
| OVERLOAD | RATE_LIMIT | Reduce rate, queue requests, notify coordinator |
| CONFLICT | MEDIATION | Pause agents, request DAEDALUS, log to ECHO |
| DRIFT | REALIGN | Sync manifest, revalidate, report to DVA |
| FAILURE | FAILOVER | Activate backup, snapshot state, alert human |

## Integration

```typescript
import ZeusSentinel from '@mobius/sentinels/zeus-sentinel';

// Monitor interaction
const result = ZeusSentinel.monitorInteraction(
  {
    source: 'AUREA',
    target: 'ATLAS',
    type: 'REQUEST',
    timestamp: new Date().toISOString(),
    latencyMs: 120,
    success: true
  },
  interactionHistory
);

if (result.anomaly) {
  console.warn(`Anomaly detected: ${result.reason}`);
}
```

## DVA Coordination

ZEUS_SENTINEL coordinates with DVA for:
- Critical conflict escalation
- Failover authorization
- Integrity threshold violations
- System-wide alerts

```typescript
// Failover with DVA notification
await ZeusSentinel.coordinateFailover(
  {
    trigger: 'AGENT_FAILURE',
    targetAgent: 'AUREA',
    fallbackAgent: 'ATLAS',
    autoExecute: true,
    notifyDVA: true
  },
  process.env.DVA_ENDPOINT,
  process.env.ECHO_ENDPOINT
);
```

## Related

- [ZEUS_COORDINATOR](../zeus-coordinator/README.md) - Tier 2 Strategist counterpart
- [DVA](../packages/integrity-core/) - Integrity Rail
- [ECHO](../echo/README.md) - Pulse Logger

---

*"Integrity Through Vigilance" — ZEUS_SENTINEL*
