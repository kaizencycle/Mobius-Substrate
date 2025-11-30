// Mobius Habits - MII (Mobius Integrity Index) Calculation
// C-150: Testnet MII computation for daily reflections + Citizen Shield

export interface ReflectionData {
  gi_score?: number | null;
  echo_score?: number | null;
}

export interface ShieldData {
  completion_score?: number | null;
  gi_estimate?: number | null;
}

/**
 * Compute daily MII for Mobius Habits testnet
 * 
 * Formula: MII_daily = 0.4 * GI_reflection + 0.3 * Echo_score + 0.3 * Shield_completion_factor
 * 
 * @param reflection - Daily reflection data with GI and Echo scores
 * @param shield - Weekly Citizen Shield completion data
 * @returns MII score (0.0 to 1.0)
 */
export function computeMII(reflection: ReflectionData | null, shield: ShieldData | null): number {
  const GI = reflection?.gi_score ?? 0;
  const echo = reflection?.echo_score ?? 0;
  
  // Shield completion factor:
  // - 1.0 if all 5 steps complete (completion_score >= 1.0)
  // - 0.5 if 3-4 steps done (completion_score >= 0.5)
  // - 0.0 otherwise
  let shieldFactor = 0;
  if (shield?.completion_score !== null && shield?.completion_score !== undefined) {
    const completion = shield.completion_score;
    if (completion >= 1.0) {
      shieldFactor = 1.0;
    } else if (completion >= 0.5) {
      shieldFactor = 0.5;
    }
  }

  const mii = 0.4 * GI + 0.3 * echo + 0.3 * shieldFactor;
  
  // Round to 3 decimal places and clamp to [0, 1]
  return Math.max(0, Math.min(1, Math.round(mii * 1000) / 1000));
}

/**
 * Calculate completion score for Citizen Shield from step booleans
 */
export function calculateShieldCompletionScore(steps: {
  step_update_devices: boolean;
  step_router_hygiene: boolean;
  step_browser_lockdown: boolean;
  step_2fa_check: boolean;
  step_backup_essentials: boolean;
}): number {
  const totalSteps = 5;
  let completed = 0;
  
  if (steps.step_update_devices) completed++;
  if (steps.step_router_hygiene) completed++;
  if (steps.step_browser_lockdown) completed++;
  if (steps.step_2fa_check) completed++;
  if (steps.step_backup_essentials) completed++;
  
  return completed / totalSteps;
}
