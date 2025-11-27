import { NextFunction, Request, Response } from "express";

interface AdminAuthOptions {
  headerName?: string;
  expectedToken?: string;
}

/**
 * Placeholder admin auth middleware. In production, wire this to
 * your existing auth stack (JWT, mTLS, Civics SSO, etc.).
 */
export function requireAdminAuth(
  options: AdminAuthOptions = {}
): (req: Request, res: Response, next: NextFunction) => void {
  const headerName = options.headerName ?? "authorization";
  const expectedToken =
    options.expectedToken ?? process.env.ENCYCLOPEDIA_ADMIN_TOKEN;

  return (req, res, next) => {
    if (!expectedToken) {
      console.warn(
        "[encyclopedia-api] No ENCYCLOPEDIA_ADMIN_TOKEN configured; allowing admin routes for local dev"
      );
      return next();
    }

    const provided = req.header(headerName);
    const token = provided?.toLowerCase().startsWith("bearer ")
      ? provided.slice(7)
      : provided;

    if (!token || token !== expectedToken) {
      return res.status(401).json({ error: "unauthorized" });
    }

    // Attach a placeholder reviewer id for downstream use
    (req as any).userId = req.header("x-admin-user") ?? "admin";
    return next();
  };
}
