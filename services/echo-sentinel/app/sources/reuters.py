"""Reuters adapter using RSS feeds."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

REUTERS_FEEDS = {
    "economy": "https://www.reuters.com/markets/economy/rss",
    "technology": "https://www.reuters.com/technology/rss",
    "climate": "https://www.reuters.com/sustainability/climate-energy-environment/rss",
    "defense": "https://www.reuters.com/world/rss",
}


def _parse_entry(entry, topic: str) -> FetchResult:
    published = getattr(entry, "published_parsed", None)
    published_dt = dt.datetime(*published[:6]) if published else None
    return FetchResult(
        source="Reuters",
        title=getattr(entry, "title", "Reuters update"),
        url=getattr(entry, "link"),
        published_at=published_dt,
        topic=topic,
        summary=getattr(entry, "summary", None),
    )


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    url = REUTERS_FEEDS.get(topic)
    if not url:
        return []
    feed = feedparser.parse(url)
    return [_parse_entry(entry, topic) for entry in feed.entries[:20]]

