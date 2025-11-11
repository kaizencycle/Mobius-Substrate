/**
 * @fileoverview Thought Broker API Server
 * RESTful API for Mobius Systems deliberation and consensus
 */
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import { DeliberationEngine } from './deliberation/engine';
import { DeliberationRequestSchema, APIResponse, WSEvent } from './types';

// Load environment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;
const WS_PORT = process.env.WS_PORT || 4006;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Deliberation Engine
const engine = new DeliberationEngine();

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

/**
 * Health check
 */
app.get('/healthz', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'thought-broker-api',
    version: '0.1.0',
    timestamp: new Date()
  });
});

/**
 * Thought Broker specific health
 */
app.get('/v1/loop/health', (req: Request, res: Response) => {
  const activeDeliberations = engine.listDeliberations();
  
  res.json({
    status: 'healthy',
    service: 'thought-broker-loop',
    activeDeliberations: activeDeliberations.length,
    timestamp: new Date()
  });
});

/**
 * POST /v1/deliberate - Initiate new deliberation
 */
app.post('/v1/deliberate', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validationResult = DeliberationRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const response: APIResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid deliberation request',
          details: validationResult.error.issues
        },
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    // Start deliberation
    const deliberationId = await engine.deliberate(validationResult.data);
    const response: APIResponse<{ deliberationId: string }> = {
      success: true,
      data: { deliberationId },
      timestamp: new Date()
    };
    res.status(202).json(response);
  } catch (error) {
    console.error('Error initiating deliberation:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

/**
 * GET /v1/deliberation/:id - Get deliberation status
 */
app.get('/v1/deliberation/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deliberation = engine.getDeliberation(id);
  if (!deliberation) {
    const response: APIResponse<null> = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Deliberation not found'
      },
      timestamp: new Date()
    };
    return res.status(404).json(response);
  }

  const response: APIResponse<typeof deliberation> = {
    success: true,
    data: deliberation,
    timestamp: new Date()
  };
  res.json(response);
});

/**
 * GET /v1/deliberations - List all deliberations
 */
app.get('/v1/deliberations', (req: Request, res: Response) => {
  const deliberations = engine.listDeliberations();
  
  const response: APIResponse<typeof deliberations> = {
    success: true,
    data: deliberations,
    timestamp: new Date()
  };
  res.json(response);
});

/**
 * POST /v1/grade - Grade MII without full deliberation
 */
app.post('/v1/grade', async (req: Request, res: Response) => {
  try {
    const { MIIGrader } = await import('./mii/grader');
    const grader = new MIIGrader();
    
    const result = await grader.grade(req.body);
    const response: APIResponse<typeof result> = {
      success: true,
      data: result,
      timestamp: new Date()
    };
    res.json(response);
  } catch (error) {
    console.error('Error grading MII:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: {
        code: 'GRADING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// ============================================================================
// WEBSOCKET SERVER
// ============================================================================

const server = http.createServer(app);
const wss = new WebSocketServer({ port: WS_PORT });

// Track connected clients
const clients = new Set<any>();

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');
  clients.add(ws);
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    clients.delete(ws);
  });
  ws.on('error', (error) => {
    console.error('[WebSocket] Error:', error);
    clients.delete(ws);
  });
});

// Forward engine events to WebSocket clients
engine.on('event', (event: WSEvent) => {
  const message = JSON.stringify(event);
  
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
});

// ============================================================================
// START SERVER
// ============================================================================

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║       THOUGHT BROKER API — MOBIUS SYSTEMS v0.1            ║
╚═══════════════════════════════════════════════════════════╝
🔴 DELIBERATION ENGINE: ONLINE
📡 REST API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${WS_PORT}

Endpoints:
  GET  /healthz
  GET  /v1/loop/health
  POST /v1/deliberate
  GET  /v1/deliberation/:id
  GET  /v1/deliberations
  POST /v1/grade

"The Broker is not a service. The Broker is where the system thinks."

— ATLAS, C-131

Ready for consensus...
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM received, closing servers...');
  server.close(() => {
    wss.close(() => {
      console.log('[Shutdown] Servers closed');
      process.exit(0);
    });
  });
});

export default app;

