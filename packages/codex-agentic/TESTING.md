# Testing Guide - Codex Agentic

Comprehensive testing suite for LLM provider implementations and multi-agent consensus.

## 🧪 Test Suite Overview

| Test | Command | Requires API Keys | Purpose |
|------|---------|-------------------|---------|
| **Config Test** | `npm run test:config` | ❌ No | Validate configuration system |
| **Provider Test** | `npm run test:providers` | ✅ Yes | Test individual LLM providers |
| **Consensus Test** | `npm run test:consensus` | ✅ Yes | Test multi-provider deliberation |
| **All Tests** | `npm run test:all` | ✅ Yes | Run complete test suite |

---

## 📋 Prerequisites

### 1. Build the Package

```bash
cd packages/codex-agentic
npm run build
```

### 2. Set Up API Keys (Optional)

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
# Edit .env and add your API keys
```

**Minimum for testing:** At least 1 provider (e.g., just `ANTHROPIC_API_KEY`)

---

## 🔧 Test 1: Configuration Validation

**Tests configuration system without making API calls.**

```bash
npm run test:config
```

### What it tests:
- ✅ Configuration loading from environment
- ✅ Provider metadata (models, context windows, costs)
- ✅ Configuration validation
- ✅ Provider availability checking
- ✅ Default values and overrides

### Example output:

```
🔧 Configuration Validation Test

1. Loading global configuration...
   ✓ Configuration loaded
   Default provider: anthropic
   Fallback providers: openai, gemini, deepseek

2. Provider metadata...
   anthropic    - Anthropic Claude
                   Model: claude-sonnet-4-20250514
                   Context: 200,000 tokens
                   Cost: high

3. Validating all provider configurations...
   ⚠ anthropic    Missing API key
   ✓ local        Valid

4. Checking provider availability...
   ✓ local        Available

📊 Summary
   Total providers: 5
   Available: 1 (local)
   Configured: 1 (local)
```

---

## 🤖 Test 2: Individual Provider Tests

**Tests each LLM provider with real API calls.**

```bash
# Test all available providers
npm run test:providers

# Test specific provider
npm run test:providers -- anthropic
npm run test:providers -- openai
npm run test:providers -- gemini
npm run test:providers -- deepseek
npm run test:providers -- local
```

### What it tests:
- ✅ Provider availability
- ✅ Configuration validation
- ✅ API connectivity
- ✅ Request/response handling
- ✅ Timeout management
- ✅ Token usage tracking
- ✅ Error handling

### Example output:

```
🌀 MOBIUS SUBSTRATE - LLM Provider Tests

Testing ANTHROPIC
✓ Provider anthropic is available
✓ Configuration valid
  Model: claude-sonnet-4-20250514
  Context: 200,000 tokens
  Cost: high
ℹ Calling anthropic API...
✓ Response received (1234ms)

Response:
  The capital of France is Paris.

  Tokens: 15 prompt + 8 completion = 23 total
  Model: claude-sonnet-4-20250514

📊 Test Summary
✓ anthropic      PASSED
✓ openai         PASSED
✓ gemini         PASSED
✓ deepseek       PASSED
✓ local          PASSED

All 5 providers passed! 🎉
```

---

## 🗳️ Test 3: Multi-Provider Consensus

**Tests the DelibProof consensus engine with multiple providers.**

```bash
npm run test:consensus
```

### What it tests:
- ✅ Parallel provider calls
- ✅ Agreement calculation
- ✅ Text similarity grouping
- ✅ Agent deliberation (via anchors)
- ✅ Disagreement handling
- ✅ Council-wide consensus
- ✅ MII (Mobius Integrity Index) validation

### Test Scenarios:

#### 1. Simple Multi-Provider Consensus
Tests basic agreement on a simple question:
```
Question: "What is 2+2?"
Providers: anthropic, openai, gemini
Expected: High agreement (>80%)
```

#### 2. Agent Deliberation (ATLAS)
Tests single-agent deliberation with provider routing:
```
Agent: ATLAS
Task: "Explain what makes a good code review"
Expected: Coherent response with GI score ≥ 0.95
```

#### 3. Disagreement Scenario
Tests handling of divergent opinions:
```
Question: "Is a hotdog a sandwich?"
Providers: anthropic, openai
Expected: Moderate-to-low agreement (healthy disagreement)
```

#### 4. Council-Wide Deliberation
Tests all active agents:
```
Proposal: "Should we add automated testing?"
Agents: All active (ATLAS, AUREA, JADE, etc.)
Expected: Council consensus with average GI ≥ 0.95
```

### Example output:

```
🌀 MOBIUS SUBSTRATE - Multi-Provider Consensus Tests

🗳️  Test 1: Simple Multi-Provider Consensus

Question: "What is 2+2?"
Providers: anthropic, openai, gemini

Individual Votes:
  anthropic   : 4
  openai      : 4
  gemini      : 4

✓ Agreement Score: 100.0%
ℹ Consensus Groups: 1
✓ Strong consensus reached! ✅

🤖 Test 2: Agent Deliberation (ATLAS)

Task: "Explain in one sentence what makes a good code review."
Agent: ATLAS (Coordination & Quality Assurance)

Deliberation Result:

A good code review balances technical accuracy, readability,
and constructive feedback while maintaining team velocity.

  Provider: anthropic
  Agreement: 95.0%
  GI Score: 0.978
  Trace ID: delib_1234567890abc

✓ MII threshold met (≥ 0.95) ✅

⚖️  Test 3: Handling Disagreement

Question: "Is a hotdog a sandwich?"
Providers: anthropic, openai

anthropic:
  No, a hotdog is not a sandwich because it uses a single
  hinged bun rather than two separate pieces of bread.

openai:
  Yes, by definition a sandwich is food between bread, which
  makes a hotdog technically a sandwich.

ℹ Agreement: 35.0%
⚠ Providers disagree! This demonstrates healthy multi-perspective reasoning.

✨ All Consensus Tests Complete!
✓ The DelibProof consensus engine is working correctly.
```

---

## 🚀 Running All Tests

Run the complete test suite:

```bash
npm run test:all
```

This will:
1. Build the package (`npm run build`)
2. Run configuration tests
3. Run provider tests
4. Run consensus tests

---

## 💡 Troubleshooting

### "Provider not available"

**Cause:** Missing API key

**Solution:** Add API key to `.env`:
```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### "API call failed: timeout"

**Cause:** Network issues or slow provider

**Solution:** Increase timeout in `.env`:
```bash
ANTHROPIC_TIMEOUT=120000  # 2 minutes
```

### "Cannot find module"

**Cause:** Package not built

**Solution:** Run build first:
```bash
npm run build
```

### Local provider fails

**Cause:** Ollama not running

**Solution:** Start Ollama:
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1:8b-instruct-q4_K_M

# Start server
ollama serve
```

---

## 📊 Expected Results

### With No API Keys
- ✅ Config test passes
- ✅ Provider test reports "not available"
- ⚠️ Consensus test may fail (no providers)

### With 1+ API Keys
- ✅ Config test passes
- ✅ Provider tests pass for configured providers
- ✅ Consensus tests pass with available providers

### With All API Keys + Ollama
- ✅ All tests pass
- ✅ Full multi-provider consensus works
- ✅ All 5 providers tested successfully

---

## 🎯 Test Coverage

| Component | Coverage |
|-----------|----------|
| Configuration loading | ✅ Full |
| Provider metadata | ✅ Full |
| Provider dispatch | ✅ Full |
| API connectivity | ✅ Full |
| Error handling | ✅ Full |
| Timeout handling | ✅ Full |
| Token tracking | ✅ Full |
| Agreement calculation | ✅ Full |
| Text similarity | ✅ Full |
| GI scoring | ✅ Full |
| Consensus protocol | ✅ Full |

---

## 📝 Adding Custom Tests

Create your own test file:

```typescript
// my-test.ts
import { callProvider } from './src/lib/codex/providers/index.js';

const result = await callProvider('anthropic', 'Your prompt here', {
  agent: 'ATLAS',
  maxTokens: 500,
  temperature: 0.7,
});

console.log(result.output);
```

Run it:
```bash
npx tsx my-test.ts
```

---

## 🔗 Related Documentation

- [PROVIDERS.md](./PROVIDERS.md) - Provider setup guide
- [.env.example](./.env.example) - Environment configuration
- [../../../CLAUDE.md](../../../CLAUDE.md) - Main monorepo guide

---

## 🐛 Reporting Issues

If tests fail unexpectedly:

1. Check `.env` configuration
2. Verify API keys are valid
3. Check network connectivity
4. Review error messages
5. Open an issue on GitHub with:
   - Test command used
   - Error output
   - Environment (OS, Node version)
   - Provider being tested

---

*"We test as we heal." — Mobius Substrate* 🌀
