"""ECB press release adapter."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

ECB_PRESS = "https://www.ecb.europa.eu/press/pr/html/index.en.rss"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic != "economy":
        return []
    feed = feedparser.parse(ECB_PRESS)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="ECB",
                title=getattr(entry, "title", "ECB release"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="economy",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

