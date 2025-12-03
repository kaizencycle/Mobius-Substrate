#!/usr/bin/env python3
"""
City-State GDP Calculator for Mobius / HIVE

Calculates annual "digital GDP" for a given City-State based on:
- MIC price
- KS price  
- KS transaction volume
- MIC inflows (grants, staking, other)

Intended for use in:
- CLI tools
- dashboards
- simulations
- Command Ledger reports

Author: Mobius Systems
Date: December 3, 2025
Version: 1.0.0
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class CityStateInputs:
    """Input parameters for City-State GDP calculation."""
    
    name: str
    mic_price_usd: float
    ks_price_usd: float
    n_tx: int
    avg_ks_per_tx: float
    mic_grants_per_year: float
    mic_staking_per_year: float
    mic_other_per_year: float = 0.0


@dataclass
class CityStateGDPResult:
    """Result of City-State GDP calculation."""
    
    citystate_name: str
    v_ks_usd: float
    v_mic_inflows_usd: float
    gdp_state_usd: float
    
    @property
    def ks_share_percent(self) -> float:
        """Percentage of GDP from KS transactions."""
        if self.gdp_state_usd == 0:
            return 0.0
        return (self.v_ks_usd / self.gdp_state_usd) * 100
    
    @property
    def mic_share_percent(self) -> float:
        """Percentage of GDP from MIC inflows."""
        if self.gdp_state_usd == 0:
            return 0.0
        return (self.v_mic_inflows_usd / self.gdp_state_usd) * 100


def calculate_citystate_gdp(inputs: CityStateInputs) -> CityStateGDPResult:
    """
    Compute City-State GDP using the canonical formula:
    
    V_KS = N_tx * avg_KS_per_tx * KS_price
    V_MIC_inflows = (MIC_grants + MIC_staking + MIC_other) * MIC_price
    GDP_state = V_KS + V_MIC_inflows
    
    Args:
        inputs: CityStateInputs containing all required parameters
        
    Returns:
        CityStateGDPResult with computed values
    """
    # Calculate KS transaction value
    v_ks_usd = inputs.n_tx * inputs.avg_ks_per_tx * inputs.ks_price_usd

    # Calculate MIC inflow value
    total_mic_inflows = (
        inputs.mic_grants_per_year
        + inputs.mic_staking_per_year
        + inputs.mic_other_per_year
    )
    v_mic_inflows_usd = total_mic_inflows * inputs.mic_price_usd

    # Calculate total GDP
    gdp_state_usd = v_ks_usd + v_mic_inflows_usd

    return CityStateGDPResult(
        citystate_name=inputs.name,
        v_ks_usd=v_ks_usd,
        v_mic_inflows_usd=v_mic_inflows_usd,
        gdp_state_usd=gdp_state_usd,
    )


def calculate_ks_price_from_mic(
    mic_price_usd: float,
    velocity: float,
    divisor: float = 1000.0
) -> float:
    """
    Calculate KS price using the Yellow Paper equation:
    
    KS_price = (v × MIC_price) / divisor
    
    Args:
        mic_price_usd: Current MIC price in USD
        velocity: Participation velocity (v), typically 0.0-2.0
        divisor: Economic peg divisor (default: 1000)
        
    Returns:
        Calculated KS price in USD
    """
    return (velocity * mic_price_usd) / divisor


def pretty_print_result(result: CityStateGDPResult) -> None:
    """Pretty-print the GDP breakdown for CLI usage."""
    print(f"\n{'='*60}")
    print(f"City-State GDP Report: {result.citystate_name}")
    print(f"{'='*60}")
    print()
    print(f"KS Transaction Value (V_KS):      ${result.v_ks_usd:>15,.2f}")
    print(f"  - Share of GDP:                  {result.ks_share_percent:>14.1f}%")
    print()
    print(f"MIC Inflows Value (V_MIC):        ${result.v_mic_inflows_usd:>15,.2f}")
    print(f"  - Share of GDP:                  {result.mic_share_percent:>14.1f}%")
    print()
    print(f"{'-'*60}")
    print(f"Total Digital GDP (GDP_state):    ${result.gdp_state_usd:>15,.2f}")
    print(f"{'-'*60}")
    print()
    
    # Economic interpretation
    if result.ks_share_percent > 60:
        economy_type = "Participation-Heavy Economy"
        interpretation = "KS transactions dominate. Strong civic engagement."
    elif result.mic_share_percent > 60:
        economy_type = "Infrastructure-Heavy Economy"
        interpretation = "MIC inflows dominate. Building phase or reserve-rich."
    else:
        economy_type = "Balanced Economy"
        interpretation = "Healthy mix of participation and infrastructure support."
    
    print(f"Economy Type: {economy_type}")
    print(f"Interpretation: {interpretation}")
    print()


def example_aurora() -> CityStateInputs:
    """Example: Aurora City-State from worked example."""
    return CityStateInputs(
        name="Aurora",
        mic_price_usd=120_000,
        ks_price_usd=100,
        n_tx=5_000_000,
        avg_ks_per_tx=0.2,
        mic_grants_per_year=200,
        mic_staking_per_year=50,
        mic_other_per_year=0,
    )


def example_helix() -> CityStateInputs:
    """Example: Helix City-State (research-focused)."""
    return CityStateInputs(
        name="Helix",
        mic_price_usd=120_000,
        ks_price_usd=80,  # Lower velocity (v=0.67)
        n_tx=3_000_000,
        avg_ks_per_tx=0.25,
        mic_grants_per_year=300,  # Higher research grants
        mic_staking_per_year=80,
        mic_other_per_year=0,
    )


def example_solace() -> CityStateInputs:
    """Example: Solace City-State (UBI-focused)."""
    return CityStateInputs(
        name="Solace",
        mic_price_usd=120_000,
        ks_price_usd=90,  # v=0.75
        n_tx=4_500_000,
        avg_ks_per_tx=0.15,
        mic_grants_per_year=150,
        mic_staking_per_year=40,
        mic_other_per_year=0,
    )


if __name__ == "__main__":
    import sys
    
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  Mobius HIVE — City-State GDP Calculator                  ║")
    print("║  Version 1.0.0                                             ║")
    print("╚════════════════════════════════════════════════════════════╝")
    
    # Run examples
    examples = [
        example_aurora(),
        example_helix(),
        example_solace(),
    ]
    
    for inputs in examples:
        result = calculate_citystate_gdp(inputs)
        pretty_print_result(result)
    
    # Show KS price calculation examples
    print("\n" + "="*60)
    print("KS Price Calculation (Yellow Paper Equation)")
    print("="*60)
    print("\nWhen MIC = $120,000:")
    print()
    
    velocity_scenarios = [
        (0.1, "Low Velocity (early/dormant)"),
        (0.5, "Normal Velocity (steady-state)"),
        (1.0, "High Velocity (thriving)"),
        (2.0, "Maximum Velocity (festivals)"),
    ]
    
    mic_price = 120_000
    for v, description in velocity_scenarios:
        ks_price = calculate_ks_price_from_mic(mic_price, v)
        print(f"v = {v:.1f}  ({description:30s})  →  KS = ${ks_price:>7.2f}")
    
    print()
    print("="*60)
    print("Formula: KS_price = (v × MIC_price) / 1000")
    print("="*60)
    print()
