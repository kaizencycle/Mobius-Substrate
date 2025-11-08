## Echo Sentinel

- **Purpose**: fetch verified reports, enforce dual-source corroboration, sign OAA attestations, anchor to the Civic Ledger, and return compact alerts.
- **Stack**: FastAPI, Pydantic v2, PyNaCl, Requests.
- **Policy guardrails**: drop alerts unless impact ≥ `medium` *and* at least two corroborating sources.

### Setup
- `python -m venv .venv && source .venv/bin/activate`
- `pip install -e .`
- Copy `.env.example` to `.env` and provide real endpoints/keys.
- `uvicorn echo_scout.server:app --port 8088 --reload`

### Endpoint
POST `/echo/alert`

```json
{
  "domain": "defense",
  "headline": "Example dual-source alert",
  "summary": "…",
  "impact": "high",
  "sources": []
}
```

### Behavior
- Enforces corroboration (auto-fills using `demo_fetch` placeholder when sources are empty).
- Suppresses alerts if impact `< medium` or corroboration `< 2`.
- Signs payload via OAA Ed25519 key, anchors to Civic Ledger, returns ledger receipt and sources.

