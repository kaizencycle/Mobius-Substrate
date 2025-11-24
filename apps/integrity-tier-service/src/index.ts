import express from 'express';
import { z } from 'zod';
import { evaluateIntegrity } from './integrityTier';

const app = express();
app.use(express.json());

const InputSchema = z.object({
  content: z.string(),
  origin: z.object({
    engine: z.string(),
    routingMode: z.string(),
    taskType: z.string().optional(),
    sources: z.array(z.string()).optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
});

app.post('/v1/integrity/evaluate', async (req, res) => {
  const parse = InputSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parse.error.format() });
  }

  try {
    const result = await evaluateIntegrity(parse.data);
    return res.json(result);
  } catch (err) {
    console.error('[integrity-tier] evaluation error', err);
    return res
      .status(500)
      .json({ error: 'Integrity evaluation failed', details: 'internal_error' });
  }
});

const port = process.env.PORT || 4600;
app.listen(port, () => {
  console.log(`[integrity-tier] service listening on ${port}`);
});
