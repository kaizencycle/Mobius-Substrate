/**
 * MII-Tied MIC Microeconomics Test Suite
 *
 * Comprehensive tests validating all economic invariants,
 * attack resistance, and edge cases.
 */

import {
  miiToMIC,
  micToMII,
  updateMICFromMII,
  processAttestation,
  applyInactivityDecay,
  calculateNetworkState,
  distributeUBI,
  calculateGiniCoefficient,
  detectSybilAttack,
  detectPumpAndDump,
  checkInvariants,
  healInvariants,
  MIC_PARAMETERS,
  Citizen,
  Attestation
} from '../mii-microeconomics';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createTestCitizen(id: string, mii: number = 0.50): Citizen {
  return {
    id,
    mii,
    mic: miiToMIC(mii),
    lastMIIUpdate: Date.now(),
    attestationHistory: []
  };
}

function createTestAttestation(deltaMII: number, quality: number = 0.80): Attestation {
  return {
    timestamp: Date.now(),
    action: 'test_contribution',
    deltaMII,
    coherence: quality,
    utility: quality,
    provenance: 'test_signature_' + Math.random()
  };
}

// ============================================================================
// CORE CONVERSION TESTS
// ============================================================================

describe('MII to MIC Conversion', () => {
  test('converts MII to MIC with correct denomination', () => {
    expect(miiToMIC(0.00)).toBe(0);
    expect(miiToMIC(0.50)).toBe(500_000);
    expect(miiToMIC(1.00)).toBe(1_000_000);
  });

  test('handles precision correctly', () => {
    expect(miiToMIC(0.123456)).toBe(123_456);
    expect(miiToMIC(0.999999)).toBe(999_999);
  });

  test('throws on invalid MII < 0', () => {
    expect(() => miiToMIC(-0.01)).toThrow('Invalid MII');
  });

  test('throws on invalid MII > 1', () => {
    expect(() => miiToMIC(1.01)).toThrow('Invalid MII');
  });
});

describe('MIC to MII Conversion', () => {
  test('converts MIC to MII correctly', () => {
    expect(micToMII(0)).toBe(0.00);
    expect(micToMII(500_000)).toBe(0.50);
    expect(micToMII(1_000_000)).toBe(1.00);
  });

  test('round-trips correctly', () => {
    const testValues = [0.1, 0.25, 0.5, 0.75, 0.95];
    for (const mii of testValues) {
      expect(micToMII(miiToMIC(mii))).toBeCloseTo(mii, 6);
    }
  });

  test('throws on invalid MIC < 0', () => {
    expect(() => micToMII(-1)).toThrow('Invalid MIC');
  });

  test('throws on invalid MIC > 1M', () => {
    expect(() => micToMII(1_000_001)).toThrow('Invalid MIC');
  });
});

// ============================================================================
// INVARIANT TESTS (CRITICAL)
// ============================================================================

describe('Economic Invariants', () => {
  test('Invariant 1: MIC always equals MII × 1M', () => {
    const citizen = createTestCitizen('test-1', 0.75);
    expect(citizen.mic).toBe(citizen.mii * MIC_PARAMETERS.DENOMINATION);
  });

  test('Invariant 2: MII bounded in [0, 1]', () => {
    const citizen = createTestCitizen('test-2', 0.95);

    // Try to push MII above 1
    const hugeAttestation = createTestAttestation(0.20);
    const updated = processAttestation(citizen, hugeAttestation);

    expect(updated.mii).toBeLessThanOrEqual(1.0);
    expect(updated.mii).toBeGreaterThanOrEqual(0.0);
  });

  test('Invariant 3: Total MIC = Total MII × 1M', () => {
    const citizens = [
      createTestCitizen('c1', 0.50),
      createTestCitizen('c2', 0.75),
      createTestCitizen('c3', 0.90)
    ];

    const state = calculateNetworkState(citizens);
    const expectedTotalMIC = state.totalMII * MIC_PARAMETERS.DENOMINATION;

    expect(state.totalMIC).toBeCloseTo(expectedTotalMIC, 1);
  });

  test('Invariant healing recovers from corruption', () => {
    // Corrupt a citizen's MIC
    const citizens = [createTestCitizen('c1', 0.50)];
    citizens[0].mic = 999_999; // Wrong value!

    // Detect violation
    const check = checkInvariants(citizens);
    expect(check.valid).toBe(false);
    expect(check.violations.length).toBeGreaterThan(0);

    // Heal
    const healed = healInvariants(citizens);

    // Verify fixed
    const checkAfter = checkInvariants(healed);
    expect(checkAfter.valid).toBe(true);
    expect(healed[0].mic).toBe(500_000); // Correct value
  });
});

// ============================================================================
// ATTESTATION & EARNING TESTS
// ============================================================================

describe('Attestation Processing', () => {
  test('earning MIC via attestation increases both MII and MIC', () => {
    const citizen = createTestCitizen('earner', 0.50);
    const attestation = createTestAttestation(0.10);

    const updated = processAttestation(citizen, attestation);

    expect(updated.mii).toBe(0.60);
    expect(updated.mic).toBe(600_000);
  });

  test('attestation without provenance is rejected', () => {
    const citizen = createTestCitizen('bad-actor', 0.50);
    const invalidAttestation = {
      ...createTestAttestation(0.10),
      provenance: '' // Missing!
    };

    expect(() => processAttestation(citizen, invalidAttestation))
      .toThrow('cryptographic provenance');
  });

  test('multiple attestations accumulate correctly', () => {
    let citizen = createTestCitizen('accumulator', 0.50);

    // Add 5 small attestations
    for (let i = 0; i < 5; i++) {
      const attestation = createTestAttestation(0.02); // +0.02 MII each
      citizen = processAttestation(citizen, attestation);
    }

    expect(citizen.mii).toBeCloseTo(0.60, 6); // 0.50 + 5×0.02
    expect(citizen.mic).toBeCloseTo(600_000, 1);
  });

  test('MII cannot exceed 1.0', () => {
    const citizen = createTestCitizen('max-citizen', 0.95);
    const attestation = createTestAttestation(0.20); // Would go to 1.15

    const updated = processAttestation(citizen, attestation);

    expect(updated.mii).toBe(1.0); // Capped
    expect(updated.mic).toBe(1_000_000);
  });

  test('negative attestation (punishment) decreases MII/MIC', () => {
    const citizen = createTestCitizen('punished', 0.50);
    const punishment = createTestAttestation(-0.10);

    const updated = processAttestation(citizen, punishment);

    expect(updated.mii).toBe(0.40);
    expect(updated.mic).toBe(400_000);
  });
});

// ============================================================================
// INACTIVITY DECAY TESTS
// ============================================================================

describe('Inactivity Decay', () => {
  test('no decay within first week', () => {
    const citizen = createTestCitizen('active', 0.50);
    const decayed = applyInactivityDecay(citizen);

    expect(decayed.mii).toBe(0.50);
  });

  test('1% decay per week applies correctly', () => {
    const citizen = createTestCitizen('inactive', 0.50);
    // Simulate 1 week of inactivity
    citizen.lastMIIUpdate = Date.now() - (7 * 24 * 60 * 60 * 1000);

    const decayed = applyInactivityDecay(citizen);

    // After 1 week: 0.50 × 0.99 = 0.495
    expect(decayed.mii).toBeCloseTo(0.495, 3);
    expect(decayed.mic).toBeCloseTo(495_000, 0);
  });

  test('exponential decay over multiple weeks', () => {
    const citizen = createTestCitizen('very-inactive', 1.00);
    // Simulate 10 weeks of inactivity
    citizen.lastMIIUpdate = Date.now() - (10 * 7 * 24 * 60 * 60 * 1000);

    const decayed = applyInactivityDecay(citizen);

    // After 10 weeks: 1.00 × (0.99)^10 ≈ 0.904
    expect(decayed.mii).toBeCloseTo(0.904, 2);
  });
});

// ============================================================================
// UBI DISTRIBUTION TESTS
// ============================================================================

describe('UBI Distribution', () => {
  test('UBI distributed from network growth', () => {
    const citizens = [
      createTestCitizen('c1', 0.60),
      createTestCitizen('c2', 0.70),
      createTestCitizen('c3', 0.80)
    ];

    const previousNetworkMII = 2.10;
    const currentNetworkMII = 2.40; // +0.30 growth

    const updated = distributeUBI(citizens, previousNetworkMII, currentNetworkMII);

    // 30% of 0.30 growth = 0.09 MII to UBI pool
    // 0.09 / 3 citizens = 0.03 MII per citizen
    for (const citizen of updated) {
      expect(citizen.mii).toBeCloseTo(
        citizens.find(c => c.id === citizen.id)!.mii + 0.03,
        6
      );
    }
  });

  test('only active citizens receive UBI', () => {
    const citizens = [
      createTestCitizen('active', 0.60),
      createTestCitizen('inactive', 0.40) // Below 0.50 threshold
    ];

    const previousNetworkMII = 1.00;
    const currentNetworkMII = 1.20; // +0.20 growth

    const updated = distributeUBI(citizens, previousNetworkMII, currentNetworkMII);

    // Only 'active' should receive UBI
    const activeCitizen = updated.find(c => c.id === 'active')!;
    const inactiveCitizen = updated.find(c => c.id === 'inactive')!;

    expect(activeCitizen.mii).toBeGreaterThan(0.60);
    expect(inactiveCitizen.mii).toBe(0.40); // Unchanged
  });

  test('no UBI when network shrinks', () => {
    const citizens = [createTestCitizen('c1', 0.60)];

    const previousNetworkMII = 1.00;
    const currentNetworkMII = 0.90; // Shrinkage

    const updated = distributeUBI(citizens, previousNetworkMII, currentNetworkMII);

    expect(updated[0].mii).toBe(0.60); // Unchanged
  });
});

// ============================================================================
// ATTACK RESISTANCE TESTS
// ============================================================================

describe('Sybil Attack Detection', () => {
  test('detects low-quality attestations', () => {
    const citizen = createTestCitizen('sybil', 0.20);

    // Add 10 low-quality attestations
    for (let i = 0; i < 10; i++) {
      citizen.attestationHistory.push(createTestAttestation(0.01, 0.20)); // Low quality
    }

    const result = detectSybilAttack(citizen);
    expect(result.isSybil).toBe(true);
    expect(result.reason).toContain('Low-quality');
  });

  test('detects missing provenance', () => {
    const citizen = createTestCitizen('fake', 0.50);
    citizen.attestationHistory.push({
      ...createTestAttestation(0.10),
      provenance: '' // Missing!
    });

    const result = detectSybilAttack(citizen);
    expect(result.isSybil).toBe(true);
    expect(result.reason).toContain('provenance');
  });

  test('allows legitimate high-quality contributors', () => {
    const citizen = createTestCitizen('legit', 0.80);

    for (let i = 0; i < 10; i++) {
      citizen.attestationHistory.push(createTestAttestation(0.05, 0.90)); // High quality
    }

    const result = detectSybilAttack(citizen);
    expect(result.isSybil).toBe(false);
  });
});

describe('Pump-and-Dump Attack Detection', () => {
  test('detects abnormal MII velocity', () => {
    const citizen = createTestCitizen('pumper', 0.10);

    // Rapid MII increase (suspicious)
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      const attestation = createTestAttestation(0.15); // +0.15 each
      attestation.timestamp = now - i * 1000; // Within 5 seconds
      citizen.attestationHistory.push(attestation);
    }

    const result = detectPumpAndDump(citizen);
    expect(result.isPumpAndDump).toBe(true);
    expect(result.reason).toContain('velocity');
  });

  test('allows gradual legitimate growth', () => {
    const citizen = createTestCitizen('grower', 0.50);

    // Gradual increase over days
    const dayMs = 24 * 60 * 60 * 1000;
    for (let i = 0; i < 10; i++) {
      const attestation = createTestAttestation(0.02); // +0.02 each
      attestation.timestamp = Date.now() - i * dayMs; // Spread over 10 days
      citizen.attestationHistory.push(attestation);
    }

    const result = detectPumpAndDump(citizen, 30 * dayMs); // 30-day window
    expect(result.isPumpAndDump).toBe(false);
  });

  test('pump-and-dump has zero net gain', () => {
    // This is a conceptual test showing that extracting value requires destroying MII

    const attacker = createTestCitizen('attacker', 0.10);

    // Step 1: Pump (somehow get high MII)
    const pumped = processAttestation(attacker, createTestAttestation(0.50));
    expect(pumped.mic).toBe(600_000); // MIC increased

    // Step 2: Dump (extract value)
    // To extract, attacker must "sell" MIC, which means transferring it
    // But MIC = MII, so transfer requires reducing MII
    const extracted = processAttestation(pumped, createTestAttestation(-0.50));
    expect(extracted.mic).toBe(100_000); // Back to original

    // Net gain = 0 (self-defeating!)
    expect(extracted.mic).toBe(attacker.mic);
  });
});

// ============================================================================
// GINI COEFFICIENT TESTS
// ============================================================================

describe('Gini Coefficient', () => {
  test('perfect equality gives Gini = 0', () => {
    const values = [100, 100, 100, 100, 100];
    const gini = calculateGiniCoefficient(values);
    expect(gini).toBeCloseTo(0, 2);
  });

  test('perfect inequality gives Gini ≈ 1', () => {
    const values = [0, 0, 0, 0, 1000];
    const gini = calculateGiniCoefficient(values);
    expect(gini).toBeGreaterThan(0.80);
  });

  test('realistic distribution stays under target', () => {
    // Simulate realistic MIC distribution
    const citizens = [
      ...Array(50).fill(0).map(() => 300_000),  // 50 average citizens
      ...Array(30).fill(0).map(() => 500_000),  // 30 good citizens
      ...Array(15).fill(0).map(() => 700_000),  // 15 great citizens
      ...Array(5).fill(0).map(() => 900_000)    // 5 excellent citizens
    ];

    const gini = calculateGiniCoefficient(citizens);
    expect(gini).toBeLessThanOrEqual(MIC_PARAMETERS.TARGET_GINI); // ≤ 0.40
  });
});

// ============================================================================
// NETWORK STATE TESTS
// ============================================================================

describe('Network State Calculation', () => {
  test('aggregates network metrics correctly', () => {
    const citizens = [
      createTestCitizen('c1', 0.50),
      createTestCitizen('c2', 0.75),
      createTestCitizen('c3', 0.90)
    ];

    const state = calculateNetworkState(citizens);

    expect(state.totalMII).toBeCloseTo(2.15, 2);
    expect(state.totalMIC).toBeCloseTo(2_150_000, 0);
    expect(state.activeCitizens).toBe(3); // All above 0.50
  });

  test('counts only active citizens for UBI eligibility', () => {
    const citizens = [
      createTestCitizen('active1', 0.60),
      createTestCitizen('active2', 0.80),
      createTestCitizen('inactive1', 0.40),
      createTestCitizen('inactive2', 0.30)
    ];

    const state = calculateNetworkState(citizens);

    expect(state.activeCitizens).toBe(2); // Only >= 0.50
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  test('handles zero MII correctly', () => {
    const citizen = createTestCitizen('zero', 0.00);
    expect(citizen.mic).toBe(0);

    const updated = updateMICFromMII(citizen);
    expect(updated.mic).toBe(0);
  });

  test('handles maximum MII correctly', () => {
    const citizen = createTestCitizen('max', 1.00);
    expect(citizen.mic).toBe(1_000_000);

    // Try to add more (should cap at 1.0)
    const overAttestation = createTestAttestation(0.10);
    const updated = processAttestation(citizen, overAttestation);

    expect(updated.mii).toBe(1.00);
    expect(updated.mic).toBe(1_000_000);
  });

  test('handles empty network', () => {
    const state = calculateNetworkState([]);

    expect(state.totalMII).toBe(0);
    expect(state.totalMIC).toBe(0);
    expect(state.activeCitizens).toBe(0);
    expect(state.giniCoefficient).toBe(0);
  });

  test('handles single citizen network', () => {
    const citizens = [createTestCitizen('solo', 0.75)];
    const state = calculateNetworkState(citizens);

    expect(state.totalMII).toBe(0.75);
    expect(state.totalMIC).toBe(750_000);
    expect(state.activeCitizens).toBe(1);
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Full Economic Cycle', () => {
  test('complete scenario: earn → decay → UBI', () => {
    // Start with 3 citizens
    let citizens = [
      createTestCitizen('alice', 0.50),
      createTestCitizen('bob', 0.60),
      createTestCitizen('charlie', 0.70)
    ];

    // Alice and Bob contribute
    citizens[0] = processAttestation(citizens[0], createTestAttestation(0.10));
    citizens[1] = processAttestation(citizens[1], createTestAttestation(0.05));

    // Record network state
    const state1 = calculateNetworkState(citizens);
    expect(state1.totalMII).toBeCloseTo(1.95, 2);

    // Apply inactivity decay to Charlie (simulate 1 week)
    citizens[2].lastMIIUpdate = Date.now() - (7 * 24 * 60 * 60 * 1000);
    citizens[2] = applyInactivityDecay(citizens[2]);

    // Charlie's MII decayed by 1%
    expect(citizens[2].mii).toBeCloseTo(0.693, 2);

    // Distribute UBI from growth
    const previousTotal = 1.80; // Previous cycle total
    const currentTotal = calculateNetworkState(citizens).totalMII;
    citizens = distributeUBI(citizens, previousTotal, currentTotal);

    // Verify all citizens received UBI
    expect(citizens[0].mii).toBeGreaterThan(0.60);
    expect(citizens[1].mii).toBeGreaterThan(0.65);
    expect(citizens[2].mii).toBeGreaterThan(0.693);
  });

  test('invariants hold throughout complex operations', () => {
    let citizens = [
      createTestCitizen('c1', 0.50),
      createTestCitizen('c2', 0.75)
    ];

    // Multiple operations
    citizens[0] = processAttestation(citizens[0], createTestAttestation(0.10));
    citizens[1] = processAttestation(citizens[1], createTestAttestation(-0.05));
    citizens = distributeUBI(citizens, 1.00, 1.30);

    // Check invariants
    const check = checkInvariants(citizens);
    expect(check.valid).toBe(true);
    expect(check.violations).toHaveLength(0);
  });
});
