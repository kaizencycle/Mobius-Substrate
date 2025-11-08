"""Civic Ledger anchoring client."""

from __future__ import annotations

import json

import requests

from .config import settings
from .models import VerifiedEvent


def write_event(event: VerifiedEvent, gi: float) -> dict:
    """Anchor attested event into Civic Ledger and return receipt."""
    payload = {
        "type": "echo.alert",
        "gi": gi,
        "topic": event.topic,
        "headline": event.headline,
        "citations": [item.url for item in event.items],
        "impact": event.impact,
    }
    response = requests.post(
        f"{settings.LEDGER_API_BASE.rstrip('/')}/ledger/attest",
        headers={
            "Authorization": f"Bearer {settings.LEDGER_API_TOKEN}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=settings.TIMEOUT_SECS,
    )
    response.raise_for_status()
    return response.json()

