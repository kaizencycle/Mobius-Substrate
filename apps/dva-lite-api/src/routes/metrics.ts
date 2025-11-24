import { Router } from 'express';
import { getGiSnapshot } from '../services/giSnapshot';

export const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const gi = await getGiSnapshot();
    res.type('text/plain').send(
      [
        `mobius_mii_current ${gi.mii}`,
        `mobius_mii_trend{direction="${gi.trend}"} 1`,
      ].join('\n'),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
