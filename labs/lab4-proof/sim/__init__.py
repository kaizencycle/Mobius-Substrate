# AlphaCivilization Simulation Module
# Mobius Systems - Lab4 Proof
# Cycle: C-154

"""
AlphaCivilization v0.1 - Reinforcement Learning for Civilization

This module provides the core simulation engine for 3-city civic self-play,
demonstrating RL concepts applied to governance and integrity optimization.
"""

from .alpha_cities_v0 import (
    CityState,
    compute_mii,
    apply_action,
    AlphaCitiesSim,
    CityId,
    ActionId,
)

__all__ = [
    "CityState",
    "compute_mii",
    "apply_action",
    "AlphaCitiesSim",
    "CityId",
    "ActionId",
]
