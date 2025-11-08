"""WHO Disease Outbreak News adapter."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

WHO_DON = "https://www.who.int/feeds/entity/csr/don/en/rss.xml"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic != "climate":
        return []
    feed = feedparser.parse(WHO_DON)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="WHO",
                title=getattr(entry, "title", "WHO bulletin"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="climate",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

