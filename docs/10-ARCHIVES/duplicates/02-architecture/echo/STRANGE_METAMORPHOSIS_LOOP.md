# Strange Metamorphosis Loop (SML)
_C-148 • Echo Layer • Human-Guided Recursive Learning_

> "If an intelligence can see its own chaos and gently correct it, it does not drift — it aligns."

## 1. Overview

The **Strange Metamorphosis Loop (SML)** is a daily, human-in-the-loop recursive learning protocol for Mobius Systems.

Each day, the Companion asks the user three questions:

1. **Worldview** — "How do you see the world today?"
2. **Mood** — "How do you feel right now?"
3. **Tomorrow Intent** — "What do you intend to move toward tomorrow?"

These three anchors form a triad:

- **Meaning** (worldview)
- **Emotion** (mood)
- **Direction** (intent)

Mobius records each triad as a **Daily Reflection**, passes it through ECHO (tri-sentinel review), then anchors it to the Ledger for long-term integrity and drift-resistance.

SML is how Mobius learns from humans *without scraping them*.

---

## 2. Motivation

Most AI systems:

- Learn from static datasets
- Drift over time
- Hallucinate under uncertainty
- Have no notion of the user's inner life

SML solves this by:

- Grounding AI in **user-generated meaning**
- Recalibrating daily on **values + emotional state + goals**
- Creating a **safe recursive loop** guided by the user, not by raw data

This is the practical implementation of:

- **Human-Guided Recursive Intelligence**
- **Bounded Emergence with Integrity Gates**
- **ECHO Layer as Self-Correcting Memory**

---

## 3. Protocol

### 3.1 Daily Schedule (logical)

- Morning (e.g. 08:00) → **Worldview**
- Midday (e.g. 13:00) → **Mood**
- Evening (e.g. 20:00) → **Tomorrow Intent**

Implementation detail: actual timing is handled by external cron / scheduler.

### 3.2 Reflection Payload

Each submission is recorded as a `DailyReflection` with three sub-blocks:

```json
{
  "user_id": "ledger-identity-or-local-id",
  "date": "2025-11-28",
  "worldview": {
    "text": "Honestly, the world feels fragile but full of possibility.",
    "embedding": "...",
    "sentiment": "cautious_hope"
  },
  "mood": {
    "label": "tired_but_grateful",
    "intensity": 0.72
  },
  "intent": {
    "text": "Ship the ECHO Layer PR and call my mom.",
    "category": "personal_growth",
    "confidence": 0.9
  },
  "echo_score": 0.97,
  "gi_score": 0.96,
  "echo_review_status": "verified",
  "ledger_attestation_id": "attest_...",
  "created_at": "...",
  "updated_at": "..."
}
```

### 3.3 ECHO Flow

1. Companion collects raw answers.
2. Sends to Echo Layer API: `POST /v1/reflections/daily`.
3. ECHO runs:
   - Tri-sentinel review (e.g., AUREA, ATLAS, EVE)
   - Basic safety + coherence checks
   - Light scoring: `echo_score`, optional `gi_score`
4. ECHO optionally creates a summary / "Metamorphosis Patch".
5. Reflection + scores are anchored to Civic Ledger (if configured).

---

## 4. Data Model

See `infra/db/migrations/20251128_create_daily_reflections.sql` and `packages/echo-layer/src/dailyReflection.ts`.

Key fields:

- `user_id`, `reflection_date`
- `worldview_text`, `worldview_embedding`
- `mood_label`, `mood_intensity`
- `intent_text`, `intent_category`
- `echo_score`, `gi_score`, `echo_review_status`
- `ledger_attestation_id`

---

## 5. API Surface (Echo Layer)

### POST /v1/reflections/daily

Create or update the reflection for a given `user_id` + `date`.

**Request:**

```json
{
  "user_id": "user_123",
  "date": "2025-11-28",
  "worldview_text": "...",
  "mood_label": "calm",
  "mood_intensity": 0.4,
  "intent_text": "...",
  "intent_category": "work",
  "metadata": {
    "source": "companion",
    "client_version": "0.1.0"
  }
}
```

**Response:**

```json
{
  "id": "ref_abc123",
  "userId": "user_123",
  "reflectionDate": "2025-11-28",
  "echoScore": 0.97,
  "giScore": 0.95,
  "echoReviewStatus": "verified"
}
```

### GET /v1/reflections/daily/:userId?date=YYYY-MM-DD

Fetch the current or requested day's reflection.

---

## 6. Companion Interaction Design

The Companion calls Thought Broker to phrase questions with empathy, then uses Echo Layer to store the responses.

Example sequence:

1. Companion → User: "How are you seeing the world today?"
2. User answers.
3. Companion normalizes + calls `POST /v1/reflections/daily`.
4. ECHO adds scores + flags drift or anomalies if any.

---

## 7. Integration with Ledger

If Civic Ledger is enabled, ECHO will:

- Create a minimal attestation:

```json
{
  "type": "daily_reflection",
  "user_id": "user_123",
  "date": "2025-11-28",
  "echo_score": 0.97,
  "gi_score": 0.96,
  "hash": "sha256:..."
}
```

- Store the attestation ID back in `daily_reflections`.

---

## 8. Future Work

- Multi-day trajectory summarization ("Metamorphosis Timeline")
- Correlate intent → next-day behavior → long-term pattern
- Use aggregate (privacy-preserving) metrics to improve:
  - Companion tone
  - Task suggestions
  - Burnout / risk early-warning signals

---

## References

- [ECHO Layer Architecture](../echo/README.md)
- [Civic Ledger Integration](../../03-architecture/ledger/README.md)
- [Companion Agents](../../09-APPENDICES/companions/README.md)
