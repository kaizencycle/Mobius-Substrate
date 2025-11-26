// apps/broker-api/src/middleware/auth.ts
// Authentication middleware and utilities

import { Request, Response, NextFunction } from "express";

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
