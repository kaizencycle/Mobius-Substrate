# LLM Provider Implementations

Complete implementation of all LLM providers for Mobius Substrate's multi-agent consensus system.

## ✅ Implemented Providers

| Provider | Status | SDK | Default Model | Context | Cost |
|----------|--------|-----|---------------|---------|------|
| **Anthropic** | ✅ Complete | `@anthropic-ai/sdk` | `claude-sonnet-4-20250514` | 200K | High |
| **OpenAI** | ✅ Complete | `openai` | `gpt-4o` | 128K | High |
| **Gemini** | ✅ Complete | `@google/generative-ai` | `gemini-1.5-pro` | 1M | Medium |
| **DeepSeek** | ✅ Complete | `openai` (compatible) | `deepseek-chat` | 64K | Low |
| **Local** | ✅ Complete | Fetch API (Ollama) | `llama3.1:8b` | 128K | Free |

## 🚀 Quick Start

### 1. Install Dependencies

All dependencies are already installed in the monorepo:

```bash
npm install  # From repo root
```

### 2. Configure API Keys

Copy the example environment file and add your API keys:

```bash
cd packages/codex-agentic
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Use in Code

```typescript
import { codexDeliberate } from '@mobius/codex-agentic';

// Single agent deliberation (uses default provider route)
const result = await codexDeliberate({
  agent: 'ATLAS',
  input: 'Review this code for security vulnerabilities',
  maxTokens: 2000,
  temperature: 0.7,
});

console.log('Consensus:', result.winner.output);
console.log('Agreement:', result.agreement);
console.log('GI Score:', result.giScore);
```

## 🧠 Phase 2: Memory & Learning (NEW)

The system now includes agent memory and learning persistence:

- **Automatic context retrieval**: Past deliberations inform new ones
- **Performance analytics**: Track agent and provider performance over time
- **Session management**: Group related deliberations
- **Pattern detection**: Identify success/failure patterns

See [MEMORY.md](./MEMORY.md) for complete documentation.

```typescript
import { codexDeliberate, generateAgentAnalytics } from '@mobius/codex-agentic';

// Memory is automatically enabled (set CODEX_USE_MEMORY=true in .env)
const result = await codexDeliberate({
  agent: 'ATLAS',
  input: 'How should we handle security audits?',
  tags: ['security', 'governance'],
});

// Agent learns from this deliberation and can reference it in future deliberations

// Get analytics
const analytics = await generateAgentAnalytics('ATLAS', 30);
console.log('Success rate:', (analytics.successRate * 100).toFixed(1) + '%');
console.log('Avg agreement:', (analytics.avgAgreement * 100).toFixed(1) + '%');
```

## 📚 Provider Details

### Anthropic (Claude)

**Best for:** Strategic reasoning, code review, long-context tasks

```typescript
// Environment variables
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514  // or claude-opus-4-5-20251101

// Features
- 200K token context window
- Best-in-class reasoning
- Strong code understanding
- Excellent safety/alignment
```

**Models:**
- `claude-sonnet-4-20250514` - Balanced (default)
- `claude-opus-4-5-20251101` - Most capable
- `claude-3-5-haiku-20241022` - Fast & efficient

---

### OpenAI (GPT)

**Best for:** General tasks, function calling, structured outputs

```typescript
// Environment variables
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o  // or gpt-4-turbo-preview

// Features
- 128K token context window
- Versatile across all tasks
- Strong function calling
- Broad knowledge base
```

**Models:**
- `gpt-4o` - Latest, fastest (default)
- `gpt-4-turbo-preview` - High capability
- `gpt-4` - Stable, reliable

---

### Google Gemini

**Best for:** Multimodal tasks, massive context, research

```typescript
// Environment variables
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-pro

// Features
- 1M token context window (largest!)
- Strong multimodal capabilities
- Competitive pricing
- Fast inference
```

**Models:**
- `gemini-1.5-pro` - Most capable (default)
- `gemini-1.5-flash` - Fast & efficient
- `gemini-2.0-flash-exp` - Experimental

---

### DeepSeek

**Best for:** Code generation, reasoning chains, cost efficiency

```typescript
// Environment variables
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

// Features
- OpenAI-compatible API
- Specialized reasoning models
- Very cost-effective
- Strong code capabilities
```

**Models:**
- `deepseek-chat` - General chat (default)
- `deepseek-reasoner` - Chain-of-thought reasoning
- `deepseek-coder` - Code-specialized

---

### Local (Ollama/LMStudio)

**Best for:** Privacy, offline work, experimentation, cost control

```typescript
// Environment variables (optional)
LOCAL_LLM_URL=http://localhost:11434  // Ollama default
LOCAL_LLM_MODEL=llama3.1:8b-instruct-q4_K_M

// Features
- Completely free
- Full privacy (no data leaves your machine)
- No API limits
- Supports Ollama, LMStudio, etc.
```

**Setup Ollama:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1:8b-instruct-q4_K_M

# Start server (runs automatically)
ollama serve
```

**Popular Models:**
- `llama3.1:8b-instruct-q4_K_M` - Balanced, quantized
- `mistral:7b-instruct` - Fast, efficient
- `codellama:13b-instruct` - Code-specialized
- `gemma2:9b` - Google's open model

---

## 🎯 Sentinel-Provider Mapping

Based on the broker-api configuration, here's the recommended provider for each sentinel:

| Sentinel | Provider | Model | Why |
|----------|----------|-------|-----|
| **ATLAS** | Anthropic | Claude Sonnet 4 | Strategic planning, code audit |
| **AUREA** | Anthropic | Claude Sonnet 4 | Constitutional reasoning |
| **HERMES** | Anthropic | Claude Sonnet 4 | Communication clarity |
| **EVE** | Anthropic | Claude Sonnet 4 | Safety analysis |
| **ZEUS** | Anthropic | Claude Sonnet 4 | Security review |
| **JADE** | OpenAI | GPT-4 Turbo | Knowledge synthesis |
| **ECHO** | Gemini | Gemini 1.5 Pro | Pattern recognition |
| **DAEDALUS** | DeepSeek | DeepSeek Reasoner | Meta-optimization |

## 🔧 Advanced Usage

### Direct Provider Calls

```typescript
import { callProvider } from '@mobius/codex-agentic/lib/codex/providers';

const result = await callProvider('anthropic', 'Explain quantum computing', {
  agent: 'ATLAS',
  maxTokens: 1000,
  temperature: 0.5,
});
```

### Multi-Provider Consensus

```typescript
import { callProviders } from '@mobius/codex-agentic/lib/codex/providers';

const votes = await callProviders(
  ['anthropic', 'openai', 'gemini'],
  'Is this code secure?',
  { agent: 'ZEUS', temperature: 0.3 }
);

// All 3 providers respond in parallel
votes.forEach(vote => {
  console.log(`${vote.provider}: ${vote.output}`);
});
```

### Check Available Providers

```typescript
import { getAvailableProviders, isProviderAvailable } from '@mobius/codex-agentic/lib/codex/providers';

// Get all providers with API keys configured
const available = getAvailableProviders();
console.log('Available:', available); // ['anthropic', 'openai', 'local']

// Check specific provider
if (isProviderAvailable('gemini')) {
  console.log('Gemini is ready!');
}
```

### Configuration Management

```typescript
import { getConfig, validateProviderConfig } from '@mobius/codex-agentic/lib/codex/config';

// Get full configuration
const config = getConfig();
console.log('Default provider:', config.defaultProvider);

// Validate a provider
const validation = validateProviderConfig('anthropic');
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

## 🔐 Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Rotate keys regularly** - Generate new keys every 90 days
3. **Use provider-specific keys** - Don't reuse keys across services
4. **Monitor usage** - Set up billing alerts in provider dashboards
5. **Limit scope** - Use read-only or restricted keys when possible

## 💰 Cost Optimization

### Provider Costs (Approximate)

| Provider | Input ($/1M tokens) | Output ($/1M tokens) | Total for 10K consensus |
|----------|---------------------|----------------------|-------------------------|
| Anthropic Claude Sonnet | $3 | $15 | ~$0.18 |
| OpenAI GPT-4o | $2.50 | $10 | ~$0.13 |
| Gemini 1.5 Pro | $1.25 | $5 | ~$0.06 |
| DeepSeek | $0.14 | $0.28 | ~$0.004 |
| Local (Ollama) | $0 | $0 | $0 |

### Tips:
- Use **DeepSeek** for high-volume, cost-sensitive tasks
- Use **Local** for development and testing
- Reserve **Claude Opus** for critical, high-stakes decisions
- Use **temperature=0** for deterministic, cheaper outputs
- Cache prompts when possible (reduces input tokens)

## 🧪 Testing

```bash
# Run provider tests
cd packages/codex-agentic
npm test

# Test specific provider
npm test -- providers/anthropic.test.ts
```

## 🐛 Troubleshooting

### "API key required" error

```bash
# Check if API key is set
echo $ANTHROPIC_API_KEY

# Set it temporarily
export ANTHROPIC_API_KEY=sk-ant-...

# Or add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### "Connection refused" for Local provider

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull a model if needed
ollama pull llama3.1:8b-instruct-q4_K_M
```

### Timeout errors

```bash
# Increase timeout in .env
ANTHROPIC_TIMEOUT=120000  # 2 minutes
LOCAL_LLM_TIMEOUT=300000  # 5 minutes for local (slower)
```

## 📖 API Reference

See the TypeScript definitions in:
- `src/types.ts` - Core types
- `src/lib/codex/providers/unified.ts` - Provider interface
- `src/lib/codex/config.ts` - Configuration types

## 🤝 Contributing

When adding a new provider:

1. Create `src/lib/codex/providers/[provider].ts`
2. Implement the `(prompt: string, req?: CodexRequest) => Promise<CodexVote>` interface
3. Add to `PROVIDER_DISPATCH` in `unified.ts`
4. Add metadata to `PROVIDER_METADATA`
5. Update `.env.example` with new variables
6. Add tests in `__tests__/providers/`

## 📜 License

MIT - See LICENSE file in repo root

---

**Questions?** Check the main [CLAUDE.md](../../CLAUDE.md) or ask ATLAS! 🌀
