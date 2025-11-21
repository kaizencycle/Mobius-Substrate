import request from 'supertest';
import app from '../src/server';
import * as ledgerClientModule from '../src/clients/ledgerClient';
import { trialAnalyticsStore } from '../src/services/trialAnalyticsStore';

describe('KTT Trial-001 Analytics Listing API', () => {
  beforeAll(() => {
    jest.spyOn(ledgerClientModule, 'ledgerClient', 'get').mockReturnValue({
      createTrialSession: jest.fn().mockResolvedValue(undefined),
      recordTrialEvent: jest.fn().mockResolvedValue(undefined),
      closeTrialSession: jest.fn().mockResolvedValue(undefined),
    } as any);
  });

  beforeEach(() => {
    trialAnalyticsStore.reset();
  });

  it('returns empty list and stats when no trials exist', async () => {
    const listRes = await request(app).get('/v1/trials/ktt-001').expect(200);
    expect(listRes.body.protocolId).toBe('ktt-001');
    expect(Array.isArray(listRes.body.trials)).toBe(true);
    expect(listRes.body.trials.length).toBe(0);

    const statsRes = await request(app).get('/v1/trials/ktt-001/stats').expect(200);
    expect(statsRes.body.protocolId).toBe('ktt-001');
    expect(statsRes.body.totalTrials).toBe(0);
  });

  it('lists trials after creating sessions and events', async () => {
    const sessionRes = await request(app)
      .post('/v1/trials/ktt-001/session')
      .send({ participantId: 'user-abc', scenarioId: 'dispatch-001' })
      .expect(201);

    const trialId = sessionRes.body.trialId;

    await request(app)
      .post('/v1/trials/ktt-001/event')
      .send({
        trialId,
        stepIndex: 1,
        prompt: 'Prompt 1',
        userChoice: 'help',
        alignmentScore: 0.9,
        giSnapshot: 0.95,
      })
      .expect(201);

    await request(app)
      .post('/v1/trials/ktt-001/close')
      .send({
        trialId,
        steps: 1,
        completionStatus: 'completed',
        finalGiScore: 0.96,
        finalAlignmentScore: 0.91,
      })
      .expect(200);

    const listRes = await request(app).get('/v1/trials/ktt-001').expect(200);
    expect(listRes.body.protocolId).toBe('ktt-001');
    expect(Array.isArray(listRes.body.trials)).toBe(true);
    expect(listRes.body.trials.length).toBeGreaterThanOrEqual(1);

    const found = listRes.body.trials.find((t: any) => t.trialId === trialId);
    expect(found).toBeDefined();
    expect(found.status).toBe('closed');
    expect(typeof found.steps).toBe('number');
  });

  it('serves the dashboard HTML', async () => {
    const res = await request(app).get('/dashboard/ktt-001').expect(200);
    expect(res.text).toContain('KTT Trial-001 Dashboard');
  });
});

