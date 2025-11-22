# Mobius Antigravity Node

**Status:** v0.1 · Experimental  
**Purpose:** Bridge Mobius Thought Broker to Google Gemini 3 **Antigravity** as a *tool orchestration layer*, never as a source of truth.

## Design

- Accepts **lift requests** from the Thought Broker (task id, intent, allowed tools, safety level).
- Calls Gemini 3 Antigravity for planning, tool execution, web/code/data fetches.
- Wraps all outputs with tool traces, risk flags, and integrity metadata.
- Returns structured payloads back to the Broker for Sentinel consensus, GI grading, and ledger attestation.

Antigravity behaves as:

- **Muscle layer** → tool routing, execution, fetching.
- **Under Constitution** → Mobius task IDs, integrity guards, Sentinel review.

## Endpoints

- `GET /healthz`
- `POST /v1/antigravity/lift`
  - Body:
    - `taskId: string`
    - `intent: string`
    - `context?: object`
    - `allowedTools?: string[]`
    - `safetyLevel?: "low" | "medium" | "high"`

Returns a `LiftResult` containing:

- `answer`
- `toolTraces`
- `riskFlags`
- `rawModelMeta`

## Environment

- `PORT` (default `12000`)
- `GEMINI_API_KEY`
- `GEMINI_MODEL_ID` (default `gemini-3.0-antigravity`)
- `BROKER_API_URL` (default `http://localhost:4005`)
- `BROKER_API_KEY`

## Safety Notes

- Never bypass Mobius Sentinels.
- Every lift request is logged + gradeable via `/v1/grade`.
- Tag traces with `source: "antigravity-node"` for downstream audits.

## Getting Started

```bash
cd apps/antigravity-node
npm install
npm run dev
```

```bash
curl -X POST http://localhost:12000/v1/antigravity/lift \
  -H "Content-Type: application/json" \
  -d '{"taskId":"demo-1","intent":"Summarize integrity posture"}'
```

---

*Antigravity provides lift. Mobius keeps the law.* 
