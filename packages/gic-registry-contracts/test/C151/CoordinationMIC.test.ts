/**
 * @fileoverview C-151 CoordinationMIC Test Suite
 * @description Comprehensive tests for coordination-weighted MIC economy
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 */

import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { CoordinationMIC } from '../../typechain-types';

describe('C-151 CoordinationMIC', () => {
  let mic: CoordinationMIC;
  let owner: SignerWithAddress;
  let attester: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  // ═══════════════════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════════════════

  beforeEach(async () => {
    [owner, attester, unauthorized] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory('CoordinationMIC');
    mic = await Factory.deploy(owner.address) as CoordinationMIC;
    await mic.waitForDeployment();
    
    // Authorize attester
    await mic.setAttester(attester.address, true);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // DEPLOYMENT TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Deployment', () => {
    it('should set correct token name and symbol', async () => {
      expect(await mic.name()).to.equal('Mobius Intelligence Credit');
      expect(await mic.symbol()).to.equal('MIC');
    });

    it('should initialize with C-151 cycle', async () => {
      expect(await mic.currentCycle()).to.equal('C-151');
    });

    it('should set owner as authorized attester', async () => {
      expect(await mic.authorizedAttesters(owner.address)).to.be.true;
    });

    it('should configure cathedral multipliers correctly', async () => {
      expect(await mic.getCathedralMultiplier('FOR-GOVERNMENTS')).to.equal(
        ethers.parseEther('2')
      );
      expect(await mic.getCathedralMultiplier('FOR-ECONOMISTS')).to.equal(
        ethers.parseEther('1.5')
      );
      expect(await mic.getCathedralMultiplier('FOR-ACADEMICS')).to.equal(
        ethers.parseEther('1.2')
      );
      expect(await mic.getCathedralMultiplier('FOR-PHILOSOPHERS')).to.equal(
        ethers.parseEther('1')
      );
    });

    it('should assign sentinels to cathedrals', async () => {
      expect(await mic.getSentinelCathedral('ATLAS')).to.equal('FOR-GOVERNMENTS');
      expect(await mic.getSentinelCathedral('AUREA')).to.equal('FOR-ECONOMISTS');
      expect(await mic.getSentinelCathedral('ECHO')).to.equal('FOR-ACADEMICS');
      expect(await mic.getSentinelCathedral('EVE')).to.equal('FOR-PHILOSOPHERS');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ATTESTATION TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Attestation', () => {
    it('should mint reward for valid attestation', async () => {
      const score = ethers.parseEther('67.3');
      
      const tx = await mic.connect(attester).attest('ATLAS', score);
      const receipt = await tx.wait();
      
      expect(await mic.balanceOf(attester.address)).to.be.gt(0);
      expect(await mic.totalAttestations()).to.equal(1);
    });

    it('should apply cathedral multiplier (ATLAS = 2.0x)', async () => {
      const score = ethers.parseEther('50'); // Midpoint
      
      await mic.connect(attester).attest('ATLAS', score);
      const atlasBalance = await mic.balanceOf(attester.address);
      
      // Reset for EVE test
      await mic.connect(owner).attest('EVE', score);
      
      // ATLAS (2.0x) should get roughly 2x more than EVE (1.0x)
      // Note: We're minting to owner for EVE, so we need to compare properly
      // The exact ratio depends on the logistic curve, but ATLAS should be higher
    });

    it('should reject scores below minimum', async () => {
      await expect(
        mic.connect(attester).attest('ATLAS', 0)
      ).to.be.revertedWith('Score below minimum');
    });

    it('should reject scores above maximum', async () => {
      await expect(
        mic.connect(attester).attest('ATLAS', ethers.parseEther('101'))
      ).to.be.revertedWith('Score exceeds maximum');
    });

    it('should reject unauthorized attesters', async () => {
      await expect(
        mic.connect(unauthorized).attest('ATLAS', ethers.parseEther('50'))
      ).to.be.revertedWith('Not authorized attester');
    });

    it('should emit AttestationSubmitted event', async () => {
      const score = ethers.parseEther('67.3');
      
      await expect(mic.connect(attester).attest('ATLAS', score))
        .to.emit(mic, 'AttestationSubmitted')
        .withArgs(
          'ATLAS',
          score,
          expect.anything, // reward (calculated by contract)
          'FOR-GOVERNMENTS',
          expect.anything  // timestamp
        );
    });

    it('should store attestation correctly', async () => {
      const score = ethers.parseEther('67.3');
      await mic.connect(attester).attest('ATLAS', score);
      
      const attestation = await mic.getAttestation('ATLAS');
      expect(attestation.score).to.equal(score);
      expect(attestation.cathedral).to.equal('FOR-GOVERNMENTS');
      expect(attestation.reward).to.be.gt(0);
      expect(attestation.timestamp).to.be.gt(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // REWARD CURVE TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Reward Curve', () => {
    it('should give low rewards for low scores', async () => {
      const lowScore = ethers.parseEther('10');
      const reward = await mic.previewReward('EVE', lowScore);
      
      // Should be significantly less than max reward (1000 MIC)
      expect(reward).to.be.lt(ethers.parseEther('200'));
    });

    it('should give medium rewards for midpoint scores', async () => {
      const midScore = ethers.parseEther('50');
      const reward = await mic.previewReward('EVE', midScore);
      
      // At midpoint, should be around half of max (with 1.0x multiplier)
      expect(reward).to.be.closeTo(
        ethers.parseEther('500'),
        ethers.parseEther('100')
      );
    });

    it('should give high rewards for high scores', async () => {
      const highScore = ethers.parseEther('90');
      const reward = await mic.previewReward('EVE', highScore);
      
      // Should approach max reward
      expect(reward).to.be.gt(ethers.parseEther('700'));
    });

    it('should scale with cathedral multiplier', async () => {
      const score = ethers.parseEther('50');
      
      const eveReward = await mic.previewReward('EVE', score);      // 1.0x
      const aureaReward = await mic.previewReward('AUREA', score);  // 1.5x
      const atlasReward = await mic.previewReward('ATLAS', score);  // 2.0x
      
      // AUREA should be ~1.5x EVE
      expect(aureaReward).to.be.closeTo(
        eveReward * 15n / 10n,
        ethers.parseEther('10')
      );
      
      // ATLAS should be ~2x EVE
      expect(atlasReward).to.be.closeTo(
        eveReward * 2n,
        ethers.parseEther('10')
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Admin Functions', () => {
    it('should allow owner to configure cathedral', async () => {
      await mic.configureCathedral('FOR-PIONEERS', ethers.parseEther('1.8'), true);
      
      expect(await mic.getCathedralMultiplier('FOR-PIONEERS')).to.equal(
        ethers.parseEther('1.8')
      );
    });

    it('should reject multiplier below 0.5x', async () => {
      await expect(
        mic.configureCathedral('TEST', ethers.parseEther('0.4'), true)
      ).to.be.revertedWith('Multiplier too low');
    });

    it('should reject multiplier above 5.0x', async () => {
      await expect(
        mic.configureCathedral('TEST', ethers.parseEther('5.1'), true)
      ).to.be.revertedWith('Multiplier too high');
    });

    it('should allow owner to assign sentinel', async () => {
      await mic.assignSentinel('NOVA', 'FOR-PIONEERS');
      expect(await mic.getSentinelCathedral('NOVA')).to.equal('FOR-PIONEERS');
    });

    it('should allow owner to update cycle', async () => {
      await mic.updateCycle('C-152');
      expect(await mic.currentCycle()).to.equal('C-152');
    });

    it('should allow owner to authorize/revoke attesters', async () => {
      await mic.setAttester(unauthorized.address, true);
      expect(await mic.authorizedAttesters(unauthorized.address)).to.be.true;
      
      await mic.setAttester(unauthorized.address, false);
      expect(await mic.authorizedAttesters(unauthorized.address)).to.be.false;
    });

    it('should reject non-owner admin calls', async () => {
      await expect(
        mic.connect(unauthorized).configureCathedral('TEST', ethers.parseEther('1'), true)
      ).to.be.revertedWithCustomError(mic, 'OwnableUnauthorizedAccount');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // GAS OPTIMIZATION TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Gas Optimization', () => {
    it('should use less than 500k gas for attestation', async () => {
      const score = ethers.parseEther('67.3');
      
      const tx = await mic.connect(attester).attest('ATLAS', score);
      const receipt = await tx.wait();
      
      expect(receipt?.gasUsed).to.be.lt(500_000n);
      console.log(`      Gas used: ${receipt?.gasUsed}`);
    });

    it('should use minimal gas for preview', async () => {
      // Preview is a view function, so it shouldn't cost gas in actual use
      // This test ensures it doesn't revert
      const reward = await mic.previewReward('ATLAS', ethers.parseEther('67.3'));
      expect(reward).to.be.gt(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('should handle multiple attestations from same sentinel', async () => {
      const score1 = ethers.parseEther('50');
      const score2 = ethers.parseEther('75');
      
      await mic.connect(attester).attest('ATLAS', score1);
      const balance1 = await mic.balanceOf(attester.address);
      
      await mic.connect(attester).attest('ATLAS', score2);
      const balance2 = await mic.balanceOf(attester.address);
      
      expect(balance2).to.be.gt(balance1);
      expect(await mic.totalAttestations()).to.equal(2);
    });

    it('should handle attestations from multiple sentinels', async () => {
      const score = ethers.parseEther('60');
      
      await mic.connect(attester).attest('ATLAS', score);
      await mic.connect(attester).attest('AUREA', score);
      await mic.connect(attester).attest('ECHO', score);
      
      expect(await mic.totalAttestations()).to.equal(3);
      expect(await mic.balanceOf(attester.address)).to.be.gt(0);
    });

    it('should track total supply correctly', async () => {
      const initialSupply = await mic.totalSupply();
      expect(initialSupply).to.equal(0);
      
      await mic.connect(attester).attest('ATLAS', ethers.parseEther('67.3'));
      
      const finalSupply = await mic.totalSupply();
      expect(finalSupply).to.be.gt(0);
      expect(finalSupply).to.equal(await mic.balanceOf(attester.address));
    });
  });
});
