"""Echo Sentinel pipeline orchestration."""

from __future__ import annotations

from typing import Optional

from .fetchers import demo_fetch
from .ledger_client import LedgerClient
from .oaa_client import OAAClient
from .schemas import Finding


class EchoPipeline:
    def __init__(self, oaa: OAAClient, ledger: LedgerClient):
        self.oaa = oaa
        self.ledger = ledger

    @staticmethod
    def _meets_policy(finding: Finding) -> bool:
        return finding.impact in {"medium", "high"} and len(finding.sources) >= 2

    def process(self, finding: Finding) -> Optional[dict]:
        if len(finding.sources) < 2:
            finding.sources = demo_fetch(finding.headline)

        if not self._meets_policy(finding):
            return None

        payload = finding.model_dump(mode="json")
        envelope = self.oaa.sign_attestation(payload)
        ack = self.ledger.anchor(envelope)
        return {
            "headline": finding.headline,
            "impact": finding.impact,
            "domain": finding.domain,
            "ledger_receipt": ack,
            "sources": [source.model_dump(mode="json") for source in finding.sources],
        }

