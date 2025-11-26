// apps/broker-api/src/services/security/logger.ts
// Security event logging

import { Pool } from "pg";
import { sendNotification } from "../notifications/email";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface SecurityEvent {
  type: "ECHO_BLOCK" | "SENTINEL_FAILURE" | "DRIFT_MAJOR" | "HUMAN_REVIEW_BACKLOG";
  severity: "low" | "medium" | "high" | "critical";
  query?: string;
  giScore?: number;
  sentinels?: any[];
  metadata?: Record<string, any>;
}

/**
 * Logs a security event
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const client = await pool.connect();
  
  try {
    const id = `SEC_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    await client.query(
      `INSERT INTO security_events (
        id, event_type, severity, query_text, gi_score, 
        sentinels_json, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        id,
        event.type,
        event.severity,
        event.query || null,
        event.giScore || null,
        JSON.stringify(event.sentinels || []),
        JSON.stringify(event.metadata || {})
      ]
    );

    console.error(`[Security Event] ${event.type} - ${event.severity}: ${event.query?.substring(0, 100)}`);

    // Alert for critical events
    if (event.severity === "critical") {
      await sendCriticalAlert(event);
    }
  } finally {
    client.release();
  }
}

/**
 * Gets recent security events
 */
export async function getSecurityEvents(
  severity?: string,
  limit: number = 100
): Promise<SecurityEvent[]> {
  const query = severity
    ? `SELECT * FROM security_events WHERE severity = $1 ORDER BY created_at DESC LIMIT $2`
    : `SELECT * FROM security_events ORDER BY created_at DESC LIMIT $1`;
  
  const params = severity ? [severity, limit] : [limit];
  
  const res = await pool.query(query, params);
  
  return res.rows.map(row => ({
    type: row.event_type,
    severity: row.severity,
    query: row.query_text,
    giScore: row.gi_score,
    sentinels: JSON.parse(row.sentinels_json || "[]"),
    metadata: JSON.parse(row.metadata || "{}")
  }));
}

/**
 * Sends critical security alert
 */
async function sendCriticalAlert(event: SecurityEvent): Promise<void> {
  const alertEmails = (process.env.SECURITY_ALERT_EMAILS || "").split(",").filter(Boolean);
  
  for (const email of alertEmails) {
    await sendNotification({
      to: email,
      subject: `🚨 CRITICAL SECURITY ALERT: ${event.type}`,
      body: `
Critical security event detected:

Type: ${event.type}
Severity: ${event.severity}
Query: ${event.query || "N/A"}
GI Score: ${event.giScore || "N/A"}
Time: ${new Date().toISOString()}

Review immediately: ${process.env.APP_URL}/security/events

Metadata: ${JSON.stringify(event.metadata, null, 2)}
      `.trim()
    });
  }
}

