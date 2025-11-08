"""AP News adapter using topic RSS feeds."""

from __future__ import annotations

import datetime as dt
from typing import List

import feedparser

from .typing import FetchResult

AP_FEEDS = {
    "economy": "https://apnews.com/hub/ap-top-news?utm_source=rss",
    "technology": "https://apnews.com/hub/technology?utm_source=rss",
    "climate": "https://apnews.com/hub/climate-and-environment?utm_source=rss",
    "defense": "https://apnews.com/hub/world-news?utm_source=rss",
}


def _parse_entry(entry, topic: str) -> FetchResult:
    published = getattr(entry, "published_parsed", None)
    published_dt = dt.datetime(*published[:6]) if published else None
    return FetchResult(
        source="AP",
        title=getattr(entry, "title", "AP update"),
        url=getattr(entry, "link"),
        published_at=published_dt,
        topic=topic,
        summary=getattr(entry, "summary", None),
    )


def fetch(topic: str, timeout: int) -> List[FetchResult]:
    url = AP_FEEDS.get(topic)
    if not url:
        return []
    feed = feedparser.parse(url)
    return [_parse_entry(entry, topic) for entry in feed.entries[:20]]

