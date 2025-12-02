# ZEUS_COORDINATOR

**Tier 2 Strategist - Stabilizer & Load Balancer**

## Constitutional Reference

**Amendment C-002: ZEUS Split Codification**  
*Ratified: 2025-12-02 (Cycle C-152)*

ZEUS is formally split into:
- **ZEUS_COORDINATOR** (this service) - Tier 2 Strategist for load balancing and drift detection
- **ZEUS_SENTINEL** - Tier 4 Guardian for integrity monitoring and failover protocols

## Responsibilities

1. **Drift Detection**: Detect and dampen drift across agents and chambers
2. **Load Balancing**: Coordinate Echo–AUREA–Stabilizer loops when load is high
3. **Escalation Recommendation**: Recommend safety escalation when thresholds are crossed

## Permissions

| Permission | Allowed |
|------------|---------|
| `can_edit_code` | ❌ |
| `can_edit_repos` | ❌ |
| `can_update_canon_docs` | ❌ |
| `can_trigger_executors` | ✅ |

## Core Functions

```typescript
// Detect drift between systems
detectDrift(current, expected, source, target, type)

// Analyze system load
analyzeLoad(metrics: LoadMetrics)

// Coordinate with ECHO and AUREA
coordinateStabilizerLoop(echoEndpoint, aureaEndpoint, metrics)

// Generate escalation for DVA
generateEscalation(driftEvents, loadMetrics)
```

## Configuration

```yaml
# sentinel.yaml
agent: ZEUS_COORDINATOR
tier: 2
thresholds:
  drift: 0.15
  load: 0.85
  escalation: 0.90
endpoints:
  echo: ${ECHO_ENDPOINT}
  aurea: ${AUREA_ENDPOINT}
  dva: ${DVA_ENDPOINT}
```

## Integration

```typescript
import ZeusCoordinator from '@mobius/sentinels/zeus-coordinator';

// Detect drift
const drift = ZeusCoordinator.detectDrift(
  currentValue,
  expectedValue,
  'AUREA',
  'ATLAS',
  'INTEGRITY'
);

// Analyze load
const recommendation = ZeusCoordinator.analyzeLoad({
  cpu: 0.75,
  memory: 0.80,
  activeAgents: 12,
  pendingRequests: 45,
  averageLatencyMs: 120
});
```

## Related

- [ZEUS_SENTINEL](../zeus-sentinel/README.md) - Tier 4 Guardian counterpart
- [DVA](../packages/integrity-core/) - Integrity Rail
- [ECHO](../echo/README.md) - Pulse Logger

---

*"Stability Through Coordination" — ZEUS_COORDINATOR*
