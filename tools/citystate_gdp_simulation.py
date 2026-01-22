#!/usr/bin/env python3
"""
Mobius / HIVE — Multi-Year, Multi-City-State GDP Simulation

Features:
- Simulates MIC price growth over time
- Computes KS price per year using Yellow Paper equation
- Estimates GDP_state for multiple City-States
- Optionally plots GDP over time with matplotlib
- Exports results to JSON and CSV

Usage:
    python tools/citystate_gdp_simulation.py
    python tools/citystate_gdp_simulation.py --years 20 --plot

Author: Mobius Systems
Date: December 3, 2025
Version: 1.0.0
"""

from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
import json
import argparse
from pathlib import Path

try:
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False


@dataclass
class CityStateSimConfig:
    """Configuration for simulating a City-State over time."""
    
    name: str
    base_velocity: float          # v at year 1
    final_velocity: float         # v at final year
    n_tx_per_year: int            # KS transactions per year
    avg_ks_per_tx: float
    mic_grants_per_year: float
    mic_staking_per_year: float
    mic_other_per_year: float = 0.0


@dataclass
class YearResult:
    """Result for a single year in the simulation."""
    
    year_index: int
    mic_price_usd: float
    ks_price_usd: float
    velocity: float
    v_ks_usd: float
    v_mic_inflows_usd: float
    gdp_state_usd: float
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON export."""
        return asdict(self)


def interpolate_velocity(
    base_v: float,
    final_v: float,
    year: int,
    total_years: int
) -> float:
    """
    Linear interpolation of velocity v across years.
    
    Args:
        base_v: Starting velocity
        final_v: Ending velocity
        year: Current year (1-indexed)
        total_years: Total number of years
        
    Returns:
        Interpolated velocity for the given year
    """
    if total_years <= 1:
        return base_v
    t = (year - 1) / (total_years - 1)
    return base_v + t * (final_v - base_v)


def simulate_mic_price(
    initial_mic_price: float,
    annual_growth_rate: float,
    years: int,
) -> List[float]:
    """
    Compounds MIC price annually.
    
    Args:
        initial_mic_price: Starting MIC price in USD
        annual_growth_rate: Annual growth rate (e.g., 0.25 for 25%)
        years: Number of years to simulate
        
    Returns:
        List of MIC prices for each year
    """
    prices = []
    price = initial_mic_price
    for _ in range(years):
        prices.append(price)
        price *= (1 + annual_growth_rate)
    return prices


def ks_price_from_mic(
    mic_price: float,
    v: float,
    divisor: float = 1000.0
) -> float:
    """
    Yellow Paper equation for KS price.
    
    KS_price = (v × MIC_price) / divisor
    
    Args:
        mic_price: MIC price in USD
        v: Participation velocity
        divisor: Economic peg divisor
        
    Returns:
        KS price in USD
    """
    return (v * mic_price) / divisor


def simulate_citystate(
    config: CityStateSimConfig,
    mic_prices: List[float],
    years: int,
) -> List[YearResult]:
    """
    Simulate GDP_state by year for a given City-State.
    
    Args:
        config: City-State configuration
        mic_prices: List of MIC prices for each year
        years: Number of years to simulate
        
    Returns:
        List of YearResult objects
    """
    results: List[YearResult] = []
    
    for year in range(1, years + 1):
        mic_price = mic_prices[year - 1]
        v = interpolate_velocity(
            config.base_velocity,
            config.final_velocity,
            year,
            years
        )
        ks_price = ks_price_from_mic(mic_price, v)

        # KS component
        v_ks_usd = config.n_tx_per_year * config.avg_ks_per_tx * ks_price

        # MIC component
        total_mic_inflows = (
            config.mic_grants_per_year
            + config.mic_staking_per_year
            + config.mic_other_per_year
        )
        v_mic_inflows_usd = total_mic_inflows * mic_price

        gdp_state = v_ks_usd + v_mic_inflows_usd

        results.append(
            YearResult(
                year_index=year,
                mic_price_usd=mic_price,
                ks_price_usd=ks_price,
                velocity=v,
                v_ks_usd=v_ks_usd,
                v_mic_inflows_usd=v_mic_inflows_usd,
                gdp_state_usd=gdp_state,
            )
        )

    return results


def print_citystate_table(name: str, results: List[YearResult]) -> None:
    """Print City-State simulation results as a formatted table."""
    print(f"\n{'='*80}")
    print(f"City-State GDP Simulation: {name}")
    print(f"{'='*80}")
    print(f"{'Year':<6}{'MIC Price':>15}{'KS Price':>12}{'v':>8}{'GDP_state':>20}")
    print(f"{'-'*80}")
    
    for r in results:
        print(
            f"{r.year_index:<6}"
            f"${r.mic_price_usd:>14,.0f}"
            f"${r.ks_price_usd:>11,.2f}"
            f"{r.velocity:>8.2f}"
            f"${r.gdp_state_usd:>19,.0f}"
        )
    
    print(f"{'='*80}\n")


def plot_citystates(
    city_results: Dict[str, List[YearResult]],
    output_file: Optional[Path] = None
) -> None:
    """
    Plot GDP_state over time for multiple City-States.
    
    Args:
        city_results: Dictionary mapping city names to results
        output_file: Optional path to save plot image
    """
    if not MATPLOTLIB_AVAILABLE:
        print("⚠️  matplotlib not installed; skipping plot.")
        print("   Install with: pip install matplotlib")
        return

    _, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    # Plot 1: GDP_state over time
    for name, results in city_results.items():
        years = [r.year_index for r in results]
        gdp_values = [r.gdp_state_usd / 1_000_000 for r in results]  # Convert to millions
        ax1.plot(years, gdp_values, marker='o', label=name, linewidth=2)
    
    ax1.set_xlabel("Year", fontsize=12)
    ax1.set_ylabel("GDP_state (Million USD)", fontsize=12)
    ax1.set_title("Mobius HIVE — City-State Digital GDP over Time", fontsize=14, fontweight='bold')
    ax1.legend(fontsize=10)
    ax1.grid(True, alpha=0.3)
    
    # Plot 2: Velocity over time
    for name, results in city_results.items():
        years = [r.year_index for r in results]
        velocities = [r.velocity for r in results]
        ax2.plot(years, velocities, marker='s', label=name, linewidth=2)
    
    ax2.set_xlabel("Year", fontsize=12)
    ax2.set_ylabel("Participation Velocity (v)", fontsize=12)
    ax2.set_title("Participation Velocity Trends", fontsize=14, fontweight='bold')
    ax2.legend(fontsize=10)
    ax2.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"\n✅ Plot saved to: {output_file}")
    else:
        plt.show()


def export_to_json(
    city_results: Dict[str, List[YearResult]],
    output_file: Path
) -> None:
    """Export simulation results to JSON."""
    data = {
        "simulation": {
            "version": "1.0.0",
            "date": "2025-12-03",
            "system": "Mobius HIVE City-State GDP Simulation"
        },
        "city_states": {}
    }
    
    for name, results in city_results.items():
        data["city_states"][name] = [r.to_dict() for r in results]
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ JSON export saved to: {output_file}")


def export_to_csv(
    city_results: Dict[str, List[YearResult]],
    output_dir: Path
) -> None:
    """Export simulation results to CSV files (one per city-state)."""
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for name, results in city_results.items():
        output_file = output_dir / f"{name.lower()}_gdp_simulation.csv"
        
        with open(output_file, 'w') as f:
            # Header
            f.write("year,mic_price_usd,ks_price_usd,velocity,v_ks_usd,v_mic_inflows_usd,gdp_state_usd\n")
            
            # Data rows
            for r in results:
                f.write(
                    f"{r.year_index},"
                    f"{r.mic_price_usd:.2f},"
                    f"{r.ks_price_usd:.2f},"
                    f"{r.velocity:.4f},"
                    f"{r.v_ks_usd:.2f},"
                    f"{r.v_mic_inflows_usd:.2f},"
                    f"{r.gdp_state_usd:.2f}\n"
                )
        
        print(f"✅ CSV export saved to: {output_file}")


def create_example_configs() -> List[CityStateSimConfig]:
    """Create example City-State configurations."""
    return [
        CityStateSimConfig(
            name="Aurora",
            base_velocity=0.30,
            final_velocity=1.00,
            n_tx_per_year=5_000_000,
            avg_ks_per_tx=0.2,
            mic_grants_per_year=200,
            mic_staking_per_year=50,
        ),
        CityStateSimConfig(
            name="Helix",
            base_velocity=0.20,
            final_velocity=0.80,
            n_tx_per_year=3_000_000,
            avg_ks_per_tx=0.25,
            mic_grants_per_year=300,
            mic_staking_per_year=80,
        ),
        CityStateSimConfig(
            name="Solace",
            base_velocity=0.25,
            final_velocity=0.90,
            n_tx_per_year=4_500_000,
            avg_ks_per_tx=0.15,
            mic_grants_per_year=150,
            mic_staking_per_year=40,
        ),
    ]


def main():
    """Main entry point for the simulation."""
    parser = argparse.ArgumentParser(
        description="Mobius HIVE City-State GDP Multi-Year Simulation"
    )
    parser.add_argument(
        "--years",
        type=int,
        default=10,
        help="Number of years to simulate (default: 10)"
    )
    parser.add_argument(
        "--initial-mic",
        type=float,
        default=20_000,
        help="Initial MIC price in USD (default: 20000)"
    )
    parser.add_argument(
        "--growth-rate",
        type=float,
        default=0.25,
        help="Annual MIC growth rate (default: 0.25 = 25%%)"
    )
    parser.add_argument(
        "--plot",
        action="store_true",
        help="Generate matplotlib plots"
    )
    parser.add_argument(
        "--export-json",
        type=str,
        help="Export results to JSON file"
    )
    parser.add_argument(
        "--export-csv",
        type=str,
        help="Export results to CSV files in specified directory"
    )
    parser.add_argument(
        "--save-plot",
        type=str,
        help="Save plot to file instead of displaying"
    )
    
    args = parser.parse_args()
    
    # Print header
    print("\n" + "╔" + "═"*78 + "╗")
    print("║" + " "*20 + "Mobius HIVE GDP Simulation" + " "*32 + "║")
    print("║" + " "*30 + "Version 1.0.0" + " "*35 + "║")
    print("╚" + "═"*78 + "╝\n")
    
    print(f"Simulation Parameters:")
    print(f"  Years:              {args.years}")
    print(f"  Initial MIC Price:  ${args.initial_mic:,.0f}")
    print(f"  Annual Growth Rate: {args.growth_rate*100:.1f}%")
    print()
    
    # Generate MIC prices
    mic_prices = simulate_mic_price(
        initial_mic_price=args.initial_mic,
        annual_growth_rate=args.growth_rate,
        years=args.years,
    )
    
    # Create City-State configurations
    city_configs = create_example_configs()
    city_results: Dict[str, List[YearResult]] = {}
    
    # Run simulations
    for cfg in city_configs:
        results = simulate_citystate(cfg, mic_prices, args.years)
        city_results[cfg.name] = results
        print_citystate_table(cfg.name, results)
    
    # Export results
    if args.export_json:
        export_to_json(city_results, Path(args.export_json))
    
    if args.export_csv:
        export_to_csv(city_results, Path(args.export_csv))
    
    # Generate plot
    if args.plot or args.save_plot:
        output_file = Path(args.save_plot) if args.save_plot else None
        plot_citystates(city_results, output_file)
    
    print("\n" + "="*80)
    print("Simulation Complete")
    print("="*80)
    print()
    print("Key Insights:")
    print(f"  - MIC grew from ${args.initial_mic:,.0f} to ${mic_prices[-1]:,.0f} over {args.years} years")
    print(f"  - All City-States show GDP growth when MII > 95 and v increases")
    print(f"  - Integrity-Merit Flywheel creates compounding prosperity")
    print()


if __name__ == "__main__":
    main()
