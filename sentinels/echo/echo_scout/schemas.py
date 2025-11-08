"""Pydantic schemas for Echo Sentinel."""

from __future__ import annotations

from typing import List, Literal

from pydantic import AnyHttpUrl, BaseModel, Field

Impact = Literal["low", "medium", "high"]


class Source(BaseModel):
    outlet: str
    url: AnyHttpUrl
    title: str
    published_at: str
    checksum_sha256: str


class Finding(BaseModel):
    domain: Literal["economy", "technology", "climate", "defense"]
    headline: str
    summary: str
    impact: Impact
    sources: List[Source] = Field(default_factory=list, min_length=0)
    category: Literal["alert", "note"] = "alert"

