"""Pydantic models for Echo Sentinel domain objects."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, HttpUrl

Impact = Literal["low", "medium", "high"]


class RawItem(BaseModel):
    source: str
    title: str
    url: HttpUrl
    published_at: Optional[datetime] = None
    topic: Literal["economy", "technology", "climate", "defense"]
    summary: Optional[str] = None


class VerifiedEvent(BaseModel):
    topic: str
    headline: str
    items: List[RawItem] = Field(min_length=2)
    impact: Impact


class AlertPayload(BaseModel):
    domain: str
    summary: str
    impact: Impact
    citations: List[HttpUrl]


class Attestation(BaseModel):
    subject: str
    event: VerifiedEvent
    integrity_anchor: str = "Kaizen/Concord"
    timestamp: datetime
    annotations: Dict[str, str] | None = None

