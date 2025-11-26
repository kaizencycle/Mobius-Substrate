import { Router, Request, Response } from 'express';
import {
  createEntry,
  getCanonicalEntryByTopicId,
  searchEntries,
} from '../services/encyclopediaService';
import { CreateEncyclopediaEntryInput, EncyclopediaStatus } from '../types/encyclopedia';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) ?? '';
    if (!query.trim()) {
      return res.status(400).json({ error: 'MISSING_QUERY' });
    }

    const results = await searchEntries(query, 20, {
      jurisdictionId: req.query.jurisdictionId as string | undefined,
    });

    return res.json({ results });
  } catch (err) {
    console.error('[GET /v1/encyclopedia] error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.get('/:topicId', async (req: Request, res: Response) => {
  try {
    const topicId = req.params.topicId;
    if (!topicId) {
      return res.status(400).json({ error: 'MISSING_TOPIC_ID' });
    }

    const entry = await getCanonicalEntryByTopicId(topicId, {
      jurisdictionId: req.query.jurisdictionId as string | undefined,
    });

    if (!entry) {
      return res.status(404).json({ error: 'ENTRY_NOT_FOUND', topicId });
    }

    return res.json({ entry });
  } catch (err) {
    console.error('[GET /v1/encyclopedia/:topicId] error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

router.post('/ingest', async (req: Request, res: Response) => {
  try {
    const payload = req.body as Partial<CreateEncyclopediaEntryInput> & {
      giScore: number;
      engines: CreateEncyclopediaEntryInput['engines'];
      sources: CreateEncyclopediaEntryInput['sources'];
    };

    if (!payload?.topicId || !payload?.title || !payload?.content) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const normalizedStatus: EncyclopediaStatus =
      payload.status ?? (payload.giScore >= 0.95 ? 'CANONICAL' : 'DRAFT');

    const entry = await createEntry({
      topicId: payload.topicId,
      title: payload.title,
      summary: payload.summary ?? payload.content.slice(0, 280),
      content: payload.content,
      giScore: payload.giScore,
      status: normalizedStatus,
      engines: payload.engines ?? [],
      sources: payload.sources ?? [],
      createdBy: payload.createdBy ?? 'system:encyclopedia',
      ledgerTxId: payload.ledgerTxId,
      jurisdictionId: payload.jurisdictionId,
    });

    return res.status(201).json({ entry });
  } catch (err) {
    console.error('[POST /v1/encyclopedia/ingest] error', err);
    return res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

export default router;
