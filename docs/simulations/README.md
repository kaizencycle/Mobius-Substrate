# Mobius Systems Simulations

This directory contains simulation models and empirical tests for Mobius Systems resilience and behavior.

## Available Simulations

### Carrington-Class Failure Simulation

**File:** `carrington-event-failure-model.md` (documentation)  
**Script:** `carrington_sim.py` (executable)

**Purpose:** Tests whether 10% of DVA nodes can regrow the civilization substrate after 90% destruction.

**Usage:**
```bash
cd docs/simulations
python3 carrington_sim.py [options]

# Example with custom parameters
python3 carrington_sim.py --nodes 200 --collapse 0.95 --steps-before 2000
```

**Key Parameters:**
- `--nodes`: Total number of nodes (default: 100)
- `--collapse`: Fraction destroyed (default: 0.9)
- `--steps-before`: Baseline period (default: 1000)
- `--steps-after`: Isolation period (default: 1000)
- `--steps-recovery`: Recovery period (default: 1000)
- `--event-prob`: Event generation probability (default: 0.3)
- `--quiet`: Suppress progress output

**Success Criteria:**
- Ledger convergence > 95%
- MII stability ± 5%
- Zero corruption
- Recovery time < 1000 ticks

## Running Simulations

All simulation scripts are executable and can be run directly:

```bash
# Make executable (if needed)
chmod +x *.py

# Run simulation
./carrington_sim.py
```

## Output Format

Simulations output:
1. **Progress indicators** during each phase
2. **Summary statistics** (survivors, tier distribution)
3. **MII progression** (baseline → isolation → recovery)
4. **Ledger convergence** percentage
5. **Success/failure conclusion**

## Extending Simulations

To add new simulations:

1. Create a new Python script following the pattern in `carrington_sim.py`
2. Document the simulation model in a corresponding `.md` file
3. Add entry to this README
4. Include success criteria and interpretation guidelines

## Related Documentation

- [Digital Civilization Substrate](../09-research/whitepapers/digital-civilization-substrate.md) - Theoretical foundation
- [Carrington Event Failure Model](./carrington-event-failure-model.md) - Detailed specification

---

**© 2025 Mobius Systems Foundation**

*"We heal as we walk."*
