/**
 * @fileoverview Deliberation Engine
 * Orchestrates multi-agent consensus loops for Mobius Systems
 * 
 * Architecture:
 * 1. Initialize deliberation session
 * 2. Run bounded iteration rounds (max 5)
 * 3. Collect sentinel responses in parallel
 * 4. Calculate convergence after each round
 * 5. Achieve consensus or fail gracefully
 * 6. Generate DeliberationProof
 * 7. Grade with MII
 * 8. Attest to ledger
 */
import { nanoid } from 'nanoid';
import {
  DeliberationRequest,
  DeliberationResponse,
  DeliberationRound,
  DeliberationStatus,
  SentinelResponse,
  Consensus,
  DeliberationProof,
  SentinelRole,
  WSEventType
} from '../types';
import { SentinelCoordinator } from '../sentinels/coordinator';
import { ConsensusProtocol } from '../consensus/protocol';
import { MIIGrader } from '../mii/grader';
import { ProofGenerator } from '../proofs/generator';
import { EventEmitter } from 'events';

export class DeliberationEngine extends EventEmitter {
  private activeSessions: Map<string, DeliberationResponse> = new Map();
  private sentinelCoordinator: SentinelCoordinator;
  private consensusProtocol: ConsensusProtocol;
  private miiGrader: MIIGrader;
  private proofGenerator: ProofGenerator;

  constructor() {
    super();
    this.sentinelCoordinator = new SentinelCoordinator();
    this.consensusProtocol = new ConsensusProtocol();
    this.miiGrader = new MIIGrader();
    this.proofGenerator = new ProofGenerator();
  }

  /**
   * Initiate a new deliberation session
   */
  async deliberate(request: DeliberationRequest): Promise<string> {
    const deliberationId = nanoid();
    
    const session: DeliberationResponse = {
      id: deliberationId,
      status: DeliberationStatus.PENDING,
      request,
      rounds: [],
      createdAt: new Date()
    };
    this.activeSessions.set(deliberationId, session);
    
    // Emit WebSocket event
    this.emit('event', {
      type: WSEventType.DELIBERATION_STARTED,
      deliberationId,
      payload: session,
      timestamp: new Date()
    });
    
    // Start deliberation asynchronously
    this.runDeliberation(deliberationId).catch(error => {
      console.error(`Deliberation ${deliberationId} failed:`, error);
      session.status = DeliberationStatus.ERROR;
    });

    return deliberationId;
  }

  /**
   * Main deliberation loop
   */
  private async runDeliberation(deliberationId: string): Promise<void> {
    const session = this.activeSessions.get(deliberationId);
    if (!session) throw new Error('Session not found');
    session.status = DeliberationStatus.IN_PROGRESS;
    const { request } = session;
    const maxRounds = request.maxRounds || 5;
    const threshold = request.consensusThreshold || 0.75;

    // Determine active sentinels
    const activeSentinels = request.requiredSentinels || [
      SentinelRole.ATLAS,
      SentinelRole.AUREA
    ];

    // Run deliberation rounds
    for (let roundNum = 1; roundNum <= maxRounds; roundNum++) {
      console.log(`[Deliberation ${deliberationId}] Round ${roundNum}/${maxRounds}`);
      const round = await this.runRound(
        deliberationId,
        roundNum,
        activeSentinels,
        request.prompt,
        request.context,
        session.rounds
      );
      session.rounds.push(round);

      // Emit round completion
      this.emit('event', {
        type: WSEventType.ROUND_COMPLETED,
        deliberationId,
        payload: round,
        timestamp: new Date()
      });

      // Check for consensus
      if (round.convergence >= threshold) {
        console.log(`[Deliberation ${deliberationId}] Consensus reached!`);
        
        const consensus = this.consensusProtocol.synthesize(session.rounds);
        session.consensus = consensus;
        session.status = DeliberationStatus.CONSENSUS_REACHED;
        this.emit('event', {
          type: WSEventType.CONSENSUS_REACHED,
          deliberationId,
          payload: consensus,
          timestamp: new Date()
        });
        break;
      }

      // Check if final round
      if (roundNum === maxRounds) {
        console.log(`[Deliberation ${deliberationId}] Max rounds reached without consensus`);
        session.status = DeliberationStatus.CONSENSUS_FAILED;
        
        this.emit('event', {
          type: WSEventType.CONSENSUS_FAILED,
          deliberationId,
          payload: { reason: 'Max rounds exceeded' },
          timestamp: new Date()
        });
      }
    }

    // Grade with MII if consensus reached
    if (session.status === DeliberationStatus.CONSENSUS_REACHED && session.consensus) {
      const miiResult = await this.miiGrader.grade({
        action: session.consensus.finalPosition,
        context: request.context || {},
        proposedBy: request.requester,
        deliberationId
      });
      session.miiScore = miiResult.score;
      this.emit('event', {
        type: WSEventType.MII_GRADED,
        deliberationId,
        payload: miiResult,
        timestamp: new Date()
      });
      if (!miiResult.passed) {
        session.status = DeliberationStatus.MII_REJECTED;
        console.log(`[Deliberation ${deliberationId}] MII rejected: ${miiResult.reasoning}`);
      } else {
        session.status = DeliberationStatus.COMPLETED;
      }
    }

    // Generate proof
    if (session.consensus && session.miiScore) {
      session.deliberationProof = this.proofGenerator.generate(session);
    }

    session.completedAt = new Date();
    this.emit('event', {
      type: WSEventType.DELIBERATION_COMPLETED,
      deliberationId,
      payload: session,
      timestamp: new Date()
    });
    console.log(`[Deliberation ${deliberationId}] Completed with status: ${session.status}`);
  }

  /**
   * Execute a single deliberation round
   */
  private async runRound(
    deliberationId: string,
    roundNumber: number,
    sentinels: SentinelRole[],
    prompt: string,
    context: Record<string, unknown> | undefined,
    previousRounds: DeliberationRound[]
  ): Promise<DeliberationRound> {
    // Build context from previous rounds
    const roundContext = this.buildRoundContext(prompt, context, previousRounds);

    // Collect responses from all sentinels in parallel
    const responses = await Promise.all(
      sentinels.map(sentinel => 
        this.sentinelCoordinator.query(sentinel, roundContext)
      )
    );

    // Emit sentinel responses
    responses.forEach(response => {
      this.emit('event', {
        type: WSEventType.SENTINEL_RESPONDED,
        deliberationId,
        payload: response,
        timestamp: new Date()
      });
    });

    // Calculate convergence
    const convergence = this.consensusProtocol.calculateConvergence(responses);

    return {
      roundNumber,
      sentinelResponses: responses,
      convergence,
      timestamp: new Date()
    };
  }

  /**
   * Build context for a deliberation round
   */
  private buildRoundContext(
    prompt: string,
    context: Record<string, unknown> | undefined,
    previousRounds: DeliberationRound[]
  ): string {
    let roundContext = `# Deliberation Prompt\n\n${prompt}\n\n`;

    if (context && Object.keys(context).length > 0) {
      roundContext += `## Context\n\n${JSON.stringify(context, null, 2)}\n\n`;
    }

    if (previousRounds.length > 0) {
      roundContext += `## Previous Rounds\n\n`;
      previousRounds.forEach(round => {
        roundContext += `### Round ${round.roundNumber} (Convergence: ${(round.convergence * 100).toFixed(1)}%)\n\n`;
        round.sentinelResponses.forEach(response => {
          roundContext += `**${response.sentinel}** (Vote: ${response.vote})\n`;
          roundContext += `Position: ${response.position}\n\n`;
        });
      });
    }

    return roundContext;
  }

  /**
   * Get deliberation status
   */
  getDeliberation(deliberationId: string): DeliberationResponse | undefined {
    return this.activeSessions.get(deliberationId);
  }

  /**
   * List all active deliberations
   */
  listDeliberations(): DeliberationResponse[] {
    return Array.from(this.activeSessions.values());
  }
}

