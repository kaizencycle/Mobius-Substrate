"""Runtime configuration helpers for Echo Scout."""

from __future__ import annotations

from dataclasses import dataclass
import os
from functools import lru_cache
from typing import Optional


@dataclass(frozen=True)
class Settings:
    lab4_base: Optional[str] = os.getenv("LAB4_BASE")
    lab6_base: Optional[str] = os.getenv("LAB6_BASE")
    lab7_base: Optional[str] = os.getenv("LAB7_BASE")
    ledger_base: str = os.environ.get("LEDGER_BASE", "")

    oaa_private_b64: str = os.environ.get("OAA_ED25519_PRIVATE_B64", "")
    oaa_public_b64: Optional[str] = os.getenv("OAA_ED25519_PUBLIC_B64")
    oaa_issuer: str = os.getenv("OAA_ISSUER", "oaa_lab7")
    oaa_signing_version: str = os.getenv("OAA_SIGNING_VERSION", "oaa.ed25519.v1")
    oaa_verify_pin_keys: bool = os.getenv("OAA_VERIFY_PIN_KEYS", "true").lower() == "true"
    oaa_verify_ts_window_min: int = int(os.getenv("OAA_VERIFY_TS_WINDOW_MIN", "10"))


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance."""
    settings = Settings()
    if not settings.ledger_base:
        raise RuntimeError("LEDGER_BASE environment variable is required.")
    if not settings.oaa_private_b64:
        raise RuntimeError("OAA_ED25519_PRIVATE_B64 environment variable is required.")
    return settings

