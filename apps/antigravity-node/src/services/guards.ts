import { LiftRequest, LiftResult } from '../types/antigravity';

export function validateLiftRequest(lift: LiftRequest): string[] {
  const issues: string[] = [];

  if (!lift.taskId || typeof lift.taskId !== 'string') {
    issues.push('MISSING_TASK_ID');
  }
  if (!lift.intent || typeof lift.intent !== 'string') {
    issues.push('MISSING_INTENT');
  }
  if (lift.allowedTools && !Array.isArray(lift.allowedTools)) {
    issues.push('INVALID_ALLOWED_TOOLS');
  }

  return issues;
}

export function applyIntegrityGuards(result: LiftResult): LiftResult {
  const riskFlags = [...result.riskFlags];

  if (!result.answer || !result.answer.trim()) {
    riskFlags.push('EMPTY_ANSWER');
  }

  if (result.answer && result.answer.length > 8_000) {
    riskFlags.push('ANSWER_TOO_LONG');
  }

  return {
    ...result,
    riskFlags
  };
}
