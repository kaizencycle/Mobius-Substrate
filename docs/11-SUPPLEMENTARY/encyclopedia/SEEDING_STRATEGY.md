# Mobius Encyclopedia Seeding Strategy

This playbook explains how the Librarian cron job chooses questions, how frequently it should run, and how we keep the encyclopedia clean as it grows.

## Seed Sources (Curriculum Pillars)

1. **Civics & History** — Haymarket, suffrage, civil rights, constitutional basics.
2. **Science & Environment** — climate fundamentals, vaccines, energy mix, LUCA, water cycle.
3. **Ethics & AI** — Henrietta Lacks, consent, provenance, civic OS, democratic AI.
4. **Math & Numeracy** — Arabic numerals, base-10, compound interest, inflation literacy.
5. **Culture & Language** — multilingual education, anti-intellectualism counterpoints, minority viewpoints.

Seeds can be stored as `{ question, topics[] }` objects. The first version can be a static JSON list; future versions should track coverage metrics (how many entries per topic) and bias (ensure minority/alternative perspectives are represented).

## Schedule Examples

| Deployment | Frequency | Notes |
|------------|-----------|-------|
| Local dev node | 1 per day @ 03:00 local | `0 3 * * * /opt/mobius/infra/cron/encyclopedia_seed.sh` |
| Shared staging | 4 per day (every 6h) | `0 */6 * * * ...` |
| Production | Adaptive | Increase cadence when GI coverage drops below target |

The script `infra/cron/encyclopedia_seed.sh` reads `ENCYCLOPEDIA_API_URL` and `ENCYCLOPEDIA_CRON_SECRET`, posts to `/v1/encyclopedia/seed`, and logs the new `entry.id` + `entry.question`.

## Guardrails

1. **GI threshold filter (v2)** — store everything now, but flag `giScore < 0.93` for review instead of serving publicly.
2. **Topic coverage** — avoid over-indexing on a single domain. Track counts per topic and favor underrepresented ones.
3. **Bias & plurality** — include prompts that explicitly ask for multiple perspectives (“what are the main disagreements about X?”) and minority voices.
4. **Review loop** — low-GI entries default to `pending_review`. Admin tools let humans promote to `approved`, add commentary, or retire stale answers.

## Flow Recap

```
[CRON] → POST /v1/encyclopedia/seed
   → pickSeedQuestion()
   → brokerClient.deliberate(question)
      → Sentinels debate
      → ECHO.reinforce(a1, a2, question)
   → encyclopediaRepo.save(entry)
   → ledgerClient.attestEncyclopedia(entry)
   → entry available for GET /v1/encyclopedia queries
```

The Librarian habit is simple:
- Good questions (high GI, good sources) get reinforced, re-used, and maybe “canonized”.
- Weak questions remain flagged until humans intervene.
- Every failure is a signal: it tells humans “please add better context here,” aligning with “If an intelligence can reflect and see its flaws, then it knows it can proceed.”
