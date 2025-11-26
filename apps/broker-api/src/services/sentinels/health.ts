// apps/broker-api/src/services/sentinels/health.ts
// Sentinel Health Monitoring & Circuit Breaker

import { ECHO_CONFIG } from "../../config/echo";

interface SentinelHealth {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  lastSuccess: number;
  consecutiveFailures: number;
  averageLatency: number;
  errorRate: number;
}

const healthStore = new Map<string, SentinelHealth>();

// Circuit breaker configuration
const CIRCUIT_BREAKER_THRESHOLD = 5; // consecutive failures
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
const ERROR_RATE_THRESHOLD = 0.3; // 30% error rate

/**
 * Records a successful sentinel call
 */
export function recordSuccess(sentinelName: string, latency: number): void {
  const health = healthStore.get(sentinelName) || createDefaultHealth(sentinelName);
  
  health.lastSuccess = Date.now();
  health.consecutiveFailures = 0;
  health.averageLatency = (health.averageLatency * 0.9) + (latency * 0.1);
  
  healthStore.set(sentinelName, health);
}

/**
 * Records a failed sentinel call
 */
export function recordFailure(sentinelName: string, error: Error): void {
  const health = healthStore.get(sentinelName) || createDefaultHealth(sentinelName);
  
  health.consecutiveFailures++;
  health.errorRate = Math.min(1, health.errorRate + 0.1);
  
  healthStore.set(sentinelName, health);
  
  console.warn(`[Sentinel Health] ${sentinelName} failure ${health.consecutiveFailures}: ${error.message}`);
  
  // Check if circuit breaker should open
  if (shouldOpenCircuitBreaker(health)) {
    console.error(`[Circuit Breaker] ${sentinelName} is now UNHEALTHY - opening circuit`);
    health.status = "unhealthy";
    
    // Attempt reset after timeout
    setTimeout(() => {
      console.log(`[Circuit Breaker] ${sentinelName} attempting recovery`);
      health.status = "degraded";
      health.consecutiveFailures = 0;
      health.errorRate = 0.5; // Start with elevated error rate
    }, CIRCUIT_BREAKER_TIMEOUT);
  }
}

/**
 * Checks if a sentinel can be called
 */
export function isSentinelAvailable(sentinelName: string): boolean {
  const health = healthStore.get(sentinelName);
  if (!health) return true;
  
  if (health.status === "unhealthy") {
    console.warn(`[Circuit Breaker] ${sentinelName} is UNHEALTHY - call blocked`);
    return false;
  }
  
  if (health.status === "degraded" && health.errorRate > ERROR_RATE_THRESHOLD) {
    console.warn(`[Circuit Breaker] ${sentinelName} is DEGRADED - call blocked`);
    return false;
  }
  
  return true;
}

/**
 * Gets health status for all sentinels
 */
export function getAllSentinelHealth(): Record<string, SentinelHealth> {
  const allSentinels = [
    ...ECHO_CONFIG.PRIMARY_SENTINELS,
    ECHO_CONFIG.VALIDATOR_SENTINEL,
    ...ECHO_CONFIG.FALLBACK_SENTINELS
  ];
  
  const result: Record<string, SentinelHealth> = {};
  
  for (const name of allSentinels) {
    result[name] = healthStore.get(name) || createDefaultHealth(name);
  }
  
  return result;
}

/**
 * Creates default health record
 */
function createDefaultHealth(name: string): SentinelHealth {
  return {
    name,
    status: "healthy",
    lastSuccess: Date.now(),
    consecutiveFailures: 0,
    averageLatency: 0,
    errorRate: 0
  };
}

/**
 * Determines if circuit breaker should open
 */
function shouldOpenCircuitBreaker(health: SentinelHealth): boolean {
  return health.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD || 
         health.errorRate > ERROR_RATE_THRESHOLD;
}

