# Mobius Habits — Engineering Technical Brief

**For:** Engineers, SRE teams, and architecture review boards

## Architecture Overview

Mobius Habits v1 consists of two microservices:

```
apps/
  habits-/api/        # Express API for reflections + shield
  habits-web/        # Next.js frontend
packages/
  integrity-core/    # MII/MIC/Shards calculation logic
```

## Data Flow

1. User submits reflection entry → `habits-api`
2. Echo Processor computes:
   - Coherence score
   - Mood embedding
   - Integrity delta
3. Weekly Shield → `habits-api`
4. Combined → `integrity-core/MII`
5. Stored in:
   - `daily_reflections` table
   - `citizen_shield_runs` table
   - `testnet_rewards` table (MIC + Shards)

## Key Engineering Principles

- **Fully local cache-first**: Reflections stored locally before sync
- **Strict schema validation**: TypeScript + Postgres constraints
- **No inferred analytics**: Only explicit user inputs
- **No third-party SDKs**: Zero external tracking dependencies
- **Additive-only commits**: Enforced via Codex Rules
- **Anti-Nuke workflow**: Prevents repo destruction
- **Multi-agent Sentinel validation**: Integrity gating

## Risk Profile

- **Zero behavioral surveillance**: No passive data collection
- **Self-sovereign data ownership**: User controls all data
- **Clear recovery paths**: Database migrations reversible
- **Fault-tolerant integrity scoring**: Graceful degradation on missing data

## Database Schema

### Core Tables

- `daily_reflections`: User reflection entries with GI/Echo scores
- `habit_profiles`: User preferences (timezone, notifications)
- `citizen_shield_runs`: Weekly Shield completion records
- `testnet_rewards`: MIC points and Kaizen Shards (testnet only)

See `infra/db/migrations/20251130_mobius_habits_tables.sql` for full schema.

## API Endpoints

### Habits API (`apps/habits-api`)

- `GET /habits/dashboard?userId=...` - User dashboard data
- `POST /habits/reflection` - Submit daily reflection
- `POST /habits/shield/submit` - Update Shield checklist
- `GET /habits/identity?userId=...` - User identity + MIC/Shards
- `GET /habits/insights?userId=...` - Streak + MII insights

## Deployment

### Render.com

Services:
- `mobius-habits-api` (Node.js, Express)
- `mobius-habits-web` (Next.js)

Environment variables:
- `DATABASE_URL` (Postgres connection string)
- `NEXT_PUBLIC_HABITS_API_BASE` (API URL for frontend)

### Local Development

```bash
# Start API
cd apps/habits-api
npm run dev

# Start Web
cd apps/habits-web
npm run dev

# Seed database
npm run seed:habits
```

## Testing

- Unit tests: MII/MIC calculation logic
- Integration tests: API endpoints
- E2E tests: Full reflection + shield flow

## Monitoring

- API latency (p50, p95, p99)
- Error rates
- Database connection pool usage
- Reflection submission rate
- Shield completion rate

## Security

- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- Rate limiting (future: per-user limits)
- CORS configuration for web app

---

**Cycle:** C-150  
**Version:** 1.0.0  
**Last Updated:** 2025-01-27
