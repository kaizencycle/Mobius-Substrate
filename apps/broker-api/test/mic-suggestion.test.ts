import request from 'supertest';
import app from '../src/server';
import * as ledgerClientModule from '../src/clients/ledgerClient';
import { trialAnalyticsStore } from '../src/services/trialAnalyticsStore';

describe('MIC reward suggestion API (simulation only)', () => {
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

  it('returns 404 for unknown trial', async () => {
    const res = await request(app)
      .get('/v1/trials/ktt-001/non-existent-trial/mic-suggestion')
      .expect(404);

    expect(res.body.error).toBeDefined();
  });

  it('returns a MIC suggestion for a completed trial', async () => {
    const sessionRes = await request(app)
      .post('/v1/trials/ktt-001/session')
      .send({ participantId: 'user-mic', scenarioId: 'dispatch-mic' })
      .expect(201);

    const trialId = sessionRes.body.trialId;

    await request(app)
      .post('/v1/trials/ktt-001/event')
      .send({
        trialId,
        stepIndex: 1,
        prompt: 'Prompt 1',
        userChoice: 'help',
        alignmentScore: 0.92,
        giSnapshot: 0.97,
      })
      .expect(201);

    await request(app)
      .post('/v1/trials/ktt-001/close')
      .send({
        trialId,
        steps: 1,
        completionStatus: 'completed',
        finalGiScore: 0.97,
        finalAlignmentScore: 0.92,
      })
      .expect(200);

    const res = await request(app)
      .get(`/v1/trials/ktt-001/${trialId}/mic-suggestion`)
      .expect(200);

    expect(res.body.trialId).toBe(trialId);
    expect(res.body.protocolId).toBe('ktt-001');
    expect(res.body.mode).toBe('simulation_only');
    expect(res.body.minting).toBe(false);
    expect(typeof res.body.suggestedMic).toBe('number');
    expect(res.body.suggestedMic).toBeGreaterThan(0);
    expect(res.body.maxMic).toBeGreaterThan(0);
  });
});

