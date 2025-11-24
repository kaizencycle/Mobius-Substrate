import { Router } from 'express';
import { metricsHandler } from '../metrics';

export const router = Router();

router.get('/', metricsHandler);

export default router;
