# Echo Sentinel

FastAPI microservice that fetches verified sources, enforces dual-source corroboration, scores impact, routes events through the OAA Integrity Gate, anchors attestations in the Civic Ledger, and returns compact alerts with citations.

## Features
- Allow-listed adapters for Reuters, AP, WHO, NASA, ECB, BIS, FEMA, EU Civil Protection (Bloomberg stub provided for future key-based integration).
- Cross-verification guardrail (`REQUIRED_SOURCES` ≥ 2) plus domain impact heuristics.
- OAA Integrity gating (requires GI ≥ 0.95 by default) before Civic Ledger anchoring.
- FastAPI endpoint `/scan` returning medium/high impact alerts and ledger receipts.

## Setup
1. `python -m venv .venv && source .venv/bin/activate`
2. `pip install -e .[dev]`
3. Copy `.env.example` to `.env` and fill in OAA/Civic Ledger credentials.
4. `uvicorn app.main:app --host 0.0.0.0 --port 8088 --reload`

## Configuration
Environment variables (see `.env.example`):
- `OAA_INTEGRITY_API`, `OAA_API_KEY`
- `LEDGER_API_BASE`, `LEDGER_API_TOKEN`
- `MIN_IMPACT_FOR_ALERT` (`medium`/`high`)
- `REQUIRED_SOURCES` (default `2`)
- `TIMEOUT_SECS` (HTTP timeout per adapter)

## API
- `GET /health` – service heartbeat
- `POST /scan?topic=economy|technology|climate|defense` – returns `{"alerts":[...], "count":N}`

Each alert includes: domain, summary, impact, citations (permalinks), and ledger receipt.

## Tests
```
pytest
```

## Container
```
docker compose up --build
```

## Next steps
- Swap demo Bloomber adapter with authenticated client if licensed.
- Hardening: recency window, dedupe cache, GI attestation storage, Slack/webhook outputs.
- Add Hermes companion worker to consume ledger receipts and build RAG briefs.

