"""Abstract base for news/source adapters."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List

from .typing import FetchResult


class BaseSource(ABC):
    name: str

    @abstractmethod
    def fetch(self, topic: str, timeout: int) -> List[FetchResult]:
        """Return a list of normalized fetch results."""
        raise NotImplementedError

