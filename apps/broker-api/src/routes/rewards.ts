import express from 'express';
import { previewReward } from '../services/tokenomicsService';

const router = express.Router();

router.post('/preview', (req, res) => {
  try {
    const { activity, options } = req.body;
    if (!activity) {
      res.status(400).json({ error: 'activity payload is required' });
      return;
    }

    const reward = previewReward(activity, options);
    res.json(reward);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({ error: message });
  }
});

export default router;
