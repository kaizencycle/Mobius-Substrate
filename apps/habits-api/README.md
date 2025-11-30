# Mobius Habits API

**C-150: Daily Reflections + Citizen Shield Backend**

Express API service for Mobius Habits testnet app.

## Endpoints

- `GET /health` - Health check
- `GET /habits/dashboard?userId=...` - User dashboard data
- `POST /habits/reflection` - Submit daily reflection
- `POST /habits/shield/submit` - Update Shield checklist
- `GET /habits/identity?userId=...` - User identity + MIC/Shards
- `GET /habits/insights?userId=...` - Streak + MII insights

## Environment Variables

- `DATABASE_URL` - Postgres connection string
- `PORT` - Server port (default: 4005)
- `HABITS_SIGNING_KEY` - Optional signing key for future JWT/HMAC

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Database

Requires migrations:
- `infra/db/migrations/20251130_mobius_habits_tables.sql`

Run seed script:
```bash
npm run seed:habits
```

---

**Cycle:** C-150  
**Version:** 1.0.0
