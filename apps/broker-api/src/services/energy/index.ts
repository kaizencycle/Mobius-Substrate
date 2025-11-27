// Energy Integration Module - Index
// Mobius Systems - Energy Integration Module v1.0
// Kaizen: Incremental energy infrastructure integration

// ============================================================================
// Type Exports
// ============================================================================

export * from "./types";

// ============================================================================
// Constitution Exports
// ============================================================================

export {
  ENERGY_CONSTITUTION,
  checkConstitutionalCompliance,
  canAutoApprove,
  getRequiredSentinelCount,
  calculateRoutingScore,
  getDVALayer,
  constitution,
} from "./constitution";

export type {
  ConstitutionalCheckResult,
  DVALayer,
} from "./constitution";

// ============================================================================
// Service Exports
// ============================================================================

export {
  EnergyTelemetryService,
  createEnergyTelemetryService,
} from "./telemetryService";

export {
  EnergyRoutingService,
  createEnergyRoutingService,
} from "./routingService";

// ============================================================================
// Module Info
// ============================================================================

import { ENERGY_MODULE_VERSION } from "./types";

export const MODULE_INFO = {
  name: "Mobius Energy Integration",
  version: ENERGY_MODULE_VERSION.full,
  status: ENERGY_MODULE_VERSION.status,
  description: "Constitutional energy routing and telemetry for Mobius Systems",
  
  // Kaizen sprints completed
  sprints: [
    "Sprint 1: Energy Telemetry Types",
    "Sprint 2: DVA Energy Constitution",
    "Sprint 3: Telemetry Ingestion Service",
    "Sprint 4: Constitutional Routing Service",
  ],
  
  // Integration points
  integrations: {
    echo: "ECHO Layer caches verified routing decisions",
    dva: "DVA layers govern routing by complexity",
    ledger: "Civic Ledger attests high-value transfers",
    broker: "Thought Broker orchestrates multi-sentinel review",
  },
  
  // DVA layer mapping
  dvaMapping: {
    "DVA.LITE": "Monitors anomalies, handles small auto-approved transfers",
    "DVA.ONE": "Optimizes single-node decisions, handles medium transfers",
    "DVA.FULL": "Coordinates cross-region transfers",
    "DVA.HIVE": "Nation-scale emergency coordination",
  },
};
