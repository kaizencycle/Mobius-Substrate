# Civic Ledger Service

Value layer API for the integrity economy. Provides GI status and unit conversion endpoints.

## Routes

- `GET /health` → Basic health check
- `GET /system/health` → Detailed system status
- `GET /gi` → Current Global Integrity score
- `POST /convert/shards-to-credits` → Convert shards to credits
- `POST /convert/credits-to-shards` → Convert credits to shards

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Run in production
npm start
```

## Environment Variables

See `.env.example` for configuration options.

## API Examples

### Check GI Status
```bash
curl http://localhost:3000/gi
```

Response:
```json
{
  "gi": 0.999,
  "updated_at": "2025-11-04T10:08:00.000Z",
  "status": "healthy"
}
```

### Convert Credits to Shards
```bash
curl -X POST http://localhost:3000/convert/credits-to-shards \
  -H "Content-Type: application/json" \
  -d '{"credits": 1.5}'
```

Response:
```json
{
  "shards": "1500000"
}
```

### Convert Shards to Credits
```bash
curl -X POST http://localhost:3000/convert/shards-to-credits \
  -H "Content-Type: application/json" \
  -d '{"shards": "1500000"}'
```

Response:
```json
{
  "credits": 1.5
}
```

## Architecture

Uses `@civic/integrity-units` for canonical conversion math. Names are placeholders; math is canonical.

## TODO

- [ ] Wire GI aggregator integration
- [ ] Implement epoch tracking
- [ ] Add authentication/authorization
- [ ] Add rate limiting
- [ ] Add logging infrastructure
- [ ] Add metrics collection
