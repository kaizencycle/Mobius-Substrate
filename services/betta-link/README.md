# BettaFish → Civic Ledger Integration Service
# Bridges public-opinion sentiment from BettaFish into Kaizen OS Civic Layer

## Purpose
Fetches sentiment data from BettaFish API and forwards it to the Civic Ledger
for ingestion as Integrity Mood Index (IMI) metrics.

## Setup

1. Install dependencies:
```bash
pip install requests
```

2. Configure environment variables:
```bash
export BETTA_BASE="https://<bettafish-host>/api"
export BETTA_TOKEN="your-bettafish-token"
export LEDGER_URL="https://<civic-ledger-host>/ingest/sentiment"
export LEDGER_INGEST_KEY="your-ledger-ingest-key"
export EPOCH=125
export LOOKBACK_MIN=60
```

3. Run the worker:
```bash
python fwd_betta_to_ledger.py
```

## Configuration

- `BETTA_BASE`: BettaFish API base URL
- `BETTA_TOKEN`: Authentication token for BettaFish API
- `LEDGER_URL`: Civic Ledger sentiment ingest endpoint
- `LEDGER_INGEST_KEY`: API key for ledger authentication (from LEDGER_INGEST_KEY env var)
- `EPOCH`: Current epoch number
- `LOOKBACK_MIN`: Lookback window in minutes (default: 60)

## Output

The worker polls BettaFish every 60 seconds and forwards sentiment data to the ledger.
Each payload includes:
- `avg_sentiment`: -1..+1 average sentiment
- `polarization`: 0..1 polarization index
- `volume`: Message/document count
- `topics`: Optional topic-specific scores

## Future Enhancements

- Add Redis queue for reliable delivery
- Add retry logic with exponential backoff
- Add structured logging
- Add health check endpoint
- Add metrics/telemetry
