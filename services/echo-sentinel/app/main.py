"""FastAPI application for Echo Sentinel."""

from __future__ import annotations

from typing import Dict, List

from fastapi import FastAPI, HTTPException, Query

from .config import settings
from .ingest import collect, cross_verify
from .integrity import gate
from .ledger import write_event

GI_THRESHOLD = 0.95

app = FastAPI(title="Echo Sentinel", version="0.1.0")


@app.get("/health")
def health() -> Dict[str, object]:
    return {"ok": True, "env": settings.ENV}


@app.post("/scan")
def scan(topic: str = Query(..., pattern="^(economy|technology|climate|defense)$")) -> Dict[str, object]:
    try:
        items = collect(topic, settings.TIMEOUT_SECS)
        verified_events = cross_verify(items, settings.REQUIRED_SOURCES)
        alerts: List[Dict[str, object]] = []
        for event in verified_events:
            if settings.MIN_IMPACT_FOR_ALERT == "high" and event.impact != "high":
                continue
            if settings.MIN_IMPACT_FOR_ALERT == "medium" and event.impact not in {"medium", "high"}:
                continue
            gi = gate(event)
            if gi < GI_THRESHOLD:
                continue
            receipt = write_event(event, gi)
            alerts.append(
                {
                    "domain": event.topic,
                    "summary": event.headline,
                    "impact": event.impact,
                    "citations": [item.url for item in event.items],
                    "ledger_receipt": receipt,
                    "gi": gi,
                }
            )
        return {"alerts": alerts, "count": len(alerts)}
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc

