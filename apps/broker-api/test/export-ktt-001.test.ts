import request from 'supertest';
import app from '../src/server';
import * as ledgerClientModule from '../src/clients/ledgerClient';
import { trialAnalyticsStore } from '../src/services/trialAnalyticsStore';

describe('KTT-001 export API', () => {
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

  it('returns JSON export with MIC suggestions', async () => {
    const sessionRes = await request(app)
      .post('/v1/trials/ktt-001/session')
      .send({ participantId: 'user-export', scenarioId: 'dispatch-export' })
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
        giSnapshot: 0.96,
      })
      .expect(201);

    await request(app)
      .post('/v1/trials/ktt-001/close')
      .send({
        trialId,
        steps: 1,
        completionStatus: 'completed',
        finalGiScore: 0.96,
        finalAlignmentScore: 0.9,
      })
      .expect(200);

    const res = await request(app)
      .get('/v1/trials/ktt-001/export?format=json')
      .expect(200);

    expect(res.body.protocolId).toBe('ktt-001');
    expect(res.body.minting).toBe(false);
    expect(res.body.mode).toBe('simulation_only');
    expect(Array.isArray(res.body.trials)).toBe(true);
    expect(res.body.trials.length).toBeGreaterThanOrEqual(1);

    const trialRow = res.body.trials.find((t: any) => t.trialId === trialId);
    expect(trialRow).toBeDefined();
    expect(trialRow.participantRef).toMatch(/^p-/);
    expect(trialRow.suggestedMic).toBeGreaterThan(0);
    expect(trialRow.maxMic).toBeGreaterThan(0);
  });

  it('returns CSV when requested', async () => {
    const sessionRes = await request(app)
      .post('/v1/trials/ktt-001/session')
      .send({ participantId: 'csv-user', scenarioId: 'csv-scenario' })
      .expect(201);

    const trialId = sessionRes.body.trialId;

    await request(app)
      .post('/v1/trials/ktt-001/event')
      .send({
        trialId,
        stepIndex: 1,
        prompt: 'Prompt CSV',
        userChoice: 'help',
        alignmentScore: 0.85,
        giSnapshot: 0.95,
      })
      .expect(201);

    await request(app)
      .post('/v1/trials/ktt-001/close')
      .send({
        trialId,
        steps: 1,
        completionStatus: 'completed',
        finalGiScore: 0.95,
        finalAlignmentScore: 0.85,
      })
      .expect(200);

    const res = await request(app)
      .get('/v1/trials/ktt-001/export?format=csv')
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
    const lines = res.text.trim().split('\n');
    expect(lines[0]).toContain('protocolId,trialId,participantRef');
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});
