# ECHO Layer Deployment Guide

## Quick Start

### 1. Database Setup

```bash
# Ensure Postgres is running with pgvector extension
psql -U postgres -d civic_ledger <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
\i infra/db/migrations/20251125_add_echo_layer.sql
EOF
```

### 2. Install Dependencies

```bash
cd apps/broker-api
npm install pg @types/pg openai
```

### 3. Environment Configuration

Add to `.env`:

```bash
# ECHO Layer Configuration
ECHO_LAYER_ENABLED=true
DATABASE_URL=postgresql://civic:civic@localhost:5432/civic_ledger

# Embeddings (required for semantic search)
OPENAI_API_KEY=sk-...

# Optional: Admin operations
ECHO_ADMIN_KEY=$(openssl rand -hex 32)

# Optional: DVA.LITE integration
DVA_LITE_URL=https://dva.lite.mobius.systems
DVA_LITE_API_KEY=...
```

### 4. Build Vector Index

```sql
-- After inserting at least 100 rows
CREATE INDEX idx_echo_layer_embedding 
  ON echo_layer_entries 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

### 5. Start Services

```bash
npm run dev
```

## Integration Checklist

### Sentinel Integration

**File**: `apps/broker-api/src/services/echo/reviewEngine.ts`

Replace mock `callSentinel()` function with your actual sentinel client:

```typescript
import { callSentinel } from "../sentinels/client"; // Your actual implementation
```

### Embedding Service

**File**: `apps/broker-api/src/utils/embedding.ts`

Already configured for OpenAI. Ensure `OPENAI_API_KEY` is set.

For other providers, modify the `embedText()` function.

### DVA.LITE Integration

**Files**: 
- `apps/broker-api/src/services/echo/driftGuard.ts`
- `apps/broker-api/src/services/echo/memoryValidator.ts`

Set `DVA_LITE_URL` and `DVA_LITE_API_KEY` environment variables.

## Testing

### Unit Tests

```bash
npm run test -- tests/broker/echo/
```

### Integration Tests

```bash
npm run test -- tests/integration/echo-client.test.ts
```

### Manual Testing

```bash
# Check cache
curl "http://localhost:4005/v1/echo/cache/check?q=What+is+2%2B2"

# Full deliberation
curl -X POST "http://localhost:4005/v1/echo/deliberate" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the capital of France?", "domain": "geography"}'

# Get statistics
curl "http://localhost:4005/v1/echo/stats"
```

## Monitoring

### Key Metrics

- **Cache Hit Rate**: Should increase over time
- **Average GI Score**: Should be > 0.90
- **Drift Events**: Should be minimal
- **Memory Validation**: Should run successfully

### DVA.LITE Dashboard

Monitor via `/v1/echo/stats` endpoint:
- Total entries
- Active entries
- Average GI score
- Entries in last 24h
- Expired entries
- Domain breakdown

## Troubleshooting

### Issue: Semantic search not working

**Solution**: Ensure `OPENAI_API_KEY` is set and embeddings are being generated.

### Issue: Cache writes failing

**Solution**: Check database connection and ensure `echo_layer_entries` table exists.

### Issue: Sentinels timing out

**Solution**: Increase `SENTINEL_TIMEOUT_MS` or check sentinel service health.

### Issue: Low GI scores

**Solution**: Review sentinel responses and source quality. May need to adjust GI formula weights.

## Production Considerations

1. **Vector Index**: Use HNSW instead of IVFFlat for >100K entries
2. **Connection Pooling**: Configure pgPool for your load
3. **Rate Limiting**: Add rate limits per agent/domain
4. **Monitoring**: Set up alerts for GI score drops
5. **Backup**: Regular backups of `echo_layer_entries` table

---

**Status**: Ready for deployment  
**Version**: 1.0.0

