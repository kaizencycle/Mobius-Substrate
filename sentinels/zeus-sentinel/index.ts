/**
 * @fileoverview ZEUS_SENTINEL - Stabilizer Sentinel
 * @description Tier 4 Guardian for integrity monitoring and failover
 * @author Mobius Systems Foundation
 * @version 1.1.2
 * @cycle C-152
 * 
 * Constitutional Reference: C-002 (ZEUS Split Codification)
 * 
 * ZEUS_SENTINEL responsibilities:
 * - Monitor agent interactions for overload or conflict
 * - Enforce stabilizer protocols when conditions degrade
 * - Coordinate with DVA and Echo in failover loops
 * 
 * Note: This is the Tier 4 Sentinel half of the ZEUS split.
 * The Tier 2 Strategist half is ZEUS_COORDINATOR.
 */

import manifest from './manifest.json';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentInteraction {
  source: string;
  target: string;
  type: 'REQUEST' | 'RESPONSE' | 'DELEGATION' | 'ESCALATION';
  timestamp: string;
  latencyMs: number;
  success: boolean;
}

export interface ConflictEvent {
  agents: string[];
  type: 'PERMISSION' | 'RESOURCE' | 'CONSENSUS' | 'DEADLOCK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  resolution?: string;
}

export interface FailoverProtocol {
  trigger: string;
  targetAgent: string;
  fallbackAgent: string;
  autoExecute: boolean;
  notifyDVA: boolean;
}

export interface SentinelStatus {
  healthy: boolean;
  agentsMonitored: number;
  activeConflicts: number;
  lastCheck: string;
  uptime: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const AGENT_ID = 'ZEUS_SENTINEL';
export const TIER = 4;
export const OVERLOAD_THRESHOLD = 100; // requests per minute
export const CONFLICT_ALERT_THRESHOLD = 3;
export const FAILOVER_TIMEOUT_MS = 5000;

// ═══════════════════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Monitor agent interactions and detect anomalies
 */
export function monitorInteraction(
  interaction: AgentInteraction,
  history: AgentInteraction[]
): { anomaly: boolean; reason?: string } {
  // Check for high latency
  if (interaction.latencyMs > 5000) {
    return {
      anomaly: true,
      reason: `High latency detected: ${interaction.latencyMs}ms`,
    };
  }
  
  // Check for repeated failures
  const recentFailures = history
    .filter(i => 
      i.source === interaction.source && 
      i.target === interaction.target &&
      !i.success
    )
    .slice(-5);
  
  if (recentFailures.length >= 3) {
    return {
      anomaly: true,
      reason: `Repeated failures: ${recentFailures.length} in last 5 interactions`,
    };
  }
  
  // Check for overload (interactions per minute)
  const oneMinuteAgo = Date.now() - 60000;
  const recentCount = history.filter(
    i => new Date(i.timestamp).getTime() > oneMinuteAgo
  ).length;
  
  if (recentCount > OVERLOAD_THRESHOLD) {
    return {
      anomaly: true,
      reason: `Overload detected: ${recentCount} interactions/min`,
    };
  }
  
  return { anomaly: false };
}

/**
 * Detect conflicts between agents
 */
export function detectConflict(
  agents: string[],
  interactions: AgentInteraction[]
): ConflictEvent | null {
  // Check for deadlock (circular waiting)
  const agentSet = new Set(agents);
  const waitingOn = new Map<string, string>();
  
  for (const interaction of interactions) {
    if (agentSet.has(interaction.source) && agentSet.has(interaction.target)) {
      if (!interaction.success) {
        waitingOn.set(interaction.source, interaction.target);
      }
    }
  }
  
  // Simple deadlock detection (A waits for B, B waits for A)
  for (const [a, b] of waitingOn.entries()) {
    if (waitingOn.get(b) === a) {
      return {
        agents: [a, b],
        type: 'DEADLOCK',
        severity: 'CRITICAL',
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  return null;
}

/**
 * Enforce stabilizer protocol when conditions degrade
 */
export function enforceStabilizerProtocol(
  condition: 'OVERLOAD' | 'CONFLICT' | 'DRIFT' | 'FAILURE',
  affectedAgents: string[]
): { protocol: string; actions: string[] } {
  const protocols: Record<typeof condition, { protocol: string; actions: string[] }> = {
    OVERLOAD: {
      protocol: 'RATE_LIMIT',
      actions: [
        'Reduce request rate by 50%',
        'Queue non-critical requests',
        'Notify ZEUS_COORDINATOR',
      ],
    },
    CONFLICT: {
      protocol: 'MEDIATION',
      actions: [
        'Pause conflicting agents',
        'Request DAEDALUS mediation',
        'Log conflict to ECHO',
      ],
    },
    DRIFT: {
      protocol: 'REALIGN',
      actions: [
        'Sync with manifest v1.1.2',
        'Revalidate permissions',
        'Report to DVA',
      ],
    },
    FAILURE: {
      protocol: 'FAILOVER',
      actions: [
        'Activate backup agent',
        'Preserve state snapshot',
        'Alert human operator',
      ],
    },
  };
  
  console.log(`[${AGENT_ID}] Enforcing ${protocols[condition].protocol} protocol`);
  console.log(`   Affected agents: ${affectedAgents.join(', ')}`);
  
  return protocols[condition];
}

/**
 * Coordinate failover with DVA and ECHO
 */
export async function coordinateFailover(
  protocol: FailoverProtocol,
  dvaEndpoint: string,
  echoEndpoint: string
): Promise<{ success: boolean; failoverAgent?: string }> {
  console.log(`[${AGENT_ID}] Initiating failover: ${protocol.targetAgent} → ${protocol.fallbackAgent}`);
  
  // In production, this would call actual endpoints
  if (protocol.notifyDVA) {
    console.log(`[${AGENT_ID}] Notifying DVA at ${dvaEndpoint}`);
  }
  
  console.log(`[${AGENT_ID}] Logging to ECHO at ${echoEndpoint}`);
  
  return {
    success: true,
    failoverAgent: protocol.fallbackAgent,
  };
}

/**
 * Get sentinel status
 */
export function getStatus(
  monitoredAgents: string[],
  activeConflicts: ConflictEvent[],
  startTime: number
): SentinelStatus {
  return {
    healthy: activeConflicts.filter(c => c.severity === 'CRITICAL').length === 0,
    agentsMonitored: monitoredAgents.length,
    activeConflicts: activeConflicts.length,
    lastCheck: new Date().toISOString(),
    uptime: Date.now() - startTime,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export { manifest };

export default {
  AGENT_ID,
  TIER,
  manifest,
  monitorInteraction,
  detectConflict,
  enforceStabilizerProtocol,
  coordinateFailover,
  getStatus,
};
