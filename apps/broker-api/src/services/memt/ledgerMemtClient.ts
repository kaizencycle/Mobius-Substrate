/**
 * Civic Ledger Client for MEMT-Routed Tasks
 *
 * Provides attestation and provenance for MEMT routing decisions.
 * Every cross-model decision is hashed and stored for accountability.
 *
 * @see /docs/architecture/MEMT/MEMT_WHITEPAPER.md
 */

import axios from 'axios';
import * as crypto from 'node:crypto';
import {
  MemtLedgerPayload,
  MemtEngineId,
  EngineRole,
  RiskLevel,
  TaskKind,
  DvaTier,
} from '../../types/memt';

const LEDGER_BASE_URL = process.env.LEDGER_BASE_URL || process.env.LEDGER_ATTEST_URL || '';
const LEDGER_API_KEY = process.env.LEDGER_API_KEY || '';
const LEDGER_TIMEOUT_MS = Number(process.env.LEDGER_TIMEOUT_MS ?? 15000);

/**
 * Generate attestation hash for a MEMT decision
 */
function generateAttestationHash(payload: MemtLedgerPayload): string {
  const data = JSON.stringify({
    taskId: payload.taskId,
    giScore: payload.giScore,
    decision: payload.decision,
    engines: payload.engines.map(e => `${e.id}:${e.role}`).join(','),
    kind: payload.kind,
    risk: payload.risk,
    dvaTier: payload.dvaTier,
    timestamp: Date.now(),
  });

  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Attest a MEMT routing decision to the Civic Ledger
 *
 * Creates an immutable record of the multi-engine decision for:
 * - Accountability and audit trails
 * - Provenance tracking
 * - Governance compliance
 */
export async function ledgerAttest(payload: MemtLedgerPayload): Promise<{
  success: boolean;
  attestationHash?: string;
  ledgerTxId?: string;
  error?: string;
}> {
  if (!LEDGER_BASE_URL) {
    console.warn('[LEDGER-MEMT] LEDGER_BASE_URL not configured, skipping attestation.');
    return { success: false, error: 'LEDGER_BASE_URL not configured' };
  }

  const attestationHash = generateAttestationHash(payload);

  try {
    const response = await axios.post(
      `${LEDGER_BASE_URL}/ledger/attest`,
      {
        task_id: payload.taskId,
        jurisdiction_id: payload.jurisdictionId,
        gi_score: payload.giScore,
        decision: payload.decision,
        consensus_rationale: payload.consensusRationale,
        risk: payload.risk,
        kind: payload.kind,
        dva_tier: payload.dvaTier,
        engines: payload.engines.map(e => ({
          engine_id: e.id,
          role: e.role,
          gi_contribution: e.giContribution,
        })),
        attestation_hash: attestationHash,
        source: 'memt_router',
        metadata: payload.metadata,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LEDGER_API_KEY,
        },
        timeout: LEDGER_TIMEOUT_MS,
      }
    );

    const data = response.data as any;
    console.log(`[LEDGER-MEMT] Attested task ${payload.taskId}, hash: ${attestationHash.slice(0, 16)}...`);

    return {
      success: true,
      attestationHash,
      ledgerTxId: data?.tx_id || data?.ledger_tx_id,
    };
  } catch (err) {
    const errorMsg = (err as Error).message;
    console.warn('[LEDGER-MEMT] Failed to attest:', errorMsg);
    return { success: false, error: errorMsg, attestationHash };
  }
}

/**
 * Verify an attestation exists in the ledger
 */
export async function ledgerVerify(params: {
  taskId?: string;
  attestationHash?: string;
}): Promise<{
  verified: boolean;
  record?: {
    taskId: string;
    giScore: number;
    decision: string;
    timestamp: string;
    dvaTier: DvaTier;
  };
  error?: string;
}> {
  if (!LEDGER_BASE_URL) {
    return { verified: false, error: 'LEDGER_BASE_URL not configured' };
  }

  try {
    const endpoint = params.taskId
      ? `${LEDGER_BASE_URL}/ledger/verify/task/${params.taskId}`
      : `${LEDGER_BASE_URL}/ledger/verify/hash/${params.attestationHash}`;

    const response = await axios.get(endpoint, {
      headers: {
        'x-api-key': LEDGER_API_KEY,
      },
      timeout: LEDGER_TIMEOUT_MS,
    });

    const data = response.data as any;
    if (data?.verified) {
      return {
        verified: true,
        record: {
          taskId: data.task_id,
          giScore: data.gi_score,
          decision: data.decision,
          timestamp: data.timestamp,
          dvaTier: data.dva_tier,
        },
      };
    }

    return { verified: false };
  } catch (err) {
    return { verified: false, error: (err as Error).message };
  }
}

/**
 * Query ledger for MEMT decision history
 */
export async function ledgerQueryHistory(params: {
  jurisdictionId?: string;
  kind?: TaskKind;
  dvaTier?: DvaTier;
  minGiScore?: number;
  limit?: number;
  since?: Date;
}): Promise<{
  records: {
    taskId: string;
    giScore: number;
    decision: string;
    kind: TaskKind;
    dvaTier: DvaTier;
    timestamp: string;
  }[];
  error?: string;
}> {
  if (!LEDGER_BASE_URL) {
    return { records: [], error: 'LEDGER_BASE_URL not configured' };
  }

  try {
    const response = await axios.post(
      `${LEDGER_BASE_URL}/ledger/query`,
      {
        jurisdiction_id: params.jurisdictionId,
        kind: params.kind,
        dva_tier: params.dvaTier,
        min_gi_score: params.minGiScore,
        limit: params.limit ?? 100,
        since: params.since?.toISOString(),
        source: 'memt_router',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LEDGER_API_KEY,
        },
        timeout: LEDGER_TIMEOUT_MS,
      }
    );

    const data = response.data as any;
    return {
      records: (data?.records ?? []).map((r: any) => ({
        taskId: r.task_id,
        giScore: r.gi_score,
        decision: r.decision,
        kind: r.kind,
        dvaTier: r.dva_tier,
        timestamp: r.timestamp,
      })),
    };
  } catch (err) {
    return { records: [], error: (err as Error).message };
  }
}

/**
 * Build a ledger payload from routing results
 */
export function buildLedgerPayload(params: {
  taskId: string;
  giScore: number;
  decision: string;
  consensusRationale: string;
  engines: { id: MemtEngineId; role: EngineRole; giContribution?: number }[];
  risk: RiskLevel;
  kind: TaskKind;
  dvaTier: DvaTier;
  jurisdictionId?: string;
  metadata?: Record<string, unknown>;
}): MemtLedgerPayload {
  return {
    taskId: params.taskId,
    jurisdictionId: params.jurisdictionId,
    giScore: params.giScore,
    decision: params.decision,
    engines: params.engines,
    consensusRationale: params.consensusRationale,
    risk: params.risk,
    kind: params.kind,
    dvaTier: params.dvaTier,
    metadata: params.metadata,
  };
}
