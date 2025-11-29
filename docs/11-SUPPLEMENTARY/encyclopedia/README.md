# Mobius AI Encyclopedia

**Status:** Alpha • Backed by ECHO + Civic Ledger • GI-gated

The Mobius AI Encyclopedia is a **high-integrity, auto-growing knowledge base** that stores
GI-scored, multi-engine consensus answers as **canonical entries**.

It is not a generic wiki.

It is a **Civic Encyclopedia**:

- Every entry is:
  - Proposed by AI (multi-engine Thought Broker)
  - Evaluated by Sentinels (Claude / GPT / Gemini / DeepSeek)
  - Scored by GI (Global Integrity)
  - Optionally attested into the Civic Ledger
- Only entries above a GI threshold (e.g. ≥ 0.95) become **CANONICAL**.
- Everything else enters as **DRAFT** or **NEEDS_REVIEW**.

This is how Mobius turns raw AI output into **stable, reusable, low-hallucination knowledge**.

---

## Core Concepts

### Topic ID

Each entry is anchored by a stable `topicId`, e.g.:

- `civic_os.mic_tokenomics`
- `civic_os.echo_layer`
- `mobius.thought_broker`
- `hive.lore.crown_bearers`
- `usecase.boulder.climate_policy`

`topicId` is:

- Machine-friendly
- Stable across time
- The lookup key for all agents

### Status

Each entry has a `status`:

- `CANONICAL` – high-GI, consensus answer, safe to reuse as truth
- `DRAFT` – decent answer but below GI threshold, needs human review
- `NEEDS_REVIEW` – flagged for re-examination (human or Sentinel-initiated)

### GI Thresholds

Default thresholds (configurable):

- `GI ≥ 0.95` → auto-eligible for `CANONICAL`
- `0.90 ≤ GI < 0.95` → `DRAFT`, must be reviewed
- `GI < 0.90` → not ingested (only logged for analysis)

---

## Data Model (Conceptual)

Table: `encyclopedia_entries`

- `id: UUID`
- `topic_id: TEXT`
- `title: TEXT`
- `summary: TEXT`
- `content: TEXT` (markdown encouraged)
- `gi_score: NUMERIC(4,3)`
- `status: 'CANONICAL' | 'DRAFT' | 'NEEDS_REVIEW'`
- `engines: JSONB`  
  `[{ name, version, vote, confidence }]`
- `sources: JSONB`  
  `[{ kind, url?, docId?, title?, citation?, hash? }]`
- `version: INTEGER`
- `ledger_tx_id: TEXT | NULL`
- `created_by: TEXT` (`'system:nightly-cron'`, user id, etc.)
- `created_at: timestamptz`
- `updated_at: timestamptz`
- `last_reviewed_at: timestamptz | NULL`

Invariants:

- `(topic_id, version)` is unique
- Highest `version` with `status='CANONICAL'` is the current canonical entry

---

## API Overview

Base path: `/v1/encyclopedia`

### GET /v1/encyclopedia/:topicId

Fetch the **current canonical** entry for a topic.

**Request:**

```http
GET /v1/encyclopedia/civic_os.mic_tokenomics

Response (200):

{
  "entry": {
    "id": "uuid",
    "topicId": "civic_os.mic_tokenomics",
    "title": "MIC Tokenomics for Citizens",
    "summary": "MIC rewards nodes for high Global Integrity scores...",
    "content": "## MIC Tokenomics\n\nLong markdown...",
    "giScore": 0.972,
    "status": "CANONICAL",
    "engines": [
      { "name": "claude", "version": "opus-4.5", "vote": "APPROVE", "confidence": 0.96 },
      { "name": "gpt", "version": "5.1", "vote": "APPROVE", "confidence": 0.98 }
    ],
    "sources": [
      {
        "kind": "doc",
        "title": "Mobius Systems: MIC Tokenomics",
        "citation": "Mobius Systems Whitepaper (2025)",
        "hash": "sha256:..."
      }
    ],
    "version": 3,
    "ledgerTxId": "ledger_tx_abc123",
    "createdBy": "system:nightly-cron",
    "createdAt": "2025-11-25T02:05:00Z",
    "updatedAt": "2025-11-25T02:05:00Z",
    "lastReviewedAt": "2025-11-25T12:00:00Z"
  }
}

Response (404):

{
  "error": "ENTRY_NOT_FOUND",
  "topicId": "civic_os.unknown"
}
```

---

`GET /v1/encyclopedia?query=…`

Search entries by topic/title/summary.

**Request:**

```
GET /v1/encyclopedia?query=tokenomics
```

**Response:**

```
{
  "results": [
    { "id": "...", "topicId": "civic_os.mic_tokenomics", "title": "...", "giScore": 0.972, "status": "CANONICAL", ... },
    { "id": "...", "topicId": "civic_os.mic_overview", "title": "...", "giScore": 0.941, "status": "DRAFT", ... }
  ]
}
```

---

### POST /v1/encyclopedia/ingest

Internal endpoint, intended for:

- Nightly cron jobs
- n8n flows
- System-level ingestion

**Expected payload:**

```
POST /v1/encyclopedia/ingest
{
  "topicId": "civic_os.mic_tokenomics",
  "title": "MIC Tokenomics for Citizens (Grade 10)",
  "summary": "MIC is a Global Integrity–linked reward token...",
  "content": "# MIC Tokenomics\n\nLong form markdown answer...",
  "giScore": 0.972,
  "engines": [
    { "name": "claude", "version": "opus-4.5", "vote": "APPROVE", "confidence": 0.96 },
    { "name": "gpt", "version": "5.1", "vote": "APPROVE", "confidence": 0.98 },
    { "name": "deepseek", "version": "coder", "vote": "APPROVE", "confidence": 0.95 }
  ],
  "sources": [
    {
      "kind": "doc",
      "title": "Mobius Systems: MIC Tokenomics",
      "citation": "Mobius Systems Whitepaper (2025)",
      "hash": "sha256:..."
    },
    {
      "kind": "url",
      "url": "https://example.com/mic-design",
      "title": "MIC Design Notes",
      "hash": "sha256:..."
    }
  ],
  "ledgerTxId": "ledger_tx_abc123",
  "createdBy": "system:nightly-cron"
}

Response:

{
  "entry": {
    "id": "uuid",
    "topicId": "civic_os.mic_tokenomics",
    "version": 3,
    "status": "CANONICAL",
    "giScore": 0.972,
    ...
  }
}
```

**Status logic:**

- If `giScore ≥ CANONICAL_THRESHOLD` → stored as `CANONICAL`
- Else → stored as `DRAFT` (or `NEEDS_REVIEW`, depending on ingest policy)

---

## Nightly Encyclopedia Build (n8n / Cron Flow)

A typical nightly job:

1. Cron (02:00) – trigger
2. Topic generator – generate ~20 topics/questions:
   - Either static list
   - Or small-model “topic proposer” using repo/docs context
3. Thought Broker call (`/v1/deliberate`):
   - Mode: `"encyclopedia_build"`
   - Sentinels: Claude, GPT, Gemini, DeepSeek
   - Requires: GI score, engine votes, sources
4. GI filter:
   - If `giScore ≥ 0.95` → candidate for `CANONICAL`
   - If `0.90 ≤ giScore < 0.95` → `DRAFT` only
5. Civic Ledger attestation (optional):
   - `POST /v1/ledger/attest` with content hash, GI, sources
   - Receive `ledgerTxId`
6. Encyclopedia ingest:
   - `POST /v1/encyclopedia/ingest` with consensus answer
7. Human review (optional):
   - If status = `DRAFT` or GI below threshold → send to human queue (Telegram/Discord)

Over time, this creates a growing, integrity-filtered canon of entries.

---

## How Agents Should Use the Encyclopedia

Recommended retrieval priority:

1. ECHO Layer (short-term context & cached Q/A)
2. Mobius Encyclopedia (`/v1/encyclopedia/:topicId`)
3. Fresh multi-engine reasoning via Thought Broker (`/v1/deliberate`)

**Pseudocode:**

```ts
async function answerQuestion(q: QuestionInput): Promise<Answer> {
  const topicId = deriveTopicIdFromQuestion(q);

  // 1) Try ECHO (fast, short-term cache)
  const echoHit = await echo.getBestMatch(topicId, q);
  if (echoHit && echoHit.giScore >= 0.93) {
    return {
      mode: 'echo',
      source: 'ECHO',
      content: echoHit.answer,
      giScore: echoHit.giScore,
    };
  }

  // 2) Try Encyclopedia (stable, curated canon)
  const canonical = await encyclopedia.getCanonical(topicId);
  if (canonical && canonical.giScore >= 0.95) {
    return {
      mode: 'encyclopedia',
      source: 'ENCYCLOPEDIA',
      content: canonical.content,
      giScore: canonical.giScore,
      topicId,
      version: canonical.version,
    };
  }

  // 3) Fall back to fresh multi-engine reasoning
  const deliberation = await thoughtBroker.deliberate({
    prompt: q.text,
    topicId,
    requireSources: true,
    requireGiScore: true,
  });

  // Optional: if high GI, enqueue for ingest
  if (deliberation.giScore >= 0.95) {
    await encyclopedia.ingestFromDeliberation(topicId, deliberation);
  }

  return {
    mode: 'fresh',
    source: 'THOUGHT_BROKER',
    content: deliberation.consensus.answer,
    giScore: deliberation.giScore,
  };
}
```

---

## Design Goals

- Reduce hallucinations by reusing high-GI answers instead of re-inventing them every time.
- Preserve provenance via engines + sources + ledger tx id.
- Stay adaptive: entries can be superseded by newer, higher-GI versions.
- Remain civic: humans can review, flag, or amend entries via separate workflows.

For civic-level rules around what qualifies as CANONICAL, see:

`docs/encyclopedia/CHARTER.md`

---
