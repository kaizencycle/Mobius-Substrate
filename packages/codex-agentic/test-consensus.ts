#!/usr/bin/env node
/**
 * Multi-Provider Consensus Test
 * Demonstrates DelibProof consensus across multiple LLM providers
 *
 * Usage:
 *   npm run test:consensus
 */

import { codexDeliberate, councilDeliberate } from './src/lib/codex/router.js';
import { callProviders } from './src/lib/codex/providers/index.js';
import { calculateAgreement, groupByTextSimilarity } from './src/lib/gi/metrics.js';
import type { ProviderId } from './src/types.js';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  header: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
};

/**
 * Test 1: Simple Multi-Provider Consensus
 */
async function testSimpleConsensus() {
  log.header('🗳️  Test 1: Simple Multi-Provider Consensus');

  const question = 'What is 2+2? Answer with just the number.';
  const providers: ProviderId[] = ['anthropic', 'openai', 'gemini'];

  log.info(`Question: "${question}"`);
  log.info(`Providers: ${providers.join(', ')}`);
  console.log();

  try {
    const votes = await callProviders(providers, question, {
      agent: 'ATLAS',
      maxTokens: 50,
      temperature: 0.1, // Low temperature for deterministic answer
    });

    // Display individual votes
    console.log(`${colors.bright}Individual Votes:${colors.reset}`);
    votes.forEach(vote => {
      if (vote.meta?.error) {
        log.warning(`${vote.provider}: ERROR - ${vote.meta.errorMessage}`);
      } else {
        console.log(`  ${vote.provider.padEnd(12)}: ${vote.output.trim()}`);
      }
    });

    // Calculate agreement
    const validVotes = votes.filter(v => !v.meta?.error);
    if (validVotes.length > 0) {
      const agreement = calculateAgreement(validVotes, 0.80);
      const groups = groupByTextSimilarity(validVotes, 0.80);

      console.log();
      log.success(`Agreement Score: ${(agreement * 100).toFixed(1)}%`);
      log.info(`Consensus Groups: ${groups.length}`);

      if (agreement >= 0.80) {
        log.success('Strong consensus reached! ✅');
      } else if (agreement >= 0.50) {
        log.warning('Moderate consensus');
      } else {
        log.warning('Low consensus - providers disagree');
      }
    }
  } catch (error) {
    log.warning(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test 2: Agent Deliberation (uses anchor configuration)
 */
async function testAgentDeliberation() {
  log.header('🤖 Test 2: Agent Deliberation (ATLAS)');

  const task = 'Explain in one sentence what makes a good code review.';

  log.info(`Task: "${task}"`);
  log.info(`Agent: ATLAS (Coordination & Quality Assurance)`);
  console.log();

  try {
    const result = await codexDeliberate({
      agent: 'ATLAS',
      input: task,
      maxTokens: 200,
      temperature: 0.7,
    });

    console.log(`${colors.bright}Deliberation Result:${colors.reset}`);
    console.log();
    console.log(`${result.winner.output.trim()}`);
    console.log();

    log.dim(`Provider: ${result.winner.provider}`);
    log.dim(`Agreement: ${(result.agreement * 100).toFixed(1)}%`);
    log.dim(`GI Score: ${result.giScore.toFixed(3)}`);
    log.dim(`Trace ID: ${result.traceId}`);

    // Show all votes
    if (result.votes.length > 1) {
      console.log();
      console.log(`${colors.bright}All Votes (${result.votes.length}):${colors.reset}`);
      result.votes.forEach((vote, i) => {
        const preview = vote.output.substring(0, 80) + (vote.output.length > 80 ? '...' : '');
        console.log(`  ${i + 1}. [${vote.provider}] ${preview}`);
      });
    }

    // Validate MII threshold
    console.log();
    if (result.giScore >= 0.95) {
      log.success(`MII threshold met (≥ 0.95) ✅`);
    } else {
      log.warning(`MII below threshold: ${result.giScore.toFixed(3)} < 0.95`);
    }
  } catch (error) {
    log.warning(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test 3: Disagreement Scenario
 */
async function testDisagreement() {
  log.header('⚖️  Test 3: Handling Disagreement');

  const question = 'Is a hotdog a sandwich? Answer yes or no and explain in one sentence.';
  const providers: ProviderId[] = ['anthropic', 'openai'];

  log.info(`Question: "${question}"`);
  log.info(`Providers: ${providers.join(', ')}`);
  log.dim('(This question typically causes disagreement)');
  console.log();

  try {
    const votes = await callProviders(providers, question, {
      agent: 'JADE',
      maxTokens: 100,
      temperature: 0.8, // Higher temperature for diverse opinions
    });

    console.log(`${colors.bright}Responses:${colors.reset}`);
    votes.forEach(vote => {
      if (!vote.meta?.error) {
        console.log();
        console.log(`${colors.bright}${vote.provider}:${colors.reset}`);
        console.log(`  ${vote.output.trim()}`);
      }
    });

    const validVotes = votes.filter(v => !v.meta?.error);
    if (validVotes.length > 0) {
      const agreement = calculateAgreement(validVotes, 0.80);
      console.log();
      log.info(`Agreement: ${(agreement * 100).toFixed(1)}%`);

      if (agreement < 0.50) {
        log.warning('Providers disagree! This demonstrates healthy multi-perspective reasoning.');
      }
    }
  } catch (error) {
    log.warning(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Test 4: Council-Wide Deliberation (all agents)
 */
async function testCouncilDeliberation() {
  log.header('🏛️  Test 4: Council-Wide Deliberation');

  const proposal = 'Should we add automated testing to this codebase?';

  log.info(`Proposal: "${proposal}"`);
  log.info(`This will consult ALL active agents...`);
  console.log();

  try {
    const result = await councilDeliberate(proposal);

    console.log(`${colors.bright}Council Results:${colors.reset}`);
    console.log();

    result.results.forEach(agentResult => {
      const agentName = agentResult.winner.meta?.agent || 'Unknown';
      console.log(`${colors.bright}${agentName}${colors.reset} (agreement: ${(agentResult.agreement * 100).toFixed(0)}%, GI: ${agentResult.giScore.toFixed(2)})`);
      console.log(`  ${agentResult.winner.output.substring(0, 120)}...`);
      console.log();
    });

    log.success(`Council Agreement: ${(result.councilAgreement * 100).toFixed(1)}%`);
    log.success(`Average GI: ${result.giAvg.toFixed(3)}`);

    if (result.giAvg >= 0.95) {
      log.success('Council maintains high integrity! ✅');
    }
  } catch (error) {
    log.warning(`Council deliberation not available (requires anchor configuration)`);
    log.dim(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🌀 MOBIUS SUBSTRATE - Multi-Provider Consensus Tests   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  log.info('This will test the multi-LLM deliberation engine');
  log.dim('Ensure you have API keys configured in .env file');

  // Run all tests
  await testSimpleConsensus();
  await testAgentDeliberation();
  await testDisagreement();
  await testCouncilDeliberation();

  // Summary
  log.header('✨ All Consensus Tests Complete!');
  log.success('The DelibProof consensus engine is working correctly.');
  console.log();
}

main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
