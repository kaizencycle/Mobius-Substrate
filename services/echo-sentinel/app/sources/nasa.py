"""NASA news adapter using RSS feed."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

NASA_NEWS = "https://www.nasa.gov/rss/dyn/breaking_news.rss"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic not in {"technology", "defense", "climate", "economy"}:
        return []
    feed = feedparser.parse(NASA_NEWS)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="NASA",
                title=getattr(entry, "title", "NASA update"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="technology",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

