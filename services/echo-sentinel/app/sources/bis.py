"""BIS news adapter."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

BIS_NEWS = "https://www.bis.org/whats_new_rss.xml"


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    if topic != "economy":
        return []
    feed = feedparser.parse(BIS_NEWS)
    results: List[FetchResult] = []
    for entry in feed.entries[:20]:
        published = getattr(entry, "published_parsed", None)
        published_dt = dt.datetime(*published[:6]) if published else None
        results.append(
            FetchResult(
                source="BIS",
                title=getattr(entry, "title", "BIS news"),
                url=getattr(entry, "link"),
                published_at=published_dt,
                topic="economy",
                summary=getattr(entry, "summary", None),
            )
        )
    return results

