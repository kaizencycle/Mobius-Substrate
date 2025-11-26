import express from 'express';
import request from 'supertest';
import echoRouter from '../src/routes/v1/echo';
import { memoryStore } from '@mobius/echo-layer';

describe('ECHO /v1/echo/reinforce route', () => {
  const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/v1/echo', echoRouter);
    return app;
  };

  beforeEach(() => {
    memoryStore.clear();
  });

  it('returns a reinforced entry', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/v1/echo/reinforce')
      .send({
        question: 'What is 2 + 2?',
        a1: { answer: '4', sources: [] },
        a2: { answer: '4', sources: [] },
      })
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('question', 'What is 2 + 2?');
    expect(res.body).toHaveProperty('answer', '4');
    expect(memoryStore.get('What is 2 + 2?')).not.toBeNull();
  });
});
