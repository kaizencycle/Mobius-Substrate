import type { Request, Response } from 'express';
import { trialAnalyticsStore } from '../services/trialAnalyticsStore';
import { suggestMicReward } from '../services/micRewards';

const PROTOCOL_ID = 'ktt-001';

function toCsvRow(fields: Array<string | number | boolean | null | undefined>): string {
  return fields
    .map((field) => {
      if (field === null || typeof field === 'undefined') {
        return '';
      }
      const str = String(field);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(',');
}

export async function exportKtt001Handler(req: Request, res: Response): Promise<void> {
  const format = (req.query.format as string | undefined)?.toLowerCase() ?? 'json';

  const summaries = trialAnalyticsStore.listSummaries(PROTOCOL_ID);
  const globalStats = trialAnalyticsStore.getGlobalStats(PROTOCOL_ID);

  const payload = summaries.map((summary) => {
    const mic = suggestMicReward(summary, globalStats);

    return {
      protocolId: mic.protocolId,
      trialId: mic.trialId,
      participantRef: summary.participantId ? `p-${summary.participantId.slice(0, 8)}` : null,
      scenarioId: summary.scenarioId ?? null,
      status: summary.status,
      completionStatus: summary.completionStatus ?? null,
      steps: typeof summary.steps === 'number' ? summary.steps : null,
      avgAlignmentScore:
        typeof summary.avgAlignmentScore === 'number' ? summary.avgAlignmentScore : null,
      avgGiSnapshot: typeof summary.avgGiSnapshot === 'number' ? summary.avgGiSnapshot : null,
      createdAt: summary.createdAt ?? null,
      closedAt: summary.closedAt ?? null,
      suggestedMic: mic.suggestedMic,
      maxMic: mic.maxMic,
      rewardIntensity: mic.rewardIntensity,
      reason: mic.reason,
      note: mic.note ?? null,
      minting: false,
      mode: 'simulation_only',
    };
  });

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="ktt-001_mic_simulation_export.csv"',
    );

    const header = [
      'protocolId',
      'trialId',
      'participantRef',
      'scenarioId',
      'status',
      'completionStatus',
      'steps',
      'avgAlignmentScore',
      'avgGiSnapshot',
      'createdAt',
      'closedAt',
      'suggestedMic',
      'maxMic',
      'rewardIntensity',
      'reason',
      'note',
      'minting',
      'mode',
    ];

    res.write(header.join(',') + '\n');

    payload.forEach((row) => {
      res.write(
        toCsvRow([
          row.protocolId,
          row.trialId,
          row.participantRef,
          row.scenarioId,
          row.status,
          row.completionStatus,
          row.steps,
          row.avgAlignmentScore,
          row.avgGiSnapshot,
          row.createdAt,
          row.closedAt,
          row.suggestedMic,
          row.maxMic,
          row.rewardIntensity,
          row.reason,
          row.note,
          row.minting ? 'true' : 'false',
          row.mode,
        ]) + '\n',
      );
    });

    res.end();
    return;
  }

  res.status(200).json({
    protocolId: PROTOCOL_ID,
    count: payload.length,
    globalStats,
    minting: false,
    mode: 'simulation_only',
    trials: payload,
  });
}
