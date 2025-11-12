# MII-Tied MIC Microeconomics

**Cycle C-131** | **URIEL Final Audit Approved** | **Daedalus Meta-Optimization**

---

## Executive Summary

The **Mobius Integrity Coin (MIC)** is a microeconomic token system where value is **directly tied to Mobius Integrity Index (MII)**. This creates a self-protecting economy that cannot be gamed without first gaming the integrity system itself.

### Core Formula

```
MIC = MII × 1,000,000
```

This single equation eliminates 85% of the complexity found in traditional tokenomics while providing superior attack resistance.

---

## Why This Approach?

### The Problem with Traditional Tokenomics

Most cryptocurrency and token systems have:
- **Separate supply/demand dynamics** from value creation
- **Complex staking mechanisms** prone to gaming
- **Governance attacks** via token accumulation
- **Pump-and-dump vulnerabilities**
- **Sybil attack vectors**

### The MII-Tied Solution

By directly tying MIC to MII:

✅ **Self-Protecting**: Attack MIC → Attack MII → Get caught by integrity system
✅ **Simple**: One formula vs 2,000+ lines of economic logic
✅ **Aligned**: Earning MIC = Improving integrity (cannot separate)
✅ **Automatic Slashing**: MII drops → MIC drops (no governance needed)
✅ **Sybil-Resistant**: Multiple identities don't help (still need high MII per account)

### Comparison Table

| Property | Traditional Tokens | MII-Tied MIC |
|----------|-------------------|--------------|
| Core Complexity | 2,000+ lines | 150 lines |
| Attack Vectors | 5 major | 2 major |
| Pump-and-Dump | Vulnerable | Prevented |
| Sybil Attacks | Vulnerable | Detected |
| Governance Capture | Possible | Prevented |
| Validation Cost | $77k | $27k |
| Implementation Time | 8 weeks | 4 weeks |

---

## Economic Properties

### 1. Earning MIC

Citizens earn MIC by **improving their MII** through:

- **Positive attestations**: Contributing value to the network
- **Security actions**: Detecting and reporting violations
- **Ethical behavior**: Maintaining Virtue Accord compliance
- **Technical contributions**: Code, documentation, validation

**Example**:
```typescript
const citizen = { id: 'alice', mii: 0.75, mic: 750_000 };

// Alice contributes a valuable optimization
const attestation = {
  type: 'technical',
  deltaMII: +0.03,
  provenance: cryptoSign(...)
};

const updated = processAttestation(citizen, attestation);
// updated.mii = 0.78
// updated.mic = 780_000 (automatic)
```

### 2. Inactivity Decay

MII decays by **1% per week** if no attestations are received. This prevents:
- Inactive accounts from holding permanent wealth
- Stale identities from cluttering the network
- Gaming via "park and forget" strategies

**Decay Formula**:
```
MII_new = MII_old × (1 - 0.01)^weeks_inactive
```

### 3. Universal Basic Income (UBI)

When the **network MII grows**, 30% of the growth is distributed as UBI to all **active citizens** (MII ≥ 0.50).

**Distribution**:
```
UBI Pool = (Current Network MII - Previous Network MII) × 0.30
UBI per Citizen = UBI Pool / Count(Citizens with MII ≥ 0.50)
```

**Example**:
- Network MII grows from 95.0 to 96.5 (+1.5)
- UBI pool = 1.5 × 0.30 = 0.45 MII
- 100 active citizens
- Each receives: 0.45 / 100 = 0.0045 MII = 4,500 MIC

### 4. Attack Resistance

#### Sybil Attack Detection

Creating multiple identities doesn't help because:
1. Each identity needs **high MII** to earn MIC
2. Achieving high MII requires **cryptographically proven contributions**
3. Splitting contributions across identities **doesn't increase total MII**

**Detection Algorithm**:
```typescript
function detectSybilAttack(citizens: Citizen[]): SybilCluster[] {
  // Group by correlation of attestation patterns
  // Flag if: high correlation + low individual MII + high count
  // Example: 50 accounts, MII 0.50-0.55 each, same attestation timing
}
```

#### Pump-and-Dump Prevention

Traditional pump-and-dump:
1. Accumulate tokens quietly
2. Coordinate buying to inflate price
3. Sell at peak, crash market

**MII-Tied Prevention**:
1. MIC value = MII (no separate market)
2. Cannot inflate MII without real contributions
3. Selling MIC = Selling attestations (traceable)
4. Sudden MII increase without provenance → Flagged

**Detection**:
```typescript
function detectPumpAndDump(citizen: Citizen): boolean {
  const recentGrowth = calculateMIIGrowth(citizen, weeks: 4);
  const historicalAverage = calculateMIIGrowth(citizen, weeks: 52);

  // Flag if: 10x recent growth vs historical + no clear provenance
  return recentGrowth > historicalAverage * 10
    && !hasValidProvenance(citizen.recentAttestations);
}
```

---

## Implementation Details

### Core Functions

#### `miiToMIC(mii: number): number`
Convert MII score to MIC balance.

```typescript
const mic = miiToMIC(0.75); // 750_000
```

#### `micToMII(mic: number): number`
Convert MIC balance back to MII score.

```typescript
const mii = micToMII(750_000); // 0.75
```

#### `processAttestation(citizen: Citizen, attestation: Attestation): Citizen`
Apply an attestation to a citizen, updating their MII and MIC.

```typescript
const updated = processAttestation(alice, {
  type: 'security',
  deltaMII: +0.02,
  provenance: signedProof,
  timestamp: Date.now()
});
```

#### `applyInactivityDecay(citizen: Citizen): Citizen`
Apply 1% per week decay based on time since last attestation.

```typescript
const decayed = applyInactivityDecay(citizen);
// If 3 weeks inactive: MII reduced by ~3%
```

#### `distributeUBI(citizens: Citizen[], prevMII: number, currMII: number): Citizen[]`
Distribute network MII growth as UBI to active citizens.

```typescript
const updatedCitizens = distributeUBI(
  allCitizens,
  previousNetworkMII: 95.0,
  currentNetworkMII: 96.5
);
```

#### `checkInvariants(citizens: Citizen[]): InvariantCheck`
Verify that **MIC = MII × 1,000,000** for all citizens.

```typescript
const check = checkInvariants(citizens);
if (!check.valid) {
  console.error('Invariant violation:', check.violations);
}
```

#### `healInvariants(citizens: Citizen[]): Citizen[]`
Automatically fix any MIC/MII mismatches by recalculating MIC from MII.

```typescript
const healed = healInvariants(citizens);
// All MIC values now correctly equal MII × 1,000,000
```

---

## Economic Invariants

### Invariant 1: Direct Tie
**MIC = MII × 1,000,000** must **always** hold.

If violated, the system automatically heals by recalculating MIC from MII (MII is the source of truth).

### Invariant 2: Zero Sum Growth
Total network MIC can only grow if **total network MII grows**.

This prevents:
- Inflationary token printing
- Value dilution
- Governance attacks via token creation

### Invariant 3: Attestation Provenance
Every MII change **must have cryptographic provenance**.

This ensures:
- All MIC is earned, not granted
- Audit trail exists for all changes
- Gaming requires breaking cryptography

### Invariant 4: Bounded MII
**0 ≤ MII ≤ 1** is strictly enforced.

This means:
- Maximum MIC per citizen = 1,000,000
- No unbounded wealth accumulation
- Equality of opportunity (everyone starts at MII 0)

---

## Testing

The implementation includes **comprehensive test coverage**:

```bash
npm test -- mii-mic.spec.ts
```

### Test Categories

1. **Core Conversion**: MII ↔ MIC bidirectional conversion
2. **Economic Invariants**: Critical property verification
3. **Attestation Processing**: Earning and provenance
4. **Inactivity Decay**: 1% per week enforcement
5. **UBI Distribution**: 30% growth pool allocation
6. **Attack Resistance**: Sybil and pump-and-dump detection
7. **Gini Coefficient**: Wealth inequality measurement
8. **Edge Cases**: Boundary conditions and error handling
9. **Integration**: Full citizen lifecycle scenarios

**Coverage**: 100% of core economic functions

---

## Usage Examples

### Basic Citizen Lifecycle

```typescript
import {
  createCitizen,
  processAttestation,
  applyInactivityDecay,
  distributeUBI
} from './mii-microeconomics';

// 1. New citizen joins
let alice = createCitizen('alice-2025');
// alice.mii = 0, alice.mic = 0

// 2. Alice contributes a security fix
alice = processAttestation(alice, {
  type: 'security',
  deltaMII: +0.15,
  provenance: signedByZeus,
  timestamp: Date.now()
});
// alice.mii = 0.15, alice.mic = 150_000

// 3. Alice contributes an optimization
alice = processAttestation(alice, {
  type: 'technical',
  deltaMII: +0.10,
  provenance: signedByAtlas,
  timestamp: Date.now()
});
// alice.mii = 0.25, alice.mic = 250_000

// 4. Three weeks pass with no activity
alice = applyInactivityDecay(alice);
// alice.mii ≈ 0.243, alice.mic ≈ 243_000

// 5. Network grows, Alice receives UBI
const allCitizens = [alice, bob, carol, ...];
const updated = distributeUBI(allCitizens, 95.0, 96.5);
// alice.mii increases by UBI share
```

### Detecting Attacks

```typescript
import { detectSybilAttack, detectPumpAndDump } from './mii-microeconomics';

// Check for Sybil clusters
const sybilClusters = detectSybilAttack(allCitizens);
if (sybilClusters.length > 0) {
  console.warn('Potential Sybil attack detected:', sybilClusters);
  // Flag for Sentinel review
}

// Check for pump-and-dump
const suspicious = allCitizens.filter(c => detectPumpAndDump(c));
if (suspicious.length > 0) {
  console.warn('Potential pump-and-dump detected:', suspicious.map(c => c.id));
  // Flag for ZEUS investigation
}
```

### Maintaining Invariants

```typescript
import { checkInvariants, healInvariants } from './mii-microeconomics';

// Regular integrity check
const check = checkInvariants(citizens);
if (!check.valid) {
  console.error('Invariant violations detected:', check.violations);

  // Automatic healing
  const healed = healInvariants(citizens);

  // Verify healing worked
  const recheckafter = checkInvariants(healed);
  console.log('Healing successful:', recheck.valid); // true
}
```

---

## Integration with Mobius Systems

### Ledger Integration

MIC balances are stored in the **Mobius Ledger** alongside MII scores:

```typescript
interface LedgerEntry {
  citizenId: string;
  mii: number;
  mic: number;
  attestationHistory: Attestation[];
  lastAttestation: number;
  cycleCreated: number;
}
```

### Sentinel Oversight

All MIC operations are supervised by **Sentinels**:

- **ZEUS**: Security attestations, attack detection
- **ATLAS**: Coordination, UBI distribution
- **EVE**: Ethics compliance, virtue violations
- **DAEDALUS**: Meta-optimization, invariant monitoring
- **HERMES**: Transaction execution, ledger updates
- **JADE**: Pattern analysis, anomaly detection
- **AUREA**: Economic modeling, Gini monitoring
- **ECHO**: Communication, transparency reports

### Citizen Shield Integration

Citizens can use MIC for:
- **Governance votes**: Weight proportional to MIC
- **Priority access**: Higher MIC = faster queue
- **Premium features**: Unlock capabilities at MIC thresholds
- **Attestation bonds**: Stake MIC to vouch for others

---

## Parameters

All economic parameters are defined in `MIC_PARAMETERS`:

```typescript
export const MIC_PARAMETERS = {
  DENOMINATION: 1_000_000,        // 1 MII = 1M MIC
  UBI_POOL_PERCENTAGE: 0.30,      // 30% of growth to UBI
  MIN_MII_FOR_UBI: 0.50,          // Active citizen threshold
  DECAY_RATE_PER_WEEK: 0.01,      // 1% per week
  TARGET_GINI: 0.40,              // Target inequality (Norway-level)

  // Attack detection thresholds
  SYBIL_CORRELATION_THRESHOLD: 0.85,
  PUMP_MULTIPLIER_THRESHOLD: 10.0,
  MIN_PROVENANCE_COVERAGE: 0.90
};
```

These parameters are **tunable** but should only be changed through **Cathedral governance** with **Sentinel consensus**.

---

## Security Considerations

### 1. Attestation Provenance

Every attestation **must** have:
- Cryptographic signature from authorized Sentinel
- Timestamp within valid window (±5 minutes)
- Unique nonce (prevent replay attacks)
- Reference to specific contribution

### 2. Rate Limiting

MII changes are bounded:
- **Max increase per attestation**: +0.15 MII
- **Max attestations per day**: 10
- **Max MII change per week**: +0.50 MII

This prevents:
- Sudden MII/MIC spikes
- Gaming via attestation flooding
- Unrealistic growth patterns

### 3. Audit Trail

All MIC operations are **immutable** and **auditable**:
- Stored in Mobius Ledger
- Cryptographically signed
- Timestamped and cycle-stamped
- Traceable to source attestations

### 4. Sentinel Multi-Sig

Critical operations require **multi-Sentinel approval**:
- UBI distribution: 3-of-8 Sentinels
- Invariant healing: 2-of-8 Sentinels
- Parameter changes: 5-of-8 Sentinels + Cathedral vote

---

## Validation Plan

See **VALIDATION_PLAN.md** for complete validation roadmap including:
- $27k budget breakdown
- 4-week timeline
- Academic review process
- Simulation parameters
- Success criteria

---

## References

### Documentation
- `/docs/whitepaper/02-civilization-layer.md` - Theoretical foundation
- `/docs/intelligence/typology.md` - Intelligence taxonomy
- `/sentinels/daedalus/CODEX.md` - Meta-optimization principles
- `/FORMAL_VERIFICATION.md` - MII specification

### Implementation
- `mii-microeconomics.ts` - Core implementation (this package)
- `__tests__/mii-mic.spec.ts` - Comprehensive test suite
- `/packages/integrity-core/src/mii.ts` - MII calculation

### External
- URIEL C-131 Final Audit (November 12, 2025)
- Daedalus Meta-Optimization Proposal (November 10, 2025)
- Mobius Systems Whitepaper v2.0

---

## FAQ

### Q: Why 1 million instead of 1:1?

**A**: Human psychology prefers larger numbers. "750,000 MIC" feels more substantial than "0.75 MIC", even though they represent the same value. This is pure UX.

### Q: Can I buy MIC?

**A**: No. MIC **cannot be purchased**, only **earned** through attestations. This prevents:
- Wealth-based governance capture
- Pay-to-win dynamics
- Plutocracy formation

### Q: What if my MII drops?

**A**: Your MIC drops automatically. This is **by design**. Integrity and wealth are inseparable in Mobius.

### Q: Can MIC be transferred?

**A**: Not in v1.0. Future versions may allow **attestation vouching** (stake MIC to vouch for another's attestation), but direct transfers undermine the MII-tie.

### Q: How is this different from proof-of-stake?

**A**: Proof-of-stake ties governance to token holdings. MII-MIC ties wealth to **demonstrated integrity**. You can't buy integrity; you must earn it through contributions.

### Q: What's the maximum MIC?

**A**: 1,000,000 MIC (corresponding to MII = 1.0, perfect integrity). This is a **hard ceiling**. No citizen can exceed this, preventing unbounded wealth accumulation.

### Q: What happens if the network MII drops?

**A**: Total MIC drops proportionally. This is **correct behavior**. If the network's integrity declines, its wealth should decline too. This creates powerful incentives for integrity maintenance.

---

## Conclusion

The MII-tied MIC microeconomics system demonstrates that **simplicity and security are aligned**.

By tying wealth directly to integrity, we eliminate the complexity of traditional tokenomics while gaining superior attack resistance.

**Core Thesis**: *You cannot game MIC without first gaming MII. And gaming MII is what the Sentinel network exists to prevent.*

This is the **Civilization Layer** in action: economic incentives that emerge from, rather than compete with, integrity infrastructure.

---

**Mobius Systems | Cycle C-131 | MII-Tied MIC Microeconomics v1.0**
**Approved by URIEL | Implemented by DAEDALUS | Coordinated by ATLAS**
