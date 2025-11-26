/**
 * ECHO Layer Client for MEMT-Routed Tasks
 *
 * Provides memory persistence for MEMT routing results.
 * Stores high-integrity responses in the ECHO layer for future recall.
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

import axios from 'axios';
import { MemtEchoPayload, MemtEngineId, TaskKind } from '../../types/memt';

const ECHO_BASE_URL = process.env.ECHO_BASE_URL || process.env.ECHO_LAYER_URL || '';
const ECHO_API_KEY = process.env.ECHO_API_KEY || '';
const ECHO_TIMEOUT_MS = Number(process.env.ECHO_TIMEOUT_MS ?? 5000);

/**
 * Upsert a MEMT task result into the ECHO layer
 *
 * This is a fire-and-forget operation - failure does not block the main response.
 */
export async function echoUpsertMemory(payload: MemtEchoPayload): Promise<void> {
  if (!ECHO_BASE_URL) {
    console.warn('[ECHO-MEMT] ECHO_BASE_URL not configured, skipping upsert.');
    return;
  }

  try {
    await axios.post(
      `${ECHO_BASE_URL}/v1/memory/upsert`,
      {
        task_id: payload.taskId,
        question_raw: payload.prompt,
        answer_text: payload.finalAnswer,
        gi_score: payload.giScore,
        task_kind: payload.kind,
        engines_used: payload.enginesUsed,
        consensus_summary: payload.consensusSummary,
        metadata: payload.metadata,
        source: 'memt_router',
        created_at: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ECHO_API_KEY,
        },
        timeout: ECHO_TIMEOUT_MS,
      }
    );
    console.log(`[ECHO-MEMT] Upserted memory for task ${payload.taskId}`);
  } catch (err) {
    console.warn('[ECHO-MEMT] Failed to upsert memory:', (err as Error).message);
  }
}

/**
 * Query ECHO layer for cached response to similar prompt
 */
export async function echoQueryMemory(params: {
  prompt: string;
  kind?: TaskKind;
  minGiScore?: number;
}): Promise<{
  hit: boolean;
  answer?: string;
  giScore?: number;
  taskId?: string;
  similarity?: number;
} | null> {
  if (!ECHO_BASE_URL) {
    return null;
  }

  try {
    const response = await axios.post(
      `${ECHO_BASE_URL}/v1/memory/query`,
      {
        prompt: params.prompt,
        task_kind: params.kind,
        min_gi_score: params.minGiScore ?? 0.95,
        limit: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ECHO_API_KEY,
        },
        timeout: ECHO_TIMEOUT_MS,
      }
    );

    const data = response.data as any;
    if (data?.results?.length > 0) {
      const result = data.results[0];
      return {
        hit: true,
        answer: result.answer_text,
        giScore: result.gi_score,
        taskId: result.task_id,
        similarity: result.similarity,
      };
    }

    return { hit: false };
  } catch (err) {
    console.warn('[ECHO-MEMT] Failed to query memory:', (err as Error).message);
    return null;
  }
}

/**
 * Batch upsert multiple MEMT results
 */
export async function echoBatchUpsert(payloads: MemtEchoPayload[]): Promise<void> {
  if (!ECHO_BASE_URL || payloads.length === 0) {
    return;
  }

  try {
    await axios.post(
      `${ECHO_BASE_URL}/v1/memory/batch-upsert`,
      {
        items: payloads.map(p => ({
          task_id: p.taskId,
          question_raw: p.prompt,
          answer_text: p.finalAnswer,
          gi_score: p.giScore,
          task_kind: p.kind,
          engines_used: p.enginesUsed,
          consensus_summary: p.consensusSummary,
          metadata: p.metadata,
          source: 'memt_router',
          created_at: new Date().toISOString(),
        })),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ECHO_API_KEY,
        },
        timeout: ECHO_TIMEOUT_MS * 2,
      }
    );
    console.log(`[ECHO-MEMT] Batch upserted ${payloads.length} memories`);
  } catch (err) {
    console.warn('[ECHO-MEMT] Failed to batch upsert:', (err as Error).message);
  }
}

/**
 * Invalidate cached memory for a task
 */
export async function echoInvalidateMemory(taskId: string): Promise<void> {
  if (!ECHO_BASE_URL) {
    return;
  }

  try {
    await axios.delete(`${ECHO_BASE_URL}/v1/memory/${taskId}`, {
      headers: {
        'x-api-key': ECHO_API_KEY,
      },
      timeout: ECHO_TIMEOUT_MS,
    });
    console.log(`[ECHO-MEMT] Invalidated memory for task ${taskId}`);
  } catch (err) {
    console.warn('[ECHO-MEMT] Failed to invalidate memory:', (err as Error).message);
  }
}
