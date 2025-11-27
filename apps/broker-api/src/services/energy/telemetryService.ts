// Energy Telemetry Service
// Mobius Systems - Energy Integration Module v1.0
// Kaizen Sprint 3: Telemetry ingestion and processing

import {
  EnergyNodeTelemetry,
  AggregatedTelemetry,
  EnergyAlert,
  EnergySource,
  GridRegion,
  NodeStatus,
  EnergyModuleConfig,
} from "./types";
import { ENERGY_CONSTITUTION } from "./constitution";

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: EnergyModuleConfig = {
  telemetryEnabled: true,
  autoRoutingEnabled: false,
  autoApprovalGiThreshold: 0.95,
  maxAutoTransferKwh: 10_000,
  alertThresholds: {
    lowStoragePercent: 20,
    highCarbonIntensity: 500,
    maxCostPerKwh: 0.75,
    minEfficiency: 0.70,
  },
  managedRegions: ["CAISO", "ERCOT", "PJM", "MISO"],
  pollingIntervalSeconds: 60,
};

// ============================================================================
// In-Memory Store (would be Redis/DB in production)
// ============================================================================

interface TelemetryStore {
  nodes: Map<string, EnergyNodeTelemetry>;
  alerts: EnergyAlert[];
  lastUpdate: Date;
}

const store: TelemetryStore = {
  nodes: new Map(),
  alerts: [],
  lastUpdate: new Date(),
};

// ============================================================================
// Telemetry Service
// ============================================================================

export class EnergyTelemetryService {
  private config: EnergyModuleConfig;

  constructor(config: Partial<EnergyModuleConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // --------------------------------------------------------------------------
  // Telemetry Ingestion
  // --------------------------------------------------------------------------

  /**
   * Ingest telemetry from an energy node
   */
  async ingestTelemetry(telemetry: EnergyNodeTelemetry): Promise<{
    stored: boolean;
    alerts: EnergyAlert[];
  }> {
    if (!this.config.telemetryEnabled) {
      return { stored: false, alerts: [] };
    }

    // Validate telemetry
    const validation = this.validateTelemetry(telemetry);
    if (!validation.valid) {
      console.warn(`[Energy] Invalid telemetry from ${telemetry.nodeId}: ${validation.reason}`);
      return { stored: false, alerts: [] };
    }

    // Store telemetry
    store.nodes.set(telemetry.nodeId, telemetry);
    store.lastUpdate = new Date();

    // Check for alerts
    const alerts = this.checkAlerts(telemetry);
    if (alerts.length > 0) {
      store.alerts.push(...alerts);
    }

    console.log(`[Energy] Ingested telemetry from ${telemetry.nodeId} (${telemetry.source})`);

    return { stored: true, alerts };
  }

  /**
   * Ingest batch of telemetry readings
   */
  async ingestBatch(telemetryList: EnergyNodeTelemetry[]): Promise<{
    stored: number;
    failed: number;
    alerts: EnergyAlert[];
  }> {
    let stored = 0;
    let failed = 0;
    const allAlerts: EnergyAlert[] = [];

    for (const telemetry of telemetryList) {
      const result = await this.ingestTelemetry(telemetry);
      if (result.stored) {
        stored++;
        allAlerts.push(...result.alerts);
      } else {
        failed++;
      }
    }

    return { stored, failed, alerts: allAlerts };
  }

  // --------------------------------------------------------------------------
  // Telemetry Retrieval
  // --------------------------------------------------------------------------

  /**
   * Get telemetry for a specific node
   */
  getNodeTelemetry(nodeId: string): EnergyNodeTelemetry | null {
    return store.nodes.get(nodeId) ?? null;
  }

  /**
   * Get all nodes in a region
   */
  getRegionNodes(region: GridRegion): EnergyNodeTelemetry[] {
    const nodes: EnergyNodeTelemetry[] = [];
    for (const node of store.nodes.values()) {
      if (node.region === region) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Get all nodes by source type
   */
  getNodesBySource(source: EnergySource): EnergyNodeTelemetry[] {
    const nodes: EnergyNodeTelemetry[] = [];
    for (const node of store.nodes.values()) {
      if (node.source === source) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Get all online nodes
   */
  getOnlineNodes(): EnergyNodeTelemetry[] {
    const nodes: EnergyNodeTelemetry[] = [];
    for (const node of store.nodes.values()) {
      if (node.status === "online") {
        nodes.push(node);
      }
    }
    return nodes;
  }

  // --------------------------------------------------------------------------
  // Aggregation
  // --------------------------------------------------------------------------

  /**
   * Aggregate telemetry for a region
   */
  aggregateRegion(region: GridRegion): AggregatedTelemetry {
    const nodes = this.getRegionNodes(region);
    return this.aggregate(`region:${region}`, "region", nodes);
  }

  /**
   * Aggregate telemetry for all managed regions
   */
  aggregateAll(): AggregatedTelemetry {
    const nodes = Array.from(store.nodes.values());
    return this.aggregate("all", "fleet", nodes);
  }

  private aggregate(
    aggregateId: string,
    aggregationType: "region" | "fleet" | "operator" | "city",
    nodes: EnergyNodeTelemetry[],
  ): AggregatedTelemetry {
    const onlineNodes = nodes.filter(n => n.status === "online");
    
    // Calculate totals
    let totalCapacityKwh = 0;
    let totalOutputKw = 0;
    let weightedStorageSum = 0;
    let weightedEfficiencySum = 0;
    let weightedCarbonSum = 0;

    const sourceBreakdown: AggregatedTelemetry["sourceBreakdown"] = {} as any;

    for (const node of nodes) {
      totalCapacityKwh += node.capacityKwh;
      totalOutputKw += node.currentOutputKw;
      weightedStorageSum += node.storagePercent * node.capacityKwh;
      weightedEfficiencySum += node.efficiency * node.capacityKwh;
      weightedCarbonSum += node.carbonIntensity * node.currentOutputKw;

      // Source breakdown
      if (!sourceBreakdown[node.source]) {
        sourceBreakdown[node.source] = { count: 0, capacityMwh: 0, outputMw: 0 };
      }
      sourceBreakdown[node.source].count++;
      sourceBreakdown[node.source].capacityMwh += node.capacityKwh / 1000;
      sourceBreakdown[node.source].outputMw += node.currentOutputKw / 1000;
    }

    return {
      aggregateId,
      aggregationType,
      nodeCount: nodes.length,
      nodesOnline: onlineNodes.length,
      totalCapacityMwh: totalCapacityKwh / 1000,
      currentOutputMw: totalOutputKw / 1000,
      avgStoragePercent: totalCapacityKwh > 0 ? weightedStorageSum / totalCapacityKwh : 0,
      avgEfficiency: totalCapacityKwh > 0 ? weightedEfficiencySum / totalCapacityKwh : 0,
      avgCarbonIntensity: totalOutputKw > 0 ? weightedCarbonSum / totalOutputKw : 0,
      sourceBreakdown,
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // Alert Checking
  // --------------------------------------------------------------------------

  private checkAlerts(telemetry: EnergyNodeTelemetry): EnergyAlert[] {
    const alerts: EnergyAlert[] = [];
    const thresholds = this.config.alertThresholds;

    // Low storage alert
    if (telemetry.storagePercent < thresholds.lowStoragePercent) {
      alerts.push(this.createAlert(
        "capacity_low",
        telemetry.storagePercent < 10 ? "critical" : "warning",
        telemetry.nodeId,
        `Storage at ${telemetry.storagePercent}%`,
        telemetry.storagePercent,
        thresholds.lowStoragePercent,
        "Consider routing additional energy to this node",
      ));
    }

    // High carbon intensity alert
    if (telemetry.carbonIntensity > thresholds.highCarbonIntensity) {
      alerts.push(this.createAlert(
        "carbon_threshold",
        "warning",
        telemetry.nodeId,
        `Carbon intensity at ${telemetry.carbonIntensity} gCO2/kWh`,
        telemetry.carbonIntensity,
        thresholds.highCarbonIntensity,
        "Consider routing to lower-carbon sources",
      ));
    }

    // High cost alert
    if (telemetry.costPerKwh > thresholds.maxCostPerKwh) {
      alerts.push(this.createAlert(
        "cost_threshold",
        "warning",
        telemetry.nodeId,
        `Cost at $${telemetry.costPerKwh}/kWh`,
        telemetry.costPerKwh,
        thresholds.maxCostPerKwh,
        "Consider alternative routing",
      ));
    }

    // Low efficiency alert
    if (telemetry.efficiency < thresholds.minEfficiency) {
      alerts.push(this.createAlert(
        "efficiency_drop",
        "warning",
        telemetry.nodeId,
        `Efficiency at ${(telemetry.efficiency * 100).toFixed(1)}%`,
        telemetry.efficiency,
        thresholds.minEfficiency,
        "Maintenance may be required",
      ));
    }

    // Node offline alert
    if (telemetry.status === "offline" || telemetry.status === "emergency") {
      alerts.push(this.createAlert(
        "node_offline",
        telemetry.status === "emergency" ? "emergency" : "critical",
        telemetry.nodeId,
        `Node status: ${telemetry.status}`,
        0,
        1,
        "Investigate node status immediately",
      ));
    }

    return alerts;
  }

  private createAlert(
    type: EnergyAlert["type"],
    severity: EnergyAlert["severity"],
    affectedId: string,
    message: string,
    currentValue: number,
    threshold: number,
    recommendedAction: string,
  ): EnergyAlert {
    return {
      alertId: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      severity,
      type,
      affectedId,
      message,
      currentValue,
      threshold,
      recommendedAction,
      acknowledged: false,
      timestamp: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // Validation
  // --------------------------------------------------------------------------

  private validateTelemetry(telemetry: EnergyNodeTelemetry): { valid: boolean; reason?: string } {
    if (!telemetry.nodeId) {
      return { valid: false, reason: "Missing nodeId" };
    }
    if (!telemetry.source) {
      return { valid: false, reason: "Missing source" };
    }
    if (telemetry.capacityKwh <= 0) {
      return { valid: false, reason: "Invalid capacity" };
    }
    if (telemetry.storagePercent < 0 || telemetry.storagePercent > 100) {
      return { valid: false, reason: "Invalid storage percent" };
    }
    if (telemetry.efficiency < 0 || telemetry.efficiency > 1) {
      return { valid: false, reason: "Invalid efficiency" };
    }
    return { valid: true };
  }

  // --------------------------------------------------------------------------
  // Alerts Management
  // --------------------------------------------------------------------------

  /**
   * Get unacknowledged alerts
   */
  getActiveAlerts(): EnergyAlert[] {
    return store.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = store.alerts.find(a => a.alertId === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get alerts for a specific node
   */
  getNodeAlerts(nodeId: string): EnergyAlert[] {
    return store.alerts.filter(a => a.affectedId === nodeId);
  }

  // --------------------------------------------------------------------------
  // Stats
  // --------------------------------------------------------------------------

  /**
   * Get service statistics
   */
  getStats(): {
    totalNodes: number;
    onlineNodes: number;
    activeAlerts: number;
    lastUpdate: string;
    regionBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  } {
    const regionBreakdown: Record<string, number> = {};
    const sourceBreakdown: Record<string, number> = {};
    let onlineCount = 0;

    for (const node of store.nodes.values()) {
      regionBreakdown[node.region] = (regionBreakdown[node.region] ?? 0) + 1;
      sourceBreakdown[node.source] = (sourceBreakdown[node.source] ?? 0) + 1;
      if (node.status === "online") onlineCount++;
    }

    return {
      totalNodes: store.nodes.size,
      onlineNodes: onlineCount,
      activeAlerts: this.getActiveAlerts().length,
      lastUpdate: store.lastUpdate.toISOString(),
      regionBreakdown,
      sourceBreakdown,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createEnergyTelemetryService(
  config?: Partial<EnergyModuleConfig>,
): EnergyTelemetryService {
  return new EnergyTelemetryService(config);
}
