import os
import time
import json
import requests
from datetime import datetime, timedelta

BETTA_BASE = os.getenv("BETTA_BASE", "https://bettafish.example/api")
BETTA_TOKEN = os.getenv("BETTA_TOKEN")
LEDGER_URL = os.getenv("LEDGER_URL", "http://localhost:3000/ingest/sentiment")
LEDGER_KEY = os.getenv("LEDGER_INGEST_KEY")
EPOCH = int(os.getenv("EPOCH", "0"))
LOOKBACK_MIN = int(os.getenv("LOOKBACK_MIN", "60"))


def fetch_betta(window_minutes=60):
    """Fetch sentiment data from BettaFish API."""
    headers = {"Authorization": f"Bearer {BETTA_TOKEN}"}
    since = (datetime.utcnow() - timedelta(minutes=window_minutes)).isoformat() + "Z"
    r = requests.get(
        f"{BETTA_BASE}/sentiment?since={since}",
        headers=headers,
        timeout=30
    )
    r.raise_for_status()
    d = r.json()
    # Expected shape (adapt if different)
    return {
        "avg_sentiment": d["avg_sentiment"],     # -1..+1
        "polarization": d["polarization"],       # 0..1
        "volume": d["volume"],
        "topics": d.get("topics", []),
        "window_start": d["window_start"],
        "window_end": d["window_end"],
    }


def forward_to_ledger(payload):
    """Forward sentiment data to Civic Ledger."""
    headers = {"x-ledger-key": LEDGER_KEY, "Content-Type": "application/json"}
    body = {"source": "bettafish", "epoch": EPOCH, **payload}
    r = requests.post(
        LEDGER_URL,
        headers=headers,
        data=json.dumps(body),
        timeout=30
    )
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    while True:
        try:
            data = fetch_betta(LOOKBACK_MIN)
            res = forward_to_ledger(data)
            print("[betta-link] forwarded", res.get("saved", {}))
        except Exception as e:
            print("[betta-link] error:", e)
        time.sleep(60)  # run every minute
