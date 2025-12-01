// apps/broker-api/src/routes/health.ts
// Health check endpoints

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Pool } from "pg";
import { getAllSentinelHealth } from "../services/sentinels/health";
import { validateAdminKey } from "../middleware/auth";
import { formatPrometheusMetric } from "../utils/prometheus";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const healthRouter = Router();

// Rate limiting for health endpoints
const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  message: { error: "Too many health check requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const detailedHealthRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP for detailed endpoints
  message: { error: "Too many requests for detailed health info, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GET /health
 * Basic health check
 */
healthRouter.get("/", healthRateLimiter, async (req, res) => {
  try {
    // Check database
    await pool.query("SELECT 1");
    
    // Check sentinels
    const sentinelHealth = getAllSentinelHealth();
    const unhealthySentinels = Object.values(sentinelHealth).filter(h => h.status === "unhealthy");
    
    if (unhealthySentinels.length > 2) {
      return res.status(503).json({
        status: "degraded",
        database: "healthy",
        sentinels: sentinelHealth,
        message: "Too many unhealthy sentinels"
      });
    }

    res.json({
      status: "healthy",
      database: "connected",
      sentinels: sentinelHealth,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error: any) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /health/detailed
 * Detailed health metrics
 */
healthRouter.get("/detailed", detailedHealthRateLimiter, async (req, res) => {
  if (!validateAdminKey(req)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    // Database stats
    const dbStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM echo_layer_entries) as total_entries,
        (SELECT COUNT(*) FROM echo_layer_entries WHERE status = 'active') as active_entries,
        (SELECT AVG(gi_score) FROM echo_layer_entries WHERE status = 'active') as avg_gi_score,
        (SELECT COUNT(*) FROM human_review_queue WHERE status = 'pending') as pending_reviews,
        (SELECT COUNT(*) FROM security_events WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '24 hours') as critical_events
    `);

    // Sentinel health
    const sentinelHealth = getAllSentinelHealth();

    // Cache hit rate (mocked for now - implement with Redis in production)
    const cacheHitRate = 0.85; // Placeholder

    res.json({
      status: "healthy",
      database: dbStats.rows[0],
      sentinels: sentinelHealth,
      cache: { hitRate: cacheHitRate },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0",
        node: process.version
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
});

/**
 * GET /metrics
 * Prometheus-compatible metrics
 */
healthRouter.get("/metrics", detailedHealthRateLimiter, async (req, res) => {
  if (!validateAdminKey(req)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    // Gather metrics
    const dbStats = await pool.query(`
      SELECT 
        COUNT(*) as total_entries,
        AVG(gi_score) as avg_gi,
        COUNT(CASE WHEN gi_score >= 0.93 THEN 1 END) as high_quality_entries
      FROM echo_layer_entries 
      WHERE status = 'active'
    `);

    const sentinelHealth = getAllSentinelHealth();

    // Format as Prometheus metrics
    const metrics = `
# HELP echo_layer_entries_total Total number of entries in ECHO layer
# TYPE echo_layer_entries_total gauge
${formatPrometheusMetric("echo_layer_entries_total", dbStats.rows[0].total_entries)}

# HELP echo_layer_gi_score_average Average GI score of active entries
# TYPE echo_layer_gi_score_average gauge
${formatPrometheusMetric("echo_layer_gi_score_average", dbStats.rows[0].avg_gi || 0)}

# HELP echo_high_quality_entries Number of high-quality entries (GI >= 0.93)
# TYPE echo_high_quality_entries gauge
${formatPrometheusMetric("echo_high_quality_entries", dbStats.rows[0].high_quality_entries)}

${Object.entries(sentinelHealth).map(([name, health]) => `
# HELP sentinel_health_status Sentinel health status (1=healthy, 0=unhealthy)
# TYPE sentinel_health_status gauge
${formatPrometheusMetric("sentinel_health_status", health.status === "healthy" ? 1 : 0, { name })}

# HELP sentinel_error_rate Sentinel error rate
# TYPE sentinel_error_rate gauge
${formatPrometheusMetric("sentinel_error_rate", health.errorRate, { name })}
`).join("\n")}
    `;

    res.set("Content-Type", "text/plain");
    res.send(metrics.trim());
  } catch (error: any) {
    res.status(500).send("# ERROR generating metrics");
  }
});
