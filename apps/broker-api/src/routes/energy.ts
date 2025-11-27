// Energy API Routes
// Mobius Systems - Energy Integration Module v1.0
// Broker API endpoints for energy telemetry and routing

import { Router, Request, Response, NextFunction } from "express";
import {
  createEnergyTelemetryService,
  EnergyTelemetryService,
} from "../services/energy/telemetryService";
import {
  createEnergyRoutingService,
  EnergyRoutingService,
} from "../services/energy/routingService";
import { ENERGY_CONSTITUTION } from "../services/energy/constitution";
import { ENERGY_MODULE_VERSION } from "../services/energy/types";

export const energyRouter = Router();

// Initialize services
const telemetryService = createEnergyTelemetryService();
const routingService = createEnergyRoutingService(telemetryService);

// ============================================================================
// Telemetry Endpoints
// ============================================================================

/**
 * POST /api/energy/v1/telemetry
 * 
 * Ingest telemetry from an energy node
 */
energyRouter.post("/telemetry", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const telemetry = req.body;

    if (!telemetry.nodeId) {
      return res.status(400).json({
        error: "nodeId is required",
        code: "MISSING_NODE_ID",
      });
    }

    const result = await telemetryService.ingestTelemetry(telemetry);

    res.json({
      success: result.stored,
      alerts: result.alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/energy/v1/telemetry/batch
 * 
 * Ingest batch of telemetry readings
 */
energyRouter.post("/telemetry/batch", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { telemetryList } = req.body;

    if (!Array.isArray(telemetryList)) {
      return res.status(400).json({
        error: "telemetryList array is required",
        code: "INVALID_INPUT",
      });
    }

    const result = await telemetryService.ingestBatch(telemetryList);

    res.json({
      stored: result.stored,
      failed: result.failed,
      alerts: result.alerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/energy/v1/telemetry/:nodeId
 * 
 * Get telemetry for a specific node
 */
energyRouter.get("/telemetry/:nodeId", (req: Request, res: Response) => {
  const { nodeId } = req.params;
  const telemetry = telemetryService.getNodeTelemetry(nodeId);

  if (!telemetry) {
    return res.status(404).json({
      error: "Node not found",
      code: "NODE_NOT_FOUND",
    });
  }

  res.json(telemetry);
});

/**
 * GET /api/energy/v1/telemetry/region/:region
 * 
 * Get all nodes in a region
 */
energyRouter.get("/telemetry/region/:region", (req: Request, res: Response) => {
  const { region } = req.params;
  const nodes = telemetryService.getRegionNodes(region as any);
  res.json({ region, nodes, count: nodes.length });
});

// ============================================================================
// Aggregation Endpoints
// ============================================================================

/**
 * GET /api/energy/v1/aggregate
 * 
 * Get aggregated telemetry for all managed nodes
 */
energyRouter.get("/aggregate", (req: Request, res: Response) => {
  const aggregate = telemetryService.aggregateAll();
  res.json(aggregate);
});

/**
 * GET /api/energy/v1/aggregate/:region
 * 
 * Get aggregated telemetry for a region
 */
energyRouter.get("/aggregate/:region", (req: Request, res: Response) => {
  const { region } = req.params;
  const aggregate = telemetryService.aggregateRegion(region as any);
  res.json(aggregate);
});

// ============================================================================
// Routing Endpoints
// ============================================================================

/**
 * POST /api/energy/v1/route
 * 
 * Submit an energy transfer request for constitutional review
 */
energyRouter.post("/route", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = req.body;

    // Validate required fields
    if (!request.sourceId || !request.destinationId || !request.amountKwh) {
      return res.status(400).json({
        error: "sourceId, destinationId, and amountKwh are required",
        code: "INVALID_INPUT",
      });
    }

    // Add request metadata if not present
    if (!request.requestId) {
      request.requestId = `route-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!request.timestamp) {
      request.timestamp = new Date().toISOString();
    }
    if (!request.requestedStartTime) {
      request.requestedStartTime = new Date().toISOString();
    }
    if (!request.durationMinutes) {
      request.durationMinutes = 60;
    }
    if (!request.priority) {
      request.priority = "normal";
    }

    const decision = await routingService.processTransferRequest(request);

    res.json(decision);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/energy/v1/route/optimize
 * 
 * Find optimal source for a destination's energy needs
 */
energyRouter.post("/route/optimize", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destinationId, requiredKwh } = req.body;

    if (!destinationId || !requiredKwh) {
      return res.status(400).json({
        error: "destinationId and requiredKwh are required",
        code: "INVALID_INPUT",
      });
    }

    const result = await routingService.findOptimalSource(destinationId, requiredKwh);

    if (!result) {
      return res.status(404).json({
        error: "No suitable source found",
        code: "NO_SOURCE_AVAILABLE",
      });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// Alert Endpoints
// ============================================================================

/**
 * GET /api/energy/v1/alerts
 * 
 * Get active (unacknowledged) alerts
 */
energyRouter.get("/alerts", (req: Request, res: Response) => {
  const alerts = telemetryService.getActiveAlerts();
  res.json({ alerts, count: alerts.length });
});

/**
 * GET /api/energy/v1/alerts/:nodeId
 * 
 * Get alerts for a specific node
 */
energyRouter.get("/alerts/:nodeId", (req: Request, res: Response) => {
  const { nodeId } = req.params;
  const alerts = telemetryService.getNodeAlerts(nodeId);
  res.json({ nodeId, alerts, count: alerts.length });
});

/**
 * POST /api/energy/v1/alerts/:alertId/acknowledge
 * 
 * Acknowledge an alert
 */
energyRouter.post("/alerts/:alertId/acknowledge", (req: Request, res: Response) => {
  const { alertId } = req.params;
  const acknowledged = telemetryService.acknowledgeAlert(alertId);

  if (!acknowledged) {
    return res.status(404).json({
      error: "Alert not found",
      code: "ALERT_NOT_FOUND",
    });
  }

  res.json({ success: true, alertId });
});

// ============================================================================
// Constitution Endpoints
// ============================================================================

/**
 * GET /api/energy/v1/constitution
 * 
 * Get the current energy constitution (governance rules)
 */
energyRouter.get("/constitution", (req: Request, res: Response) => {
  res.json({
    version: "1.0",
    constitution: ENERGY_CONSTITUTION,
    description: "Immutable governance rules for energy routing",
  });
});

// ============================================================================
// Stats & Health
// ============================================================================

/**
 * GET /api/energy/v1/stats
 * 
 * Get service statistics
 */
energyRouter.get("/stats", (req: Request, res: Response) => {
  const stats = telemetryService.getStats();
  res.json(stats);
});

/**
 * GET /api/energy/v1/health
 * 
 * Health check endpoint
 */
energyRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "energy-integration",
    version: ENERGY_MODULE_VERSION.full,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/energy/v1/info
 * 
 * Service information
 */
energyRouter.get("/info", (req: Request, res: Response) => {
  res.json({
    name: "Mobius Energy Integration",
    version: ENERGY_MODULE_VERSION.full,
    status: ENERGY_MODULE_VERSION.status,
    description: "Constitutional energy routing and telemetry service",
    features: [
      "Multi-source telemetry ingestion",
      "Constitutional routing constraints",
      "DVA layer integration",
      "Alert monitoring",
      "Carbon tracking",
      "Cost optimization",
    ],
    endpoints: {
      telemetry: "/api/energy/v1/telemetry",
      route: "/api/energy/v1/route",
      aggregate: "/api/energy/v1/aggregate",
      alerts: "/api/energy/v1/alerts",
      constitution: "/api/energy/v1/constitution",
    },
    constitution: {
      maxAutoTransferKwh: ENERGY_CONSTITUTION.MAX_AUTO_TRANSFER_KWH,
      giAutoApproval: ENERGY_CONSTITUTION.GI_AUTO_APPROVAL,
      maxCarbonIntensity: ENERGY_CONSTITUTION.CARBON_ALERT_THRESHOLD,
    },
  });
});
