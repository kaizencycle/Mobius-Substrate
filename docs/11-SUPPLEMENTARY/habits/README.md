# Mobius Habits Documentation

**C-150: Daily Reflections + Citizen Shield**

## Overview

Mobius Habits is the first testnet application for Mobius Systems. It combines daily reflections with weekly cybersecurity rituals to generate integrity signals for the Mobius Integrity Index (MII) and future MIC tokenomics.

## Documentation Files

- **[One-Pager](./mobius-habits-v1-onepager.md)** - Executive summary for stakeholders
- **[Government Briefing](./mobius-habits-government-briefing.md)** - For municipal innovation agencies
- **[Academic Abstract](./mobius-habits-academic-abstract.md)** - For research publications
- **[Engineering Brief](./mobius-habits-engineering-brief.md)** - Technical architecture and deployment

## Quick Start

### 1. Database Setup

Run migrations:
```bash
psql $DATABASE_URL -f infra/db/migrations/20251130_mobius_habits_tables.sql
```

### 2. Seed Data

```bash
npm run seed:habits
```

### 3. Start API

```bash
cd apps/habits-api
npm install
npm run dev
```

### 4. Start Web

```bash
cd apps/habits-web
npm install
npm run dev
```

Visit http://localhost:3006

## Architecture

```
apps/
  habits-/api/          # Express API
  habits-web/          # Next.js frontend
packages/
  integrity-core/      # MII/MIC/Shards logic
infra/db/migrations/   # Database schema
scripts/               # Seed scripts
```

## API Endpoints

- `GET /habits/dashboard` - User dashboard
- `POST /habits/reflection` - Submit daily reflection
- `POST /habits/shield/submit` - Update Shield checklist
- `GET /habits/identity` - User identity + MIC/Shards
- `GET /habits/insights` - Streak + MII insights

## Deployment

See `infra/render.yaml` for Render.com deployment configuration.

Services:
- `mobius-habits-api` (port 4005)
- `mobius-habits-web` (Next.js)

## Testnet Phases

- **Phase 0** - Internal alpha (1-10 users)
- **Phase 1** - Closed testnet (10-100 users)
- **Phase 2** - Public testnet (100-1,000 users)
- **Phase 3** - Internet Café deployment (1,000+ users)

## Related Files

- PR Template: `.github/PULL_REQUEST_TEMPLATE/c150_mobius_habits.md`
- Database Migration: `infra/db/migrations/20251130_mobius_habits_tables.sql`
- Seed Script: `scripts/seed-mobius-habits.ts`

---

**Cycle:** C-150  
**Version:** 1.0.0  
**Status:** Alpha
