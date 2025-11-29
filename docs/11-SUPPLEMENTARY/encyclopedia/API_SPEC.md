# Mobius Encyclopedia API Spec

## Base URL

```
/v1/encyclopedia
```

## Public Endpoints

### GET /v1/encyclopedia

Search entries by text/topic.

Query params:
- `q` (required) – search text
- `topics` (optional) – comma-separated topics
- `status` (optional) – defaults to `approved`
- `limit` (default 10, max 50)
- `offset` (default 0)

Response:

```
{
  "items": [
    {
      "id": "echo-encyclopedia-1",
      "question": "What was the Haymarket Affair and why did it matter for labor law?",
      "answer": "The Haymarket Affair was a labor protest in Chicago in 1886...",
      "topics": ["labor", "history", "civics"],
      "sources": ["https://example.com/haymarket", "https://example.org/labor-history"],
      "giScore": 0.96,
      "consensusLevel": 0.91,
      "createdAt": "2025-11-25T00:00:00.000Z",
      "echoId": "echo-abc123",
      "ledgerTxId": "tx-12345"
    }
  ],
  "total": 1,
  "nextOffset": null
}
```

### GET /v1/encyclopedia/:id

Fetch a single entry by ID (usually the ECHO id). Returns 404 when unknown.

### POST /v1/encyclopedia/seed

Internal/cron-only endpoint that asks Thought Broker to create one entry from the curriculum.

Headers:
- `x-encyclopedia-secret` (required shared secret)

Body: `{}`

Response:

```
{
  "entry": {
    "id": "echo-encyclopedia-2",
    "question": "Who was Henrietta Lacks and why are her cells important in medicine?",
    "answer": "Henrietta Lacks was an African American woman whose cancer cells...",
    "topics": ["ethics", "medicine", "history"],
    "sources": ["https://en.wikipedia.org/wiki/Henrietta_Lacks"],
    "giScore": 0.97,
    "consensusLevel": 0.93,
    "createdAt": "2025-11-25T00:05:00.000Z",
    "echoId": "echo-encyclopedia-2",
    "ledgerTxId": "tx-67890"
  }
}
```

Error codes: `401` (missing secret), `500` (broker/echo/ledger failure).

## Admin Review Namespace

All routes require admin auth (Bearer token, mTLS, or shared secret depending on deployment). Default path prefix: `/v1/encyclopedia/admin`.

### GET /review-queue

List entries that need review.

Query params:
- `status` (default `pending_review`)
- `limit` (default 20)
- `offset` (default 0)

Response:

```
{
  "items": [
    {
      "id": "enc_01HEM3",
      "question": "What was the Haymarket Affair?",
      "topics": ["labor", "history", "chicago"],
      "giScore": 0.945,
      "status": "pending_review",
      "createdAt": "2025-11-25T13:12:03Z",
      "echoId": "echo_01X",
      "ledgerTxId": null
    }
  ],
  "total": 37,
  "nextOffset": 20
}
```

### GET /entries/:id

Return full entry (even if draft/rejected) for admin inspection.

### POST /entries/:id/review

Approve or reject an entry.

Body:

```
{
  "decision": "approve", // or "reject"
  "notes": "Add citation for police response",
  "attachLedger": true
}
```

Behavior:
- `approve` → status `approved`, sets `reviewedBy`, `reviewedAt`, optional ledger attestation
- `reject` → status `rejected`, stores notes, hides from public search

Response mirrors updated entry.

### Public status semantics

- Default search only returns `approved`
- Internal tooling can request `approved,pending_review`
- `rejected` entries stay hidden unless explicitly fetched by admins

## Consumers

### OAA Learning Hub

1. Fetch curriculum entries:
   `GET /v1/encyclopedia?topics=labor,history&status=approved`
2. Pass entries into Thought Broker:

```
POST /v1/deliberate
{
  "prompt": "Create a 45-minute learning session on the Haymarket Affair using ONLY the provided entries as factual base.",
  "context": {
    "encyclopediaEntries": [...],
    "studentProfile": { "level": "high_school", "style": "gamer", "language": "en" }
  },
  "constraints": {
    "no_external_facts": true,
    "must_cite_entry_ids": true
  }
}
```

The UI displays: “🧠 From Mobius Encyclopedia #enc_01HEM3… (GI 0.97, verified)” with a “view sources” link.

### HIVE 16-bit Codex

1. Game backend queries `GET /v1/encyclopedia?q=Haymarket&topics=labor,history&status=approved&limit=1`.
2. Client renders pixel codex panel:
   - Title bar: `Haymarket Codex`
   - Body: entry answer text
   - Badges: `🏛 Verified Civic Entry`, `🔐 GI 0.97 • Ledger: View on chain`
3. Optional overlay: “The Haymarket Echo is remembered in this shard as …”

If the player presses “Ask Companion”, the game posts back to Thought Broker with the entry as context so that dialogue remains canon-consistent.
