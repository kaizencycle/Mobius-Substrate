"""Integration with the OAA Integrity Gate."""

from __future__ import annotations

import json
from datetime import datetime, timezone

import requests

from .config import settings
from .models import Attestation, VerifiedEvent


def gate(event: VerifiedEvent) -> float:
    """Submit event to OAA Integrity Gate and return GI score."""
    payload = Attestation(
        subject="Echo.Sentinel.Alert",
        event=event,
        timestamp=datetime.now(timezone.utc),
    ).model_dump(mode="json")

    response = requests.post(
        str(settings.OAA_INTEGRITY_API),
        headers={
            "Authorization": f"Bearer {settings.OAA_API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps(payload),
        timeout=settings.TIMEOUT_SECS,
    )
    response.raise_for_status()
    data = response.json()
    return float(data.get("gi", 0.0))

