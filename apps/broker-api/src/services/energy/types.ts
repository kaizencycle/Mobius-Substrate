// Energy Telemetry Types
// Mobius Systems - Energy Integration Module v1.0
// Kaizen Sprint 1: Define what energy data Mobius can ingest

// ============================================================================
// Energy Source Types
// ============================================================================

/**
 * Supported energy source types
 */
export type EnergySource =
  | "solar"
  | "wind"
  | "hydro"
  | "geothermal"
  | "nuclear"
  | "grid"
  | "battery"
  | "hydrogen"
  | "natural_gas"
  | "other";

/**
 * Energy storage medium types
 */
export type StorageMedium =
  | "lithium_ion"
  | "liquid_metal"
  | "hydrogen_tank"
  | "molten_salt"
  | "pumped_hydro"
  | "flywheel"
  | "compressed_air"
  | "grid_export";

/**
 * Node operational status
 */
export type NodeStatus =
  | "online"
  | "offline"
  | "degraded"
  | "maintenance"
  | "emergency";

/**
 * Grid region identifiers (US ISO regions)
 */
export type GridRegion =
  | "CAISO"   // California
  | "ERCOT"   // Texas
  | "PJM"     // Mid-Atlantic
  | "MISO"    // Midwest
  | "SPP"     // Southwest
  | "NYISO"   // New York
  | "ISONE"   // New England
  | "OTHER";

// ============================================================================
// Core Telemetry Interfaces
// ============================================================================

/**
 * Real-time telemetry from an energy node
 */
export interface EnergyNodeTelemetry {
  /** Unique node identifier */
  nodeId: string;
  
  /** Human-readable node name */
  nodeName: string;
  
  /** Primary energy source */
  source: EnergySource;
  
  /** Grid region this node belongs to */
  region: GridRegion;
  
  /** Geographic coordinates */
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  
  /** Current operational status */
  status: NodeStatus;
  
  // --- Capacity Metrics ---
  
  /** Maximum capacity in kWh */
  capacityKwh: number;
  
  /** Current output in kW */
  currentOutputKw: number;
  
  /** Current storage level (0-100) */
  storagePercent: number;
  
  /** Available capacity for export in kWh */
  availableExportKwh: number;
  
  // --- Efficiency Metrics ---
  
  /** Current efficiency rating (0-1) */
  efficiency: number;
  
  /** Carbon intensity (gCO2/kWh) */
  carbonIntensity: number;
  
  /** Cost per kWh in USD */
  costPerKwh: number;
  
  // --- Timestamps ---
  
  /** When this reading was taken */
  timestamp: string;
  
  /** When the node was last calibrated */
  lastCalibration?: string;
  
  // --- Metadata ---
  
  /** Operator/owner identifier */
  operatorId?: string;
  
  /** Hardware version */
  hardwareVersion?: string;
  
  /** Firmware version */
  firmwareVersion?: string;
}

/**
 * Aggregated telemetry for a region or fleet
 */
export interface AggregatedTelemetry {
  /** Region or fleet identifier */
  aggregateId: string;
  
  /** Type of aggregation */
  aggregationType: "region" | "fleet" | "operator" | "city";
  
  /** Number of nodes in aggregate */
  nodeCount: number;
  
  /** Nodes currently online */
  nodesOnline: number;
  
  /** Total capacity in MWh */
  totalCapacityMwh: number;
  
  /** Current total output in MW */
  currentOutputMw: number;
  
  /** Average storage level (0-100) */
  avgStoragePercent: number;
  
  /** Weighted average efficiency */
  avgEfficiency: number;
  
  /** Weighted average carbon intensity */
  avgCarbonIntensity: number;
  
  /** Breakdown by source type */
  sourceBreakdown: Record<EnergySource, {
    count: number;
    capacityMwh: number;
    outputMw: number;
  }>;
  
  /** Timestamp of aggregation */
  timestamp: string;
}

// ============================================================================
// Energy Routing Types
// ============================================================================

/**
 * A proposed energy transfer between nodes/regions
 */
export interface EnergyTransferRequest {
  /** Unique request identifier */
  requestId: string;
  
  /** Source node or region */
  sourceId: string;
  
  /** Destination node or region */
  destinationId: string;
  
  /** Amount to transfer in kWh */
  amountKwh: number;
  
  /** Requested start time */
  requestedStartTime: string;
  
  /** Expected duration in minutes */
  durationMinutes: number;
  
  /** Priority level */
  priority: "low" | "normal" | "high" | "emergency";
  
  /** Reason for transfer */
  reason: string;
  
  /** Requester identifier */
  requesterId: string;
  
  /** Timestamp of request */
  timestamp: string;
}

/**
 * Result of an energy transfer routing decision
 */
export interface EnergyRoutingDecision {
  /** Original request ID */
  requestId: string;
  
  /** Decision outcome */
  decision: "approved" | "denied" | "modified" | "pending_review";
  
  /** GI score for this decision */
  giScore: number;
  
  /** Sentinels that reviewed */
  reviewedBy: string[];
  
  /** If modified, the adjusted parameters */
  modifications?: {
    adjustedAmountKwh?: number;
    adjustedStartTime?: string;
    adjustedRoute?: string[];
  };
  
  /** Reason for decision */
  reasoning: string;
  
  /** Constitutional constraints applied */
  constraintsApplied: string[];
  
  /** Estimated cost in USD */
  estimatedCostUsd: number;
  
  /** Estimated carbon impact (negative = savings) */
  estimatedCarbonImpactKg: number;
  
  /** Ledger transaction ID if attested */
  ledgerTxId?: string;
  
  /** Timestamp of decision */
  timestamp: string;
}

// ============================================================================
// Alert Types
// ============================================================================

/**
 * Energy system alert
 */
export interface EnergyAlert {
  /** Unique alert identifier */
  alertId: string;
  
  /** Severity level */
  severity: "info" | "warning" | "critical" | "emergency";
  
  /** Alert type */
  type: 
    | "capacity_low"
    | "demand_spike"
    | "node_offline"
    | "efficiency_drop"
    | "carbon_threshold"
    | "cost_threshold"
    | "grid_instability"
    | "weather_impact"
    | "maintenance_required";
  
  /** Affected node or region */
  affectedId: string;
  
  /** Alert message */
  message: string;
  
  /** Current value that triggered alert */
  currentValue: number;
  
  /** Threshold that was crossed */
  threshold: number;
  
  /** Recommended action */
  recommendedAction?: string;
  
  /** Whether alert is acknowledged */
  acknowledged: boolean;
  
  /** Timestamp */
  timestamp: string;
}

// ============================================================================
// Historical Data Types
// ============================================================================

/**
 * Historical data point for time-series analysis
 */
export interface EnergyDataPoint {
  timestamp: string;
  outputKw: number;
  storagePercent: number;
  efficiency: number;
  carbonIntensity: number;
  costPerKwh: number;
}

/**
 * Historical summary for a node
 */
export interface EnergyHistoricalSummary {
  nodeId: string;
  period: "hour" | "day" | "week" | "month";
  startTime: string;
  endTime: string;
  
  /** Total energy produced in kWh */
  totalOutputKwh: number;
  
  /** Peak output in kW */
  peakOutputKw: number;
  
  /** Average efficiency */
  avgEfficiency: number;
  
  /** Total carbon emitted in kg */
  totalCarbonKg: number;
  
  /** Total cost in USD */
  totalCostUsd: number;
  
  /** Uptime percentage */
  uptimePercent: number;
  
  /** Data points for graphing */
  dataPoints: EnergyDataPoint[];
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Energy module configuration
 */
export interface EnergyModuleConfig {
  /** Enable telemetry ingestion */
  telemetryEnabled: boolean;
  
  /** Enable automated routing */
  autoRoutingEnabled: boolean;
  
  /** GI threshold for auto-approval */
  autoApprovalGiThreshold: number;
  
  /** Maximum transfer without human review (kWh) */
  maxAutoTransferKwh: number;
  
  /** Alert thresholds */
  alertThresholds: {
    lowStoragePercent: number;
    highCarbonIntensity: number;
    maxCostPerKwh: number;
    minEfficiency: number;
  };
  
  /** Regions this instance manages */
  managedRegions: GridRegion[];
  
  /** Polling interval in seconds */
  pollingIntervalSeconds: number;
}

// ============================================================================
// Module Metadata
// ============================================================================

export const ENERGY_MODULE_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  full: "1.0.0",
  status: "development" as const,
} as const;
