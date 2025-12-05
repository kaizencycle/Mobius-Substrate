# packages/civic-protocol-core/ledger/app/alpha_civilization_events.py
# AlphaCivilization Event Handler for Civic Ledger
# Mobius Systems - Cycle C-154
#
# This module handles alpha_civilization.run.v0 events from the
# AlphaCivilization Console, transforming them into canonical
# Civic Ledger events.

from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Any, List, Dict, Optional
from uuid import uuid4
from datetime import datetime, timezone
import logging

log = logging.getLogger("alpha_civilization_events")

router = APIRouter(prefix="/ledger", tags=["AlphaCivilization"])


# ---- Incoming (thin) event from frontends ----

class CitySummary(BaseModel):
    """Summary of a city's final state from AlphaCivilization simulation."""
    city_id: str
    final_state: Dict[str, Any]
    final_mii: Optional[float] = None


class AlphaCivilizationRunThin(BaseModel):
    """
    Shape sent by the AlphaCivilization Console (frontend).
    We transform this into a formal Ledger event.
    """
    type: str = Field(default="alpha_civilization_run")
    sim_id: str
    steps: int
    cities: List[CitySummary]
    meta: Dict[str, Any] = Field(default_factory=dict)


# ---- Canonical Ledger event envelope ----

class LedgerEvent(BaseModel):
    """Canonical Civic Ledger event structure."""
    event_id: str
    event_type: str
    timestamp: str
    source: str
    cycle: Optional[str] = None
    chamber: Optional[str] = None
    payload: Dict[str, Any]


# In-memory store for v0.1 (will be replaced with DB in production)
ALPHA_CIV_EVENTS: List[LedgerEvent] = []


@router.post("/events")
def record_event(thin: AlphaCivilizationRunThin) -> Dict[str, Any]:
    """
    Record an AlphaCivilization simulation run to the Civic Ledger.
    
    This endpoint:
    1. Accepts thin payload from the AlphaCivilization Console
    2. Wraps it in canonical LedgerEvent envelope
    3. Stores for audit and analysis
    
    The event follows the schema defined in:
    docs/ledger_alpha_civilization_events.md
    
    Example:
    ```bash
    curl -X POST /ledger/events \\
      -H "Content-Type: application/json" \\
      -d '{
        "type": "alpha_civilization_run",
        "sim_id": "sim-xyz",
        "steps": 20,
        "cities": [
          {"city_id": "A", "final_state": {...}, "final_mii": 0.92}
        ],
        "meta": {"policy_mode": "sentinel", "cycle": "C-154"}
      }'
    ```
    """
    now = datetime.now(timezone.utc).isoformat()

    # Map thin payload to canonical format
    # as per docs/ledger_alpha_civilization_events.md
    cities_payload: List[Dict[str, Any]] = []
    for city in thin.cities:
        cities_payload.append({
            "city_id": city.city_id,
            "initial_state": None,  # v0: omitted, can patch later
            "final_state": city.final_state,
            "mii_initial": None,
            "mii_final": city.final_mii,
            "mii_series": None,
            "actions_summary": None,
        })

    # Compute aggregate GI if we have MII values
    mii_values = [c.final_mii for c in thin.cities if c.final_mii is not None]
    gi_final = sum(mii_values) / len(mii_values) if mii_values else None

    payload: Dict[str, Any] = {
        "sim_id": thin.sim_id,
        "version": "v0.1",
        "steps": thin.steps,
        "policy_mode": thin.meta.get("policy_mode", "unknown"),
        "integrity_target": thin.meta.get("integrity_target", 0.95),
        "cities": cities_payload,
        "gi_series": None,
        "gi_final": gi_final,
        "meta": {
            "simulation": True,
            "note": thin.meta.get(
                "note", "AlphaCivilization v0.1 run (console)."
            ),
            "trinity_seal": thin.meta.get(
                "trinity_seal", "JADE-AUREA-ATLAS-ECHO"
            ),
        },
    }

    event = LedgerEvent(
        event_id=str(uuid4()),
        event_type="alpha_civilization.run.v0",
        timestamp=now,
        source=thin.meta.get("source", "Mobius-Lab4-AlphaCivilizationConsole"),
        cycle=thin.meta.get("cycle", None),
        chamber=thin.meta.get("chamber", "Lab4"),
        payload=payload,
    )

    ALPHA_CIV_EVENTS.append(event)
    
    log.info(
        f"Recorded AlphaCivilization event: {event.event_id} "
        f"(sim={thin.sim_id}, steps={thin.steps}, gi_final={gi_final})"
    )

    return {
        "status": "ok",
        "event_id": event.event_id,
        "event_type": event.event_type,
        "recorded_at": event.timestamp,
        "gi_final": gi_final,
    }


@router.get("/events/alpha_civilization")
def list_alpha_civilization_events(
    limit: int = 100,
    offset: int = 0,
) -> Dict[str, Any]:
    """
    List all AlphaCivilization simulation events.
    
    Returns events sorted by timestamp (most recent first).
    """
    # Filter for alpha_civilization events only
    filtered = [
        e for e in ALPHA_CIV_EVENTS
        if e.event_type == "alpha_civilization.run.v0"
    ]
    
    # Sort by timestamp descending
    filtered.sort(key=lambda e: e.timestamp, reverse=True)
    
    # Apply pagination
    paginated = filtered[offset:offset + limit]
    
    return {
        "events": [e.dict() for e in paginated],
        "total": len(filtered),
        "limit": limit,
        "offset": offset,
    }


@router.get("/events/alpha_civilization/{event_id}")
def get_alpha_civilization_event(event_id: str) -> Dict[str, Any]:
    """
    Get a specific AlphaCivilization event by ID.
    """
    for event in ALPHA_CIV_EVENTS:
        if event.event_id == event_id:
            return {
                "event": event.dict(),
                "found": True,
            }
    
    return {
        "event": None,
        "found": False,
        "error": f"Event {event_id} not found",
    }


@router.get("/events/alpha_civilization/stats")
def get_alpha_civilization_stats() -> Dict[str, Any]:
    """
    Get statistics about AlphaCivilization simulation events.
    """
    events = [
        e for e in ALPHA_CIV_EVENTS
        if e.event_type == "alpha_civilization.run.v0"
    ]
    
    if not events:
        return {
            "total_runs": 0,
            "avg_gi_final": None,
            "policy_modes": {},
            "chambers": {},
        }
    
    # Compute statistics
    gi_values = []
    policy_modes: Dict[str, int] = {}
    chambers: Dict[str, int] = {}
    
    for e in events:
        gi = e.payload.get("gi_final")
        if gi is not None:
            gi_values.append(gi)
        
        mode = e.payload.get("policy_mode", "unknown")
        policy_modes[mode] = policy_modes.get(mode, 0) + 1
        
        chamber = e.chamber or "unknown"
        chambers[chamber] = chambers.get(chamber, 0) + 1
    
    return {
        "total_runs": len(events),
        "avg_gi_final": sum(gi_values) / len(gi_values) if gi_values else None,
        "min_gi_final": min(gi_values) if gi_values else None,
        "max_gi_final": max(gi_values) if gi_values else None,
        "policy_modes": policy_modes,
        "chambers": chambers,
        "runs_above_target": sum(1 for gi in gi_values if gi >= 0.95),
        "target_rate": sum(1 for gi in gi_values if gi >= 0.95) / len(gi_values) if gi_values else 0,
    }
