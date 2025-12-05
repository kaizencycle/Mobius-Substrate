# lab4-proof/api/alpha_cities_api.py
# AlphaCivilization Simulation API
# Mobius Systems - Cycle C-154

from __future__ import annotations
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Optional, Any
import logging

# Import simulation module
# Note: Adjust import path based on your project structure
try:
    from sim.alpha_cities_v0 import AlphaCitiesSim
except ImportError:
    # Alternative import for when running from app directory
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from sim.alpha_cities_v0 import AlphaCitiesSim

log = logging.getLogger("alpha_cities_api")

router = APIRouter(prefix="/sim/alpha_v0", tags=["AlphaCivilization"])


def _sanitize_log_value(value: Any) -> str:
    """Sanitize potentially unsafe strings for log output (strip CR/LF)."""
    if not isinstance(value, str):
        value = str(value)
    return value.replace("\n", "").replace("\r", "")

# In-memory store for simulation results (v0.1)
# In production, this would be persisted to Civic Ledger
SIM_STORE: Dict[str, AlphaCitiesSim] = {}


# ---- Request/Response Models ----

class InitRequest(BaseModel):
    """Request to initialize a new simulation."""
    steps: int = Field(
        default=20,
        ge=1,
        le=200,
        description="Number of timesteps to simulate"
    )
    policy_mode: str = Field(
        default="random",
        description="Policy mode: 'random' or 'sentinel'"
    )
    seed: Optional[int] = Field(
        default=None,
        description="Random seed for reproducibility"
    )


class InitResponse(BaseModel):
    """Response after initializing a simulation."""
    sim_id: str
    steps: int
    policy_mode: str


class RunRequest(BaseModel):
    """Request to run a full simulation."""
    steps: int = Field(
        default=20,
        ge=1,
        le=200,
        description="Number of timesteps to simulate"
    )
    policy_mode: str = Field(
        default="random",
        description="Policy mode: 'random' or 'sentinel'"
    )
    seed: Optional[int] = Field(
        default=None,
        description="Random seed for reproducibility"
    )


class RunResponse(BaseModel):
    """Response containing full simulation results."""
    sim_id: str
    steps: int
    payload: Dict[str, Any]


# ---- API Endpoints ----

@router.post("/init", response_model=InitResponse)
def init_sim(req: InitRequest) -> InitResponse:
    """
    Initialize a new AlphaCivilization simulation.
    
    This creates a simulation instance but does not run it.
    Use /step-run for a complete simulation in one request.
    """
    sim = AlphaCitiesSim(
        steps=req.steps,
        policy_mode=req.policy_mode,
        seed=req.seed,
    )
    SIM_STORE[sim.sim_id] = sim
    
    log.info(
        f"Initialized simulation {_sanitize_log_value(sim.sim_id)} with {int(req.steps)} steps"
    )
    
    return InitResponse(
        sim_id=sim.sim_id,
        steps=req.steps,
        policy_mode=req.policy_mode,
    )


@router.post("/step-run", response_model=RunResponse)
def run_full(req: RunRequest) -> RunResponse:
    """
    Run a complete AlphaCivilization simulation.
    
    This endpoint:
    1. Creates a new simulation
    2. Runs all timesteps
    3. Returns the full trajectory and results
    
    The simulation models 3 city-states (A, B, C) making governance
    decisions and evolving according to the world model. The reward
    signal is ΔMII (change in Mobius Integrity Index).
    
    Example:
    ```bash
    curl -X POST /sim/alpha_v0/step-run \\
      -H "Content-Type: application/json" \\
      -d '{"steps": 20, "policy_mode": "random"}'
    ```
    """
    sim = AlphaCitiesSim(
        steps=req.steps,
        policy_mode=req.policy_mode,
        seed=req.seed,
    )
    sim.run()
    SIM_STORE[sim.sim_id] = sim
    
    payload = sim.to_dict()
    
    # Sanitize sim_id and steps for log safety
    clean_sim_id = _sanitize_log_value(sim.sim_id)
    clean_steps = _sanitize_log_value(req.steps)
    log.info(
        f"Completed simulation {clean_sim_id}: "
        f"GI={payload['gi_final']:.3f}, steps={clean_steps}"
    )
    
    return RunResponse(
        sim_id=sim.sim_id,
        steps=req.steps,
        payload=payload,
    )


@router.get("/{sim_id}", response_model=RunResponse)
def get_sim(sim_id: str) -> RunResponse:
    """
    Retrieve a previously run simulation by ID.
    
    Returns the full trajectory and results for analysis
    or visualization.
    """
    sim = SIM_STORE.get(sim_id)
    
    if not sim:
        raise HTTPException(
            status_code=404,
            detail=f"Simulation {sim_id} not found"
        )
    
    payload = sim.to_dict()
    
    return RunResponse(
        sim_id=sim_id,
        steps=sim.steps,
        payload=payload,
    )


@router.get("/", response_model=Dict[str, Any])
def list_sims(limit: int = 10) -> Dict[str, Any]:
    """
    List recent simulations.
    
    Returns metadata for the most recent simulations
    (limited to in-memory store).
    """
    sims = list(SIM_STORE.values())[-limit:]
    
    return {
        "count": len(sims),
        "total_stored": len(SIM_STORE),
        "simulations": [
            {
                "sim_id": sim.sim_id,
                "steps": sim.steps,
                "policy_mode": sim.policy_mode,
                "gi_final": sim.get_global_integrity(),
            }
            for sim in sims
        ],
    }


@router.delete("/{sim_id}")
def delete_sim(sim_id: str) -> Dict[str, Any]:
    """
    Delete a simulation from the store.
    
    Note: This only removes from the in-memory store.
    Civic Ledger events are immutable.
    """
    if sim_id not in SIM_STORE:
        raise HTTPException(
            status_code=404,
            detail=f"Simulation {sim_id} not found"
        )
    
    del SIM_STORE[sim_id]
    
    return {
        "ok": True,
        "deleted": sim_id,
    }
