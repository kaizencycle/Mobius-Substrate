# Agent Memory & Learning System (Phase 2)

## Overview

Phase 2 introduces a comprehensive memory and learning persistence system for Codex-Agentic agents. This system enables agents to:

- **Remember past deliberations** and learn from historical outcomes
- **Retrieve relevant context** for new deliberations based on similarity
- **Track performance patterns** and identify areas for improvement
- **Persist sessions** to maintain conversational context
- **Generate analytics** on agent performance over time

## Features

### 🧠 Memory Storage

- **File-based persistence**: Efficient storage with in-memory caching
- **Auto-flush mechanism**: Configurable periodic writes to disk
- **Agent-specific indexing**: Fast lookups by agent
- **Session linking**: Group related deliberations

### 🔍 Context Retrieval

- **Semantic similarity**: Keyword-based text matching
- **Domain inference**: Automatic categorization (security, governance, technical, etc.)
- **Multi-strategy retrieval**:
  - Similar past deliberations
  - Recent successful outcomes
  - Domain-specific context

### 📊 Analytics & Patterns

- **Performance metrics**: Agreement, GI scores, success rates
- **Trend analysis**: Track improvement over time
- **Provider comparison**: Identify best-performing LLM providers
- **Pattern detection**: Discover success/failure patterns

### 📝 Session Management

- **Session tracking**: Link deliberations within a conversation
- **Session statistics**: Duration, deliberation counts, averages
- **Multi-session workflows**: Sequential, parallel, or hierarchical linking

## Architecture

```
packages/codex-agentic/src/lib/memory/
├── storage.ts         # Core storage with file-based persistence
├── retrieval.ts       # Context retrieval and similarity search
├── analytics.ts       # Pattern detection and analytics
├── session.ts         # Session lifecycle management
├── query.ts           # High-level query API
└── index.ts           # Public exports
```

## Usage

### Basic Configuration

Add to your `.env`:

```bash
# Enable memory system (default: true)
CODEX_USE_MEMORY=true

# Storage directory
MEMORY_STORAGE_DIR=./.codex-memory

# Context retrieval settings
MEMORY_MAX_CONTEXT_ENTRIES=5
MEMORY_SIMILARITY_THRESHOLD=0.1

# Auto-flush interval (ms)
MEMORY_FLUSH_INTERVAL=30000
```

### Automatic Integration

Memory is automatically integrated into `codexDeliberate()`. When enabled:

1. **Before deliberation**: Retrieves relevant past deliberations
2. **During deliberation**: Injects context into the prompt
3. **After deliberation**: Stores the result with metadata

```typescript
import { codexDeliberate } from '@mobius/codex-agentic';

// Memory is automatically used if CODEX_USE_MEMORY=true
const proof = await codexDeliberate({
  agent: 'ATLAS',
  input: 'How should we handle governance proposals?',
  tags: ['governance', 'policy'],
});

// The agent now has access to:
// - Similar past governance deliberations
// - Recent successful outcomes
// - Domain-specific context
```

### Manual Memory Operations

#### Storage Operations

```typescript
import { getMemoryStorage } from '@mobius/codex-agentic';

const storage = await getMemoryStorage();

// Store a memory entry
await storage.storeEntry({
  traceId: 'trace-123',
  agent: 'AUREA',
  timestamp: new Date().toISOString(),
  input: 'Calculate integrity score',
  output: '0.995 based on consensus',
  agreement: 0.98,
  giScore: 0.995,
  providers: ['anthropic', 'openai'],
  votes: [...],
  winner: {...},
  success: true,
});

// Retrieve a specific entry
const entry = await storage.getEntry('trace-123');

// Query with filters
const result = await storage.query({
  agent: 'AUREA',
  minAgreement: 0.95,
  successOnly: true,
  limit: 10,
});
```

#### Context Retrieval

```typescript
import { getRelevantContext, formatContextForPrompt } from '@mobius/codex-agentic';

const context = await getRelevantContext(
  'How do we prevent security vulnerabilities?',
  'ZEUS',
  {
    maxEntries: 5,
    includeSimilar: true,
    includeRecent: true,
    includeDomain: true,
  }
);

// Format for prompt injection
const contextPrompt = formatContextForPrompt(context.all);

console.log('Similar:', context.similar.length);
console.log('Recent:', context.recent.length);
console.log('Domain:', context.domain.length);
```

#### Analytics

```typescript
import { generateAgentAnalytics, getProviderRecommendations } from '@mobius/codex-agentic';

// Generate analytics for last 30 days
const analytics = await generateAgentAnalytics('HERMES', 30);

console.log('Total deliberations:', analytics.totalDeliberations);
console.log('Success rate:', (analytics.successRate * 100).toFixed(1) + '%');
console.log('Average agreement:', (analytics.avgAgreement * 100).toFixed(1) + '%');
console.log('Average GI:', analytics.avgGI.toFixed(3));
console.log('Trends:', {
  agreement: analytics.agreementTrend > 0 ? '↗ Improving' : '↘ Declining',
  gi: analytics.giTrend > 0 ? '↗ Improving' : '↘ Declining',
});

// Provider stats
for (const [provider, stats] of Object.entries(analytics.providerStats)) {
  if (stats.uses > 0) {
    console.log(`${provider}:`, {
      uses: stats.uses,
      avgAgreement: (stats.avgAgreement * 100).toFixed(1) + '%',
      avgGI: stats.avgGI.toFixed(3),
      errorRate: (stats.errorRate * 100).toFixed(1) + '%',
    });
  }
}

// Get recommendations
const recs = await getProviderRecommendations('HERMES', 30);
console.log('Recommended providers:', recs.recommended);
console.log('Avoid:', recs.avoid);
console.log('Reasoning:', recs.reasoning);
```

#### Sessions

```typescript
import {
  createSession,
  endSession,
  getSessionStats
} from '@mobius/codex-agentic';

// Create a session
const session = await createSession('EVE', ['governance-review']);

// Use session in deliberations
await codexDeliberate({
  agent: 'EVE',
  input: 'Review proposal XYZ',
  context: { sessionId: session.sessionId },
  tags: ['governance-review'],
});

// Get stats
const stats = await getSessionStats(session.sessionId);
console.log('Duration:', stats.durationMs / 1000, 'seconds');
console.log('Deliberations:', stats.session.deliberationCount);
console.log('Avg agreement:', (stats.session.averageAgreement * 100).toFixed(1) + '%');

// End session
await endSession(session.sessionId);
```

#### Query API

```typescript
import {
  getRecentDeliberations,
  getSuccessfulDeliberations,
  getFailedDeliberations,
  searchDeliberationsByInput,
  getTodayDeliberations,
} from '@mobius/codex-agentic';

// Recent deliberations
const recent = await getRecentDeliberations('JADE', 10);

// Only successful ones
const successful = await getSuccessfulDeliberations('JADE', 10);

// Failed deliberations (for analysis)
const failed = await getFailedDeliberations('JADE', 5);

// Search by text
const securityDeliberations = await searchDeliberationsByInput(
  'security vulnerability',
  'ZEUS',
  20
);

// Today's deliberations
const today = await getTodayDeliberations('ATLAS');
```

## Data Structure

### MemoryEntry

```typescript
interface MemoryEntry {
  // Core identification
  traceId: string;
  agent: FoundingAgent;
  timestamp: string;
  sessionId?: string;

  // Request context
  input: string;
  inputContext?: Record<string, unknown>;
  tags?: string[];

  // Response data
  output: string;
  agreement: number;
  giScore: number;
  providers: ProviderId[];

  // Complete deliberation data
  votes: CodexVote[];
  winner: CodexVote;

  // Learning metadata
  success: boolean;
  belowThreshold?: boolean;
  errorCount?: number;

  // Retrieval metadata
  embedding?: number[];
  keywords?: string[];
  domain?: string;
}
```

### MemorySession

```typescript
interface MemorySession {
  sessionId: string;
  agent: FoundingAgent;
  startTime: string;
  endTime?: string;
  deliberationCount: number;
  averageAgreement: number;
  averageGI: number;
  tags?: string[];
}
```

### AgentAnalytics

```typescript
interface AgentAnalytics {
  agent: FoundingAgent;
  period: { start: string; end: string };

  // Deliberation metrics
  totalDeliberations: number;
  successfulDeliberations: number;
  successRate: number;

  // Agreement metrics
  avgAgreement: number;
  minAgreement: number;
  maxAgreement: number;
  agreementTrend: number; // Positive = improving

  // GI metrics
  avgGI: number;
  minGI: number;
  maxGI: number;
  giTrend: number; // Positive = improving

  // Provider performance
  providerStats: Record<ProviderId, {
    uses: number;
    avgAgreement: number;
    avgGI: number;
    errorRate: number;
  }>;

  // Pattern insights
  topPatterns: LearningPattern[];

  // Sessions
  totalSessions: number;
  avgDeliberationsPerSession: number;
}
```

## Storage Details

### File Structure

```
.codex-memory/
├── entries/
│   ├── ATLAS.json       # All ATLAS deliberations
│   ├── AUREA.json       # All AUREA deliberations
│   ├── ZENITH.json      # All ZENITH deliberations
│   └── ...
└── sessions/
    └── all.json         # All sessions
```

### Persistence Strategy

- **In-memory cache**: Fast queries without disk I/O
- **Dirty flag**: Tracks when flush is needed
- **Auto-flush**: Periodic writes (configurable interval)
- **Critical flush**: Immediate write for low-GI deliberations
- **Graceful shutdown**: Ensures all data persisted on exit

### Performance

- **Query speed**: O(n) linear scan with in-memory filtering
- **Storage**: ~1KB per deliberation entry
- **Flush time**: ~50ms for 1000 entries
- **Load time**: ~100ms for 1000 entries

## Domain Inference

The system automatically categorizes deliberations into domains:

- **Security**: vulnerability, attack, threat, authentication, encryption
- **Governance**: policy, decision, consensus, voting, quorum
- **Technical**: code, implementation, algorithm, performance
- **Ethics**: moral, fairness, justice, privacy, rights, values
- **Economics**: market, price, value, trade, currency, tokens
- **General**: Everything else

## Similarity Calculation

Uses Jaccard index on keyword sets:

```
similarity = |keywords_A ∩ keywords_B| / |keywords_A ∪ keywords_B|
```

- **Keywords extracted**: 4+ character words, excluding stopwords
- **Top 10 keywords**: Ranked by frequency
- **Threshold**: 0.1 (10% overlap minimum)

## Pattern Detection

Automatically detects:

1. **Success patterns**: High agreement (≥95%) + high GI (≥98%)
2. **Failure patterns**: Low agreement (<90%) or low GI (<95%)
3. **Threshold breaches**: Below minimum agreement threshold
4. **High agreement**: Agreement ≥95%
5. **Low agreement**: Agreement <80%

Requires minimum occurrences to establish a pattern (3-5 depending on type).

## Best Practices

### Memory Hygiene

- **Regular cleanup**: Archive old memories periodically
- **Monitor size**: Watch storage directory size
- **Flush on shutdown**: Always call `shutdownMemoryStorage()`

### Session Usage

- **Create sessions** for multi-turn conversations
- **End sessions** when complete to finalize stats
- **Use tags** for easy filtering and analysis

### Analytics

- **Run analytics weekly** to track agent performance
- **Compare agents** to identify best practices
- **Use provider recommendations** to optimize routing

### Query Optimization

- **Use filters** to reduce result sets
- **Limit results** with pagination
- **Query by agent** for faster lookups

## Troubleshooting

### Memory not persisting

Check:
- `CODEX_USE_MEMORY=true` in `.env`
- Write permissions on `MEMORY_STORAGE_DIR`
- Auto-flush interval not too high
- Call `shutdownMemoryStorage()` on exit

### Slow queries

Solutions:
- Reduce `MEMORY_MAX_CONTEXT_ENTRIES`
- Use more specific filters (agent, tags, time range)
- Implement pagination with `limit` and `offset`

### High disk usage

Solutions:
- Archive old entries to separate directory
- Implement retention policy (e.g., keep last 90 days)
- Compress JSON files with gzip

### Context not improving deliberations

Check:
- `MEMORY_SIMILARITY_THRESHOLD` not too high
- Sufficient historical data (50+ deliberations)
- Domain inference working correctly
- Keywords extracted properly

## Roadmap

### Future Enhancements

- **Vector embeddings**: True semantic search with sentence transformers
- **Database backend**: PostgreSQL/SQLite for advanced queries
- **Memory pruning**: Automatic cleanup of low-value entries
- **Cross-agent learning**: Share insights between agents
- **Memory compression**: Summarize old deliberations
- **Real-time analytics**: Dashboard for live monitoring

## Examples

### Example: Performance Dashboard

```typescript
import { compareAgents, formatAnalyticsReport } from '@mobius/codex-agentic';

const agents = ['ATLAS', 'AUREA', 'ZENITH', 'SOLARA', 'JADE', 'EVE', 'ZEUS', 'HERMES'];
const comparison = await compareAgents(agents, 30);

console.log('=== Agent Performance Rankings (30 days) ===\n');

console.log('By Agreement:');
comparison.rankings.byAgreement.forEach((agent, i) => {
  const analytics = comparison.analytics[agent];
  console.log(`${i + 1}. ${agent}: ${(analytics.avgAgreement * 100).toFixed(1)}%`);
});

console.log('\nBy GI Score:');
comparison.rankings.byGI.forEach((agent, i) => {
  const analytics = comparison.analytics[agent];
  console.log(`${i + 1}. ${agent}: ${analytics.avgGI.toFixed(3)}`);
});

console.log('\nBy Success Rate:');
comparison.rankings.bySuccessRate.forEach((agent, i) => {
  const analytics = comparison.analytics[agent];
  console.log(`${i + 1}. ${agent}: ${(analytics.successRate * 100).toFixed(1)}%`);
});

// Detailed report for top agent
const topAgent = comparison.rankings.bySuccessRate[0];
const report = formatAnalyticsReport(comparison.analytics[topAgent]);
console.log('\n' + report);
```

### Example: Learning from Failures

```typescript
import { getFailedDeliberations, detectPatterns } from '@mobius/codex-agentic';

const agent = 'ZEUS';
const failed = await getFailedDeliberations(agent, 20);

console.log(`=== Failed Deliberations for ${agent} ===\n`);

for (const entry of failed) {
  console.log(`Trace: ${entry.traceId}`);
  console.log(`Input: ${entry.input.slice(0, 100)}...`);
  console.log(`Agreement: ${(entry.agreement * 100).toFixed(1)}%`);
  console.log(`GI: ${entry.giScore.toFixed(3)}`);
  console.log(`Domain: ${entry.domain || 'unknown'}`);
  console.log('---');
}

// Detect patterns
const patterns = await detectPatterns(agent, 30);
const failurePatterns = patterns.filter(p => p.type === 'failure');

if (failurePatterns.length > 0) {
  console.log('\nFailure Patterns Detected:');
  for (const pattern of failurePatterns) {
    console.log(`- ${pattern.type}: ${pattern.occurrences} occurrences`);
    console.log(`  Avg agreement: ${(pattern.avgAgreement * 100).toFixed(1)}%`);
    console.log(`  Avg GI: ${pattern.avgGI.toFixed(3)}`);
  }
}
```

## License

Part of Mobius Substrate monorepo. See root LICENSE.

---

**Phase 2 Status**: ✅ Complete

**Next Phase**: Phase 3 - Enhanced deliberation & consensus modes
