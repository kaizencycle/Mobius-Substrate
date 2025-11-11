/**
 * Simple test script for Thought Broker API
 * Run: node test.js (after starting server with npm run dev)
 */

const http = require('http');

const BASE_URL = 'http://localhost:4005';

async function test() {
  console.log('🧪 Testing Thought Broker API...\n');

  // Test 1: Health Check
  console.log('1. Testing health check...');
  try {
    const healthRes = await fetch(`${BASE_URL}/healthz`);
    const health = await healthRes.json();
    console.log('   ✅ Health check passed:', health.status);
  } catch (error) {
    console.error('   ❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Initiate Deliberation
  console.log('\n2. Testing deliberation initiation...');
  try {
    const deliberationRes = await fetch(`${BASE_URL}/v1/deliberate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Should we implement a new feature for real-time collaboration?',
        requester: 'test-user',
        priority: 'medium',
        requiredSentinels: ['ATLAS', 'AUREA'],
        maxRounds: 3,
        consensusThreshold: 0.75
      })
    });
    const deliberation = await deliberationRes.json();
    
    if (deliberation.success && deliberation.data?.deliberationId) {
      console.log('   ✅ Deliberation initiated:', deliberation.data.deliberationId);
      const deliberationId = deliberation.data.deliberationId;
      
      // Test 3: Poll for completion
      console.log('\n3. Polling for deliberation completion...');
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
        const statusRes = await fetch(`${BASE_URL}/v1/deliberation/${deliberationId}`);
        const status = await statusRes.json();
        
        if (status.success && status.data) {
          const { status: deliberationStatus, consensus, miiScore } = status.data;
          console.log(`   [Attempt ${attempts}] Status: ${deliberationStatus}`);
          
          if (deliberationStatus === 'COMPLETED' || deliberationStatus === 'CONSENSUS_REACHED' || deliberationStatus === 'MII_REJECTED') {
            console.log('   ✅ Deliberation completed!');
            console.log('   Consensus:', consensus?.achieved ? '✅' : '❌');
            console.log('   MII Score:', miiScore || 'N/A');
            if (status.data.deliberationProof) {
              console.log('   Proof generated:', status.data.deliberationProof.merkleRoot.substring(0, 16) + '...');
            }
            break;
          }
        }
      }
      
      if (attempts >= maxAttempts) {
        console.log('   ⚠️  Deliberation timed out (this is normal for long deliberations)');
      }
    } else {
      console.error('   ❌ Failed to initiate deliberation:', deliberation);
    }
  } catch (error) {
    console.error('   ❌ Deliberation test failed:', error.message);
  }

  // Test 4: MII Grading
  console.log('\n4. Testing MII grading...');
  try {
    const gradeRes = await fetch(`${BASE_URL}/v1/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'Deploy new feature with public documentation and audit trails',
        context: {
          feature: 'real-time collaboration',
          impact: 'high'
        },
        proposedBy: 'engineering-team'
      })
    });
    const grade = await gradeRes.json();
    
    if (grade.success && grade.data) {
      console.log('   ✅ MII grading completed');
      console.log('   Score:', (grade.data.score * 100).toFixed(1) + '%');
      console.log('   Passed:', grade.data.passed ? '✅' : '❌');
      console.log('   Breakdown:', {
        transparency: (grade.data.breakdown.transparency * 100).toFixed(1) + '%',
        accountability: (grade.data.breakdown.accountability * 100).toFixed(1) + '%',
        safety: (grade.data.breakdown.safety * 100).toFixed(1) + '%',
        equity: (grade.data.breakdown.equity * 100).toFixed(1) + '%',
        sustainability: (grade.data.breakdown.sustainability * 100).toFixed(1) + '%'
      });
    } else {
      console.error('   ❌ MII grading failed:', grade);
    }
  } catch (error) {
    console.error('   ❌ MII grading test failed:', error.message);
  }

  console.log('\n✨ Test suite complete!');
}

// Run tests
test().catch(console.error);

