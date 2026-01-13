# Enhanced Deliberation & Consensus Modes (Phase 3)

## Overview

Phase 3 introduces advanced consensus modes, deliberation strategies, decision quality analysis, and adaptive routing for Codex-Agentic agents. This enables fine-grained control over how agents reach decisions and improves deliberation quality.

## Features

### 🎯 Consensus Modes

Choose how agreement is calculated and winners are selected:

- **Simple** (default): Largest agreement group wins
- **Unanimous**: All providers must agree (100%)
- **Supermajority**: Configurable threshold (e.g., 66%, 75%)
- **Weighted**: Weight votes by historical provider performance
- **Quorum**: Require minimum participation threshold
- **Ranked**: Ranked-choice voting
- **Veto**: Any dissent blocks (require full consensus)

### 🔄 Deliberation Strategies

Control how providers are invoked:

- **Parallel** (default): All providers simultaneously
- **Sequential**: One at a time, building context
- **Debate**: Providers critique each other's outputs
- **Multi-round**: Multiple iterations for refinement
- **Cascade**: Fallback chain with early exit
- **Tournament**: Pairwise elimination

### 📊 Decision Quality Analysis

Comprehensive quality metrics:

- **Confidence**: 0-1 score based on agreement and consensus mode
- **Uncertainty**: Spread, ambiguity, volatility metrics
- **Minority Reports**: Capture dissenting views (>10% support)
- **Reasoning Transparency**: Explain how decisions were made
- **Risk Assessment**: Low/medium/high risk levels

### 🎨 Adaptive Routing

Intelligent provider selection:

- **Performance-based**: Use best-performing providers from history
- **Domain-aware**: Select providers by task domain
- **Cost-constrained**: Stay within budget limits
- **Latency-constrained**: Meet speed requirements
- **Automatic recommendations**: Suggest optimal strategies

## Usage

### Basic Enhanced Deliberation

```typescript
import { enhancedCodexDeliberate } from '@mobius/codex-agentic';

// Use enhanced deliberation with supermajority consensus
const proof = await enhancedCodexDeliberate({
  agent: 'ATLAS',
  input: 'Review this critical governance proposal',

  // Require 75% agreement
  consensus: {
    mode: 'supermajority',
    threshold: 0.75,
  },

  // Enable quality analysis
  analyzeQuality: true,
});

console.log('Agreement:', (proof.agreement * 100).toFixed(0) + '%');
console.log('Confidence:', (proof.quality?.confidence * 100).toFixed(0) + '%');
console.log('Risk:', proof.quality && assessDecisionRisk(proof.quality));
```

### Multi-Round Deliberation

```typescript
// Multiple rounds for refinement
const proof = await enhancedCodexDeliberate({
  agent: 'AUREA',
  input: 'Complex reasoning task requiring iteration',

  deliberation: {
    strategy: 'multi-round',
    maxRounds: 3,
    earlyExitThreshold: 0.95, // Stop if 95% agreement reached
    includePreviousRounds: true,
  },
});

// Check how many rounds were needed
console.log('Rounds executed:', proof.rounds?.length);
```

### Weighted Consensus

```typescript
// Weight votes by historical provider performance
const proof = await enhancedCodexDeliberate({
  agent: 'ZEUS',
  input: 'Security analysis task',

  consensus: {
    mode: 'weighted',
    useWeights: true,
    weights: {
      agreement: 0.4,  // 40% weight on past agreement
      giScore: 0.4,    // 40% weight on past GI scores
      errorRate: 0.2,  // 20% weight on error rate
    },
  },
});

// View provider weights
if (proof.providerWeights) {
  for (const pw of proof.providerWeights) {
    console.log(`${pw.provider}: weight ${pw.weight.toFixed(2)} (${pw.basedOn.sampleSize} samples)`);
  }
}
```

### Debate Deliberation

```typescript
// Providers critique each other
const proof = await enhancedCodexDeliberate({
  agent: 'EVE',
  input: 'Ethical dilemma requiring deep consideration',

  deliberation: {
    strategy: 'debate',
    debateConfig: {
      rounds: 2,
      includeCounterArguments: true,
      requireSynthesis: true,
    },
  },
});

// View debate rounds
if (proof.rounds) {
  for (const round of proof.rounds) {
    console.log(`Round ${round.roundNumber}: ${(round.agreement * 100).toFixed(0)}% agreement`);
  }
}
```

### Adaptive Routing

```typescript
// Automatically select best providers based on history
const proof = await enhancedCodexDeliberate({
  agent: 'HERMES',
  input: 'Market analysis and prediction',

  // Enable adaptive routing
  adaptiveRouting: true,

  // With constraints
  maxCost: 0.01,        // Max $0.01
  maxLatency: 3000,     // Max 3 seconds

  analyzeQuality: true,
});

// Adaptive routing selected providers based on performance
console.log('Providers used:', proof.votes.map(v => v.provider).join(', '));
console.log('Total cost:', `$${proof.metrics?.totalCost.toFixed(4)}`);
console.log('Total latency:', `${proof.metrics?.totalLatency}ms`);
```

### Cost-Constrained Deliberation

```typescript
// Stay within budget
const proof = await enhancedCodexDeliberate({
  agent: 'SOLARA',
  input: 'Computation task',

  maxCost: 0.005,  // Max half a cent

  // System will automatically recommend cascade strategy
  adaptiveRouting: true,
});
```

### Unanimous Consensus

```typescript
// Require all providers to agree
const proof = await enhancedCodexDeliberate({
  agent: 'KAIZEN',
  input: 'Constitutional change proposal',

  consensus: {
    mode: 'unanimous',
  },
});

if (!proof.quality?.reasoning.warnings) {
  console.log('✅ Unanimous agreement achieved');
} else {
  console.log('⚠️ Not unanimous:', proof.quality.reasoning.warnings);
}
```

## API Reference

### Enhanced Types

```typescript
interface EnhancedCodexRequest extends CodexRequest {
  consensus?: ConsensusConfig;
  deliberation?: DeliberationConfig;
  analyzeQuality?: boolean;
  adaptiveRouting?: boolean;
  maxCost?: number;
  maxLatency?: number;
}

interface EnhancedDelibProof extends DelibProof {
  quality?: DecisionQuality;
  consensusMode?: ConsensusMode;
  deliberationStrategy?: DeliberationStrategy;
  providerWeights?: ProviderWeights[];
  metrics?: {
    totalCost: number;
    totalLatency: number;
    providerMetrics: ProviderMetric[];
  };
  rounds?: DeliberationRound[];
}
```

### Helper Functions

```typescript
// Estimate costs
import { estimateDeliberationCost, estimateDeliberationLatency } from '@mobius/codex-agentic';

const cost = estimateDeliberationCost(['anthropic', 'openai', 'gemini'], 2000);
const latency = estimateDeliberationLatency(['anthropic', 'openai'], true);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
console.log(`Estimated latency: ${latency}ms`);

// Get strategy recommendations
import { recommendStrategy } from '@mobius/codex-agentic';

const recommendation = recommendStrategy({
  maxCost: 0.01,
  maxLatency: 2000,
  minAgreement: 0.95,
});

console.log('Recommended strategy:', recommendation.reasoning);

// Assess decision risk
import { assessDecisionRisk } from '@mobius/codex-agentic';

const risk = assessDecisionRisk(proof.quality!);
console.log('Decision risk:', risk); // 'low' | 'medium' | 'high'
```

## Consensus Modes in Detail

### Simple (Default)

```typescript
consensus: { mode: 'simple' }
```

- Largest agreement group wins
- Fast and straightforward
- Good for most use cases

### Unanimous

```typescript
consensus: { mode: 'unanimous' }
```

- All providers must agree (100%)
- High confidence, slow to achieve
- Best for critical decisions

### Supermajority

```typescript
consensus: {
  mode: 'supermajority',
  threshold: 0.66, // 2/3 majority
}
```

- Configurable threshold (e.g., 66%, 75%)
- Balance between speed and confidence
- Common in governance decisions

### Weighted

```typescript
consensus: {
  mode: 'weighted',
  useWeights: true,
  weights: {
    agreement: 0.4,
    giScore: 0.4,
    errorRate: 0.2,
  },
}
```

- Weight votes by historical performance
- Learns from past successes
- Requires Phase 2 memory enabled

### Quorum

```typescript
consensus: {
  mode: 'quorum',
  quorum: 0.5, // 50% minimum participation
}
```

- Require minimum participation threshold
- Useful when some providers may be unavailable

## Deliberation Strategies in Detail

### Parallel (Default)

```typescript
deliberation: { strategy: 'parallel' }
```

- All providers simultaneously
- Fastest option
- No context sharing between providers

### Sequential

```typescript
deliberation: {
  strategy: 'sequential',
  includePreviousRounds: true,
}
```

- One provider at a time
- Each sees previous responses
- Builds on collective knowledge

### Debate

```typescript
deliberation: {
  strategy: 'debate',
  debateConfig: {
    rounds: 2,
    includeCounterArguments: true,
    requireSynthesis: true,
  },
}
```

- Providers critique each other
- Multiple rounds of refinement
- Final synthesis round
- Best for complex, nuanced tasks

### Multi-Round

```typescript
deliberation: {
  strategy: 'multi-round',
  maxRounds: 3,
  earlyExitThreshold: 0.95,
}
```

- Iterative refinement
- Early exit when threshold met
- Good for improving agreement

### Cascade

```typescript
deliberation: {
  strategy: 'cascade',
  cascadeConfig: {
    providers: ['local', 'deepseek', 'anthropic'],
    stopOnSuccess: true,
  },
}
```

- Fallback chain
- Try cheap providers first
- Stop when one succeeds
- Minimizes cost

## Decision Quality Metrics

### Confidence

- **0.9-1.0**: Very high confidence
- **0.7-0.9**: High confidence
- **0.5-0.7**: Moderate confidence
- **Below 0.5**: Low confidence (review carefully)

### Uncertainty

- **Spread**: How diverse are outputs? (0 = identical, 1 = all different)
- **Ambiguity**: How close are top choices? (0 = clear winner, 1 = tie)
- **Volatility**: How stable is consensus? (0 = stable, 1 = volatile)

### Minority Reports

Captured when:
- Dissenting view has >10% support
- Up to 3 minority reports per deliberation
- Includes provider, output, and reasoning

## Performance Considerations

### Cost Optimization

```typescript
// Cheapest to most expensive (per 1K tokens)
local:      $0.00    (free)
deepseek:   $0.00027
gemini:     $0.00125
openai:     $0.0025
anthropic:  $0.003
```

### Latency Optimization

```typescript
// Fastest to slowest (average)
openai:     ~1.5s
anthropic:  ~2s
deepseek:   ~2.5s
gemini:     ~3s
local:      ~5s (varies by hardware)
```

### Strategy Selection

| Goal | Consensus | Deliberation |
|------|-----------|--------------|
| Speed | Simple | Parallel |
| Quality | Weighted | Debate |
| Cost | Simple | Cascade |
| Accuracy | Supermajority | Multi-round |
| Critical | Unanimous | Debate |

## Best Practices

1. **Use adaptive routing** for automatic optimization
2. **Enable quality analysis** for important decisions
3. **Set cost/latency constraints** to stay within budget
4. **Use weighted consensus** after accumulating history
5. **Try debate mode** for complex, nuanced tasks
6. **Check minority reports** for alternative perspectives
7. **Monitor decision risk** and review high-risk decisions

## Examples

See [/examples/phase3/](../../examples/phase3/) for:
- Unanimous consensus for constitutional changes
- Weighted voting for security analysis
- Debate mode for ethical dilemmas
- Cost-optimized cascade for high-volume tasks
- Multi-round refinement for research

## License

Part of Mobius Substrate monorepo. See root LICENSE.

---

**Phase 3 Status**: ✅ Complete

**Next Phase**: Phase 4 - Advanced prompt engineering per sentinel
