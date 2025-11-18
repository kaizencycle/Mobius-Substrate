# Mobius Local Node

Offline-first Sentinel console using a local LLM (via Ollama).

## Quickstart

```bash
cd apps/mobius-local-node

# Install deps from repo root first:
# npm install

# Pull local model
npm run install:llm

# Run in dev mode
npm run dev
```

Configure with:

```bash
export MOBIUS_MODEL="llama3.1"
export MOBIUS_LLM_ENDPOINT="http://localhost:11434/api/chat"
export MOBIUS_LEDGER_PATH="./data/ledger.json"
```

Then ask:

> AUREA, help me reason about civic infrastructure for NYC using Mobius.

