/**
 * @fileoverview Consensus Protocol
 * Calculates convergence, synthesizes positions, and determines consensus
 */
import { SentinelResponse, DeliberationRound, Consensus } from '../types';

export class ConsensusProtocol {
  /**
   * Calculate convergence score for a round (0-1)
   * Based on vote alignment and integrity score agreement
   */
  calculateConvergence(responses: SentinelResponse[]): number {
    if (responses.length === 0) return 0;
    // Count votes
    const votes = {
      approve: responses.filter(r => r.vote === 'approve').length,
      reject: responses.filter(r => r.vote === 'reject').length,
      abstain: responses.filter(r => r.vote === 'abstain').length
    };
    const total = responses.length;
    const maxVotes = Math.max(votes.approve, votes.reject, votes.abstain);
    
    // Vote alignment score (how many agree on dominant position)
    const voteAlignment = maxVotes / total;
    // Integrity score variance (lower variance = more agreement)
    const integrityScores = responses.map(r => r.integrityScore);
    const avgIntegrity = integrityScores.reduce((a, b) => a + b, 0) / integrityScores.length;
    const variance = integrityScores.reduce((sum, score) => 
      sum + Math.pow(score - avgIntegrity, 2), 0) / integrityScores.length;
    const integrityAlignment = 1 - Math.min(variance * 4, 1); // Scale variance to 0-1

    // Combined convergence (weighted average)
    return (voteAlignment * 0.7) + (integrityAlignment * 0.3);
  }

  /**
   * Synthesize consensus from all rounds
   */
  synthesize(rounds: DeliberationRound[]): Consensus {
    if (rounds.length === 0) {
      return this.noConsensus();
    }

    // Get latest round (most refined positions)
    const latestRound = rounds[rounds.length - 1];
    const allResponses = latestRound.sentinelResponses;

    // Tally votes
    const voteTally = {
      approve: allResponses.filter(r => r.vote === 'approve').length,
      reject: allResponses.filter(r => r.vote === 'reject').length,
      abstain: allResponses.filter(r => r.vote === 'abstain').length
    };
    const total = allResponses.length;
    const approvalRate = voteTally.approve / total;

    // Consensus achieved if majority approve
    const achieved = approvalRate > 0.5;

    // Synthesize final position from approving sentinels
    const approvingResponses = allResponses.filter(r => r.vote === 'approve');
    const finalPosition = this.synthesizePosition(approvingResponses);

    // Collect dissenting views
    const dissentingViews = allResponses
      .filter(r => r.vote === 'reject')
      .map(r => `${r.sentinel}: ${r.reasoning}`);

    // Generate synthesis reasoning
    const synthesisReasoning = this.generateSynthesisReasoning(
      rounds,
      voteTally,
      latestRound.convergence
    );

    return {
      achieved,
      finalPosition,
      voteTally,
      convergenceScore: latestRound.convergence,
      dissentingViews,
      synthesisReasoning
    };
  }

  /**
   * Synthesize a unified position from multiple sentinel responses
   */
  private synthesizePosition(responses: SentinelResponse[]): string {
    if (responses.length === 0) {
      return 'No approving positions available';
    }

    // For MVP, concatenate positions
    // In production, would use LLM to synthesize into coherent statement
    const positions = responses.map(r => 
      `${r.sentinel}: ${r.position}`
    ).join('\n\n');

    return `Consensus Position:\n\n${positions}`;
  }

  /**
   * Generate reasoning explaining how consensus was reached
   */
  private generateSynthesisReasoning(
    rounds: DeliberationRound[],
    voteTally: { approve: number; reject: number; abstain: number },
    convergence: number
  ): string {
    const total = voteTally.approve + voteTally.reject + voteTally.abstain;
    const approvalRate = (voteTally.approve / total * 100).toFixed(1);
    let reasoning = `Consensus reached after ${rounds.length} rounds of deliberation.\n\n`;
    reasoning += `Final vote: ${voteTally.approve} approve, ${voteTally.reject} reject, ${voteTally.abstain} abstain.\n`;
    reasoning += `Approval rate: ${approvalRate}%\n`;
    reasoning += `Convergence score: ${(convergence * 100).toFixed(1)}%\n\n`;

    if (rounds.length > 1) {
      reasoning += `The deliberation evolved across multiple rounds:\n`;
      rounds.forEach((round, idx) => {
        reasoning += `- Round ${idx + 1}: Convergence ${(round.convergence * 100).toFixed(1)}%\n`;
      });
    }

    return reasoning;
  }

  /**
   * Return no-consensus result
   */
  private noConsensus(): Consensus {
    return {
      achieved: false,
      finalPosition: 'No consensus reached',
      voteTally: { approve: 0, reject: 0, abstain: 0 },
      convergenceScore: 0,
      dissentingViews: [],
      synthesisReasoning: 'Insufficient deliberation rounds to achieve consensus'
    };
  }
}

