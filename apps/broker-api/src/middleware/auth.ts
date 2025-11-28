// apps/broker-api/src/middleware/auth.ts
// Authentication middleware and utilities

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";

/**
 * Validates admin API key from request headers
 * Returns true if valid, false otherwise
 *
 * Security: Explicitly checks that both the header and environment variable
 * are defined and match. Prevents undefined === undefined bypass.
 */
export function validateAdminKey(req: Request): boolean {
  const apiKey = req.headers["x-admin-key"] as string | undefined;
  const expectedKey = process.env.ECHO_ADMIN_KEY;

  // Explicitly validate both values exist and match
  if (!expectedKey || !apiKey || apiKey !== expectedKey) {
    return false;
  }

  return true;
}

/**
 * Express middleware to require admin authentication
 * Returns 403 if authentication fails
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!validateAdminKey(req)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

/**
 * Validates API key from request headers
 * Returns true if valid, false otherwise
 */
export function authenticateAPIKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const expectedKey = process.env.API_KEY || process.env.BROKER_API_KEY;

  // Allow requests without key in development mode
  if (process.env.NODE_ENV === "development" && !expectedKey) {
    return next();
  }

  if (!expectedKey || !apiKey || apiKey !== expectedKey) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  next();
}

/**
 * Rate limiter for deliberation endpoints
 */
export const deliberationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many deliberation requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
