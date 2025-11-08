"""Shared types for source adapters."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, HttpUrl


class FetchResult(BaseModel):
    source: str
    title: str
    url: HttpUrl
    published_at: Optional[datetime] = None
    topic: str
    summary: Optional[str] = None

