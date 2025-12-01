/**
 * @fileoverview C-151 Coordination-Weighted MIC Client
 * @description TypeScript client for interacting with CoordinationMIC contract
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 */

import { ethers } from 'ethers';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SentinelAttestation {
  score: bigint;
  timestamp: bigint;
  cathedral: string;
  reward: bigint;
}

export interface CathedralConfig {
  multiplier: bigint;
  active: boolean;
}

export interface AttestationResult {
  txHash: string;
  reward: bigint;
  gasUsed: bigint;
  sentinel: string;
  score: number;
}

export interface MICClientConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT ABI (Minimal)
// ═══════════════════════════════════════════════════════════════════════════

const COORDINATION_MIC_ABI = [
  // Attestation
  'function attest(string sentinelId, uint256 coordinationScore) external returns (uint256)',
  'function previewReward(string sentinelId, uint256 coordinationScore) external view returns (uint256)',
  
  // View functions
  'function balanceOf(address account) external view returns (uint256)',
  'function totalSupply() external view returns (uint256)',
  'function totalAttestations() external view returns (uint256)',
  'function currentCycle() external view returns (string)',
  'function getCathedralMultiplier(string cathedral) external view returns (uint256)',
  'function getSentinelCathedral(string sentinelId) external view returns (string)',
  'function getAttestation(string sentinelId) external view returns (tuple(uint256 score, uint256 timestamp, string cathedral, uint256 reward))',
  
  // Events
  'event AttestationSubmitted(string indexed sentinelId, uint256 score, uint256 reward, string cathedral, uint256 timestamp)',
];

// ═══════════════════════════════════════════════════════════════════════════
// CATHEDRAL MULTIPLIERS
// ═══════════════════════════════════════════════════════════════════════════

export const CATHEDRAL_MULTIPLIERS: Record<string, number> = {
  'FOR-GOVERNMENTS': 2.0,
  'FOR-ECONOMISTS': 1.5,
  'FOR-ACADEMICS': 1.2,
  'FOR-PHILOSOPHERS': 1.0,
};

export const SENTINEL_CATHEDRALS: Record<string, string> = {
  'ATLAS': 'FOR-GOVERNMENTS',
  'AUREA': 'FOR-ECONOMISTS',
  'ECHO': 'FOR-ACADEMICS',
  'EVE': 'FOR-PHILOSOPHERS',
  'HERMES': 'FOR-GOVERNMENTS',
  'JADE': 'FOR-PHILOSOPHERS',
  'URIEL': 'FOR-ACADEMICS',
  'ZEUS': 'FOR-GOVERNMENTS',
  'ZENITH': 'FOR-ECONOMISTS',
  'DAEDALUS': 'FOR-ECONOMISTS',
};

// ═══════════════════════════════════════════════════════════════════════════
// MIC CLIENT
// ═══════════════════════════════════════════════════════════════════════════

export class MICClient {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contractAddress: string;

  constructor(config: MICClientConfig) {
    this.contractAddress = config.contractAddress;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.contractAddress,
      COORDINATION_MIC_ABI,
      this.wallet
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ATTESTATION
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Submit coordination attestation for a sentinel
   * @param sentinelId Unique sentinel identifier (e.g., "ATLAS")
   * @param score Coordination score (0-100)
   * @returns Attestation result with tx hash and reward
   */
  async attestCoordination(
    sentinelId: string,
    score: number
  ): Promise<AttestationResult> {
    if (score < 0 || score > 100) {
      throw new Error(`Score must be between 0 and 100, got ${score}`);
    }

    const scoreWei = ethers.parseEther(score.toString());
    
    console.log(`📡 Submitting attestation for ${sentinelId}...`);
    console.log(`   Score: ${score} (${scoreWei} wei)`);
    
    const tx = await this.contract.attest(sentinelId, scoreWei, {
      gasLimit: 500_000n,
    });
    
    console.log(`   TX Hash: ${tx.hash}`);
    
    const receipt = await tx.wait();
    
    // Parse AttestationSubmitted event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.contract.interface.parseLog(log);
        return parsed?.name === 'AttestationSubmitted';
      } catch {
        return false;
      }
    });

    let reward = 0n;
    if (event) {
      const parsed = this.contract.interface.parseLog(event);
      reward = parsed?.args?.reward || 0n;
    }

    console.log(`✅ Attestation complete!`);
    console.log(`   Reward: ${ethers.formatEther(reward)} MIC`);
    console.log(`   Gas used: ${receipt.gasUsed}`);

    return {
      txHash: receipt.hash,
      reward,
      gasUsed: receipt.gasUsed,
      sentinel: sentinelId,
      score,
    };
  }

  /**
   * Preview reward without submitting attestation
   * @param sentinelId Sentinel identifier
   * @param score Coordination score (0-100)
   * @returns Expected reward in MIC
   */
  async previewReward(sentinelId: string, score: number): Promise<number> {
    const scoreWei = ethers.parseEther(score.toString());
    const rewardWei = await this.contract.previewReward(sentinelId, scoreWei);
    return Number(ethers.formatEther(rewardWei));
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BALANCE & SUPPLY
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get MIC balance of the wallet
   */
  async getBalance(): Promise<number> {
    const balance = await this.contract.balanceOf(this.wallet.address);
    return Number(ethers.formatEther(balance));
  }

  /**
   * Get total MIC supply
   */
  async getTotalSupply(): Promise<number> {
    const supply = await this.contract.totalSupply();
    return Number(ethers.formatEther(supply));
  }

  /**
   * Get total attestations submitted
   */
  async getTotalAttestations(): Promise<number> {
    return Number(await this.contract.totalAttestations());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SENTINEL & CATHEDRAL INFO
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get current cycle
   */
  async getCurrentCycle(): Promise<string> {
    return await this.contract.currentCycle();
  }

  /**
   * Get cathedral multiplier
   */
  async getCathedralMultiplier(cathedral: string): Promise<number> {
    const multiplier = await this.contract.getCathedralMultiplier(cathedral);
    return Number(ethers.formatEther(multiplier));
  }

  /**
   * Get sentinel's cathedral assignment
   */
  async getSentinelCathedral(sentinelId: string): Promise<string> {
    return await this.contract.getSentinelCathedral(sentinelId);
  }

  /**
   * Get latest attestation for sentinel
   */
  async getAttestation(sentinelId: string): Promise<SentinelAttestation> {
    const attestation = await this.contract.getAttestation(sentinelId);
    return {
      score: attestation.score,
      timestamp: attestation.timestamp,
      cathedral: attestation.cathedral,
      reward: attestation.reward,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return this.contractAddress;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORE CALCULATION (Mirrors contract logic)
// ═══════════════════════════════════════════════════════════════════════════

export interface CoordinationMetrics {
  appsValidated: number;
  packagesAudited: number;
  workflowsChecked: number;
  driftEventsResolved: number;
  sentinelUptimeDays: number;
}

/**
 * Calculate coordination score from metrics
 * Formula: (0.4 * apps + 0.3 * packages + 0.2 * workflows + 0.1 * drift) * (1 + log(uptime))
 */
export function calculateCoordinationScore(metrics: CoordinationMetrics): number {
  const baseScore =
    0.4 * metrics.appsValidated +
    0.3 * metrics.packagesAudited +
    0.2 * metrics.workflowsChecked +
    0.1 * Math.max(0, 10 - metrics.driftEventsResolved);

  const uptimeMultiplier = 1 + Math.log(Math.max(1, metrics.sentinelUptimeDays));
  
  return Math.min(100, baseScore * uptimeMultiplier);
}

/**
 * Estimate reward using logistic curve (client-side approximation)
 */
export function estimateReward(score: number, cathedral: string): number {
  const L = 1000; // Max reward
  const k = 0.05; // Curve steepness
  const x0 = 50;  // Midpoint

  // Logistic curve
  const exponent = -k * (score - x0);
  const baseReward = L / (1 + Math.exp(exponent));

  // Apply cathedral multiplier
  const multiplier = CATHEDRAL_MULTIPLIERS[cathedral] || 1.0;

  return baseReward * multiplier;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export default MICClient;
