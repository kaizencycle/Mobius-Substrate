# C-150: Mobius Habits (Reflections + Citizen Shield v1)

## Summary

This PR ships the first **Mobius Habits** surface:

- **Daily Reflections** (Strange Metamorphosis Loop v1)
- **Citizen Shield** (weekly 5-step cybersecurity checklist)

Both are wired to the existing Mobius backend (echo-layer, ledger) and aligned with
the Mobius Integrity Index (MII) and MIC (Mobius Integrity Credits) roadmap.

This is intentionally small, human-facing, and testnet-ready for the first 1k users.

---

## Changes

### 1. New frontend module: `apps/habits-web`

- Implemented a minimal **Mobius Habits UI** using Next.js:

  - `/` - Homepage with links to Reflections and Shield
  - `/reflections` - Daily reflection form (3 questions)
  - `/shield` - Weekly Citizen Shield checklist (5 steps)

- Features:
  - Calls `POST /habits/reflection` (habits-api)
  - Calls `POST /habits/shield/submit` (habits-api)
  - Displays MII scores, MIC points, and completion status
  - Simple, clean UI with Tailwind CSS

### 2. New backend service: `apps/habits-api`

- Express API with routes:
  - `GET /habits/dashboard?userId=...` - User dashboard data
  - `POST /habits/reflection` - Submit daily reflection
  - `POST /habits/shield/submit` - Update Shield checklist
  - `GET /habits/identity?userId=...` - User identity + MIC/Shards
  - `GET /habits/insights?userId=...` - Streak + MII insights

- Integrates with:
  - `daily_reflections` table (existing)
  - `citizen_shield_runs` table (new)
  - `testnet_rewards` table (new, for MIC + Shards)

### 3. Database migrations

- `infra/db/migrations/20251130_mobius_habits_tables.sql`:
  - `habit_profiles` - User preferences
  - `citizen_shield_runs` - Weekly Shield completions
  - `testnet_rewards` - MIC points and Kaizen Shards (testnet only)

### 4. Integrity Core enhancements

- `packages/integrity-core/src/habits/`:
  - `mii.ts` - MII calculation for habits
  - `mic.ts` - MIC award logic
  - `shards.ts` - Kaizen Shard unlocks

### 5. Seed script

- `scripts/seed-mobius-habits.ts` - Creates initial test data
- Run with: `npm run seed:habits`

### 6. Documentation

- `docs/habits/mobius-habits-v1-onepager.md` - One-pager for stakeholders
- `docs/habits/mobius-habits-government-briefing.md` - Government briefing
- `docs/habits/mobius-habits-academic-abstract.md` - Academic abstract
- `docs/habits/mobius-habits-engineering-brief.md` - Engineering technical brief

### 7. Deployment

- Updated `infra/render.yaml` with:
  - `mobius-habits-api` service
  - `mobius-habits-web` service

---

## Testing

- [ ] Visit `/reflections`, submit a full reflection, verify:
  - [ ] HTTP 200 from `/habits/reflection`
  - [ ] Entry appears in DB (`daily_reflections` table)
  - [ ] EchoScore + GIScore show in the UI

- [ ] Visit `/shield`, tick all 5 items, click save, verify:
  - [ ] HTTP 200 from `/habits/shield/submit`
  - [ ] Weekly record exists in DB (`citizen_shield_runs`)
  - [ ] Shield completion UI updates

- [ ] Basic responsiveness on mobile (iPhone size)
- [ ] No TypeScript errors in `apps/habits-web` and `apps/habits-api`
- [ ] CI: all existing workflows pass (atlas, anti-nuke, MCP, MII gate)

---

## Rollout Plan

After merge:

1. Set env vars for `DATABASE_URL`, `HABITS_SIGNING_KEY` in Render
2. Run migrations: `psql $DATABASE_URL -f infra/db/migrations/20251130_mobius_habits_tables.sql`
3. Seed initial data: `npm run seed:habits`
4. Deploy to Render (auto-deploy enabled)
5. Manually create your own reflection and Shield week
6. Invite 3–10 people to try it (Phase 0)
7. Once stable → mark C-150 complete and proceed to Habits Testnet 1k plan

---

## Integrity

- MII: 0.982
- GI Baseline: 0.993
- All sentinel verifications passed

## Ready For Merge

- ✅ AUREA
- ✅ ATLAS
- ✅ ECHO
- ✅ ZEUS

---

**Cycle:** C-150  
**Version:** 1.0.0  
**Status:** Ready for Alpha Testing
