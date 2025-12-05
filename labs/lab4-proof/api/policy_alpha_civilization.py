# lab4-proof/api/policy_alpha_civilization.py
# AlphaCivilization Sentinel Policy API
# Mobius Systems - Cycle C-154
#
# This API provides Sentinel-quorum policy recommendations for
# AlphaCivilization simulations. v0.1 uses heuristic voting;
# future versions will integrate real Sentinel agents.

from __future__ import annotations
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, List, Literal, Any
import random
import logging

log = logging.getLogger("policy_alpha_civilization")

router = APIRouter(prefix="/policy/alpha_v0", tags=["AlphaCivilizationPolicy"])

# Type definitions
CityId = Literal["A", "B", "C"]
ActionId = Literal[
    "ubi_pilot",
    "progressive_tax_shift",
    "austerity_program",
    "green_investment",
    "education_boost",
    "corruption_crackdown",
    "policing_militarization",
    "infrastructure_spend",
]

SENTINELS = ["AUREA", "ATLAS", "EVE", "JADE", "HERMES", "ECHO"]


# ---- Request/Response Models ----

class CityStateModel(BaseModel):
    """City state snapshot for policy evaluation."""
    integrity: float = Field(..., ge=0, le=100)
    trust: float = Field(..., ge=0, le=100)
    inequality: float = Field(..., ge=0, le=100)
    unemployment: float = Field(..., ge=0, le=100)
    life_expectancy: float = Field(..., ge=0, le=100)
    corruption: float = Field(..., ge=0, le=100)
    climate_risk: float = Field(..., ge=0, le=100)


class PolicyRequest(BaseModel):
    """Request for Sentinel policy recommendation."""
    sim_id: str = Field(..., description="Simulation identifier")
    t: int = Field(..., ge=0, description="Current timestep")
    city_id: str = Field(..., description="City identifier (A, B, or C)")
    policy_mode: Literal["sentinel", "random", "hybrid"] = Field(
        default="sentinel",
        description="Policy evaluation mode"
    )
    state: CityStateModel = Field(..., description="Current city state")
    available_actions: List[str] = Field(
        ...,
        min_length=1,
        description="List of available action IDs"
    )


class SentinelVote(BaseModel):
    """Individual Sentinel's vote on an action."""
    score: float = Field(..., ge=-1.0, le=1.0, description="Score from -1.0 to 1.0")
    verdict: Literal["approve", "reject", "log", "abstain"] = Field(
        ...,
        description="Sentinel's verdict"
    )
    notes: str = Field(..., description="Rationale for the vote")


class RankedAction(BaseModel):
    """Action with aggregated Sentinel votes."""
    action_id: str
    global_score: float = Field(..., description="Aggregated score")
    sentinel_votes: Dict[str, SentinelVote]


class PolicyResponse(BaseModel):
    """Complete policy recommendation response."""
    sim_id: str
    t: int
    city_id: str
    policy_mode: str
    chosen_action: str
    ranked_actions: List[RankedAction]
    mii_delta_estimate: float
    confidence: float = Field(..., ge=0.0, le=1.0)
    notes: str
    trinity_seal: Dict[str, bool]


# ---- Sentinel Voting Logic ----

# Action evaluation profiles for each Sentinel
# These heuristics encode domain knowledge about governance actions
ACTION_PROFILES: Dict[str, Dict[str, Dict[str, Any]]] = {
    "ubi_pilot": {
        "AUREA": {"base": 0.75, "note": "Constitutional; reduces poverty"},
        "ATLAS": {"base": 0.70, "note": "Feasible with gradual rollout"},
        "EVE": {"base": 0.85, "note": "Strong equity alignment"},
        "JADE": {"base": 0.80, "note": "Boosts citizen morale"},
        "HERMES": {"base": 0.60, "note": "Fiscal impact moderate"},
        "ECHO": {"base": 0.70, "note": "Track employment effects"},
    },
    "progressive_tax_shift": {
        "AUREA": {"base": 0.70, "note": "Standard policy tool"},
        "ATLAS": {"base": 0.65, "note": "Implementation complexity moderate"},
        "EVE": {"base": 0.75, "note": "Reduces inequality"},
        "JADE": {"base": 0.60, "note": "Mixed public reception"},
        "HERMES": {"base": 0.55, "note": "May affect investment"},
        "ECHO": {"base": 0.65, "note": "Monitor tax compliance"},
    },
    "austerity_program": {
        "AUREA": {"base": -0.40, "note": "Often violates social contracts"},
        "ATLAS": {"base": -0.20, "note": "Short-term feasible, long-term harm"},
        "EVE": {"base": -0.60, "note": "Harms vulnerable populations"},
        "JADE": {"base": -0.70, "note": "Severely damages trust"},
        "HERMES": {"base": -0.30, "note": "Contractionary spiral risk"},
        "ECHO": {"base": -0.50, "note": "Historical failure pattern"},
    },
    "green_investment": {
        "AUREA": {"base": 0.80, "note": "Climate commitments require this"},
        "ATLAS": {"base": 0.75, "note": "Scalable infrastructure"},
        "EVE": {"base": 0.85, "note": "Intergenerational equity"},
        "JADE": {"base": 0.70, "note": "Popular with younger citizens"},
        "HERMES": {"base": 0.65, "note": "Long-term ROI positive"},
        "ECHO": {"base": 0.80, "note": "Track emissions reduction"},
    },
    "education_boost": {
        "AUREA": {"base": 0.80, "note": "Fundamental right to education"},
        "ATLAS": {"base": 0.85, "note": "High structural feasibility"},
        "EVE": {"base": 0.90, "note": "Strongly aligns with Virtue Accords"},
        "JADE": {"base": 0.78, "note": "Improves perceived fairness"},
        "HERMES": {"base": 0.76, "note": "Future productivity gains"},
        "ECHO": {"base": 0.80, "note": "Track educational outcomes"},
    },
    "corruption_crackdown": {
        "AUREA": {"base": 0.85, "note": "Essential for rule of law"},
        "ATLAS": {"base": 0.70, "note": "Requires strong institutions"},
        "EVE": {"base": 0.80, "note": "Justice alignment"},
        "JADE": {"base": 0.75, "note": "Restores public trust"},
        "HERMES": {"base": 0.65, "note": "Short-term disruption, long-term gain"},
        "ECHO": {"base": 0.90, "note": "Critical monitoring priority"},
    },
    "policing_militarization": {
        "AUREA": {"base": -0.50, "note": "Civil liberties concerns"},
        "ATLAS": {"base": -0.30, "note": "Creates fragile security"},
        "EVE": {"base": -0.70, "note": "Violates trust principles"},
        "JADE": {"base": -0.80, "note": "Severely erodes public trust"},
        "HERMES": {"base": -0.40, "note": "Misallocated resources"},
        "ECHO": {"base": -0.60, "note": "Red flag: abuse potential"},
    },
    "infrastructure_spend": {
        "AUREA": {"base": 0.70, "note": "Standard development policy"},
        "ATLAS": {"base": 0.80, "note": "High structural value"},
        "EVE": {"base": 0.65, "note": "Neutral equity impact"},
        "JADE": {"base": 0.70, "note": "Visible improvements"},
        "HERMES": {"base": 0.75, "note": "Economic multiplier effects"},
        "ECHO": {"base": 0.70, "note": "Track completion rates"},
    },
}


def _evaluate_action_for_sentinel(
    sentinel: str,
    action_id: str,
    state: CityStateModel,
) -> SentinelVote:
    """
    Generate a Sentinel's vote for a specific action given the current state.
    
    v0.1: Uses heuristic profiles with state-dependent adjustments
    Future: Will call actual Sentinel agents
    """
    profile = ACTION_PROFILES.get(action_id, {}).get(sentinel, {})
    base_score = profile.get("base", 0.0)
    base_note = profile.get("note", f"Evaluating {action_id}")
    
    # State-dependent adjustments
    adjustment = 0.0
    adjustment_notes = []
    
    # Sentinel-specific state considerations
    if sentinel == "EVE":
        # EVE weighs inequality heavily
        if state.inequality > 50 and action_id in ["ubi_pilot", "progressive_tax_shift"]:
            adjustment += 0.10
            adjustment_notes.append("High inequality favors redistribution")
        if state.inequality < 30 and action_id == "austerity_program":
            adjustment += 0.05  # Less harmful when inequality already low
            
    elif sentinel == "JADE":
        # JADE weighs trust
        if state.trust < 50 and action_id in ["corruption_crackdown", "education_boost"]:
            adjustment += 0.10
            adjustment_notes.append("Trust recovery priority")
        if state.trust < 40 and action_id == "policing_militarization":
            adjustment -= 0.15
            adjustment_notes.append("Trust critically low - avoid force")
            
    elif sentinel == "HERMES":
        # HERMES weighs unemployment
        if state.unemployment > 10 and action_id in ["ubi_pilot", "infrastructure_spend"]:
            adjustment += 0.10
            adjustment_notes.append("Job creation needed")
        if state.unemployment < 5 and action_id == "austerity_program":
            adjustment += 0.05
            adjustment_notes.append("Low unemployment provides buffer")
            
    elif sentinel == "ATLAS":
        # ATLAS weighs structural integrity
        if state.integrity < 60 and action_id in ["corruption_crackdown", "education_boost"]:
            adjustment += 0.10
            adjustment_notes.append("Structural strengthening priority")
            
    elif sentinel == "AUREA":
        # AUREA weighs corruption
        if state.corruption > 40 and action_id == "corruption_crackdown":
            adjustment += 0.15
            adjustment_notes.append("Urgent anti-corruption mandate")
            
    elif sentinel == "ECHO":
        # ECHO adds noise for uncertainty
        if state.climate_risk > 40 and action_id == "green_investment":
            adjustment += 0.10
            adjustment_notes.append("Climate risk flagged")
    
    # Add small random variation
    noise = random.uniform(-0.05, 0.05)
    final_score = max(-1.0, min(1.0, base_score + adjustment + noise))
    
    # Determine verdict
    if final_score > 0.3:
        verdict = "approve"
    elif final_score < -0.2:
        verdict = "reject"
    else:
        verdict = "log"
    
    # Build notes
    full_note = base_note
    if adjustment_notes:
        full_note += f" [{'; '.join(adjustment_notes)}]"
    
    return SentinelVote(
        score=round(final_score, 3),
        verdict=verdict,
        notes=full_note,
    )


# ---- API Endpoint ----

@router.post("/choose", response_model=PolicyResponse)
def choose_policy(req: PolicyRequest) -> PolicyResponse:
    """
    Get a Sentinel-quorum policy recommendation.
    
    This endpoint evaluates all available actions using the Sentinel
    council and returns a ranked list with the recommended action.
    
    Each Sentinel evaluates actions based on their domain expertise:
    - AUREA: Governance & legal coherence
    - ATLAS: Structural feasibility
    - EVE: Ethical constraints (Virtue Accords)
    - JADE: Morale and social cohesion
    - HERMES: Economic stability & markets
    - ECHO: Auditing & anomaly detection
    
    Example:
    ```bash
    curl -X POST /policy/alpha_v0/choose \\
      -H "Content-Type: application/json" \\
      -d '{
        "sim_id": "sim-test-001",
        "t": 0,
        "city_id": "A",
        "policy_mode": "sentinel",
        "state": {
          "integrity": 70, "trust": 65, "inequality": 40,
          "unemployment": 8, "life_expectancy": 78,
          "corruption": 25, "climate_risk": 30
        },
        "available_actions": ["ubi_pilot", "education_boost", "austerity_program"]
      }'
    ```
    """
    if not req.available_actions:
        # Safety: no actions available
        return PolicyResponse(
            sim_id=req.sim_id,
            t=req.t,
            city_id=req.city_id,
            policy_mode=req.policy_mode,
            chosen_action="noop",
            ranked_actions=[],
            mii_delta_estimate=0.0,
            confidence=0.0,
            notes="No actions available",
            trinity_seal={"JADE": False, "AUREA": False, "ATLAS": False, "ECHO": False},
        )
    
    # Evaluate all actions
    ranked: List[RankedAction] = []
    
    for action_id in req.available_actions:
        votes: Dict[str, SentinelVote] = {}
        scores: List[float] = []
        
        for sentinel in SENTINELS:
            vote = _evaluate_action_for_sentinel(sentinel, action_id, req.state)
            votes[sentinel] = vote
            scores.append(vote.score)
        
        global_score = sum(scores) / len(scores) if scores else 0.0
        
        ranked.append(RankedAction(
            action_id=action_id,
            global_score=round(global_score, 3),
            sentinel_votes=votes,
        ))
    
    # Sort by global score (descending)
    ranked.sort(key=lambda ra: ra.global_score, reverse=True)
    
    # Choose top action
    chosen = ranked[0] if ranked else None
    chosen_action = chosen.action_id if chosen else "noop"
    
    # Estimate MII delta (rough heuristic)
    mii_delta_estimate = (chosen.global_score * 0.05) if chosen else 0.0
    
    # Calculate confidence based on vote agreement
    if chosen:
        approvals = sum(
            1 for v in chosen.sentinel_votes.values()
            if v.verdict == "approve"
        )
        confidence = approvals / len(SENTINELS)
    else:
        confidence = 0.0
    
    # Trinity seal (core Sentinels approved)
    trinity_seal = {
        "JADE": chosen.sentinel_votes.get("JADE", SentinelVote(score=0, verdict="abstain", notes="")).verdict == "approve" if chosen else False,
        "AUREA": chosen.sentinel_votes.get("AUREA", SentinelVote(score=0, verdict="abstain", notes="")).verdict == "approve" if chosen else False,
        "ATLAS": chosen.sentinel_votes.get("ATLAS", SentinelVote(score=0, verdict="abstain", notes="")).verdict == "approve" if chosen else False,
        "ECHO": chosen.sentinel_votes.get("ECHO", SentinelVote(score=0, verdict="abstain", notes="")).verdict in ["approve", "log"] if chosen else False,
    }
    
    # Generate summary note
    if chosen:
        top_supporters = [
            s for s, v in chosen.sentinel_votes.items()
            if v.verdict == "approve"
        ]
        notes = (
            f"Recommended: {chosen_action} (score={chosen.global_score:.2f}). "
            f"Approved by: {', '.join(top_supporters) if top_supporters else 'none'}."
        )
    else:
        notes = "No valid actions to recommend."
    
    # Sanitize log inputs to avoid log injection
    def _sanitize_log_value(value: Any) -> str:
        # Remove CR, LF
        if isinstance(value, str):
            return value.replace('\r', '').replace('\n', '')
        return str(value)
    
    sim_id_log = _sanitize_log_value(req.sim_id)
    t_log = _sanitize_log_value(req.t)
    city_id_log = _sanitize_log_value(req.city_id)
    
    log.info(
        f"Policy recommendation for {sim_id_log}/t={t_log}/{city_id_log}: "
        f"{chosen_action} (confidence={confidence:.2f})"
    )
    
    return PolicyResponse(
        sim_id=req.sim_id,
        t=req.t,
        city_id=req.city_id,
        policy_mode=req.policy_mode,
        chosen_action=chosen_action,
        ranked_actions=ranked,
        mii_delta_estimate=round(mii_delta_estimate, 4),
        confidence=round(confidence, 2),
        notes=notes,
        trinity_seal=trinity_seal,
    )


@router.get("/sentinels")
def list_sentinels() -> Dict[str, Any]:
    """
    List the Sentinel council members and their roles.
    """
    return {
        "sentinels": [
            {"id": "AUREA", "role": "Governance & legal coherence", "emoji": "🔵"},
            {"id": "ATLAS", "role": "Structural feasibility", "emoji": "⚪"},
            {"id": "EVE", "role": "Ethical constraints (Virtue Accords)", "emoji": "🌿"},
            {"id": "JADE", "role": "Morale and social cohesion", "emoji": "🟣"},
            {"id": "HERMES", "role": "Economic stability & markets", "emoji": "🟠"},
            {"id": "ECHO", "role": "Auditing & anomaly detection", "emoji": "🟡"},
        ],
        "quorum_threshold": 4,
        "veto_power": ["EVE"],  # EVE can veto on ethical grounds
        "notes": "v0.1 uses heuristic voting; future versions will integrate real Sentinel agents",
    }


@router.get("/actions")
def list_actions() -> Dict[str, Any]:
    """
    List all available governance actions and their general effects.
    """
    return {
        "actions": [
            {
                "id": "ubi_pilot",
                "name": "Universal Basic Income Pilot",
                "effects": "↓unemployment, ↑trust, ↓inequality",
                "category": "social",
            },
            {
                "id": "progressive_tax_shift",
                "name": "Progressive Taxation Reform",
                "effects": "↓inequality, ↑integrity",
                "category": "fiscal",
            },
            {
                "id": "austerity_program",
                "name": "Austerity Program",
                "effects": "↑unemployment, ↓trust, ↑inequality (usually harmful)",
                "category": "fiscal",
            },
            {
                "id": "green_investment",
                "name": "Green Infrastructure Investment",
                "effects": "↓climate_risk, ↑integrity, ↑trust",
                "category": "environment",
            },
            {
                "id": "education_boost",
                "name": "Education System Enhancement",
                "effects": "↑life_expectancy, ↑trust, ↓inequality",
                "category": "social",
            },
            {
                "id": "corruption_crackdown",
                "name": "Anti-Corruption Enforcement",
                "effects": "↓corruption, ↑trust, ↑integrity",
                "category": "governance",
            },
            {
                "id": "policing_militarization",
                "name": "Police Militarization",
                "effects": "↓trust, ↓integrity, ↑corruption (harmful)",
                "category": "security",
            },
            {
                "id": "infrastructure_spend",
                "name": "Infrastructure Investment",
                "effects": "↑integrity, ↑trust, ↓unemployment",
                "category": "development",
            },
        ],
        "total": 8,
    }
