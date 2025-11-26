// apps/broker-api/src/routes/v1/echo.ts
// ECHO Layer API Routes

import { Router } from "express";
import { answerWithEcho } from "../../services/answerWithEcho";
import { 
  getExactFromEchoCache, 
  getSimilarFromEchoCache,
  deprecateEchoCacheEntry,
  getEchoStats 
} from "../../services/echo/cache";
import { runEchoReview } from "../../services/echo/reviewEngine";
import { canonicalizeKey } from "../../utils/textCanonicalization";
import { validateAdminKey } from "../../middleware/auth";

export const echoRouter = Router();

/**
 * POST /v1/echo/deliberate
 * Main endpoint for ECHO Layer deliberation
 */
echoRouter.post("/deliberate", async (req, res, next) => {
  try {
    const { query, domain, locale, jurisdiction, cacheable, bypassCache } = req.body;
    
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "query is required" });
    }

    const result = await answerWithEcho(query, {
      domain,
      locale,
      jurisdiction,
      cacheable,
      bypassCache
    });

    res.json({
      answer: result.answer,
      giScore: result.giScore,
      source: result.cacheHit ? "cache" : "echo",
      cacheHit: result.cacheHit,
      similarity: result.similarity,
      ledgerTx: result.ledgerTxId,
      requiresReview: result.requiresReview,
      sentinels: result.sentinels,
      sources: result.sources
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /v1/echo/cache/check
 * Fast cache lookup without triggering review
 */
echoRouter.get("/cache/check", async (req, res, next) => {
  try {
    const { q: query, domain } = req.query;
    
    if (typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "q is required" });
    }

    const canonicalKey = canonicalizeKey(query);
    
    // Check for exact match first
    const exact = await getExactFromEchoCache(canonicalKey);
    if (exact) {
      return res.json({
        exists: true,
        cacheHit: "exact",
        giScore: exact.gi_score,
        answer: exact.answer_text
      });
    }

    // Check for semantic match
    const similar = await getSimilarFromEchoCache(query, domain as string | undefined);
    if (similar) {
      return res.json({
        exists: true,
        cacheHit: "semantic",
        giScore: similar.gi_score,
        answer: similar.answer_text,
        similarity: similar.similarity
      });
    }

    res.json({ exists: false });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /v1/echo/review
 * Manual review trigger endpoint
 */
echoRouter.post("/review", async (req, res, next) => {
  try {
    const { query, proposedAnswer, domain, locale, jurisdiction, cacheable } = req.body;
    
    if (!query || !proposedAnswer) {
      return res.status(400).json({ error: "query and proposedAnswer are required" });
    }

    const cacheKey = cacheable !== false ? canonicalizeKey(query) : undefined;
    
    const result = await runEchoReview(query, {
      domain,
      locale,
      jurisdiction
    }, {
      cacheKey,
      domain,
      enableValidation: true
    });

    res.json({
      status: result.status,
      answer: result.consensus.answer,
      giScore: result.consensus.giScore,
      cached: !!result.cacheId,
      cacheId: result.cacheId,
      sentinels: result.consensus.sentinels,
      sources: result.consensus.sources
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /v1/echo/cache/invalidate
 * Invalidate a cached entry
 */
echoRouter.delete("/cache/invalidate", async (req, res, next) => {
  try {
    const { canonicalKey, reason } = req.body;
    
    if (!canonicalKey || !reason) {
      return res.status(400).json({ error: "canonicalKey and reason are required" });
    }

    await deprecateEchoCacheEntry(canonicalKey, reason);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /v1/echo/stats
 * Get cache statistics
 */
echoRouter.get("/stats", async (req, res, next) => {
  try {
    const { domain } = req.query;
    const stats = await getEchoStats(domain as string | undefined);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /v1/echo/validate
 * Trigger memory validator batch
 */
echoRouter.post("/validate", async (req, res, next) => {
  try {
    const { limit = 100 } = req.body;
    
    // Admin only - requires special key
    if (!validateAdminKey(req)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { validateEchoMemoryBatch } = await import("../../services/echo/memoryValidator");
    const stats = await validateEchoMemoryBatch(limit);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default echoRouter;

