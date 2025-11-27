# HIVE 16-bit Codex Client Contract

This note captures the contract between the Mobius Encyclopedia API and the HIVE "16-bit Codex" UI so front-end teams can wire the experience without waiting for backend details.

## Data Contract

Clients consume the public encyclopedia endpoints:

- `GET /v1/encyclopedia?q=Haymarket&topics=labor,history&status=approved&limit=1`
- `GET /v1/encyclopedia/:id`

Sample payload:

```
{
  "id": "enc_01HEM3...",
  "question": "What was the Haymarket Affair?",
  "answer": "The Haymarket Affair was a pivotal labor protest in Chicago in 1886...",
  "topics": ["labor", "history", "chicago"],
  "giScore": 0.97,
  "ledgerTxId": "tx_01XYZ...",
  "sources": [
    { "url": "https://...", "label": "Library of Congress" },
    { "url": "https://...", "label": "Encyclopedia of Chicago" }
  ],
  "createdAt": "2025-11-25T13:12:03Z"
}
```

Mapping to UI:

- `question` → title bar text; optionally prepend lore naming (e.g., "Haymarket Codex").
- `answer` → scrollable body text rendered with pixel font.
- `topics[]` → topic chips/badges (capitalize per chip).
- `giScore` → GI pill + badge tier (see below).
- `ledgerTxId` → enables "View Ledger" action and link overlay.
- `sources[]` → surfaces in the `[Y] View Sources` overlay.

## Panel Layout (16-bit inspired)

1. **Title Bar**
   - Primary text derived from `question` or curated alias.
   - Subtitle: `Mobius Civic Archive • GI {giScore.toFixed(2)}`.
2. **Body Pane**
   - Scrollable text block using 8×8 or 12×12 pixel font.
   - Hard-wrap lines to avoid overflow and enable D-pad paging.
3. **Meta / Badges Row**
   - Topic chips such as `[Labor] [History] [Chicago]`.
   - Verification badge: `🏛 Verified Civic Entry` when status = `approved`.
   - GI pill with tier label.
4. **Footer Actions**
   - `[A] Close`
   - `[Y] View Sources`
   - `[X] View Ledger` (disabled if `ledgerTxId` is null)
   - Optional `[B] Ask Companion` → Broker Study From Canon mode.

## Behavior Specification

### Opening the Codex

- Triggered when a player interacts with an artifact (e.g., "Labor Relic").
- Client issues `GET /v1/encyclopedia?q=<keyword>&topics=<csv>&status=approved&limit=1`.
- If no entry is returned, display `"Codex not yet written. (Future quest hook!)"`.

### Text Rendering & Paging

- Use a fixed-width pixel font for nostalgia and predictable wrapping.
- Body pane scrolls via D-pad up/down; optionally show page indicators.
- Preserve paragraphs from `answer`, but collapse double line breaks to avoid gaps.

### GI & Status Indicators

| giScore Range | Badge Label           |
| ------------- | --------------------- |
| ≥ 0.97        | `Civic Canon`         |
| 0.95–0.969    | `Trusted, Under Review` |
| < 0.95        | `Draft` (should not show in public UI) |

- Public Codex should default to approved entries only; the badge becomes purely celebratory unless future events unlock pending entries.

### Ledger Button

- Show `[X] View Ledger` only when `ledgerTxId` exists.
- Action opens an overlay with:
  - Copy such as `"Verified by Civic Custodians on YYYY-MM-DD"` using `reviewedAt`.
  - Deep link or QR code to the Civic Ledger explorer.

### Sources Overlay

- `[Y] View Sources` lists each source label + URL.
- If no labels exist, fall back to domain extracted from URL.
- Provide copyable link or QR for console targets.

### Ask Companion Hook (Optional)

- `[B] Ask Companion` posts to Broker:

```
POST /v1/deliberate
{
  "mode": "study_from_canon",
  "prompt": "Explain this like I'm 13 and tie it to Industrial Echo.",
  "context": {
    "encyclopediaEntry": { /* payload above */ },
    "playerProgress": { "shard": "Industrial Echo", "level": 7 }
  },
  "constraints": {
    "no_external_facts": true,
    "must_cite_entry_id": "enc_01HEM3..."
  }
}
```

- Broker responds with a styled explanation that still cites the entry id, ensuring lore stays canon.

## Implementation Checklist

- [ ] Wire encyclopedia-api base URL into the HIVE client config.
- [ ] Implement Codex panel component using layout above.
- [ ] Add utility that converts `topics` -> title-cased chips.
- [ ] Gate `[X] View Ledger` on `ledgerTxId` presence.
- [ ] Integrate optional Broker call for `[B] Ask Companion`.

This spec should give UI + gameplay teams enough detail to build the Codex panel while backend teams flesh out persistence, ledger attestation, and additional review tooling.
