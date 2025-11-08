"""FastAPI service exposing the Echo Sentinel pipeline."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException

from .config import get_settings
from .ledger_client import LedgerClient
from .oaa_client import OAAClient
from .pipeline import EchoPipeline
from .schemas import Finding

app = FastAPI(title="Echo Sentinel")

_settings = None
_pipeline = None


def _get_pipeline() -> EchoPipeline:
    global _settings, _pipeline  # pylint: disable=global-statement
    if _pipeline is None:
        _settings = get_settings()
        oaa_client = OAAClient(
            issuer=_settings.oaa_issuer,
            private_b64=_settings.oaa_private_b64,
            version=_settings.oaa_signing_version,
        )
        ledger_client = LedgerClient(_settings.ledger_base)
        _pipeline = EchoPipeline(oaa_client, ledger_client)
    return _pipeline


@app.post("/echo/alert")
def echo_alert(finding: Finding):
    pipeline = _get_pipeline()
    try:
        result = pipeline.process(finding)
        if not result:
            return {"status": "suppressed", "reason": "impact<medium or insufficient corroboration"}
        return {"status": "anchored", "data": result}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive fallback
        raise HTTPException(status_code=500, detail=str(exc)) from exc

