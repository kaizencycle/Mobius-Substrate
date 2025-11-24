import { Router } from 'express';
import { getGiSnapshot } from '../services/giSnapshot';
import { sendAlert } from '../services/alertSink';

export const router = Router();

router.post('/check', async (_req, res, next) => {
  try {
    const gi = await getGiSnapshot();

    if (gi.mii < 0.95) {
      await sendAlert({
        title: 'GI Threshold Breached',
        body: `MII=${gi.mii} (<0.95). Recommend: Safestop or investigation.`,
        severity: 'critical',
      });
    }

    res.json({ status: 'ok', gi });
  } catch (err) {
    next(err);
  }
});

export default router;
