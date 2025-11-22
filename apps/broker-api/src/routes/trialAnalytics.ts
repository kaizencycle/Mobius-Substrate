import type { Request, Response } from 'express';
import { trialAnalyticsStore } from '../services/trialAnalyticsStore';

const PROTOCOL_ID = 'ktt-001';

export async function getTrialSummaryHandler(req: Request, res: Response): Promise<void> {
  const { trialId } = req.params;
  const summary = trialAnalyticsStore.getSummary(trialId);

  if (!summary) {
    res.status(404).json({
      error: 'Trial not found',
    });
    return;
  }

  res.status(200).json(summary);
}

export async function getTrialEventsHandler(req: Request, res: Response): Promise<void> {
  const { trialId } = req.params;
  const events = trialAnalyticsStore.getEvents(trialId);

  if (!events) {
    res.status(404).json({
      error: 'Trial not found',
    });
    return;
  }

  res.status(200).json({
    trialId,
    events,
  });
}

export async function getGlobalTrialStatsHandler(_req: Request, res: Response): Promise<void> {
  const stats = trialAnalyticsStore.getGlobalStats(PROTOCOL_ID);
  res.status(200).json(stats);
}

export async function listTrialSummariesHandler(_req: Request, res: Response): Promise<void> {
  const summaries = trialAnalyticsStore.listSummaries(PROTOCOL_ID);
  res.status(200).json({
    protocolId: PROTOCOL_ID,
    count: summaries.length,
    trials: summaries,
  });
}

