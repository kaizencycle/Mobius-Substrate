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
    let score = 0.5; // Base score
    // Positive indicators
    if (text.includes('public') || text.includes('open')) score += 0.15;
    if (text.includes('audit') || text.includes('log')) score += 0.15;
    if (text.includes('visible') || text.includes('transparent')) score += 0.1;
    if (text.includes('documentation') || text.includes('record')) score += 0.1;
    // Negative indicators
    if (text.includes('hidden') || text.includes('secret')) score -= 0.2;
    if (text.includes('private') && !text.includes('privacy')) score -= 0.1;
    if (text.includes('obfuscate')) score -= 0.3;
    return Math.max(0, Math.min(1, score));
  }

  private scoreAccountability(text: string): number {
    let score = 0.5;
    if (text.includes('responsible') || text.includes('accountable')) score += 0.15;
    if (text.includes('owner') || text.includes('attribution')) score += 0.1;
    if (text.includes('track') || text.includes('trace')) score += 0.1;
    if (text.includes('signature') || text.includes('attest')) score += 0.15;
    if (text.includes('anonymous') && !text.includes('privacy')) score -= 0.15;
    if (text.includes('unattributed')) score -= 0.2;
    return Math.max(0, Math.min(1, score));
  }

  private scoreSafety(text: string): number {
    let score = 0.6; // Slightly higher base
    if (text.includes('safe') || text.includes('secure')) score += 0.15;
    if (text.includes('protect') || text.includes('guard')) score += 0.1;
    if (text.includes('validate') || text.includes('verify')) score += 0.1;
    if (text.includes('sandbox') || text.includes('isolate')) score += 0.05;
    if (text.includes('unsafe') || text.includes('danger')) score -= 0.3;
    if (text.includes('risk') && !text.includes('mitigate')) score -= 0.15;
    if (text.includes('exploit') || text.includes('vulnerability')) score -= 0.2;
    return Math.max(0, Math.min(1, score));
  }

  private scoreEquity(text: string): number {
    let score = 0.5;
    if (text.includes('fair') || text.includes('equity')) score += 0.15;
    if (text.includes('equal') || text.includes('balanced')) score += 0.1;
    if (text.includes('inclusive') || text.includes('accessible')) score += 0.15;
    if (text.includes('all users') || text.includes('everyone')) score += 0.1;
    if (text.includes('bias') && !text.includes('mitigate')) score -= 0.2;
    if (text.includes('discriminate')) score -= 0.3;
    if (text.includes('exclusive')) score -= 0.15;
    return Math.max(0, Math.min(1, score));
  }

  private scoreSustainability(text: string): number {
    let score = 0.5;
    if (text.includes('sustain') || text.includes('maintain')) score += 0.15;
    if (text.includes('long-term') || text.includes('future')) score += 0.1;
    if (text.includes('scale') || text.includes('grow')) score += 0.1;
    if (text.includes('efficient') || text.includes('optimize')) score += 0.1;
    if (text.includes('unsustainable')) score -= 0.3;
    if (text.includes('temporary') || text.includes('short-term')) score -= 0.1;
    if (text.includes('technical debt')) score -= 0.15;
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

