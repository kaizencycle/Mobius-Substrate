"""EU Civil Protection adapter."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

EU_CP = "https://civil-protection-humanitarian-aid.ec.europa.eu/rss_en"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic != "climate":
        return []
    feed = feedparser.parse(EU_CP)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="EU Civil Protection",
                title=getattr(entry, "title", "EU Civil Protection alert"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="climate",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

