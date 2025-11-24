import express from 'express';
import { config } from './config';
import { router as alerts } from './routes/alerts';
import { router as health } from './routes/health';
import { router as metrics } from './routes/metrics';
import { router as opsSummary } from './routes/opsSummary';
import { setSafeModeEnabled } from './state/integrityState';
import { startIntegrityPoller } from './tasks/integrityPoller';

const app = express();

app.use(express.json());

app.use('/health', health);
app.use('/metrics', metrics);
app.use('/alerts', alerts);
app.use('/ops/summary', opsSummary);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[DVA.LITE] Unhandled error', err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
});

setSafeModeEnabled(config.safeModeDefault);
startIntegrityPoller();

app.listen(config.port, () => {
  console.log(`DVA.LITE running on :${config.port}`);
});

export default app;
