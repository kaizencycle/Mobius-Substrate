#!/usr/bin/env node
/**
 * Provider Test Script
 * Interactive testing for all LLM providers
 *
 * Usage:
 *   npm run test:providers              # Test all available providers
 *   npm run test:providers -- anthropic # Test specific provider
 */

import { callProvider, getAvailableProviders, isProviderAvailable } from './src/lib/codex/providers/index.js';
import { validateProviderConfig, getProviderMetadata } from './src/lib/codex/config.js';
import type { ProviderId } from './src/types.js';

// ANSI color codes for pretty output
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
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
};

/**
 * Test prompt - simple, universal question
 */
const TEST_PROMPT = 'What is the capital of France? Answer in one sentence.';

/**
 * Test a single provider
 */
async function testProvider(providerId: ProviderId): Promise<boolean> {
  log.header(`Testing ${providerId.toUpperCase()}`);

  // 1. Check availability
  const available = isProviderAvailable(providerId);
  if (!available) {
    log.warning(`Provider ${providerId} is not available (missing API key or configuration)`);
    return false;
  }
  log.success(`Provider ${providerId} is available`);

  // 2. Validate configuration
  const validation = validateProviderConfig(providerId);
  if (!validation.valid) {
    log.error(`Configuration validation failed for ${providerId}:`);
    validation.errors.forEach(err => log.error(`  ${err}`));
    return false;
  }
  log.success(`Configuration valid`);

  // 3. Get metadata
  const metadata = getProviderMetadata(providerId);
  log.dim(`  Model: ${metadata.defaultModel}`);
  log.dim(`  Context: ${metadata.contextWindow.toLocaleString()} tokens`);
  log.dim(`  Cost: ${metadata.costTier}`);

  // 4. Make test API call
  log.info(`Calling ${providerId} API...`);
  const startTime = Date.now();

  try {
    const result = await callProvider(providerId, TEST_PROMPT, {
      agent: 'ATLAS',
      maxTokens: 100,
      temperature: 0.5,
    });

    const elapsed = Date.now() - startTime;

    // Check for errors
    if (result.meta?.error) {
      log.error(`API call failed: ${result.meta.errorMessage}`);
      return false;
    }

    // Success!
    log.success(`Response received (${elapsed}ms)`);
    console.log(`\n${colors.bright}Response:${colors.reset}`);
    console.log(`  ${result.output.trim()}\n`);

    // Show usage stats
    if (result.usage) {
      log.dim(`  Tokens: ${result.usage.prompt} prompt + ${result.usage.completion} completion = ${result.usage.prompt + result.usage.completion} total`);
    }

    if (result.meta?.model) {
      log.dim(`  Model: ${result.meta.model}`);
    }

    return true;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    log.error(`API call failed after ${elapsed}ms`);
    log.error(`  ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test all available providers
 */
async function testAllProviders(): Promise<void> {
  log.header('🌀 MOBIUS SUBSTRATE - LLM Provider Tests');

  const allProviders: ProviderId[] = ['anthropic', 'openai', 'gemini', 'deepseek', 'local'];
  const available = getAvailableProviders();

  log.info(`Found ${available.length} available providers: ${available.join(', ')}`);

  if (available.length === 0) {
    log.warning('No providers are configured. Please set API keys in .env file.');
    log.info('See .env.example for configuration template.');
    return;
  }

  const results: Record<string, boolean> = {};

  for (const providerId of allProviders) {
    if (available.includes(providerId)) {
      results[providerId] = await testProvider(providerId);
    } else {
      log.header(`Skipping ${providerId.toUpperCase()}`);
      log.warning(`Provider ${providerId} is not configured`);
      results[providerId] = false;
    }
  }

  // Summary
  log.header('📊 Test Summary');
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  console.log();
  Object.entries(results).forEach(([provider, success]) => {
    if (success) {
      log.success(`${provider.padEnd(12)} PASSED`);
    } else {
      log.error(`${provider.padEnd(12)} FAILED`);
    }
  });

  console.log();
  if (passed === total) {
    log.success(`All ${total} providers passed! 🎉`);
  } else if (passed > 0) {
    log.warning(`${passed}/${total} providers passed`);
  } else {
    log.error(`All tests failed`);
  }
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Test specific provider
    const providerId = args[0].toLowerCase() as ProviderId;
    const validProviders: ProviderId[] = ['anthropic', 'openai', 'gemini', 'deepseek', 'local'];

    if (!validProviders.includes(providerId)) {
      log.error(`Invalid provider: ${providerId}`);
      log.info(`Valid providers: ${validProviders.join(', ')}`);
      process.exit(1);
    }

    const success = await testProvider(providerId);
    process.exit(success ? 0 : 1);
  } else {
    // Test all providers
    await testAllProviders();
  }
}

main().catch(error => {
  log.error(`Unhandled error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
