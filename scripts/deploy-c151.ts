#!/usr/bin/env npx tsx

/**
 * @fileoverview C-151 CoordinationMIC Deployment Script
 * @description Deploys the CoordinationMIC contract to the ledger
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 * 
 * Usage:
 *   LEDGER_RPC=https://... DEPLOYER_KEY=0x... npx tsx deploy-c151.ts
 * 
 * Environment Variables:
 *   - LEDGER_RPC: RPC URL for the ledger network
 *   - DEPLOYER_KEY: Private key for deployment
 *   - LEDGER_ADDRESS: (Optional) Ledger contract for attestation
 */

import { ethers, ContractFactory } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT BYTECODE (Simplified - actual would be compiled)
// ═══════════════════════════════════════════════════════════════════════════

// In production, this would be imported from compiled artifacts
// For now, we'll compile on-the-fly if Hardhat is available

async function getContractFactory(wallet: ethers.Wallet): Promise<ContractFactory> {
  // Try to load from Hardhat artifacts
  const artifactPath = path.join(
    __dirname,
    '../packages/gic-registry-contracts/artifacts/contracts/C151/CoordinationMIC.sol/CoordinationMIC.json'
  );
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  }
  
  // Fallback: compile with solc if available
  console.log('⚠️ Artifact not found. Please compile contracts first:');
  console.log('   cd packages/gic-registry-contracts && npx hardhat compile');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 C-151 CoordinationMIC Deployment');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Validate environment
  const rpcUrl = process.env.LEDGER_RPC;
  const deployerKey = process.env.DEPLOYER_KEY;
  
  if (!rpcUrl || !deployerKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   - LEDGER_RPC: RPC URL for the ledger network');
    console.error('   - DEPLOYER_KEY: Private key for deployment');
    console.error('\nUsage:');
    console.error('   LEDGER_RPC=https://... DEPLOYER_KEY=0x... npx tsx deploy-c151.ts');
    process.exit(1);
  }
  
  // Connect
  console.log('\n📡 Connecting to ledger...');
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(deployerKey, provider);
  
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(wallet.address);
  
  console.log(`   Network: ${network.name} (chainId: ${network.chainId})`);
  console.log(`   Deployer: ${wallet.address}`);
  console.log(`   Balance: ${ethers.formatEther(balance)} ETH`);
  
  // Check balance
  if (balance < ethers.parseEther('0.01')) {
    console.error('\n❌ Insufficient balance for deployment');
    console.error('   Need at least 0.01 ETH for gas');
    process.exit(1);
  }
  
  // Get contract factory
  console.log('\n📦 Loading contract...');
  const factory = await getContractFactory(wallet);
  
  // Deploy
  console.log('\n🔨 Deploying CoordinationMIC...');
  console.log('   Owner: ' + wallet.address);
  
  const contract = await factory.deploy(wallet.address);
  console.log(`   TX Hash: ${contract.deploymentTransaction()?.hash}`);
  
  console.log('   Waiting for confirmation...');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(`\n✅ CoordinationMIC deployed!`);
  console.log(`   Address: ${address}`);
  
  // Verify initial state
  console.log('\n🔍 Verifying deployment...');
  const mic = new ethers.Contract(address, [
    'function currentCycle() view returns (string)',
    'function getCathedralMultiplier(string) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
  ], wallet);
  
  const cycle = await mic.currentCycle();
  const govMultiplier = await mic.getCathedralMultiplier('FOR-GOVERNMENTS');
  const supply = await mic.totalSupply();
  
  console.log(`   Cycle: ${cycle}`);
  console.log(`   FOR-GOVERNMENTS multiplier: ${ethers.formatEther(govMultiplier)}x`);
  console.log(`   Initial supply: ${ethers.formatEther(supply)} MIC`);
  
  // Submit deployment attestation if ledger is available
  const ledgerAddress = process.env.LEDGER_ADDRESS;
  if (ledgerAddress) {
    console.log('\n📝 Submitting deployment attestation...');
    try {
      const ledger = new ethers.Contract(ledgerAddress, [
        'function attestDeployment(string,string,string) external',
      ], wallet);
      
      const tx = await ledger.attestDeployment('C-151', 'CoordinationMIC', address);
      await tx.wait();
      console.log('   ✅ Attestation recorded');
    } catch (error: any) {
      console.log(`   ⚠️ Attestation failed: ${error.message}`);
    }
  }
  
  // Output deployment info
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📋 Deployment Summary');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Cycle: C-151`);
  console.log(`   Contract: CoordinationMIC`);
  console.log(`   Address: ${address}`);
  console.log(`   Network: ${network.name}`);
  console.log(`   Deployer: ${wallet.address}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Save deployment info
  const deploymentInfo = {
    cycle: 'C-151',
    contract: 'CoordinationMIC',
    address,
    network: network.name,
    chainId: Number(network.chainId),
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    txHash: contract.deploymentTransaction()?.hash,
  };
  
  const deploymentPath = path.join(__dirname, '../deployments/c151-coordination-mic.json');
  fs.mkdirSync(path.dirname(deploymentPath), { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
  
  console.log('\n"We heal as we walk." — Founder\'s Seal');
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

main().catch((error) => {
  console.error('Deployment failed:', error);
  process.exit(1);
});
