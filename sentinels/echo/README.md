## Echo Sentinel

- **Purpose**: Fetch verified reports, enforce dual-source corroboration, sign OAA attestations, anchor to the Civic Ledger, and return compact alerts.
- **Stack**: FastAPI, Pydantic v2, PyNaCl, Requests.
- **Policy guardrails**: Drop alerts unless impact ≥ `medium` *and* at least two corroborating sources.
- **Cycle**: C-156

---

## MCP (Mobius Core Protocol) - Repository State Export

The ECHO Sentinel includes the MCP protocol for exporting repository state to JSON format for ATLAS consumption.

### Quick Start

```bash
# Export repository state
python echo_sync.py export > repo_state.json

# Validate integrity
python echo_sync.py validate repo_state.json

# Export with deeper scan (max depth 6)
python echo_sync.py export --depth 6 > deep_state.json
```

### What Gets Exported

- **Git metadata**: Branch, commits, status
- **Directory structure**: Recursive tree scan
- **Key files**: Checksums and previews
- **Package health**: Monorepo analysis
- **Integrity signature**: SHA-256 hash

### Usage with ATLAS

Send the JSON to ATLAS for health analysis:

```bash
# Generate health report
python ../atlas/atlas_parser.py repo_state.json

# Get JSON report
python ../atlas/atlas_parser.py --format json repo_state.json

# Compare two states
python ../atlas/atlas_parser.py --compare state1.json state2.json
```

See [MCP Documentation](../../docs/04-TECHNICAL-ARCHITECTURE/protocols/MCP_README.md) for full details.

---

## Alert API (Echo Scout)

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

