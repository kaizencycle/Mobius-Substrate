export function gradeResponse(response: string): number {
  // Simple MII grading based on response quality
  // Real implementation would use more sophisticated analysis

  let score = 0.5; // Base score

  // Length check (reasonable responses are 50-500 chars)
  if (response.length > 50 && response.length < 500) {
    score += 0.1;
  }

  // Contains reasoning indicators
  if (/because|therefore|thus|reasoning|analysis/i.test(response)) {
    score += 0.1;
  }

  // Contains ethical considerations
  if (/ethic|moral|fair|just|right|integrity/i.test(response)) {
    score += 0.1;
  }

  // Contains specific recommendations
  if (/recommend|suggest|should|propose|advise/i.test(response)) {
    score += 0.1;
  }

  // Cites principles or frameworks
  if (/principle|framework|standard|guideline/i.test(response)) {
    score += 0.1;
  }

  // Cap at 0.95 (perfect 1.0 is reserved for formal verification)
  return Math.min(score, 0.95);
}
/**
 * @fileoverview MII Grader
 * Evaluates Mobius Integrity Index (MII) for deliberation outcomes
 * 
 * MII Components:
 * - Transparency: How visible/auditable is this action?
 * - Accountability: Are responsibilities clear?
 * - Safety: Does this protect users/system?
 * - Equity: Is impact distributed fairly?
 * - Sustainability: Can this be maintained long-term?
 */
import { MIIGradeRequest, MIIGradeResponse } from '../types';

export class MIIGrader {
  private readonly threshold: number;

  constructor() {
    this.threshold = parseFloat(process.env.MII_THRESHOLD || '0.95');
  }

  /**
   * Grade an action/proposal for MII impact
   */
  async grade(request: MIIGradeRequest): Promise<MIIGradeResponse> {
    console.log(`[MIIGrader] Grading action: ${request.action.substring(0, 100)}...`);
    // In production, this would:
    // 1. Call dedicated MII service
    // 2. Run ML models trained on integrity patterns
    // 3. Query historical attestations
    // 4. Consult Virtue Accords
    //
    // For MVP, we'll use heuristic scoring
    const breakdown = await this.calculateBreakdown(request);
    const score = this.calculateOverallScore(breakdown);
    const passed = score >= this.threshold;
    const warnings = this.identifyWarnings(breakdown, score);
    const reasoning = this.generateReasoning(breakdown, score, passed);

    return {
      score,
      passed,
      threshold: this.threshold,
      breakdown,
      reasoning,
      warnings
    };
  }

  /**
   * Calculate breakdown scores for MII components
   */
  private async calculateBreakdown(request: MIIGradeRequest): Promise<{
    transparency: number;
    accountability: number;
    safety: number;
    equity: number;
    sustainability: number;
  }> {
    const action = request.action.toLowerCase();
    const context = JSON.stringify(request.context).toLowerCase();
    const combined = action + ' ' + context;

    // Heuristic scoring based on keywords and patterns
    // In production, would use trained models
    return {
      transparency: this.scoreTransparency(combined),
      accountability: this.scoreAccountability(combined),
      safety: this.scoreSafety(combined),
      equity: this.scoreEquity(combined),
      sustainability: this.scoreSustainability(combined)
    };
  }

  private scoreTransparency(text: string): number {
    // Optimize by converting to word set once instead of multiple includes() calls
    const words = new Set(text.toLowerCase().split(/\s+/));
    let score = 0.5; // Base score

    // Positive indicators
    if (words.has('public') || words.has('open')) score += 0.15;
    if (words.has('audit') || words.has('log')) score += 0.15;
    if (words.has('visible') || words.has('transparent')) score += 0.1;
    if (words.has('documentation') || words.has('record')) score += 0.1;

    // Negative indicators
    if (words.has('hidden') || words.has('secret')) score -= 0.2;
    if (words.has('private') && !words.has('privacy')) score -= 0.1;
    if (words.has('obfuscate')) score -= 0.3;

    return Math.max(0, Math.min(1, score));
  }

  private scoreAccountability(text: string): number {
    const words = new Set(text.toLowerCase().split(/\s+/));
    let score = 0.5;

    if (words.has('responsible') || words.has('accountable')) score += 0.15;
    if (words.has('owner') || words.has('attribution')) score += 0.1;
    if (words.has('track') || words.has('trace')) score += 0.1;
    if (words.has('signature') || words.has('attest')) score += 0.15;
    if (words.has('anonymous') && !words.has('privacy')) score -= 0.15;
    if (words.has('unattributed')) score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private scoreSafety(text: string): number {
    const words = new Set(text.toLowerCase().split(/\s+/));
    let score = 0.6; // Slightly higher base

    if (words.has('safe') || words.has('secure')) score += 0.15;
    if (words.has('protect') || words.has('guard')) score += 0.1;
    if (words.has('validate') || words.has('verify')) score += 0.1;
    if (words.has('sandbox') || words.has('isolate')) score += 0.05;
    if (words.has('unsafe') || words.has('danger')) score -= 0.3;
    if (words.has('risk') && !words.has('mitigate')) score -= 0.15;
    if (words.has('exploit') || words.has('vulnerability')) score -= 0.2;

    return Math.max(0, Math.min(1, score));
  }

  private scoreEquity(text: string): number {
    const words = new Set(text.toLowerCase().split(/\s+/));
    let score = 0.5;

    if (words.has('fair') || words.has('equity')) score += 0.15;
    if (words.has('equal') || words.has('balanced')) score += 0.1;
    if (words.has('inclusive') || words.has('accessible')) score += 0.15;
    // Note: 'all users' is two words, keeping as text.includes for phrase matching
    if (text.toLowerCase().includes('all users') || words.has('everyone')) score += 0.1;
    if (words.has('bias') && !words.has('mitigate')) score -= 0.2;
    if (words.has('discriminate')) score -= 0.3;
    if (words.has('exclusive')) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }

  private scoreSustainability(text: string): number {
    const words = new Set(text.toLowerCase().split(/\s+/));
    const lowerText = text.toLowerCase();
    let score = 0.5;

    if (words.has('sustain') || words.has('maintain')) score += 0.15;
    // Keep hyphenated and multi-word phrases as includes
    if (lowerText.includes('long-term') || words.has('future')) score += 0.1;
    if (words.has('scale') || words.has('grow')) score += 0.1;
    if (words.has('efficient') || words.has('optimize')) score += 0.1;
    if (words.has('unsustainable')) score -= 0.3;
    if (words.has('temporary') || lowerText.includes('short-term')) score -= 0.1;
    if (lowerText.includes('technical debt')) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate overall MII score from breakdown
   */
  private calculateOverallScore(breakdown: {
    transparency: number;
    accountability: number;
    safety: number;
    equity: number;
    sustainability: number;
  }): number {
    // Weighted average
    const weights = {
      transparency: 0.2,
      accountability: 0.2,
      safety: 0.25,
      equity: 0.2,
      sustainability: 0.15
    };

    return (
      breakdown.transparency * weights.transparency +
      breakdown.accountability * weights.accountability +
      breakdown.safety * weights.safety +
      breakdown.equity * weights.equity +
      breakdown.sustainability * weights.sustainability
    );
  }

  /**
   * Identify warnings based on breakdown
   */
  private identifyWarnings(
    breakdown: {
      transparency: number;
      accountability: number;
      safety: number;
      equity: number;
      sustainability: number;
    },
    overallScore: number
  ): string[] {
    const warnings: string[] = [];
    if (breakdown.transparency < 0.6) {
      warnings.push('Low transparency score - consider adding audit trails');
    }
    if (breakdown.accountability < 0.6) {
      warnings.push('Low accountability score - ensure clear ownership');
    }
    if (breakdown.safety < 0.7) {
      warnings.push('Safety concerns detected - review security implications');
    }
    if (breakdown.equity < 0.6) {
      warnings.push('Equity concerns - evaluate impact distribution');
    }
    if (breakdown.sustainability < 0.6) {
      warnings.push('Sustainability concerns - assess long-term viability');
    }
    if (overallScore < this.threshold && overallScore >= this.threshold - 0.05) {
      warnings.push('MII score marginally below threshold - minor improvements needed');
    }
    return warnings;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(
    breakdown: {
      transparency: number;
      accountability: number;
      safety: number;
      equity: number;
      sustainability: number;
    },
    score: number,
    passed: boolean
  ): string {
    let reasoning = `MII Assessment: ${(score * 100).toFixed(1)}% (Threshold: ${(this.threshold * 100).toFixed(0)}%)\n\n`;
    reasoning += 'Breakdown:\n';
    reasoning += `- Transparency: ${(breakdown.transparency * 100).toFixed(1)}%\n`;
    reasoning += `- Accountability: ${(breakdown.accountability * 100).toFixed(1)}%\n`;
    reasoning += `- Safety: ${(breakdown.safety * 100).toFixed(1)}%\n`;
    reasoning += `- Equity: ${(breakdown.equity * 100).toFixed(1)}%\n`;
    reasoning += `- Sustainability: ${(breakdown.sustainability * 100).toFixed(1)}%\n\n`;

    if (passed) {
      reasoning += 'Result: PASSED - Action meets Mobius integrity standards.\n';
    } else {
      reasoning += 'Result: REJECTED - Action does not meet minimum integrity requirements.\n';
      
      // Identify weakest areas
      const sorted = Object.entries(breakdown).sort((a, b) => a[1] - b[1]);
      const weakest = sorted.slice(0, 2);
      reasoning += `Primary concerns: ${weakest.map(([k, v]) => `${k} (${(v * 100).toFixed(1)}%)`).join(', ')}\n`;
    }

    return reasoning;
  }
}

