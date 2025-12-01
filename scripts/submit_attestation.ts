#!/usr/bin/env npx tsx

/**
 * @fileoverview C-151 Attestation Submission Script
 * @description Submits coordination attestation to CoordinationMIC contract
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 * 
 * Usage:
 *   npx tsx submit_attestation.ts --sentinel ATLAS --score 67.3 --contract 0x... --rpc https://... --key 0x...
 */

import { ethers } from 'ethers';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface AttestationArgs {
  sentinel: string;
  score: number;
  contract: string;
  rpc: string;
  key: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT ABI
// ═══════════════════════════════════════════════════════════════════════════

const COORDINATION_MIC_ABI = [
  'function attest(string sentinelId, uint256 coordinationScore) external returns (uint256)',
  'function previewReward(string sentinelId, uint256 coordinationScore) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function currentCycle() external view returns (string)',
  'event AttestationSubmitted(string indexed sentinelId, uint256 score, uint256 reward, string cathedral, uint256 timestamp)',
];

// ═══════════════════════════════════════════════════════════════════════════
// ARGUMENT PARSING
// ═══════════════════════════════════════════════════════════════════════════

function parseArgs(): AttestationArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<AttestationArgs> = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '') as keyof AttestationArgs;
    const value = args[i + 1];
    
    if (key === 'score') {
      parsed[key] = parseFloat(value);
    } else {
      parsed[key] = value as any;
    }
  }
  
  // Validate required args
  const required: (keyof AttestationArgs)[] = ['sentinel', 'score', 'contract', 'rpc', 'key'];
  for (const key of required) {
    if (!parsed[key]) {
      console.error(`Missing required argument: --${key}`);
      console.error('Usage: npx tsx submit_attestation.ts --sentinel ATLAS --score 67.3 --contract 0x... --rpc https://... --key 0x...');
      process.exit(1);
    }
  }
  
  return parsed as AttestationArgs;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const args = parseArgs();
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🤖 C-151 Coordination Attestation');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Sentinel: ${args.sentinel}`);
  console.log(`   Score: ${args.score}`);
  console.log(`   Contract: ${args.contract}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Validate score
  if (args.score < 0 || args.score > 100) {
    console.error('❌ Score must be between 0 and 100');
    process.exit(1);
  }
  
  // Connect to network
  console.log('\n📡 Connecting to ledger...');
  const provider = new ethers.JsonRpcProvider(args.rpc);
  const wallet = new ethers.Wallet(args.key, provider);
  const contract = new ethers.Contract(args.contract, COORDINATION_MIC_ABI, wallet);
  
  // Get current cycle
  try {
    const cycle = await contract.currentCycle();
    console.log(`   Cycle: ${cycle}`);
  } catch (error) {
    console.log('   Cycle: (unable to fetch)');
  }
  
  // Preview reward
  console.log('\n📊 Previewing reward...');
  const scoreWei = ethers.parseEther(args.score.toString());
  
  try {
    const previewReward = await contract.previewReward(args.sentinel, scoreWei);
    console.log(`   Expected reward: ${ethers.formatEther(previewReward)} MIC`);
  } catch (error) {
    console.log('   Preview: (unable to calculate)');
  }
  
  // Submit attestation
  console.log('\n📤 Submitting attestation...');
  
  try {
    const tx = await contract.attest(args.sentinel, scoreWei, {
      gasLimit: 500_000n,
    });
    
    console.log(`   TX Hash: ${tx.hash}`);
    console.log('   Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    // Parse event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'AttestationSubmitted';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      console.log('\n✅ Attestation Confirmed!');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`   Sentinel: ${parsed?.args?.sentinelId}`);
      console.log(`   Score: ${ethers.formatEther(parsed?.args?.score)}`);
      console.log(`   Reward: ${ethers.formatEther(parsed?.args?.reward)} MIC`);
      console.log(`   Cathedral: ${parsed?.args?.cathedral}`);
      console.log(`   Gas Used: ${receipt.gasUsed}`);
      console.log('═══════════════════════════════════════════════════════════════');
    } else {
      console.log('\n✅ Transaction confirmed (event not found)');
      console.log(`   Gas Used: ${receipt.gasUsed}`);
    }
    
    // Check new balance
    const balance = await contract.balanceOf(wallet.address);
    console.log(`\n💰 New Balance: ${ethers.formatEther(balance)} MIC`);
    
  } catch (error: any) {
    console.error('\n❌ Attestation failed!');
    console.error(`   Error: ${error.message}`);
    
    if (error.reason) {
      console.error(`   Reason: ${error.reason}`);
    }
    
    process.exit(1);
  }
  
  console.log('\n"We heal as we walk." — Founder\'s Seal');
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
