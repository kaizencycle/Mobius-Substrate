import { Router } from 'express';
import { config } from '../config';
import { getOpsWindowSnapshot } from '../state/opsWindow';
import { getIntegritySnapshot, isSafeModeEnabled, updateIntegritySnapshot } from '../state/integrityState';
import { getGiSnapshot } from '../services/giSnapshot';

export const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    let snapshot = getIntegritySnapshot();

    if (!snapshot) {
      snapshot = await getGiSnapshot();
      updateIntegritySnapshot(snapshot);
    }

    const summary = {
      miiCurrent: snapshot?.mii ?? 0,
      miiThreshold: config.miiThreshold,
      safeModeEnabled: isSafeModeEnabled(),
      last24h: getOpsWindowSnapshot(),
    };

    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;
