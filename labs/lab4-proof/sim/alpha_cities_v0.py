# lab4-proof/sim/alpha_cities_v0.py
# AlphaCivilization v0.1 - 3-City Civic Self-Play Simulator
# Mobius Systems - Cycle C-154
#
# "DeepMind built machine intelligence for games.
#  Mobius is building machine intelligence for civilizations."

from __future__ import annotations
from dataclasses import dataclass, asdict
from typing import Dict, List, Literal, Optional, Any
import uuid
import random
import logging

log = logging.getLogger("alpha_cities")


def _sanitize_log_str(value: Any) -> str:
    """Sanitize potentially unsafe strings for log output (strip CR/LF)."""
    if not isinstance(value, str):
        value = str(value)
    return value.replace("\n", "").replace("\r", "")


# Type aliases
CityId = Literal["A", "B", "C"]

# Action space for v0.1
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

ALL_ACTIONS: List[ActionId] = [
    "ubi_pilot",
    "progressive_tax_shift",
    "austerity_program",
    "green_investment",
    "education_boost",
    "corruption_crackdown",
    "policing_militarization",
    "infrastructure_spend",
]


# ---- Core data model ----

@dataclass
class CityState:
    """
    Represents the observable state of a city-state at time t.
    
    All metrics are normalized to 0-100 range.
    Higher values generally indicate better conditions, except for:
    - inequality (higher = worse)
    - unemployment (higher = worse)
    - corruption (higher = worse)
    - climate_risk (higher = worse)
    """
    integrity: float      # 0–100: Overall institutional soundness
    trust: float          # 0–100: Social capital and civic confidence
    inequality: float     # 0–100: Wealth/opportunity disparity (higher = worse)
    unemployment: float   # 0–100: Labor market dysfunction
    life_expectancy: float  # 0–100: Health and wellbeing proxy (scaled)
    corruption: float     # 0–100: Institutional rot risk
    climate_risk: float   # 0–100: Environmental vulnerability

    def clamp(self) -> "CityState":
        """Clamp all values to valid 0-100 range."""
        for field_name in self.__dataclass_fields__:
            v = getattr(self, field_name)
            v = max(0.0, min(100.0, v))
            setattr(self, field_name, v)
        return self

    def to_dict(self) -> Dict[str, float]:
        """Convert to dictionary."""
        return asdict(self)


def compute_mii(state: CityState) -> float:
    """
    Compute the Mobius Integrity Index (MII) for a city state.
    
    MII is a normalized score in [0, 1] representing overall civic health.
    This is the reward signal for the RL system.
    
    Formula:
    - Positive contributions: integrity, trust, life_expectancy
    - Negative contributions: inequality, unemployment, corruption
    - Climate risk as a modifier
    
    The weights are calibrated so that a "healthy" city scores ~0.90-0.95
    and a "failing" city scores ~0.70-0.80.
    """
    # Positive factors (scaled 0-1)
    positives = (
        0.25 * (state.integrity / 100.0)
        + 0.20 * (state.trust / 100.0)
        + 0.20 * (state.life_expectancy / 100.0)
    )

    # Negative factors (scaled 0-1, then subtracted)
    negatives = (
        0.15 * (state.inequality / 100.0)
        + 0.10 * (state.unemployment / 100.0)
        + 0.10 * (state.corruption / 100.0)
    )

    # Climate risk penalty (smaller weight)
    climate_penalty = 0.05 * (state.climate_risk / 100.0)

    # Raw MII can be negative in extreme cases
    raw = positives - negatives - climate_penalty
    
    # Shift and scale to [0, 1]
    # With current weights, raw ranges roughly from -0.35 to +0.65
    # We normalize to make typical values land around 0.85-0.95
    normalized = (raw + 0.40) / 1.05
    
    return max(0.0, min(1.0, normalized))


def apply_action(state: CityState, action: ActionId) -> CityState:
    """
    Apply a governance action to a city state and return the next state.
    
    This is a deterministic toy dynamics model. In later versions,
    this will be replaced or augmented by a learned world model (MuZero-style).
    
    Actions have realistic tradeoffs:
    - Pro-social actions (UBI, education) improve trust/integrity but have costs
    - Austerity damages trust and increases inequality
    - Corruption crackdowns are effective but may cause short-term turbulence
    - Policing militarization erodes trust significantly
    """
    s = CityState(**asdict(state))  # shallow copy

    if action == "ubi_pilot":
        # UBI: Reduces unemployment, builds trust, reduces inequality
        s.unemployment -= 3.0
        s.trust += 4.0
        s.inequality -= 2.0
        s.integrity += 1.0
        # Small fiscal pressure (not modeled directly)

    elif action == "progressive_tax_shift":
        # More progressive taxation: Reduces inequality, builds trust
        s.inequality -= 3.0
        s.integrity += 2.0
        s.trust += 1.0
        # Slight economic friction
        s.unemployment += 0.5

    elif action == "austerity_program":
        # Austerity: Often counterproductive in practice
        s.unemployment += 4.0
        s.trust -= 3.0
        s.inequality += 2.0
        s.integrity -= 2.0
        s.life_expectancy -= 1.0
        # Supposed to help, but usually doesn't

    elif action == "green_investment":
        # Climate adaptation: Long-term resilience
        s.climate_risk -= 4.0
        s.integrity += 2.0
        s.trust += 1.0
        # Creates some jobs
        s.unemployment -= 1.0

    elif action == "education_boost":
        # Human capital investment: Broad positive effects
        s.life_expectancy += 2.0
        s.trust += 2.0
        s.inequality -= 1.0
        s.integrity += 1.5
        # Future productivity (not directly modeled)

    elif action == "corruption_crackdown":
        # Anti-corruption enforcement: High impact, some disruption
        s.corruption -= 5.0
        s.trust += 3.0
        s.integrity += 2.0
        # Some short-term institutional friction
        s.unemployment += 0.5

    elif action == "policing_militarization":
        # Security theater: Trust-destroying
        s.trust -= 4.0
        s.integrity -= 3.0
        s.corruption += 1.0  # Can enable abuse
        # Minor decrease in some crime (not modeled)

    elif action == "infrastructure_spend":
        # Physical capital: Broad improvements
        s.integrity += 3.0
        s.trust += 1.0
        s.unemployment -= 1.5
        # Future growth enablement

    # Add small noise to avoid perfectly deterministic trajectories
    # This represents unmodeled exogenous factors
    s.trust += random.uniform(-0.5, 0.5)
    s.integrity += random.uniform(-0.5, 0.5)
    s.unemployment += random.uniform(-0.3, 0.3)
    s.climate_risk += random.uniform(-0.2, 0.2)

    return s.clamp()


# ---- Simulation core ----

@dataclass
class StepRecord:
    """Record of a single simulation step."""
    t: int
    states: Dict[CityId, Dict[str, float]]
    actions: Dict[CityId, ActionId]
    mii: Dict[CityId, float]
    rewards: Dict[CityId, float]


class AlphaCitiesSim:
    """
    AlphaCivilization v0.1 Simulator
    
    A minimal 3-city self-play engine for demonstrating RL concepts
    applied to civic governance. Each city independently chooses
    policies and evolves according to the world model.
    
    Key features:
    - State: CityState (7 metrics per city)
    - Actions: 8 governance interventions
    - Reward: ΔMII (change in Mobius Integrity Index)
    - Policy: Random (v0.1) or Sentinel quorum (future)
    
    Usage:
        sim = AlphaCitiesSim(steps=20)
        sim.run()
        results = sim.to_dict()
    """

    def __init__(
        self,
        steps: int = 20,
        policy_mode: str = "random",
        seed: Optional[int] = None,
    ):
        """
        Initialize a new simulation.
        
        Args:
            steps: Number of timesteps to simulate
            policy_mode: "random" or "sentinel" (sentinel not yet implemented)
            seed: Random seed for reproducibility
        """
        if seed is not None:
            random.seed(seed)
        
        self.sim_id: str = f"sim-{uuid.uuid4()}"
        self.steps: int = steps
        self.policy_mode: str = policy_mode
        self.current_step: int = 0

        # Initialize 3 city-states with diverse starting conditions
        # City A: Medium development, stable
        # City B: Lower development, higher inequality
        # City C: High development, low corruption
        self.initial_states: Dict[CityId, CityState] = {
            "A": CityState(
                integrity=70.0, trust=65.0, inequality=40.0,
                unemployment=8.0, life_expectancy=78.0,
                corruption=25.0, climate_risk=30.0
            ),
            "B": CityState(
                integrity=55.0, trust=50.0, inequality=60.0,
                unemployment=12.0, life_expectancy=74.0,
                corruption=45.0, climate_risk=45.0
            ),
            "C": CityState(
                integrity=80.0, trust=75.0, inequality=30.0,
                unemployment=5.0, life_expectancy=82.0,
                corruption=20.0, climate_risk=25.0
            ),
        }

        # Current states (will evolve)
        self.cities: Dict[CityId, CityState] = {
            cid: CityState(**asdict(s))
            for cid, s in self.initial_states.items()
        }

        # Trajectory log
        self.trajectory: List[StepRecord] = []

    @staticmethod
    def _all_actions() -> List[ActionId]:
        """Return all available actions."""
        return list(ALL_ACTIONS)

    def _choose_action(self, city_id: CityId, state: CityState) -> ActionId:
        """
        Choose an action for a city given its current state.
        
        v0.1: Random policy
        Future: Sentinel quorum policy via API call
        """
        if self.policy_mode == "sentinel":
            # TODO: Call Sentinel Policy API
            # For now, fall back to random
            log.warning(
                f"Sentinel mode not yet implemented, using random for city {city_id}"
            )
        
        return random.choice(self._all_actions())

    def run(self) -> None:
        """
        Execute the full simulation.
        
        For each timestep:
        1. Record current MII for all cities
        2. Each city chooses an action
        3. Apply actions to get next states
        4. Compute rewards (ΔMII)
        5. Log the step
        """
        # Compute initial MII
        prev_mii: Dict[CityId, float] = {
            cid: compute_mii(s) for cid, s in self.cities.items()
        }

        for t in range(self.steps):
            self.current_step = t
            actions: Dict[CityId, ActionId] = {}
            next_states: Dict[CityId, CityState] = {}
            rewards: Dict[CityId, float] = {}
            mii: Dict[CityId, float] = {}

            # Each city chooses an action
            for cid, state in self.cities.items():
                actions[cid] = self._choose_action(cid, state)

            # Apply actions and compute new states/rewards
            for cid, state in self.cities.items():
                ns = apply_action(state, actions[cid])
                next_states[cid] = ns
                mii[cid] = compute_mii(ns)
                rewards[cid] = mii[cid] - prev_mii[cid]

            # Log this step
            self.trajectory.append(StepRecord(
                t=t,
                states={cid: asdict(s) for cid, s in self.cities.items()},
                actions=actions,
                mii=prev_mii.copy(),
                rewards=rewards,
            ))

            # Update for next step
            self.cities = next_states
            prev_mii = mii

        log.info(
            f"Simulation {_sanitize_log_str(self.sim_id)} completed: {_sanitize_log_str(self.steps)} steps"
        )

    def get_global_integrity(self) -> float:
        """
        Compute Global Integrity (GI) as the average MII across all cities.
        """
        mii_values = [compute_mii(s) for s in self.cities.values()]
        return sum(mii_values) / len(mii_values) if mii_values else 0.0

    def to_dict(self) -> Dict[str, Any]:
        """
        Export simulation results as a dictionary.
        
        This format is suitable for:
        - API responses
        - Civic Ledger events
        - Analysis and visualization
        """
        final_mii = {cid: compute_mii(s) for cid, s in self.cities.items()}
        initial_mii = {
            cid: compute_mii(s) for cid, s in self.initial_states.items()
        }

        # Build MII series for each city
        mii_series: Dict[CityId, List[float]] = {"A": [], "B": [], "C": []}
        for step in self.trajectory:
            for cid in mii_series:
                mii_series[cid].append(step.mii.get(cid, 0.0))
        # Add final values
        for cid in mii_series:
            mii_series[cid].append(final_mii[cid])

        # Build GI series
        gi_series = []
        for i in range(len(self.trajectory) + 1):
            if i < len(self.trajectory):
                gi = sum(self.trajectory[i].mii.values()) / 3
            else:
                gi = sum(final_mii.values()) / 3
            gi_series.append(round(gi, 4))

        return {
            "sim_id": self.sim_id,
            "version": "v0.1",
            "steps": self.steps,
            "policy_mode": self.policy_mode,
            "trajectory": [
                {
                    "t": step.t,
                    "states": step.states,
                    "actions": step.actions,
                    "mii": step.mii,
                    "rewards": step.rewards,
                }
                for step in self.trajectory
            ],
            "initial_states": {
                cid: asdict(s) for cid, s in self.initial_states.items()
            },
            "final_states": {cid: asdict(s) for cid, s in self.cities.items()},
            "initial_mii": initial_mii,
            "final_mii": final_mii,
            "mii_series": mii_series,
            "gi_series": gi_series,
            "gi_final": round(self.get_global_integrity(), 4),
        }


# ---- CLI entry point ----

if __name__ == "__main__":
    print("=" * 60)
    print("AlphaCivilization v0.1 - 3-City Civic Self-Play")
    print("Mobius Systems - Cycle C-154")
    print("=" * 60)
    print()
    
    # Run a quick simulation
    sim = AlphaCitiesSim(steps=10, seed=42)
    sim.run()
    data = sim.to_dict()
    
    print(f"Simulation ID: {data['sim_id']}")
    print(f"Steps: {data['steps']}")
    print(f"Policy Mode: {data['policy_mode']}")
    print()
    
    print("Final Results:")
    print("-" * 40)
    for cid in ["A", "B", "C"]:
        initial = data["initial_mii"][cid]
        final = data["final_mii"][cid]
        delta = final - initial
        status = "↑" if delta > 0 else "↓" if delta < 0 else "→"
        print(f"City {cid}: MII {initial:.3f} → {final:.3f} ({status} {delta:+.3f})")
    
    print()
    print(f"Global Integrity (GI): {data['gi_final']:.3f}")
    target = 0.95
    if data['gi_final'] >= target:
        print(f"✅ Target MII ≥ {target} ACHIEVED")
    else:
        print(f"⚠️  Below target MII {target}")
    
    print()
    print("Sample Trajectory (first 3 steps):")
    print("-" * 40)
    for step in data["trajectory"][:3]:
        print(f"t={step['t']}: Actions = {step['actions']}, Rewards = {{", end="")
        rewards_str = ", ".join(
            f"{k}: {v:+.4f}" for k, v in step["rewards"].items()
        )
        print(f"{rewards_str}}}")
    
    print()
    print("Trinity Seal: JADE 🟣 • AUREA 🔵 • ATLAS ⚪ • ECHO 🟡")
    print('"Integrity above acceleration."')
