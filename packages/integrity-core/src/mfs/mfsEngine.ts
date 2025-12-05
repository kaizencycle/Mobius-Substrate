/**
 * Mobius Fractal Shards (MFS) Engine
 * Version: 1.0 (C-155)
 * 
 * Core logic for aggregating MFS records into ΔMII contributions.
 * This module is the bridge between individual integrity actions
 * and the Mobius Integrity Index.
 */

// =============================================================================
// Type Definitions
// =============================================================================

export type MfsArchetype = "REF" | "LRN" | "CIV" | "STB" | "STW" | "INV" | "GRD";

export interface MfsRecord {
  mfs_id: string;
  citizen_id: string;
  archetype: MfsArchetype;
  weight: number;
  quality_score: number;
  timestamp: string;
  integrity_coefficient: number;
  computed_mii_delta?: number;
}

export interface MiiAggregationResult {
  deltaMii: number;
  totalMfs: number;
  byArchetype: Record<MfsArchetype, ArchetypeStats>;
  byQualityBand: Record<string, number>;
  topContributors: ContributorStats[];
  epochId: string;
}

export interface ArchetypeStats {
  count: number;
  deltaMii: number;
  avgQuality: number;
}

export interface ContributorStats {
  citizen_id: string;
  mfsCount: number;
  deltaMii: number;
  dominantArchetype: MfsArchetype;
}

export interface FractalState {
  citizen_id: string;
  totalMfs: number;
  weightedSum: number;
  deltaMiiContribution: number;
  byArchetype: Record<MfsArchetype, number>;
  qualityAverage: number;
  governancePower: number;
  lastUpdated: string;
}

// =============================================================================
// Constants
// =============================================================================

export const ARCHETYPE_WEIGHTS: Record<MfsArchetype, number> = {
  REF: 0.20,  // Reflection
  LRN: 0.15,  // Learning
  CIV: 0.25,  // Civic (highest)
  STB: 0.15,  // Stability
  STW: 0.10,  // Stewardship
  INV: 0.10,  // Innovation
  GRD: 0.05   // Guardian
};

export const QUALITY_BANDS = {
  minimal: { min: 0.5, max: 0.7 },
  standard: { min: 0.8, max: 1.0 },
  above_average: { min: 1.1, max: 1.4 },
  exceptional: { min: 1.5, max: 1.7 },
  transformative: { min: 1.8, max: 2.0 }
};

// Base integrity coefficient (calibrated per epoch by MIC Indexer)
export const DEFAULT_INTEGRITY_COEFFICIENT = 0.000001;

// =============================================================================
// Core Aggregation Functions
// =============================================================================

/**
 * Compute the MII delta for a single MFS record
 */
export function computeSingleMiiDelta(record: MfsRecord): number {
  const mfsWeighted = record.weight * record.quality_score;
  return mfsWeighted * record.integrity_coefficient;
}

/**
 * Aggregate multiple MFS records into a ΔMII result
 */
export function aggregateMfsToMii(
  records: MfsRecord[],
  epochId: string = "unknown"
): MiiAggregationResult {
  let deltaMii = 0;
  
  const byArchetype: Record<MfsArchetype, ArchetypeStats> = {
    REF: { count: 0, deltaMii: 0, avgQuality: 0 },
    LRN: { count: 0, deltaMii: 0, avgQuality: 0 },
    CIV: { count: 0, deltaMii: 0, avgQuality: 0 },
    STB: { count: 0, deltaMii: 0, avgQuality: 0 },
    STW: { count: 0, deltaMii: 0, avgQuality: 0 },
    INV: { count: 0, deltaMii: 0, avgQuality: 0 },
    GRD: { count: 0, deltaMii: 0, avgQuality: 0 }
  };

  const byQualityBand: Record<string, number> = {
    minimal: 0,
    standard: 0,
    above_average: 0,
    exceptional: 0,
    transformative: 0
  };

  const citizenContributions: Map<string, {
    count: number;
    deltaMii: number;
    archetypes: Record<MfsArchetype, number>;
  }> = new Map();

  const qualitySums: Record<MfsArchetype, number> = {
    REF: 0, LRN: 0, CIV: 0, STB: 0, STW: 0, INV: 0, GRD: 0
  };

  // Process each record
  for (const rec of records) {
    const miiDelta = computeSingleMiiDelta(rec);
    deltaMii += miiDelta;

    // Update archetype stats
    byArchetype[rec.archetype].count += 1;
    byArchetype[rec.archetype].deltaMii += miiDelta;
    qualitySums[rec.archetype] += rec.quality_score;

    // Update quality band distribution
    const band = getQualityBand(rec.quality_score);
    byQualityBand[band] += 1;

    // Track citizen contributions
    if (!citizenContributions.has(rec.citizen_id)) {
      citizenContributions.set(rec.citizen_id, {
        count: 0,
        deltaMii: 0,
        archetypes: { REF: 0, LRN: 0, CIV: 0, STB: 0, STW: 0, INV: 0, GRD: 0 }
      });
    }
    const contrib = citizenContributions.get(rec.citizen_id)!;
    contrib.count += 1;
    contrib.deltaMii += miiDelta;
    contrib.archetypes[rec.archetype] += 1;
  }

  // Calculate average quality per archetype
  for (const arch of Object.keys(byArchetype) as MfsArchetype[]) {
    if (byArchetype[arch].count > 0) {
      byArchetype[arch].avgQuality = qualitySums[arch] / byArchetype[arch].count;
    }
  }

  // Get top contributors
  const topContributors: ContributorStats[] = Array.from(citizenContributions.entries())
    .map(([citizen_id, data]) => ({
      citizen_id,
      mfsCount: data.count,
      deltaMii: data.deltaMii,
      dominantArchetype: getDominantArchetype(data.archetypes)
    }))
    .sort((a, b) => b.deltaMii - a.deltaMii)
    .slice(0, 10);

  return {
    deltaMii,
    totalMfs: records.length,
    byArchetype,
    byQualityBand,
    topContributors,
    epochId
  };
}

/**
 * Compute a citizen's fractal state from their MFS portfolio
 */
export function computeFractalState(
  citizenId: string,
  records: MfsRecord[]
): FractalState {
  const citizenRecords = records.filter(r => r.citizen_id === citizenId);
  
  let weightedSum = 0;
  let deltaMiiContribution = 0;
  let qualitySum = 0;

  const byArchetype: Record<MfsArchetype, number> = {
    REF: 0, LRN: 0, CIV: 0, STB: 0, STW: 0, INV: 0, GRD: 0
  };

  for (const rec of citizenRecords) {
    const weighted = rec.weight * rec.quality_score;
    weightedSum += weighted;
    deltaMiiContribution += computeSingleMiiDelta(rec);
    qualitySum += rec.quality_score;
    byArchetype[rec.archetype] += 1;
  }

  const qualityAverage = citizenRecords.length > 0 
    ? qualitySum / citizenRecords.length 
    : 0;

  // Governance power uses sqrt to dampen plutocratic influence
  const governancePower = Math.sqrt(weightedSum) * 0.01;

  return {
    citizen_id: citizenId,
    totalMfs: citizenRecords.length,
    weightedSum,
    deltaMiiContribution,
    byArchetype,
    qualityAverage,
    governancePower,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Calculate MIC distribution weights for citizens based on their MFS
 */
export function calculateMicDistribution(
  records: MfsRecord[],
  totalMicMinted: number
): Map<string, number> {
  const distribution = new Map<string, number>();
  
  // Calculate total impact across all citizens
  const citizenImpacts = new Map<string, number>();
  let totalImpact = 0;

  for (const rec of records) {
    const impact = computeSingleMiiDelta(rec);
    totalImpact += impact;
    
    const current = citizenImpacts.get(rec.citizen_id) || 0;
    citizenImpacts.set(rec.citizen_id, current + impact);
  }

  // Distribute MIC proportionally
  if (totalImpact > 0) {
    for (const [citizenId, impact] of citizenImpacts) {
      const share = (impact / totalImpact) * totalMicMinted;
      distribution.set(citizenId, share);
    }
  }

  return distribution;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getQualityBand(score: number): string {
  for (const [band, range] of Object.entries(QUALITY_BANDS)) {
    if (score >= range.min && score <= range.max) {
      return band;
    }
  }
  return "standard";
}

function getDominantArchetype(
  archetypes: Record<MfsArchetype, number>
): MfsArchetype {
  let maxCount = 0;
  let dominant: MfsArchetype = "REF";
  
  for (const [arch, count] of Object.entries(archetypes) as [MfsArchetype, number][]) {
    if (count > maxCount) {
      maxCount = count;
      dominant = arch;
    }
  }
  
  return dominant;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate an MFS record before processing
 */
export function validateMfsRecord(record: Partial<MfsRecord>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!record.mfs_id?.match(/^MFS-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{6}$/)) {
    errors.push("Invalid mfs_id format");
  }

  if (!record.citizen_id?.match(/^(CIT|AGT)-0x[a-fA-F0-9]+$/)) {
    errors.push("Invalid citizen_id format");
  }

  if (!record.archetype || !Object.keys(ARCHETYPE_WEIGHTS).includes(record.archetype)) {
    errors.push("Invalid archetype");
  }

  if (record.quality_score !== undefined && 
      (record.quality_score < 0.5 || record.quality_score > 2.0)) {
    errors.push("quality_score must be between 0.5 and 2.0");
  }

  if (record.weight !== undefined && (record.weight < 0 || record.weight > 1)) {
    errors.push("weight must be between 0 and 1");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verify archetype weights sum to 1.0
 */
export function verifyArchetypeWeights(): boolean {
  const sum = Object.values(ARCHETYPE_WEIGHTS).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.0001;
}

// =============================================================================
// Export
// =============================================================================

export default {
  computeSingleMiiDelta,
  aggregateMfsToMii,
  computeFractalState,
  calculateMicDistribution,
  validateMfsRecord,
  verifyArchetypeWeights,
  ARCHETYPE_WEIGHTS,
  QUALITY_BANDS,
  DEFAULT_INTEGRITY_COEFFICIENT
};
