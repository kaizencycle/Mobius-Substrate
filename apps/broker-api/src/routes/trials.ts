import type { Request, Response } from 'express';
import { ledgerClient } from '../clients/ledgerClient';
import { trialAnalyticsStore } from '../services/trialAnalyticsStore';

const PROTOCOL_ID = 'ktt-001';

export async function createTrialSessionHandler(req: Request, res: Response): Promise<void> {
  const { participantId, scenarioId } = req.body ?? {};

  try {
    const trialId = trialAnalyticsStore.createTrialSession({
      participantId,
      scenarioId,
      protocolId: PROTOCOL_ID,
    });

    await ledgerClient.createTrialSession({
      trialId,
      participantId,
      scenarioId,
      protocolId: PROTOCOL_ID,
    });

    res.status(201).json({
      protocolId: PROTOCOL_ID,
      trialId,
      status: 'active',
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to create trial session',
    });
  }
}

export async function recordTrialEventHandler(req: Request, res: Response): Promise<void> {
  const {
    trialId,
    stepIndex,
    prompt,
    userChoice,
    modelChoice,
    alignmentScore,
    giSnapshot,
    tags,
  } = req.body ?? {};

  if (!trialId || typeof stepIndex !== 'number') {
    res.status(400).json({
      error: 'trialId and numeric stepIndex are required',
    });
    return;
  }

  try {
    trialAnalyticsStore.recordTrialEvent({
      trialId,
      stepIndex,
      prompt,
      userChoice,
      modelChoice,
      alignmentScore,
      giSnapshot,
      tags,
    });

    await ledgerClient.recordTrialEvent({
      trialId,
      stepIndex,
      alignmentScore,
      giSnapshot,
    });

    res.status(201).json({
      trialId,
      stepIndex,
    });
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Failed to record trial event',
    });
  }
}

export async function closeTrialSessionHandler(req: Request, res: Response): Promise<void> {
  const { trialId, steps, completionStatus, finalAlignmentScore, finalGiScore } = req.body ?? {};

  if (!trialId) {
    res.status(400).json({
      error: 'trialId is required',
    });
    return;
  }

  try {
    trialAnalyticsStore.closeTrialSession({
      trialId,
      steps,
      completionStatus,
      finalAlignmentScore,
      finalGiScore,
    });

    await ledgerClient.closeTrialSession({
      trialId,
      completionStatus,
      finalAlignmentScore,
      finalGiScore,
    });

    res.status(200).json({
      trialId,
      status: 'closed',
      completionStatus,
    });
  } catch (error) {
    res.status(404).json({
      error: error instanceof Error ? error.message : 'Failed to close trial session',
    });
  }
}

