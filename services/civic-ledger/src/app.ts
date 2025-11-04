import express from "express";
import { giStatus } from "./routes/gi.js";
import { shardsToCreditsRoute, creditsToShardsRoute } from "./routes/convert.js";
import { getSystemHealth } from "./utils/health.js";

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "civic-ledger",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// System health (detailed)
app.get("/system/health", async (_req, res) => {
  try {
    const health = await getSystemHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GI endpoint
app.get("/gi", giStatus);

// Conversion endpoints
app.post("/convert/shards-to-credits", shardsToCreditsRoute);
app.post("/convert/credits-to-shards", creditsToShardsRoute);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.originalUrl,
    available_routes: [
      "GET /health",
      "GET /system/health",
      "GET /gi",
      "POST /convert/shards-to-credits",
      "POST /convert/credits-to-shards"
    ]
  });
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

export default app;
