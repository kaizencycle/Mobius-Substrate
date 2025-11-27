// Energy Routing Service
// Mobius Systems - Energy Integration Module v1.0
// Kaizen Sprint 4: Routing decisions with ECHO integration

import {
  EnergyTransferRequest,
  EnergyRoutingDecision,
  EnergyNodeTelemetry,
} from "./types";
import {
  ENERGY_CONSTITUTION,
  checkConstitutionalCompliance,
  canAutoApprove,
  getRequiredSentinelCount,
  calculateRoutingScore,
  getDVALayer,
  ConstitutionalCheckResult,
} from "./constitution";
import { EnergyTelemetryService } from "./telemetryService";

// ============================================================================
// Routing Service
// ============================================================================

export class EnergyRoutingService {
  private telemetryService: EnergyTelemetryService;

  constructor(telemetryService: EnergyTelemetryService) {
    this.telemetryService = telemetryService;
  }

  // --------------------------------------------------------------------------
  // Main Routing Entry Point
  // --------------------------------------------------------------------------

  /**
   * Process an energy transfer request through constitutional review
   */
  async processTransferRequest(
    request: EnergyTransferRequest,
  ): Promise<EnergyRoutingDecision> {
    const startTime = Date.now();

    // Get source and destination telemetry
    const sourceNode = this.telemetryService.getNodeTelemetry(request.sourceId);
    const destNode = this.telemetryService.getNodeTelemetry(request.destinationId);

    if (!sourceNode) {
      return this.createDeniedDecision(
        request,
        "Source node not found or offline",
        [],
        Date.now() - startTime,
      );
    }

    if (!destNode) {
      return this.createDeniedDecision(
        request,
        "Destination node not found or offline",
        [],
        Date.now() - startTime,
      );
    }

    // Run constitutional checks
    const constitutionalResults = checkConstitutionalCompliance(
      request,
      sourceNode,
      destNode,
    );

    // Check for hard failures
    const hardFailures = constitutionalResults.filter(r => !r.passed);
    if (hardFailures.length > 0) {
      // Some failures might be recoverable with modifications
      const canModify = this.attemptModification(request, sourceNode, hardFailures);
      
      if (canModify.modified) {
        return this.processModifiedRequest(
          request,
          canModify.modifiedRequest!,
          sourceNode,
          destNode,
          constitutionalResults,
          Date.now() - startTime,
        );
      }

      return this.createDeniedDecision(
        request,
        `Constitutional violations: ${hardFailures.map(f => f.reason).join("; ")}`,
        constitutionalResults.map(r => r.constraint),
        Date.now() - startTime,
      );
    }

    // Calculate GI score (would integrate with ECHO in production)
    const giScore = this.calculateGIScore(request, sourceNode, destNode, constitutionalResults);

    // Check if can auto-approve
    const autoApproval = canAutoApprove(request, giScore, constitutionalResults);

    if (autoApproval.canApprove) {
      return this.createApprovedDecision(
        request,
        giScore,
        autoApproval.reason,
        constitutionalResults.map(r => r.constraint),
        sourceNode,
        destNode,
        Date.now() - startTime,
      );
    }

    // Route to appropriate DVA layer for review
    const dvaLayer = getDVALayer(request, sourceNode.region, destNode.region);
    
    return this.createPendingDecision(
      request,
      giScore,
      `Requires ${dvaLayer} review: ${autoApproval.reason}`,
      constitutionalResults.map(r => r.constraint),
      sourceNode,
      destNode,
      Date.now() - startTime,
    );
  }

  // --------------------------------------------------------------------------
  // GI Score Calculation
  // --------------------------------------------------------------------------

  private calculateGIScore(
    request: EnergyTransferRequest,
    source: EnergyNodeTelemetry,
    dest: EnergyNodeTelemetry,
    constitutionalResults: ConstitutionalCheckResult[],
  ): number {
    let score = 0.80; // Base score

    // Constitutional compliance bonus
    const passedChecks = constitutionalResults.filter(r => r.passed).length;
    const totalChecks = constitutionalResults.length;
    score += (passedChecks / totalChecks) * 0.10;

    // Source reliability bonus
    if (source.status === "online" && source.efficiency > 0.9) {
      score += 0.03;
    }

    // Low carbon bonus
    if (source.carbonIntensity < ENERGY_CONSTITUTION.MAX_PREFERRED_CARBON_INTENSITY) {
      score += 0.02;
    }

    // Cost efficiency bonus
    if (source.costPerKwh < ENERGY_CONSTITUTION.MAX_AUTO_COST_PER_KWH) {
      score += 0.02;
    }

    // Same-region bonus (lower transmission loss)
    if (source.region === dest.region) {
      score += 0.02;
    }

    // Priority adjustment
    if (request.priority === "emergency") {
      score += 0.01; // Slight boost for emergency
    }

    // Routing score contribution
    const routingScore = calculateRoutingScore(source, dest, request);
    score += (routingScore / 100) * 0.05;

    return Math.min(1.0, score);
  }

  // --------------------------------------------------------------------------
  // Modification Attempts
  // --------------------------------------------------------------------------

  private attemptModification(
    request: EnergyTransferRequest,
    source: EnergyNodeTelemetry,
    failures: ConstitutionalCheckResult[],
  ): { modified: boolean; modifiedRequest?: EnergyTransferRequest } {
    // Try to create a modified request that passes checks
    let modifiedAmount = request.amountKwh;
    let canModify = true;

    for (const failure of failures) {
      switch (failure.constraint) {
        case "MAX_SINGLE_TRANSFER_KWH":
          modifiedAmount = Math.min(modifiedAmount, ENERGY_CONSTITUTION.MAX_SINGLE_TRANSFER_KWH);
          break;
        
        case "MAX_TRANSFER_PERCENT_OF_CAPACITY":
          const maxByCapacity = source.capacityKwh * (ENERGY_CONSTITUTION.MAX_TRANSFER_PERCENT_OF_CAPACITY / 100);
          modifiedAmount = Math.min(modifiedAmount, maxByCapacity);
          break;
        
        case "MIN_SOURCE_STORAGE_AFTER_TRANSFER":
          const currentStorageKwh = (source.storagePercent / 100) * source.capacityKwh;
          const minRetain = (ENERGY_CONSTITUTION.MIN_SOURCE_STORAGE_AFTER_TRANSFER / 100) * source.capacityKwh;
          const maxTransfer = currentStorageKwh - minRetain;
          if (maxTransfer > 0) {
            modifiedAmount = Math.min(modifiedAmount, maxTransfer);
          } else {
            canModify = false;
          }
          break;
        
        default:
          // Some constraints can't be modified around
          if (failure.constraint === "CARBON_ALERT_THRESHOLD" || 
              failure.constraint === "MAX_TRANSFER_DURATION_MINUTES") {
            canModify = false;
          }
      }
    }

    if (!canModify || modifiedAmount <= 0 || modifiedAmount === request.amountKwh) {
      return { modified: false };
    }

    return {
      modified: true,
      modifiedRequest: {
        ...request,
        amountKwh: modifiedAmount,
      },
    };
  }

  private async processModifiedRequest(
    originalRequest: EnergyTransferRequest,
    modifiedRequest: EnergyTransferRequest,
    source: EnergyNodeTelemetry,
    dest: EnergyNodeTelemetry,
    originalResults: ConstitutionalCheckResult[],
    elapsedMs: number,
  ): Promise<EnergyRoutingDecision> {
    // Re-run checks with modified request
    const newResults = checkConstitutionalCompliance(modifiedRequest, source, dest);
    const newFailures = newResults.filter(r => !r.passed);

    if (newFailures.length > 0) {
      return this.createDeniedDecision(
        originalRequest,
        "Cannot modify request to meet constitutional requirements",
        originalResults.map(r => r.constraint),
        elapsedMs,
      );
    }

    const giScore = this.calculateGIScore(modifiedRequest, source, dest, newResults);

    return {
      requestId: originalRequest.requestId,
      decision: "modified",
      giScore,
      reviewedBy: ["energy-routing-service"],
      modifications: {
        adjustedAmountKwh: modifiedRequest.amountKwh,
      },
      reasoning: `Original request of ${originalRequest.amountKwh} kWh modified to ${modifiedRequest.amountKwh} kWh to meet constitutional limits`,
      constraintsApplied: newResults.map(r => r.constraint),
      estimatedCostUsd: modifiedRequest.amountKwh * source.costPerKwh,
      estimatedCarbonImpactKg: this.calculateCarbonImpact(modifiedRequest, source, dest),
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // Decision Creation Helpers
  // --------------------------------------------------------------------------

  private createApprovedDecision(
    request: EnergyTransferRequest,
    giScore: number,
    reasoning: string,
    constraints: string[],
    source: EnergyNodeTelemetry,
    dest: EnergyNodeTelemetry,
    elapsedMs: number,
  ): EnergyRoutingDecision {
    return {
      requestId: request.requestId,
      decision: "approved",
      giScore,
      reviewedBy: ["energy-routing-service"],
      reasoning,
      constraintsApplied: constraints,
      estimatedCostUsd: request.amountKwh * source.costPerKwh,
      estimatedCarbonImpactKg: this.calculateCarbonImpact(request, source, dest),
      timestamp: new Date().toISOString(),
    };
  }

  private createDeniedDecision(
    request: EnergyTransferRequest,
    reasoning: string,
    constraints: string[],
    elapsedMs: number,
  ): EnergyRoutingDecision {
    return {
      requestId: request.requestId,
      decision: "denied",
      giScore: 0,
      reviewedBy: ["energy-routing-service"],
      reasoning,
      constraintsApplied: constraints,
      estimatedCostUsd: 0,
      estimatedCarbonImpactKg: 0,
      timestamp: new Date().toISOString(),
    };
  }

  private createPendingDecision(
    request: EnergyTransferRequest,
    giScore: number,
    reasoning: string,
    constraints: string[],
    source: EnergyNodeTelemetry,
    dest: EnergyNodeTelemetry,
    elapsedMs: number,
  ): EnergyRoutingDecision {
    return {
      requestId: request.requestId,
      decision: "pending_review",
      giScore,
      reviewedBy: ["energy-routing-service"],
      reasoning,
      constraintsApplied: constraints,
      estimatedCostUsd: request.amountKwh * source.costPerKwh,
      estimatedCarbonImpactKg: this.calculateCarbonImpact(request, source, dest),
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // Impact Calculations
  // --------------------------------------------------------------------------

  private calculateCarbonImpact(
    request: EnergyTransferRequest,
    source: EnergyNodeTelemetry,
    dest: EnergyNodeTelemetry,
  ): number {
    // Calculate carbon impact of this transfer
    // Positive = emissions, Negative = savings (if dest would have used dirtier source)
    
    const sourceCarbon = (request.amountKwh * source.carbonIntensity) / 1000; // kg
    
    // Assume dest would have used grid average if not for this transfer
    const gridAvgCarbon = 400; // gCO2/kWh - US grid average
    const avoidedCarbon = (request.amountKwh * gridAvgCarbon) / 1000;
    
    // Net impact (negative = savings)
    return sourceCarbon - avoidedCarbon;
  }

  // --------------------------------------------------------------------------
  // Route Optimization
  // --------------------------------------------------------------------------

  /**
   * Find the best source for a destination's energy needs
   */
  async findOptimalSource(
    destinationId: string,
    requiredKwh: number,
  ): Promise<{
    sourceId: string;
    score: number;
    estimatedCost: number;
    estimatedCarbon: number;
  } | null> {
    const dest = this.telemetryService.getNodeTelemetry(destinationId);
    if (!dest) return null;

    const candidates = this.telemetryService.getOnlineNodes()
      .filter(n => n.nodeId !== destinationId)
      .filter(n => n.availableExportKwh >= requiredKwh)
      .filter(n => n.storagePercent > ENERGY_CONSTITUTION.MIN_SOURCE_STORAGE_AFTER_TRANSFER + 10);

    if (candidates.length === 0) return null;

    // Score each candidate
    const mockRequest: EnergyTransferRequest = {
      requestId: "optimization-query",
      sourceId: "",
      destinationId,
      amountKwh: requiredKwh,
      requestedStartTime: new Date().toISOString(),
      durationMinutes: 60,
      priority: "normal",
      reason: "Optimization query",
      requesterId: "system",
      timestamp: new Date().toISOString(),
    };

    let bestSource: typeof candidates[0] | null = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = calculateRoutingScore(candidate, dest, mockRequest);
      if (score > bestScore) {
        bestScore = score;
        bestSource = candidate;
      }
    }

    if (!bestSource) return null;

    return {
      sourceId: bestSource.nodeId,
      score: bestScore,
      estimatedCost: requiredKwh * bestSource.costPerKwh,
      estimatedCarbon: (requiredKwh * bestSource.carbonIntensity) / 1000,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createEnergyRoutingService(
  telemetryService: EnergyTelemetryService,
): EnergyRoutingService {
  return new EnergyRoutingService(telemetryService);
}
