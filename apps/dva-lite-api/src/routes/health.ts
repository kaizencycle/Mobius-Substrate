import { Router } from 'express';
import { getBrokerMetrics } from '../services/brokerMetrics';
import { getGiSnapshot } from '../services/giSnapshot';
import { updateIntegritySnapshot } from '../state/integrityState';

export const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const [gi, broker] = await Promise.allSettled([getGiSnapshot(), getBrokerMetrics()]);

    if (gi.status === 'fulfilled') {
      updateIntegritySnapshot(gi.value);
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      gi: gi.status === 'fulfilled' ? gi.value : null,
      brokerMetrics: broker.status === 'fulfilled' ? broker.value : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
