"""Source ingestion and cross-verification pipeline primitives."""

from __future__ import annotations

import unicodedata
from typing import Dict, List

from .models import RawItem, VerifiedEvent
from .scoring import score_impact
from .sources import ap, bis, bloomberg, ecb, eu_cp, fema, nasa, reuters, who
from .sources.typing import FetchResult

ADAPTERS = [reuters, ap, bloomberg, who, nasa, ecb, bis, fema, eu_cp]


def collect(topic: str, timeout: int) -> List[RawItem]:
    """Collect RawItem entries from all configured adapters."""
    items: List[RawItem] = []
    for adapter in ADAPTERS:
        try:
            results: List[FetchResult] = adapter.fetch(topic, timeout)
        except Exception:
            continue
        for result in results:
            try:
                items.append(RawItem(**result.model_dump()))
            except Exception:
                continue
    return items


def _title_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).lower()
    return "".join(ch for ch in normalized if ch.isalnum())[:120]


def cross_verify(items: List[RawItem], min_sources: int) -> List[VerifiedEvent]:
    """Group RawItems by approximate headline similarity and enforce source diversity."""
    buckets: Dict[str, List[RawItem]] = {}
    for item in items:
        buckets.setdefault(_title_key(item.title), []).append(item)

    verified: List[VerifiedEvent] = []
    for group in buckets.values():
        sources = {g.source for g in group}
        if len(sources) < min_sources:
            continue
        impact = score_impact(group)
        verified.append(
            VerifiedEvent(
                topic=group[0].topic,
                headline=group[0].title,
                items=group,
                impact=impact,
            )
        )
    return verified

