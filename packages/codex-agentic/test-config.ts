#!/usr/bin/env node
/**
 * Configuration Validation Test
 * Tests provider configuration without making API calls
 *
 * Usage:
 *   npm run test:config
 */

import {
  getConfig,
  validateProviderConfig,
  validateAllConfigs,
  getProviderConfig,
  getConfiguredProviders,
} from './src/lib/codex/config.js';
import {
  getAllProviderMetadata,
  getAvailableProviders,
  isProviderAvailable,
} from './src/lib/codex/providers/index.js';
import type { ProviderId } from './src/types.js';

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

console.log(`\n${colors.bright}${colors.cyan}🔧 Configuration Validation Test${colors.reset}\n`);

// Test 1: Load global configuration
console.log(`${colors.blue}1. Loading global configuration...${colors.reset}`);
const config = getConfig();
console.log(`   ${colors.green}✓${colors.reset} Configuration loaded`);
console.log(`   Default provider: ${config.defaultProvider}`);
console.log(`   Fallback providers: ${config.fallbackProviders?.join(', ') || 'none'}\n`);

// Test 2: Provider metadata
console.log(`${colors.blue}2. Provider metadata...${colors.reset}`);
const allMetadata = getAllProviderMetadata();
allMetadata.forEach(meta => {
  console.log(`   ${meta.id.padEnd(12)} - ${meta.name}`);
  console.log(`   ${' '.repeat(15)} Model: ${meta.defaultModel}`);
  console.log(`   ${' '.repeat(15)} Context: ${meta.contextWindow.toLocaleString()} tokens`);
  console.log(`   ${' '.repeat(15)} Cost: ${meta.costTier}\n`);
});

// Test 3: Validate all configurations
console.log(`${colors.blue}3. Validating all provider configurations...${colors.reset}`);
const validations = validateAllConfigs();
Object.entries(validations).forEach(([provider, result]) => {
  if (result.valid) {
    console.log(`   ${colors.green}✓${colors.reset} ${provider.padEnd(12)} Valid`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} ${provider.padEnd(12)} ${result.errors.join(', ')}`);
  }
});
console.log();

// Test 4: Check availability
console.log(`${colors.blue}4. Checking provider availability...${colors.reset}`);
const providers: ProviderId[] = ['anthropic', 'openai', 'gemini', 'deepseek', 'local'];
const available = getAvailableProviders();

providers.forEach(provider => {
  const isAvail = isProviderAvailable(provider);
  const providerConfig = getProviderConfig(provider);

  if (isAvail) {
    console.log(`   ${colors.green}✓${colors.reset} ${provider.padEnd(12)} Available`);
    if (providerConfig.apiKey) {
      const masked = providerConfig.apiKey.substring(0, 8) + '...' + providerConfig.apiKey.slice(-4);
      console.log(`   ${' '.repeat(15)} API Key: ${masked}`);
    }
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} ${provider.padEnd(12)} Not available`);
  }
});
console.log();

// Test 5: Configuration details
console.log(`${colors.blue}5. Detailed configuration for each provider...${colors.reset}`);
providers.forEach(provider => {
  const cfg = getProviderConfig(provider);
  console.log(`   ${colors.bright}${provider}${colors.reset}`);
  console.log(`     Enabled: ${cfg.enabled}`);
  console.log(`     Model: ${cfg.model || 'default'}`);
  console.log(`     Max Tokens: ${cfg.maxTokens || 'default'}`);
  console.log(`     Temperature: ${cfg.temperature ?? 'default'}`);
  console.log(`     Timeout: ${cfg.timeout || 'default'}ms`);
  if (cfg.baseURL) {
    console.log(`     Base URL: ${cfg.baseURL}`);
  }
  console.log();
});

// Summary
console.log(`${colors.bright}${colors.cyan}📊 Summary${colors.reset}\n`);
const configured = getConfiguredProviders();
console.log(`   Total providers: ${providers.length}`);
console.log(`   Available: ${available.length} (${available.join(', ') || 'none'})`);
console.log(`   Configured: ${configured.length} (${configured.join(', ') || 'none'})`);
console.log();

if (available.length === 0) {
  console.log(`${colors.yellow}⚠ Warning:${colors.reset} No providers are available.`);
  console.log(`   Set API keys in .env file to enable providers.`);
  console.log(`   See .env.example for configuration template.\n`);
} else {
  console.log(`${colors.green}✓ Configuration test complete!${colors.reset}\n`);
}
