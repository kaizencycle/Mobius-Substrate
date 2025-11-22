import axios from 'axios';
import { config } from '../config';
import { LiftRequest, LiftResult } from '../types/antigravity';
import { mapGeminiResponseToResult, mapLiftToGeminiPayload } from './mappers';

export async function callGeminiAntigravity(lift: LiftRequest): Promise<LiftResult> {
  const payload = mapLiftToGeminiPayload(lift);

  const response = await axios.post(config.gemini.endpoint, payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.gemini.apiKey}`
    },
    timeout: 60_000
  });

  return mapGeminiResponseToResult(lift, response.data);
}
