// DVA Energy Constitution
// Mobius Systems - Energy Integration Module v1.0
// Kaizen Sprint 2: Constitutional constraints for energy routing

import {
  EnergyTransferRequest,
  EnergyRoutingDecision,
  EnergyNodeTelemetry,
  GridRegion,
} from "./types";

// ============================================================================
// Constitutional Constants
// ============================================================================

/**
 * Energy Constitution - Immutable governance rules
 * 
 * These constraints cannot be overridden by any AI decision.
 * They represent the "constitutional limits" of Mobius energy governance.
 */
export const ENERGY_CONSTITUTION = {
  // --- Transfer Limits ---
  
  /** Maximum kWh that can be auto-approved without human review */
  MAX_AUTO_TRANSFER_KWH: 10_000,
  
  /** Maximum kWh that can be approved even with human review */
  MAX_SINGLE_TRANSFER_KWH: 1_000_000,
  
  /** Maximum transfers per hour from a single source */
  MAX_TRANSFERS_PER_HOUR: 100,
  
  // --- GI Thresholds ---
  
  /** Minimum GI for any routing decision */
  MIN_GI_FOR_ROUTING: 0.90,
  
  /** GI required for auto-approval */
  GI_AUTO_APPROVAL: 0.95,
  
  /** GI required for emergency routing */
  GI_EMERGENCY_ROUTING: 0.85,
  
  // --- Safety Constraints ---
  
  /** Minimum storage % a source must maintain after transfer */
  MIN_SOURCE_STORAGE_AFTER_TRANSFER: 20,
  
  /** Maximum % of capacity that can be transferred at once */
  MAX_TRANSFER_PERCENT_OF_CAPACITY: 50,
  
  /** Minimum nodes that must remain online in a region */
  MIN_ONLINE_NODES_PER_REGION: 3,
  
  // --- Environmental Constraints ---
  
  /** Maximum carbon intensity for preferred routing (gCO2/kWh) */
  MAX_PREFERRED_CARBON_INTENSITY: 100,
  
  /** Carbon intensity that triggers alert (gCO2/kWh) */
  CARBON_ALERT_THRESHOLD: 500,
  
  // --- Cost Constraints ---
  
  /** Maximum cost per kWh for auto-approval (USD) */
  MAX_AUTO_COST_PER_KWH: 0.50,
  
  /** Cost threshold requiring human review (USD) */
  COST_REVIEW_THRESHOLD: 0.75,
  
  // --- Timing Constraints ---
  
  /** Maximum duration for a single transfer (minutes) */
  MAX_TRANSFER_DURATION_MINUTES: 480, // 8 hours
  
  /** Minimum advance notice for scheduled transfers (minutes) */
  MIN_SCHEDULE_ADVANCE_MINUTES: 15,
  
  // --- Consensus Requirements ---
  
  /** Minimum sentinels for standard routing */
  MIN_SENTINELS_STANDARD: 2,
  
  /** Minimum sentinels for high-value routing */
  MIN_SENTINELS_HIGH_VALUE: 3,
  
  /** High-value threshold (kWh) */
  HIGH_VALUE_THRESHOLD_KWH: 50_000,
} as const;

// ============================================================================
// Constitutional Checks
// ============================================================================

export interface ConstitutionalCheckResult {
  passed: boolean;
  constraint: string;
  reason: string;
  currentValue?: number;
  limit?: number;
}

/**
 * Run all constitutional checks on a transfer request
 */
export function checkConstitutionalCompliance(
  request: EnergyTransferRequest,
  sourceNode: EnergyNodeTelemetry,
  destinationNode: EnergyNodeTelemetry,
): ConstitutionalCheckResult[] {
  const results: ConstitutionalCheckResult[] = [];
  
  // Check 1: Transfer amount within limits
  results.push(checkTransferAmount(request));
  
  // Check 2: Source has enough capacity
  results.push(checkSourceCapacity(request, sourceNode));
  
  // Check 3: Source maintains minimum storage
  results.push(checkMinimumStorage(request, sourceNode));
  
  // Check 4: Transfer duration within limits
  results.push(checkDuration(request));
  
  // Check 5: Carbon intensity acceptable
  results.push(checkCarbonIntensity(sourceNode));
  
  // Check 6: Cost within limits
  results.push(checkCost(sourceNode));
  
  // Check 7: Advance notice (if scheduled)
  results.push(checkSchedulingAdvance(request));
  
  return results;
}

function checkTransferAmount(request: EnergyTransferRequest): ConstitutionalCheckResult {
  const passed = request.amountKwh <= ENERGY_CONSTITUTION.MAX_SINGLE_TRANSFER_KWH;
  return {
    passed,
    constraint: "MAX_SINGLE_TRANSFER_KWH",
    reason: passed 
      ? "Transfer amount within constitutional limits"
      : `Transfer of ${request.amountKwh} kWh exceeds maximum of ${ENERGY_CONSTITUTION.MAX_SINGLE_TRANSFER_KWH} kWh`,
    currentValue: request.amountKwh,
    limit: ENERGY_CONSTITUTION.MAX_SINGLE_TRANSFER_KWH,
  };
}

function checkSourceCapacity(
  request: EnergyTransferRequest,
  source: EnergyNodeTelemetry,
): ConstitutionalCheckResult {
  const transferPercent = (request.amountKwh / source.capacityKwh) * 100;
  const passed = transferPercent <= ENERGY_CONSTITUTION.MAX_TRANSFER_PERCENT_OF_CAPACITY;
  return {
    passed,
    constraint: "MAX_TRANSFER_PERCENT_OF_CAPACITY",
    reason: passed
      ? "Transfer within capacity limits"
      : `Transfer is ${transferPercent.toFixed(1)}% of capacity, exceeds ${ENERGY_CONSTITUTION.MAX_TRANSFER_PERCENT_OF_CAPACITY}%`,
    currentValue: transferPercent,
    limit: ENERGY_CONSTITUTION.MAX_TRANSFER_PERCENT_OF_CAPACITY,
  };
}

function checkMinimumStorage(
  request: EnergyTransferRequest,
  source: EnergyNodeTelemetry,
): ConstitutionalCheckResult {
  const currentStorageKwh = (source.storagePercent / 100) * source.capacityKwh;
  const storageAfterTransfer = currentStorageKwh - request.amountKwh;
  const percentAfterTransfer = (storageAfterTransfer / source.capacityKwh) * 100;
  const passed = percentAfterTransfer >= ENERGY_CONSTITUTION.MIN_SOURCE_STORAGE_AFTER_TRANSFER;
  
  return {
    passed,
    constraint: "MIN_SOURCE_STORAGE_AFTER_TRANSFER",
    reason: passed
      ? "Source maintains minimum storage after transfer"
      : `Source would drop to ${percentAfterTransfer.toFixed(1)}%, below minimum ${ENERGY_CONSTITUTION.MIN_SOURCE_STORAGE_AFTER_TRANSFER}%`,
    currentValue: percentAfterTransfer,
    limit: ENERGY_CONSTITUTION.MIN_SOURCE_STORAGE_AFTER_TRANSFER,
  };
}

function checkDuration(request: EnergyTransferRequest): ConstitutionalCheckResult {
  const passed = request.durationMinutes <= ENERGY_CONSTITUTION.MAX_TRANSFER_DURATION_MINUTES;
  return {
    passed,
    constraint: "MAX_TRANSFER_DURATION_MINUTES",
    reason: passed
      ? "Transfer duration within limits"
      : `Duration of ${request.durationMinutes} minutes exceeds maximum of ${ENERGY_CONSTITUTION.MAX_TRANSFER_DURATION_MINUTES}`,
    currentValue: request.durationMinutes,
    limit: ENERGY_CONSTITUTION.MAX_TRANSFER_DURATION_MINUTES,
  };
}

function checkCarbonIntensity(source: EnergyNodeTelemetry): ConstitutionalCheckResult {
  const passed = source.carbonIntensity <= ENERGY_CONSTITUTION.CARBON_ALERT_THRESHOLD;
  return {
    passed,
    constraint: "CARBON_ALERT_THRESHOLD",
    reason: passed
      ? "Carbon intensity acceptable"
      : `Carbon intensity of ${source.carbonIntensity} gCO2/kWh exceeds alert threshold`,
    currentValue: source.carbonIntensity,
    limit: ENERGY_CONSTITUTION.CARBON_ALERT_THRESHOLD,
  };
}

function checkCost(source: EnergyNodeTelemetry): ConstitutionalCheckResult {
  const passed = source.costPerKwh <= ENERGY_CONSTITUTION.COST_REVIEW_THRESHOLD;
  return {
    passed,
    constraint: "COST_REVIEW_THRESHOLD",
    reason: passed
      ? "Cost within acceptable range"
      : `Cost of $${source.costPerKwh}/kWh exceeds review threshold`,
    currentValue: source.costPerKwh,
    limit: ENERGY_CONSTITUTION.COST_REVIEW_THRESHOLD,
  };
}

function checkSchedulingAdvance(request: EnergyTransferRequest): ConstitutionalCheckResult {
  const now = new Date();
  const requestedStart = new Date(request.requestedStartTime);
  const advanceMinutes = (requestedStart.getTime() - now.getTime()) / (1000 * 60);
  
  // Only check if this is a future scheduled transfer
  if (advanceMinutes > 0) {
    const passed = advanceMinutes >= ENERGY_CONSTITUTION.MIN_SCHEDULE_ADVANCE_MINUTES;
    return {
      passed,
      constraint: "MIN_SCHEDULE_ADVANCE_MINUTES",
      reason: passed
        ? "Sufficient advance notice provided"
        : `Only ${advanceMinutes.toFixed(0)} minutes advance notice, requires ${ENERGY_CONSTITUTION.MIN_SCHEDULE_ADVANCE_MINUTES}`,
      currentValue: advanceMinutes,
      limit: ENERGY_CONSTITUTION.MIN_SCHEDULE_ADVANCE_MINUTES,
    };
  }
  
  return {
    passed: true,
    constraint: "MIN_SCHEDULE_ADVANCE_MINUTES",
    reason: "Immediate transfer - advance notice not required",
  };
}

// ============================================================================
// Decision Logic
// ============================================================================

/**
 * Determine if a transfer can be auto-approved
 */
export function canAutoApprove(
  request: EnergyTransferRequest,
  giScore: number,
  constitutionalResults: ConstitutionalCheckResult[],
): { canApprove: boolean; reason: string } {
  // All constitutional checks must pass
  const failedChecks = constitutionalResults.filter(r => !r.passed);
  if (failedChecks.length > 0) {
    return {
      canApprove: false,
      reason: `Constitutional violations: ${failedChecks.map(c => c.constraint).join(", ")}`,
    };
  }
  
  // GI must meet threshold
  if (giScore < ENERGY_CONSTITUTION.GI_AUTO_APPROVAL) {
    return {
      canApprove: false,
      reason: `GI score ${giScore} below auto-approval threshold ${ENERGY_CONSTITUTION.GI_AUTO_APPROVAL}`,
    };
  }
  
  // Amount must be within auto-approval limit
  if (request.amountKwh > ENERGY_CONSTITUTION.MAX_AUTO_TRANSFER_KWH) {
    return {
      canApprove: false,
      reason: `Transfer of ${request.amountKwh} kWh exceeds auto-approval limit of ${ENERGY_CONSTITUTION.MAX_AUTO_TRANSFER_KWH} kWh`,
    };
  }
  
  // Emergency requests can bypass some checks with lower GI
  if (request.priority === "emergency" && giScore >= ENERGY_CONSTITUTION.GI_EMERGENCY_ROUTING) {
    return {
      canApprove: true,
      reason: "Emergency routing approved with expedited review",
    };
  }
  
  return {
    canApprove: true,
    reason: "All constitutional checks passed, GI threshold met",
  };
}

/**
 * Determine required sentinel count for a transfer
 */
export function getRequiredSentinelCount(request: EnergyTransferRequest): number {
  if (request.amountKwh >= ENERGY_CONSTITUTION.HIGH_VALUE_THRESHOLD_KWH) {
    return ENERGY_CONSTITUTION.MIN_SENTINELS_HIGH_VALUE;
  }
  return ENERGY_CONSTITUTION.MIN_SENTINELS_STANDARD;
}

/**
 * Calculate routing priority score
 * Higher score = better routing option
 */
export function calculateRoutingScore(
  source: EnergyNodeTelemetry,
  destination: EnergyNodeTelemetry,
  request: EnergyTransferRequest,
): number {
  let score = 100;
  
  // Penalize high carbon intensity
  score -= (source.carbonIntensity / 10);
  
  // Penalize high cost
  score -= (source.costPerKwh * 20);
  
  // Reward high efficiency
  score += (source.efficiency * 20);
  
  // Penalize low storage at source
  if (source.storagePercent < 50) {
    score -= (50 - source.storagePercent);
  }
  
  // Reward proximity (same region)
  if (source.region === destination.region) {
    score += 10;
  }
  
  // Priority bonus
  switch (request.priority) {
    case "emergency": score += 50; break;
    case "high": score += 20; break;
    case "normal": score += 0; break;
    case "low": score -= 10; break;
  }
  
  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// DVA Layer Mapping
// ============================================================================

/**
 * Determine which DVA layer should handle a routing decision
 */
export type DVALayer = "LITE" | "ONE" | "FULL" | "HIVE";

export function getDVALayer(
  request: EnergyTransferRequest,
  sourceRegion: GridRegion,
  destRegion: GridRegion,
): DVALayer {
  // Cross-region transfers → DVA.FULL or DVA.HIVE
  if (sourceRegion !== destRegion) {
    // Multi-region (more than 2 regions involved) → HIVE
    // For now, simple cross-region → FULL
    return "FULL";
  }
  
  // Emergency → elevate to appropriate level
  if (request.priority === "emergency") {
    return request.amountKwh > ENERGY_CONSTITUTION.HIGH_VALUE_THRESHOLD_KWH 
      ? "FULL" 
      : "ONE";
  }
  
  // High-value single-region → DVA.ONE
  if (request.amountKwh > ENERGY_CONSTITUTION.MAX_AUTO_TRANSFER_KWH) {
    return "ONE";
  }
  
  // Standard monitoring and small transfers → DVA.LITE
  return "LITE";
}

// ============================================================================
// Exports
// ============================================================================

export {
  ENERGY_CONSTITUTION as constitution,
};
