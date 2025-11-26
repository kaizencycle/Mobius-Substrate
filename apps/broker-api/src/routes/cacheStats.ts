/**
 * ECHO Layer Statistics Endpoint
 * Provides telemetry for DVA.LITE monitoring
 */

import { Router } from 'express';
import { getCacheStats } from '../services/echoLayer';

const router = Router();

/**
 * GET /v1/cache/stats
 * Returns ECHO Layer statistics for monitoring
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      status: 'ok',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CacheStats] Error:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

