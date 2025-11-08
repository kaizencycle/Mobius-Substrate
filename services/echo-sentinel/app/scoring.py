"""Impact scoring heuristics for verified events."""

from __future__ import annotations

from typing import List

from .models import Impact, RawItem

HIGH_TRUST = {
    "Reuters",
    "AP",
    "Bloomberg",
    "WHO",
    "NASA",
    "ECB",
    "BIS",
    "FEMA",
    "EU Civil Protection",
}


def score_impact(group: List[RawItem]) -> Impact:
    """Return heuristic impact label based on source authority, topic, and recency hints."""
    trust_weight = sum(1.0 for item in group if item.source in HIGH_TRUST)
    recency_bonus = 0.0
    for item in group:
        if item.published_at:
            recency_bonus += 0.2
    topic = group[0].topic
    topic_base = 1.3 if topic == "defense" else 1.1 if topic == "climate" else 1.0
    score = topic_base + 0.2 * trust_weight + recency_bonus
    if score >= 2.3:
        return "high"
    if score >= 1.6:
        return "medium"
    return "low"

