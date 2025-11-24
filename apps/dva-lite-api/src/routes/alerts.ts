import { Router } from 'express';
import { config } from '../config';
import { recordAlert, recordThresholdBreach } from '../metrics';
import { incrementAlertTally } from '../state/opsWindow';
import { updateIntegritySnapshot } from '../state/integrityState';
import { getGiSnapshot } from '../services/giSnapshot';
import { sendAlert } from '../services/alertSink';

export const router = Router();

router.post('/check', async (_req, res, next) => {
  try {
    const gi = await getGiSnapshot();
    updateIntegritySnapshot(gi);

    if (gi.mii < config.miiThreshold) {
      recordThresholdBreach('critical');
      recordAlert('gi_breach');
      incrementAlertTally('gi_breach');
      await sendAlert({
        title: 'GI Threshold Breached',
        body: `MII=${gi.mii} (<${config.miiThreshold}). Recommend: Safestop or investigation.`,
        severity: 'critical',
        type: 'gi_breach',
      });
    }

    res.json({ status: 'ok', gi });
  } catch (err) {
    next(err);
  }
});

export default router;
