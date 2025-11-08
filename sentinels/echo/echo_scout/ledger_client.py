"""Client for Civic Ledger anchoring."""

from __future__ import annotations

import requests


class LedgerClient:
    def __init__(self, base: str):
        if not base:
            raise ValueError("Ledger base URL must be provided.")
        self.base = base.rstrip("/")

    def anchor(self, envelope: dict) -> dict:
        url = f"{self.base}/ledger/attest"
        response = requests.post(url, json=envelope, timeout=20)
        response.raise_for_status()
        return response.json()

