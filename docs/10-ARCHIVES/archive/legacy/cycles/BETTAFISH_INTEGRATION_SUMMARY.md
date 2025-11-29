# BettaFish → Kaizen OS Integration Summary

## Overview

This integration connects BettaFish (a multi-agent public-opinion engine) to Kaizen OS Civic Layer, enabling real-time sentiment analysis as Integrity Mood Index (IMI) metrics.

## Components Implemented

### 1. Civic Ledger - Sentiment API

**Files Created:**
- `services/civic-ledger/src/types/sentiment.ts` - TypeScript types for sentiment data
- `services/civic-ledger/src/store/sentimentStore.ts` - In-memory store (TODO: Redis/DB)
- `services/civic-ledger/src/routes/sentiment.ts` - Express routes for ingest and summary

**API Endpoints:**
- `POST /ingest/sentiment` - Ingests sentiment data from BettaFish (requires `x-ledger-key` header)
- `GET /sentiment/summary` - Returns latest sentiment summary (IMI, polarization, volume, topics)

**Dependencies Added:**
- `zod` v3.23.8 for request validation

**Environment Variables:**
- `LEDGER_INGEST_KEY` - API key for securing ingest endpoint

### 2. Betta-Link Service

**Files Created:**
- `services/betta-link/fwd_betta_to_ledger.py` - Python worker that polls BettaFish and forwards to ledger
- `services/betta-link/README.md` - Setup and configuration docs
- `services/betta-link/env.example` - Environment template

**Configuration:**
- `BETTA_BASE` - BettaFish API URL
- `BETTA_TOKEN` - Authentication token
- `LEDGER_URL` - Civic Ledger endpoint
- `LEDGER_INGEST_KEY` - API key for ledger
- `EPOCH` - Current epoch number
- `LOOKBACK_MIN` - Lookback window in minutes

### 3. Integrity Pulse Visualization

**Files Created:**
- `apps/integrity-pulse/src/hooks/useSentiment.ts` - React hook for fetching sentiment data
- `apps/integrity-pulse/src/components/SentimentWave.tsx` - Visual overlay component
- `apps/integrity-pulse/src/styles/sentiment.css` - CSS for sentiment wave effect
- `apps/integrity-pulse/src/app/api/sentiment/summary/route.ts` - Next.js API proxy route

**Visual Features:**
- Color-shifting glow (red→amber→green) based on IMI
- Band density reflects polarization
- Opacity reflects volume/intensity
- Updates every 5 seconds

**Integration:**
- Added to `apps/integrity-pulse/src/app/page.tsx` as overlay
- Proxies requests to Civic Ledger via API route

### 4. Configuration Updates

**Files Modified:**
- `configs/integrity_units.yaml` - Added BettaFish integration config
  - `integrations.bettafish` - Integration settings
  - `governance.sentiment_weight_in_gi` - Future GI weight (0.05)

### 5. Grafana Dashboard

**Files Created:**
- `ops/docker-compose.grafana.yml` - Docker Compose for Grafana service
- `grafana/provisioning/datasources/datasource.yaml` - JSON API datasource config
- `grafana/provisioning/dashboards/dashboard.yaml` - Dashboard provisioning
- `grafana/dashboards/civic_sentiment.json` - Dashboard JSON

**Dashboard Features:**
- IMI gauge with color thresholds
- Polarization indicator
- Volume display
- Topics bar gauge
- Auto-refresh every 5 seconds

**Setup:**
```bash
export LEDGER_PUBLIC_URL="https://<your-civic-ledger-host>"
docker compose -f ops/docker-compose.grafana.yml up -d
# Open http://localhost:3001 (admin/admin)
```

## Data Flow

```
BettaFish API
    ↓
betta-link worker (Python)
    ↓
Civic Ledger /ingest/sentiment
    ↓
sentimentStore (in-memory, TODO: Redis/DB)
    ↓
├─→ Integrity Pulse (SentimentWave overlay)
└─→ Grafana Dashboard (metrics visualization)
```

## Security Considerations

1. **API Key Protection**: `LEDGER_INGEST_KEY` required for ingest endpoint
2. **Environment Variables**: Sensitive values stored in `.env` files
3. **Future**: IP allowlist, key rotation, rate limiting

## Next Steps

### Immediate
1. **Persist to Database**: Replace in-memory store with PostgreSQL/Redis
2. **Error Handling**: Add retry logic and exponential backoff to betta-link worker
3. **Monitoring**: Add structured logging and metrics

### Future Enhancements
1. **GI Integration**: Wire IMI into GI aggregator calculation
2. **Historical Series**: Add `/sentiment/history` endpoint for time-series data
3. **Topic Facets**: Display topic breakdown in Integrity Pulse HUD
4. **Backfill**: Historical sentiment data migration
5. **Access Control**: IP allowlist for ingest endpoint

## Testing

### Manual Testing

1. **Ingest Endpoint:**
```bash
curl -X POST http://localhost:3000/ingest/sentiment \
  -H "Content-Type: application/json" \
  -H "x-ledger-key: your-key" \
  -d '{
    "source": "bettafish",
    "epoch": 125,
    "window_start": "2025-01-27T00:00:00Z",
    "window_end": "2025-01-27T01:00:00Z",
    "avg_sentiment": 0.613,
    "polarization": 0.27,
    "volume": 1500,
    "topics": [
      {"topic": "ubi", "score": 0.7},
      {"topic": "climate", "score": 0.5},
      {"topic": "equity", "score": 0.6}
    ]
  }'
```

2. **Summary Endpoint:**
```bash
curl http://localhost:3000/sentiment/summary
```

3. **Integrity Pulse:**
- Start Next.js dev server: `cd apps/integrity-pulse && npm run dev`
- Visit `http://localhost:3010`
- Observe SentimentWave overlay

4. **Grafana:**
- Start Grafana: `docker compose -f ops/docker-compose.grafana.yml up -d`
- Login at `http://localhost:3001` (admin/admin)
- Dashboard auto-loads: "Civic • Integrity Mood"

## Commit Message Template

```
feat(betta-link): ingest public-opinion sentiment into Civic Ledger and visualize IMI in Integrity Pulse

- ledger: /ingest/sentiment (POST, API key) + /sentiment/summary (GET)
- store: in-memory summary (TODO: Redis/DB)
- lab6: betta-link worker (Python) pulls BettaFish and forwards to ledger
- pulse: SentimentWave overlay (hue=mood, density=polarization, opacity=volume)
- config: integrations.bettafish + sentiment_weight_in_gi placeholder
- grafana: JSON API dashboard for IMI monitoring

Security: header x-ledger-key
Next: persist to Redis/PG, wire IMI into GI aggregator, topic facets on HUD
```

## Architecture Notes

- **Separation of Concerns**: BettaFish integration is isolated in betta-link service
- **API Gateway Pattern**: Next.js API route proxies to ledger for CORS/security
- **Visual Feedback**: SentimentWave provides immediate visual feedback of civic mood
- **Observability**: Grafana dashboard enables operational monitoring

---

*Kaizen OS - Continuous Integrity Architecture*
*Integration: BettaFish → Civic Ledger → Integrity Pulse*
*Version: 1.0.0*
*Date: 2025-01-27*
