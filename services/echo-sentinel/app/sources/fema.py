"""FEMA news adapter."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

FEMA_NEWS = "https://www.fema.gov/feeds/fema-news.xml"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic != "climate":
        return []
    feed = feedparser.parse(FEMA_NEWS)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="FEMA",
                title=getattr(entry, "title", "FEMA bulletin"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="climate",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

