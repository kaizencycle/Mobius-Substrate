import express from 'express';
import request from 'supertest';
import axios from 'axios';
import deliberateRouter from '../src/routes/deliberate';
import { reinforce } from '@mobius/echo-layer';

jest.mock('axios');
jest.mock('../src/services/antigravityClient', () => ({
  callAntigravity: jest.fn().mockRejectedValue(new Error('antigravity disabled in tests')),
}));
jest.mock('../src/services/openaiClient', () => ({
  callOpenAI: jest.fn(async ({ prompt }: { prompt: string }) => ({
    engineId: 'openai',
    answer: `OpenAI answer for ${prompt}`,
    riskFlags: [],
    latencyMs: 5,
    meta: { sources: ['https://openai.example'] },
  })),
}));
jest.mock('../src/services/claudeClient', () => ({
  callClaude: jest.fn(async ({ prompt }: { prompt: string }) => ({
    engineId: 'claude',
    answer: `Claude answer for ${prompt}`,
    riskFlags: [],
    latencyMs: 5,
    meta: { sources: ['https://claude.example'] },
  })),
}));
jest.mock('../src/services/deepseekClient', () => ({
  callDeepseek: jest.fn(async ({ prompt }: { prompt: string }) => ({
    engineId: 'deepseek',
    answer: `Deepseek answer for ${prompt}`,
    riskFlags: [],
    latencyMs: 5,
    meta: { sources: ['https://deepseek.example'] },
  })),
}));
jest.mock('../src/services/persistence', () => ({
  saveDeliberation: jest.fn(),
  saveSentinelResponse: jest.fn(),
  saveAttestation: jest.fn(),
  getDeliberation: jest.fn(),
}));
jest.mock('../src/services/webhook', () => ({
  notifyWebhook: jest.fn(),
}));
jest.mock('../src/monitoring/health', () => ({
  healthMonitor: {
    record: jest.fn(),
  },
}));
jest.mock('../src/crypto/attestation', () => ({
  signDeliberation: jest.fn(async () => ({ signature: 'sig', publicKey: 'pub' })),
}));
jest.mock('../src/services/integrityTierClient', () => ({
  evaluateWithIntegrityTier: jest.fn().mockResolvedValue(null),
}));
jest.mock('../src/config/engines', () => ({
  ENGINE_CONFIG: [
    { id: 'openai', enabled: true },
    { id: 'claude', enabled: true },
    { id: 'antigravity', enabled: false },
  ],
  DEFAULT_ROUTING_MODE: 'multi-engine',
}));
jest.mock('@mobius/echo-layer', () => ({
  reinforce: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockReinforce = reinforce as jest.MockedFunction<typeof reinforce>;

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/v1/deliberate', deliberateRouter);
  return app;
};

describe('Deliberate route with ECHO integration', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.ECHO_LAYER_ENABLED = 'false';
    process.env.SENTINEL_CONSENSUS_URL = 'http://consensus.test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post.mockResolvedValue({
      data: {
        final_answer: 'Consensus: Paris',
        gi_score: 0.92,
        decision: 'ok',
      },
    });
    mockReinforce.mockImplementation((a1: any, _a2: any, question: string) => ({
      id: 'echo-test-id-123',
      question,
      answer: a1.answer,
      sources: a1.sources ?? [],
      consensusLevel: 0.8,
      giScore: 0.92,
      timestamp: '2025-11-25T00:00:00.000Z',
    }));
  });

  it('attaches an echo entry when two sentinel answers are present', async () => {
    const app = buildApp();

    const res = await request(app)
      .post('/v1/deliberate')
      .send({
        prompt: 'What is the capital of France?',
        routingMode: 'multi-engine',
      })
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body).toHaveProperty('finalAnswer');
    expect(res.body).toHaveProperty('sentinels');
    expect(mockReinforce).toHaveBeenCalledTimes(1);
    expect(res.body.echo).toMatchObject({
      id: 'echo-test-id-123',
      question: 'What is the capital of France?',
      consensusLevel: 0.8,
      giScore: 0.92,
    });
  });

  it('does not crash when ECHO reinforce fails open', async () => {
    mockReinforce.mockImplementationOnce(() => {
      throw new Error('ECHO failure');
    });

    const app = buildApp();
    const res = await request(app)
      .post('/v1/deliberate')
      .send({ prompt: 'Test failure path', routingMode: 'multi-engine' })
      .expect(200);

    expect(res.body).toHaveProperty('finalAnswer');
    expect(res.body.echo).toBeUndefined();
  });
});
