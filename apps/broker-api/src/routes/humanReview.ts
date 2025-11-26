/**
 * Human Review Queue Endpoint
 * Manages low-GI answers requiring human review before caching
 */

import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.INTEGRITY_CACHE_DB_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * GET /v1/cache/review/pending
 * List pending review items
 */
router.get('/pending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const priority = req.query.priority as string | undefined;

    let query = `
      SELECT *
      FROM human_review_queue
      WHERE status = 'pending'
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (priority) {
      query += ` AND priority = $${paramIdx++}`;
      params.push(priority);
    }

    query += ` ORDER BY 
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
      END,
      created_at ASC
      LIMIT $${paramIdx++}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json({
      status: 'ok',
      items: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('[HumanReview] Error fetching pending:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/cache/review/:id/approve
 * Approve a review item and promote to cache
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { editorId, editorNotes, finalAnswer, finalGiScore } = req.body;

    // Get the review item
    const reviewRes = await pool.query(
      'SELECT * FROM human_review_queue WHERE id = $1',
      [id]
    );

    if (reviewRes.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: 'Review item not found' });
    }

    const reviewItem = reviewRes.rows[0];

    // Update review status
    await pool.query(
      `UPDATE human_review_queue
       SET status = 'approved',
           editor_id = $1,
           editor_notes = $2,
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [editorId || null, editorNotes || null, id]
    );

    // Promote to cache (if finalAnswer provided)
    if (finalAnswer && finalGiScore) {
      // Import storeEntry here to avoid circular dependency
      const { storeEntry } = await import('../services/echoLayer');
      const { canonicalizeKey } = await import('../utils/textCanonicalization');
      const { inferFreshnessTag, computeValidUntil } = await import('../config/integrityCache');

      const canonicalKey = canonicalizeKey(reviewItem.question);
      const domain = 'general'; // Could extract from reviewItem if stored
      const freshnessTag = inferFreshnessTag(domain);
      const validUntil = computeValidUntil(freshnessTag);

      await storeEntry({
        questionRaw: reviewItem.question,
        answerText: finalAnswer,
        giScore: finalGiScore,
        sources: reviewItem.sources_json || [],
        sentinels: reviewItem.sentinels_json || {},
        domain,
        locale: 'en-US',
        embedding: [], // Would need to compute embedding
      });
    }

    res.json({
      status: 'ok',
      message: 'Review item approved',
      reviewId: id,
    });
  } catch (error) {
    console.error('[HumanReview] Error approving:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/cache/review/:id/reject
 * Reject a review item
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { editorId, editorNotes } = req.body;

    await pool.query(
      `UPDATE human_review_queue
       SET status = 'rejected',
           editor_id = $1,
           editor_notes = $2,
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE id = $3`,
      [editorId || null, editorNotes || null, id]
    );

    res.json({
      status: 'ok',
      message: 'Review item rejected',
      reviewId: id,
    });
  } catch (error) {
    console.error('[HumanReview] Error rejecting:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /v1/cache/review/enqueue
 * Enqueue a deliberation for human review
 */
router.post('/enqueue', async (req, res) => {
  try {
    const {
      deliberationId,
      question,
      answerCandidate,
      giScore,
      sources,
      sentinels,
      flaggedReason,
      priority = 'normal',
    } = req.body;

    const result = await pool.query(
      `INSERT INTO human_review_queue (
        deliberation_id,
        question,
        answer_candidate,
        gi_score,
        sources_json,
        sentinels_json,
        flagged_reason,
        priority,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING id`,
      [
        deliberationId,
        question,
        answerCandidate,
        giScore,
        JSON.stringify(sources || []),
        JSON.stringify(sentinels || {}),
        flaggedReason || null,
        priority,
      ]
    );

    res.json({
      status: 'ok',
      reviewId: result.rows[0].id,
      message: 'Item enqueued for human review',
    });
  } catch (error) {
    console.error('[HumanReview] Error enqueueing:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

