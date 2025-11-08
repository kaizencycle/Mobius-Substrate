"""Environment-driven configuration for Echo Sentinel."""

from __future__ import annotations

from typing import Literal

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings sourced from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENV: str = Field(default="prod", description="Deployment environment label.")

    # OAA / Integrity Gate
    OAA_INTEGRITY_API: AnyHttpUrl = Field(
        default="https://hive-api-2le8.onrender.com/attestations",
        description="Endpoint for the OAA Integrity Gate attestation API.",
    )
    OAA_API_KEY: str = Field(default="changeme", description="API key used to call OAA Integrity Gate.")

    # Civic Ledger Core
    LEDGER_API_BASE: AnyHttpUrl = Field(
        default="https://civic-protocol-core-ledger.onrender.com",
        description="Base URL for the Civic Ledger API.",
    )
    LEDGER_API_TOKEN: str = Field(default="changeme", description="Bearer token for Civic Ledger API.")

    # Operational knobs
    MIN_IMPACT_FOR_ALERT: Literal["low", "medium", "high"] = Field(
        default="medium", description="Minimum impact level required before returning an alert."
    )
    REQUIRED_SOURCES: int = Field(default=2, ge=1, description="Minimum distinct sources per verified event.")
    TIMEOUT_SECS: int = Field(default=12, ge=1, description="HTTP timeout (seconds) for source fetch adapters.")


settings = Settings()

