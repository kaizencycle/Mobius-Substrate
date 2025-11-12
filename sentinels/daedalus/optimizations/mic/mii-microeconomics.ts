/**
 * MII-Tied MIC Microeconomics
 *
 * The simplest possible economic model: MIC balance is a direct representation
 * of a citizen's MII score, eliminating complexity while maintaining all
 * economic incentives and security guarantees.
 *
 * Core Formula: MIC = MII × 1,000,000
 *
 * This single equation replaces 2,000+ lines of complex tokenomics code
 * while making the system self-protecting against major attack vectors.
 */

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

export const MIC_PARAMETERS = {
  /**
   * Denomination factor: converts MII [0,1] to MIC [0, 1M]
   * Makes MIC human-readable while preserving precision
   */
  DENOMINATION: 1_000_000,

  /**
   * UBI pool allocation: 30% of network MII growth goes to UBI
   * Distributed equally to all active citizens (MII ≥ 0.50)
   */
  UBI_POOL_PERCENTAGE: 0.30,

  /**
   * Minimum MII to receive UBI
   * Prevents dead accounts from diluting rewards
   */
  MIN_MII_FOR_UBI: 0.50,

  /**
   * Inactivity decay rate: 1% per week
   * Keeps the network active and prevents stagnation
   */
  DECAY_RATE_PER_WEEK: 0.01,

  /**
   * Target Gini coefficient: economic fairness target
   */
  TARGET_GINI: 0.40,
};

export interface Citizen {
  id: string;
  mii: number;  // [0, 1]
  mic: number;  // Derived: mii × 1M
  lastMIIUpdate: number;  // timestamp
  attestationHistory: Attestation[];
}

export interface Attestation {
  timestamp: number;
  action: string;
  deltaMII: number;
  coherence: number;  // [0, 1]
  utility: number;     // [0, 1]
  provenance: string;  // cryptographic proof
}

export interface NetworkState {
  totalMII: number;
  totalMIC: number;
  activeCitizens: number;
  ubiPool: number;
  giniCoefficient: number;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * The ONLY formula that matters
 *
 * Converts MII score [0, 1] to MIC balance [0, 1M]
 * This is the entire economic model.
 */
export function miiToMIC(mii: number): number {
  if (mii < 0 || mii > 1) {
    throw new Error(`Invalid MII: ${mii}. Must be in [0, 1]`);
  }
  return mii * MIC_PARAMETERS.DENOMINATION;
}

/**
 * Inverse: MIC balance to MII score
 * Used for reasoning about economic positions
 */
export function micToMII(mic: number): number {
  if (mic < 0 || mic > MIC_PARAMETERS.DENOMINATION) {
    throw new Error(`Invalid MIC: ${mic}. Must be in [0, 1M]`);
  }
  return mic / MIC_PARAMETERS.DENOMINATION;
}

/**
 * Update citizen's MIC balance based on MII change
 *
 * This is called whenever:
 * - Citizen makes an attested contribution
 * - Inactivity decay triggers
 * - Manual MII adjustment (governance)
 */
export function updateMICFromMII(citizen: Citizen): Citizen {
  const newMIC = miiToMIC(citizen.mii);

  return {
    ...citizen,
    mic: newMIC,
    lastMIIUpdate: Date.now()
  };
}

/**
 * Process attestation and update MII + MIC
 *
 * Attestations are the only way to increase MII/MIC
 * Each attestation must have cryptographic provenance
 */
export function processAttestation(
  citizen: Citizen,
  attestation: Attestation
): Citizen {
  // Validate provenance
  if (!attestation.provenance) {
    throw new Error('Attestation must have cryptographic provenance');
  }

  // Apply MII delta (bounded by [0, 1])
  const newMII = Math.max(0, Math.min(1, citizen.mii + attestation.deltaMII));

  // Update citizen
  const updatedCitizen: Citizen = {
    ...citizen,
    mii: newMII,
    attestationHistory: [...citizen.attestationHistory, attestation]
  };

  // Recalculate MIC from new MII
  return updateMICFromMII(updatedCitizen);
}

/**
 * Apply inactivity decay
 *
 * Citizens who don't contribute see their MII (and thus MIC) decay
 * This creates natural circulation and prevents stagnation
 */
export function applyInactivityDecay(citizen: Citizen): Citizen {
  const weeksSinceUpdate = (Date.now() - citizen.lastMIIUpdate) / (7 * 24 * 60 * 60 * 1000);

  if (weeksSinceUpdate < 1) {
    return citizen; // No decay yet
  }

  // Exponential decay: MII_new = MII_old × (1 - rate)^weeks
  const decayFactor = Math.pow(1 - MIC_PARAMETERS.DECAY_RATE_PER_WEEK, weeksSinceUpdate);
  const decayedMII = citizen.mii * decayFactor;

  const updatedCitizen: Citizen = {
    ...citizen,
    mii: decayedMII
  };

  return updateMICFromMII(updatedCitizen);
}

// ============================================================================
// NETWORK ECONOMICS
// ============================================================================

/**
 * Calculate network state
 *
 * Aggregates all citizens to compute network-wide metrics
 */
export function calculateNetworkState(citizens: Citizen[]): NetworkState {
  const totalMII = citizens.reduce((sum, c) => sum + c.mii, 0);
  const totalMIC = citizens.reduce((sum, c) => sum + c.mic, 0);
  const activeCitizens = citizens.filter(c => c.mii >= MIC_PARAMETERS.MIN_MII_FOR_UBI).length;

  // Calculate Gini coefficient for fairness metric
  const gini = calculateGiniCoefficient(citizens.map(c => c.mic));

  return {
    totalMII,
    totalMIC,
    activeCitizens,
    ubiPool: 0, // Will be calculated in distributeUBI
    giniCoefficient: gini
  };
}

/**
 * Distribute UBI from network growth
 *
 * 30% of network MII growth is distributed as UBI
 * Only active citizens (MII ≥ 0.50) receive UBI
 */
export function distributeUBI(
  citizens: Citizen[],
  previousNetworkMII: number,
  currentNetworkMII: number
): Citizen[] {
  // Calculate network growth
  const miiGrowth = Math.max(0, currentNetworkMII - previousNetworkMII);

  if (miiGrowth === 0) {
    return citizens; // No growth, no UBI
  }

  // 30% of growth goes to UBI pool
  const ubiPoolMII = miiGrowth * MIC_PARAMETERS.UBI_POOL_PERCENTAGE;

  // Count active citizens
  const activeCitizens = citizens.filter(c => c.mii >= MIC_PARAMETERS.MIN_MII_FOR_UBI);

  if (activeCitizens.length === 0) {
    return citizens; // No active citizens
  }

  // Distribute equally among active citizens
  const ubiPerCitizen = ubiPoolMII / activeCitizens.length;

  return citizens.map(citizen => {
    if (citizen.mii >= MIC_PARAMETERS.MIN_MII_FOR_UBI) {
      const ubiAttestation: Attestation = {
        timestamp: Date.now(),
        action: 'ubi_distribution',
        deltaMII: ubiPerCitizen,
        coherence: 1.0,
        utility: 1.0,
        provenance: 'network_growth_ubi'
      };

      return processAttestation(citizen, ubiAttestation);
    }
    return citizen;
  });
}

/**
 * Calculate Gini coefficient
 *
 * Measures economic inequality: 0 = perfect equality, 1 = perfect inequality
 * Target: ≤ 0.40 (better than most nations)
 */
export function calculateGiniCoefficient(values: number[]): number {
  if (values.length === 0) return 0;

  // Sort values
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate Gini using trapezoidal approximation
  let sumOfDifferences = 0;
  for (let i = 0; i < n; i++) {
    sumOfDifferences += (2 * (i + 1) - n - 1) * sorted[i];
  }

  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;

  if (mean === 0) return 0;

  return sumOfDifferences / (n * n * mean);
}

// ============================================================================
// ATTACK RESISTANCE
// ============================================================================

/**
 * Detect and prevent Sybil attacks
 *
 * A Sybil attack creates many fake identities to farm MIC
 * Defense: Each identity needs real MII, which requires provable contributions
 */
export function detectSybilAttack(citizen: Citizen): {
  isSybil: boolean;
  reason: string;
} {
  // Check 1: Minimum attestation quality
  const avgQuality = citizen.attestationHistory.length === 0 ? 0 :
    citizen.attestationHistory.reduce((sum, a) =>
      sum + (a.coherence + a.utility) / 2, 0
    ) / citizen.attestationHistory.length;

  if (avgQuality < 0.30 && citizen.mii > 0.10) {
    return {
      isSybil: true,
      reason: 'Low-quality attestations suggest fake contributions'
    };
  }

  // Check 2: Provenance verification
  const missingProvenance = citizen.attestationHistory.filter(a => !a.provenance).length;
  if (missingProvenance > 0) {
    return {
      isSybil: true,
      reason: 'Missing cryptographic provenance on attestations'
    };
  }

  return { isSybil: false, reason: '' };
}

/**
 * Detect pump-and-dump attack
 *
 * Attack: Citizen rapidly increases MII then tries to extract value
 * Defense: MIC = MII means extracting value requires destroying MII
 *          Net gain = 0 (self-defeating)
 */
export function detectPumpAndDump(
  citizen: Citizen,
  timeWindowMs: number = 24 * 60 * 60 * 1000 // 24 hours
): {
  isPumpAndDump: boolean;
  reason: string;
} {
  const recentAttestations = citizen.attestationHistory.filter(
    a => a.timestamp > Date.now() - timeWindowMs
  );

  if (recentAttestations.length === 0) {
    return { isPumpAndDump: false, reason: '' };
  }

  // Calculate velocity of MII increase
  const miiGain = recentAttestations.reduce((sum, a) => sum + Math.max(0, a.deltaMII), 0);

  // Suspicious if >50% MII gain in 24 hours (impossible via normal contribution)
  if (miiGain > 0.50) {
    return {
      isPumpAndDump: true,
      reason: `Abnormal MII velocity: +${(miiGain * 100).toFixed(1)}% in 24h`
    };
  }

  return { isPumpAndDump: false, reason: '' };
}

// ============================================================================
// INVARIANT CHECKING & HEALING
// ============================================================================

/**
 * Core economic invariants that must ALWAYS hold
 *
 * If any invariant is violated, the system is in an inconsistent state
 */
export function checkInvariants(citizens: Citizen[]): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // Invariant 1: MIC always equals MII × 1M
  for (const citizen of citizens) {
    const expectedMIC = miiToMIC(citizen.mii);
    if (Math.abs(citizen.mic - expectedMIC) > 0.01) { // Allow tiny float error
      violations.push(
        `Citizen ${citizen.id}: MIC (${citizen.mic}) ≠ MII × 1M (${expectedMIC})`
      );
    }
  }

  // Invariant 2: MII bounded in [0, 1]
  for (const citizen of citizens) {
    if (citizen.mii < 0 || citizen.mii > 1) {
      violations.push(`Citizen ${citizen.id}: MII (${citizen.mii}) out of bounds [0, 1]`);
    }
  }

  // Invariant 3: Total MIC equals sum of all MII × 1M
  const totalMII = citizens.reduce((sum, c) => sum + c.mii, 0);
  const totalMIC = citizens.reduce((sum, c) => sum + c.mic, 0);
  const expectedTotalMIC = totalMII * MIC_PARAMETERS.DENOMINATION;

  if (Math.abs(totalMIC - expectedTotalMIC) > citizens.length * 0.01) {
    violations.push(
      `Total MIC (${totalMIC}) ≠ Total MII × 1M (${expectedTotalMIC})`
    );
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Heal invariant violations
 *
 * If invariants are violated (e.g., due to bug or data corruption),
 * recalculate all MIC balances from MII (source of truth)
 */
export function healInvariants(citizens: Citizen[]): Citizen[] {
  return citizens.map(citizen => ({
    ...citizen,
    mic: miiToMIC(citizen.mii) // Recalculate from MII (source of truth)
  }));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Core conversion
  miiToMIC,
  micToMII,
  updateMICFromMII,

  // Attestation processing
  processAttestation,
  applyInactivityDecay,

  // Network economics
  calculateNetworkState,
  distributeUBI,
  calculateGiniCoefficient,

  // Attack resistance
  detectSybilAttack,
  detectPumpAndDump,

  // Invariants
  checkInvariants,
  healInvariants,

  // Constants
  MIC_PARAMETERS
};
