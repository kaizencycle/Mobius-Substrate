"""Pluggable source fetchers."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
from typing import List

from .schemas import Source


class FetchError(Exception):
    """Raised when a fetcher fails."""


def _checksum(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def demo_fetch(query: str) -> List[Source]:
    """
    Demo fetcher until live adapters are wired.

    Returns two normalized Reuters/AP records so the pipeline can run end-to-end.
    """
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    doc_a = {
        "outlet": "Reuters",
        "url": "https://www.reuters.com/example",
        "title": f"{query} — marker A",
        "published_at": now,
    }
    doc_b = {
        "outlet": "AP",
        "url": "https://apnews.com/example",
        "title": f"{query} — marker B",
        "published_at": now,
    }
    return [
        Source(**{**doc_a, "checksum_sha256": _checksum(json.dumps(doc_a, sort_keys=True))}),
        Source(**{**doc_b, "checksum_sha256": _checksum(json.dumps(doc_b, sort_keys=True))}),
    ]

