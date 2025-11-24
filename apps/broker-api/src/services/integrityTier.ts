import {
  CivicSourceRef,
  IntegrityTierInput,
  IntegrityTierReport,
  IntegrityRiskLevel,
  IntegrityRequiredAction,
  HighRiskDomain,
} from '../types/integrity';

const HIGH_RISK_DOMAINS: HighRiskDomain[] = [
  'news',
  'politics',
  'finance',
  'health',
  'public_figure',
  'crisis',
];

// Naive URL detector to spot "AI meta" leaks like "Do you want me to..."
const AI_META_PATTERNS: RegExp[] = [
  /do you want me to/i,
  /as an ai (assistant|model)/i,
  /snappier "front-page style" version/i,
  /i can also create/i,
];

function hasAiMetaLeak(text: string): boolean {
  return AI_META_PATTERNS.some((pattern) => pattern.test(text));
}

function isHighRiskDomain(domain: string): boolean {
  return HIGH_RISK_DOMAINS.includes(domain as HighRiskDomain);
}

function computeSourceScore(sources?: CivicSourceRef[]): number {
  if (!sources || sources.length === 0) return 0.2;
  if (sources.length === 1) return 0.5;
  if (sources.length >= 2 && sources.length <= 4) return 0.8;
  return 0.9;
}

function computeArticleIntegrityScore(input: IntegrityTierInput): {
  ais: number;
  issues: string[];
  riskLevel: IntegrityRiskLevel;
} {
  const issues: string[] = [];
  const highRisk = isHighRiskDomain(input.domain);

  const sourceScore = computeSourceScore(input.sources);
  if (!input.sources || input.sources.length === 0) {
    issues.push('missing_sources');
  }

  const giScore = input.sentinelVerdicts.giScore ?? 0;
  const sentinelPenalty =
    input.sentinelVerdicts.consensusLabel === 'approve'
      ? 0
      : input.sentinelVerdicts.consensusLabel === 'uncertain'
      ? 0.15
      : 0.3;

  const hasLeak = hasAiMetaLeak(input.draftText);
  if (hasLeak) {
    issues.push('ai_meta_leak');
  }

  // Very simple heuristic AIS; can be replaced with ML/consensus later
  let ais =
    0.4 * sourceScore +
    0.4 * giScore +
    0.2 * (highRisk ? 0.8 : 1.0) -
    sentinelPenalty;

  if (hasLeak) {
    ais -= 0.25;
  }

  // Clamp 0..1
  ais = Math.max(0, Math.min(1, ais));

  let riskLevel: IntegrityRiskLevel = 'low';
  if (highRisk && ais < 0.95) riskLevel = 'high';
  else if (highRisk || ais < 0.9) riskLevel = 'medium';

  return { ais, issues, riskLevel };
}

function decideRequiredAction(
  ais: number,
  riskLevel: IntegrityRiskLevel,
  issues: string[],
): IntegrityRequiredAction {
  if (issues.includes('ai_meta_leak')) return 'block';
  if (riskLevel === 'high' && ais < 0.95) return 'human_review';
  if (ais < 0.8) return 'human_review';
  if (ais < 0.6) return 'block';
  return 'auto_publish';
}

/**
 * Main Integrity Tier evaluation entrypoint.
 * Non-blocking, deterministic, and easily replaceable by a more advanced engine.
 */
export function evaluateDraftIntegrity(
  input: IntegrityTierInput,
): IntegrityTierReport {
  const { ais, issues, riskLevel } = computeArticleIntegrityScore(input);

  const requiredAction = decideRequiredAction(ais, riskLevel, issues);

  return {
    draftId: input.draftId,
    articleIntegrityScore: ais,
    riskLevel,
    issues,
    requiredAction,
    normalizedSources: input.sources ?? [],
  };
}
