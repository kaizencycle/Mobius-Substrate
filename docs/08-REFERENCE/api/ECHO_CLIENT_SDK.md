# ECHO Layer Client SDK

The ECHO Layer Client SDK provides a simple one-line interface for any AI agent to save and load verified knowledge.

## Installation

```bash
npm install @mobius/echo-client
```

## Quick Start

```typescript
import { EchoClient } from "@mobius/echo-client";

const echo = new EchoClient({
  baseURL: "https://api.mobius.systems",
  apiKey: process.env.ECHO_API_KEY,
  agentName: "my-ai-agent"
});

// Load a verified answer (checks cache first, runs ECHO if needed)
const answer = await echo.loadState("What is the capital of Mongolia?");
console.log(answer.giScore); // 0.96 - High Ground Integrity
console.log(answer.source);  // "cache" or "echo"

// Save new knowledge (automatically runs tri-sentinel review)
await echo.saveState(
  "What is the capital of Mongolia?",
  "Ulaanbaatar",
  { domain: "geography" }
);
```

## API Reference

### `EchoClient`

#### Constructor

```typescript
new EchoClient(config: EchoClientConfig)
```

#### Methods

##### `loadState(query, options?)`

- **query**: `string` - The question to answer
- **options**: `LoadStateOptions`
  - `similarityThreshold`: `number` - Minimum semantic similarity (0-1)
  - `domain`: `string` - Knowledge domain
  - `locale`: `string` - Locale code
- **Returns**: `Promise<EchoAnswer>`

##### `saveState(query, proposedAnswer, options?)`

- **query**: `string` - The question
- **proposedAnswer**: `string` - Your proposed answer
- **options**: `SaveStateOptions`
  - `domain`: `string`
  - `locale`: `string`
  - `jurisdiction`: `string`
  - `cacheable`: `boolean` - Whether to cache result
- **Returns**: `Promise<{ answer, giScore, cached, cacheId }>`

##### `checkCache(query, options?)`

- Fast cache lookup without triggering review
- **Returns**: `Promise<{ exists, giScore?, answer? }>`

##### `invalidate(canonicalKey, reason)`

- Invalidate a cached entry (admin only)

##### `getStats(domain?)`

- Get cache statistics
- **Returns**: `Promise<{ hitRate, totalEntries, avgGIScore }>`

## LangChain Integration

```typescript
import { createEchoLoader } from "@mobius/echo-client";
import { RetrievalQAChain } from "langchain/chains";

const echoLoader = createEchoLoader({
  baseURL: "https://api.mobius.systems",
  apiKey: process.env.ECHO_API_KEY,
  agentName: "langchain-agent"
});

const chain = RetrievalQAChain.fromLLM(
  llm,
  echoLoader
);
```

## Ground Integrity (GI) Score

- **0.95-1.00**: Excellent - Cached and approved
- **0.85-0.94**: Good - Approved with monitoring
- **0.70-0.84**: Moderate - Human review recommended
- **Below 0.70**: Poor - Blocked or escalated

## Error Handling

```typescript
try {
  const answer = await echo.loadState("controversial topic");
} catch (error) {
  if (error.code === 'ECHO_BLOCKED') {
    // Answer blocked due to low GI score
  }
}
```

## Rate Limits

- **Cache checks**: 1000/minute
- **Full reviews**: 100/minute
- **Admin operations**: 10/minute

