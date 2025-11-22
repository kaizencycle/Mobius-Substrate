import express from 'express';
import pino from 'pino';
import { config, ensureConfig } from './config';
import healthRouter from './routes/health';
import liftRouter from './routes/lift';

ensureConfig();

const logger = pino({
  level: config.nodeEnv === 'development' ? 'debug' : 'info'
});

const app = express();
app.use(express.json());

app.use('/healthz', healthRouter);
app.use('/v1/antigravity/lift', liftRouter);

app.get('/', (_req, res) => {
  res.json({
    service: 'mobius-antigravity-node',
    status: 'ready',
    docs: 'README.md'
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      model: config.gemini.modelId,
      broker: config.broker.enabled ? config.broker.url : 'disabled'
    },
    '🚀 Mobius Antigravity Node ready'
  );
});

export default app;
