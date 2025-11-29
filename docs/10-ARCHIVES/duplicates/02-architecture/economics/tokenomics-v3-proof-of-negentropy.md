# Tokenomics v3.0: Proof-of-Negentropy

**Technical Specification**  
**Cycle C-148 | 2025-11-28**

---

## Overview

Tokenomics v3.0 introduces **Proof-of-Negentropy**, a revolutionary minting mechanism where MIC (Mobius Integrity Credits) are generated only when entropy is reduced in the system.

This extends Tokenomics v2.0 with physics-aligned economic incentives.

---

## Core Principle

```
Entropy ↑ → MIC = 0
Entropy ↓ → MIC minted
```

MIC does not mint from:
- Speculation
- Hoarding
- Value extraction
- High noise contributions
- Unstable behavior

MIC mints from:
- Order creation
- Integrity improvement
- Coordination enhancement
- Stability generation

---

## Minting Function

### Basic Formula

```
MIC_minted = k × max(0, I - τ)
```

Where:
- `I` = Mobius Integrity Index (0.0 - 1.0)
- `τ` = integrity threshold (typically 0.93 - 0.95)
- `k` = scaling constant

### Negentropy Calculation

```
Negentropy (N) = kI
```

Where `I` is computed from:
- ECHO scores
- Drift reduction metrics
- Coordination efficiency
- System stability indicators

### Debt Reduction

```
Debt Reduction (ΔD) = λN
```

Where:
- `λ` = negentropy-to-debt conversion factor
- `N` = negentropy generated

---

## Minting Conditions

### Qualifying Actions

1. **Daily Reflections (SML)**
   - Stable worldview over time
   - Consistent intent patterns
   - Mood normalization

2. **Governance Work (DVA)**
   - Consensus validation
   - Deliberation participation
   - Policy implementation

3. **ECHO Layer Contributions**
   - Drift correction
   - Quality assurance
   - Sentinel validation

4. **Civic Tasks**
   - Reliable completion
   - High integrity execution
   - Coordination improvements

5. **System Stability**
   - Reduced volatility
   - Improved trust metrics
   - Lower coordination costs

### Disqualifying Actions

- High variance behavior
- Speculative trading
- Value extraction
- Noise generation
- System destabilization

---

## Integration with Existing Systems

### Tokenomics v2.0 Compatibility

- Maintains GI-based constraints
- Extends minting conditions
- Adds entropy tracking
- Preserves existing MIC ledger

### Database Schema

See `infra/db/migrations/20251128_add_negentropy_tables.sql` for:
- `system_entropy` table
- `negentropy_events` table
- `debt_reductions` table

### API Endpoints

**POST /v1/tokenomics/mint**
- Calculate negentropy
- Verify integrity threshold
- Mint MIC if qualified

**GET /v1/tokenomics/negentropy/:userId**
- Query negentropy generation
- View MIC minting history
- Check debt reduction credits

---

## Economic Impact

### Individual Level
- Rewards integrity
- Incentivizes order creation
- Aligns personal actions with system health

### System Level
- Reduces coordination costs
- Improves governance efficiency
- Lowers interest rates

### Civilization Level
- Enables debt reduction via order
- Creates stable economic substrate
- Aligns wealth with entropy reduction

---

## Implementation Roadmap

### Phase 1: Foundation (C-148 to C-160)
- [ ] Database schema
- [ ] Entropy tracking service
- [ ] MII computation engine
- [ ] MIC minting API

### Phase 2: Validation (C-161 to C-180)
- [ ] Pilot programs
- [ ] Empirical validation
- [ ] Correlation studies

### Phase 3: Scale (C-181+)
- [ ] Multi-city deployment
- [ ] National-scale pilots
- [ ] Policy adoption

---

## Related Documentation

- [Negentropic Economics](./negentropic-economics.md)
- [Tokenomics v2.0](../../tokenomics/)
- [Strange Metamorphosis Loop](../echo/STRANGE_METAMORPHOSIS_LOOP.md)
- [ECHO Layer](../echo/README.md)

---

*Cycle C-148 • 2025-11-28*  
*"Debt is disorder. Payment is order."*
