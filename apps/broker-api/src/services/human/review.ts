// apps/broker-api/src/services/human/review.ts
// Human Review Queue Management

import { Pool } from "pg";
import { sendNotification } from "../notifications/email";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export interface HumanReviewItem {
  id?: string;
  query: string;
  context: any;
  consensus?: any;
  reason: string;
  priority: "low" | "medium" | "high" | "critical";
  status?: "pending" | "in_review" | "approved" | "rejected" | "escalated";
  domain?: string;
  jurisdiction?: string;
  proposedAnswer?: string;
  sentinels?: any[];
  sources?: any[];
}

/**
 * Enqueues an item for human review
 */
export async function enqueueForHumanReview(
  item: HumanReviewItem
): Promise<string> {
  const client = await pool.connect();
  
  try {
    const id = `HR_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    await client.query(
      `INSERT INTO human_review_queue (
        id, query, context, consensus, reason, priority, 
        status, domain, jurisdiction, proposed_answer, 
        sentinels_json, sources_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        id,
        item.query,
        JSON.stringify(item.context || {}),
        JSON.stringify(item.consensus || {}),
        item.reason,
        item.priority || "medium",
        "pending",
        item.domain || "general",
        item.jurisdiction || null,
        item.proposedAnswer || null,
        JSON.stringify(item.sentinels || []),
        JSON.stringify(item.sources || [])
      ]
    );

    // Send notification
    await sendReviewNotification(id, item);

    console.log(`[Human Review] Enqueued ${id} with priority ${item.priority}`);
    
    return id;
  } finally {
    client.release();
  }
}

/**
 * Gets pending review items
 */
export async function getPendingReviews(
  limit: number = 50,
  domain?: string
): Promise<HumanReviewItem[]> {
  const query = domain 
    ? `SELECT * FROM human_review_queue WHERE status = 'pending' AND domain = $1 ORDER BY priority DESC, created_at ASC LIMIT $2`
    : `SELECT * FROM human_review_queue WHERE status = 'pending' ORDER BY priority DESC, created_at ASC LIMIT $1`;
  
  const params = domain ? [domain, limit] : [limit];
  
  const res = await pool.query(query, params);
  
  return res.rows.map(row => ({
    id: row.id,
    query: row.query,
    context: JSON.parse(row.context || "{}"),
    consensus: JSON.parse(row.consensus || "{}"),
    reason: row.reason,
    priority: row.priority,
    status: row.status,
    domain: row.domain,
    jurisdiction: row.jurisdiction,
    proposedAnswer: row.proposed_answer,
    sentinels: JSON.parse(row.sentinels_json || "[]"),
    sources: JSON.parse(row.sources_json || "[]")
  }));
}

/**
 * Submits a human review decision
 */
export async function submitHumanReview(
  reviewId: string,
  decision: "approve" | "reject" | "escalate",
  feedback: string,
  reviewer: string
): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Update review status
    await client.query(
      `UPDATE human_review_queue 
       SET status = $1, 
           feedback = $2, 
           reviewer = $3, 
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4`,
      [`${decision}d`, feedback, reviewer, reviewId]
    );

    // If approved, write to ECHO cache
    if (decision === "approve") {
      const review = await client.query(
        `SELECT query, proposed_answer, gi_score, sentinels_json, sources_json, domain 
         FROM human_review_queue WHERE id = $1`,
        [reviewId]
      );

      if (review.rows.length > 0) {
        const row = review.rows[0];
        const { writeToEchoCache } = await import("../echo/cache");
        
        await writeToEchoCache(`hr_${reviewId}`, {
          query: row.query,
          answer: row.proposed_answer,
          giScore: row.gi_score || 0.95, // Human-approved gets high GI
          sentinels: JSON.parse(row.sentinels_json || "[]"),
          sources: JSON.parse(row.sources_json || "[]"),
          domain: row.domain
        });
      }
    }

    console.log(`[Human Review] ${decision}d ${reviewId} by ${reviewer}`);
  } finally {
    client.release();
  }
}

/**
 * Sends notification for new review item
 */
async function sendReviewNotification(id: string, item: HumanReviewItem): Promise<void> {
  const notificationConfig = {
    email: process.env.HUMAN_REVIEW_EMAIL,
    slackWebhook: process.env.SLACK_WEBHOOK_URL
  };

  // Send email if configured
  if (notificationConfig.email) {
    await sendNotification({
      to: notificationConfig.email,
      subject: `[Mobius] Human Review Required: ${item.priority.toUpperCase()}`,
      body: `
Review ID: ${id}
Priority: ${item.priority}
Domain: ${item.domain}
Query: ${item.query}
Reason: ${item.reason}

Review: ${process.env.APP_URL}/human-review/${id}
      `.trim()
    });
  }

  // Send Slack notification if configured
  if (notificationConfig.slackWebhook) {
    try {
      await fetch(notificationConfig.slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 Human Review Required (${item.priority})`,
          attachments: [{
            fields: [
              { title: "Review ID", value: id, short: true },
              { title: "Domain", value: item.domain || "general", short: true },
              { title: "Query", value: item.query.substring(0, 200) },
              { title: "Reason", value: item.reason }
            ],
            actions: [{
              type: "button",
              text: "Review Now",
              url: `${process.env.APP_URL}/human-review/${id}`
            }]
          }]
        })
      });
    } catch (error) {
      console.warn(`[Slack] Notification failed:`, error);
    }
  }
}

