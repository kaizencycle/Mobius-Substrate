/**
 * @fileoverview Sentinel Health Check Utilities
 * @description Provides health checking and monitoring utilities for sentinels
 */

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type ComponentStatus = 'up' | 'down' | 'degraded';

export interface ComponentHealth {
  name: string;
  status: ComponentStatus;
  latency_ms?: number;
  last_check?: string;
  message?: string;
  critical?: boolean;
}

export interface HealthMetrics {
  deliberations_total?: number;
  deliberations_24h?: number;
  success_rate?: number;
  avg_latency_ms?: number;
  p95_latency_ms?: number;
  gi_score?: number;
  mii_score?: number;
  error_rate?: number;
  active_sessions?: number;
}

export interface DependencyHealth {
  name: string;
  status: ComponentStatus;
  latency_ms?: number;
}

export interface HealthWarning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  since?: string;
}

export interface HealthCheckResponse {
  agent: string;
  status: HealthStatus;
  timestamp: string;
  version?: string;
  uptime_ms?: number;
  components: ComponentHealth[];
  metrics: HealthMetrics;
  dependencies?: DependencyHealth[];
  warnings?: HealthWarning[];
  last_deliberation?: {
    trace_id: string;
    timestamp: string;
    agreement: number;
    gi_score: number;
  };
}

export interface HealthCheckConfig {
  endpoint: string;
  timeout_ms: number;
  interval_ms: number;
  retries: number;
}

// ============================================================================
// Health Check Functions
// ============================================================================

/**
 * Calculate overall health status from components
 */
export function calculateOverallStatus(components: ComponentHealth[]): HealthStatus {
  const criticalComponents = components.filter(c => c.critical !== false);
  
  // If any critical component is down, overall is unhealthy
  if (criticalComponents.some(c => c.status === 'down')) {
    return 'unhealthy';
  }
  
  // If any critical component is degraded, overall is degraded
  if (criticalComponents.some(c => c.status === 'degraded')) {
    return 'degraded';
  }
  
  // If any non-critical component has issues, consider degraded
  if (components.some(c => c.status !== 'up')) {
    return 'degraded';
  }
  
  return 'healthy';
}

/**
 * Create a health check response
 */
export function createHealthResponse(
  agent: string,
  components: ComponentHealth[],
  metrics: HealthMetrics = {},
  options: Partial<Omit<HealthCheckResponse, 'agent' | 'status' | 'timestamp' | 'components' | 'metrics'>> = {}
): HealthCheckResponse {
  return {
    agent,
    status: calculateOverallStatus(components),
    timestamp: new Date().toISOString(),
    components,
    metrics,
    ...options,
  };
}

/**
 * Check if health response indicates a healthy state
 */
export function isHealthy(response: HealthCheckResponse): boolean {
  return response.status === 'healthy';
}

/**
 * Check if health response indicates any issues
 */
export function hasIssues(response: HealthCheckResponse): boolean {
  return response.status !== 'healthy';
}

/**
 * Get failed components from health response
 */
export function getFailedComponents(response: HealthCheckResponse): ComponentHealth[] {
  return response.components.filter(c => c.status === 'down');
}

/**
 * Get degraded components from health response
 */
export function getDegradedComponents(response: HealthCheckResponse): ComponentHealth[] {
  return response.components.filter(c => c.status === 'degraded');
}

/**
 * Check if GI score is above threshold
 */
export function isGIHealthy(metrics: HealthMetrics, threshold: number = 0.95): boolean {
  return metrics.gi_score !== undefined && metrics.gi_score >= threshold;
}

/**
 * Check if MII score is above threshold
 */
export function isMIIHealthy(metrics: HealthMetrics, threshold: number = 0.95): boolean {
  return metrics.mii_score !== undefined && metrics.mii_score >= threshold;
}

/**
 * Check if success rate is acceptable
 */
export function isSuccessRateHealthy(metrics: HealthMetrics, threshold: number = 0.90): boolean {
  return metrics.success_rate !== undefined && metrics.success_rate >= threshold;
}

/**
 * Generate health warnings based on metrics
 */
export function generateWarnings(metrics: HealthMetrics): HealthWarning[] {
  const warnings: HealthWarning[] = [];
  
  if (metrics.gi_score !== undefined && metrics.gi_score < 0.95) {
    warnings.push({
      code: 'LOW_GI',
      message: `GI score ${metrics.gi_score.toFixed(3)} is below threshold 0.95`,
      severity: metrics.gi_score < 0.90 ? 'high' : 'medium',
    });
  }
  
  if (metrics.mii_score !== undefined && metrics.mii_score < 0.95) {
    warnings.push({
      code: 'LOW_MII',
      message: `MII score ${metrics.mii_score.toFixed(3)} is below threshold 0.95`,
      severity: metrics.mii_score < 0.90 ? 'high' : 'medium',
    });
  }
  
  if (metrics.success_rate !== undefined && metrics.success_rate < 0.90) {
    warnings.push({
      code: 'LOW_SUCCESS_RATE',
      message: `Success rate ${(metrics.success_rate * 100).toFixed(1)}% is below threshold 90%`,
      severity: metrics.success_rate < 0.80 ? 'high' : 'medium',
    });
  }
  
  if (metrics.error_rate !== undefined && metrics.error_rate > 0.10) {
    warnings.push({
      code: 'HIGH_ERROR_RATE',
      message: `Error rate ${(metrics.error_rate * 100).toFixed(1)}% exceeds threshold 10%`,
      severity: metrics.error_rate > 0.20 ? 'high' : 'medium',
    });
  }
  
  if (metrics.avg_latency_ms !== undefined && metrics.avg_latency_ms > 5000) {
    warnings.push({
      code: 'HIGH_LATENCY',
      message: `Average latency ${metrics.avg_latency_ms}ms exceeds threshold 5000ms`,
      severity: metrics.avg_latency_ms > 10000 ? 'high' : 'medium',
    });
  }
  
  return warnings;
}

// ============================================================================
// Health Aggregation
// ============================================================================

export interface AggregatedHealth {
  overall: HealthStatus;
  timestamp: string;
  sentinels: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  details: Record<string, HealthCheckResponse>;
  warnings: HealthWarning[];
}

/**
 * Aggregate health from multiple sentinels
 */
export function aggregateHealth(responses: HealthCheckResponse[]): AggregatedHealth {
  const details: Record<string, HealthCheckResponse> = {};
  const warnings: HealthWarning[] = [];
  
  let healthy = 0;
  let degraded = 0;
  let unhealthy = 0;
  
  for (const response of responses) {
    details[response.agent] = response;
    
    switch (response.status) {
      case 'healthy':
        healthy++;
        break;
      case 'degraded':
        degraded++;
        warnings.push({
          code: 'SENTINEL_DEGRADED',
          message: `Sentinel ${response.agent} is degraded`,
          severity: 'medium',
        });
        break;
      case 'unhealthy':
        unhealthy++;
        warnings.push({
          code: 'SENTINEL_UNHEALTHY',
          message: `Sentinel ${response.agent} is unhealthy`,
          severity: 'high',
        });
        break;
    }
    
    // Add sentinel-specific warnings
    if (response.warnings) {
      for (const w of response.warnings) {
        warnings.push({
          ...w,
          code: `${response.agent}:${w.code}`,
        });
      }
    }
  }
  
  // Calculate overall status
  let overall: HealthStatus = 'healthy';
  if (unhealthy > 0) {
    overall = 'unhealthy';
  } else if (degraded > 0) {
    overall = 'degraded';
  }
  
  return {
    overall,
    timestamp: new Date().toISOString(),
    sentinels: {
      total: responses.length,
      healthy,
      degraded,
      unhealthy,
    },
    details,
    warnings,
  };
}
