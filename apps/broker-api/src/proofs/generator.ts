/**
 * @fileoverview Proof Generator
 * Generates cryptographic DeliberationProof artifacts
 */
import { createHash } from 'crypto';
import { DeliberationResponse, DeliberationProof } from '../types';

export class ProofGenerator {
  /**
   * Generate DeliberationProof from completed deliberation
   */
  generate(session: DeliberationResponse): DeliberationProof {
    if (!session.consensus || !session.miiScore) {
      throw new Error('Cannot generate proof without consensus and MII score');
    }

    // Collect all sentinel responses for Merkle root
    const allResponses = session.rounds.flatMap(round => round.sentinelResponses);
    const merkleRoot = this.calculateMerkleRoot(allResponses);

    return {
      deliberationId: session.id,
      proofType: 'DeliberationProof-v1',
      timestamp: new Date(),
      participants: Array.from(new Set(allResponses.map(r => r.sentinel))),
      rounds: session.rounds.length,
      consensus: {
        achieved: session.consensus.achieved,
        threshold: session.request.consensusThreshold || 0.75,
        finalScore: session.consensus.convergenceScore
      },
      miiScore: session.miiScore,
      merkleRoot,
      signature: undefined // Future: Ed25519 signature
    };
  }

  /**
   * Calculate Merkle root of all sentinel responses
   */
  private calculateMerkleRoot(responses: Array<{ sentinel: string; position: string; reasoning: string; timestamp: Date }>): string {
    // Simple hash of all responses concatenated
    // In production, would use proper Merkle tree
    const combined = responses
      .map(r => `${r.sentinel}:${r.position}:${r.reasoning}:${r.timestamp.toISOString()}`)
      .join('|');
    
    return createHash('sha256').update(combined).digest('hex');
  }
}

