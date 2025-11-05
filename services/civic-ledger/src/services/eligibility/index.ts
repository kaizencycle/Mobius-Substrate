import cfg from '../../config.js';
import { getIdentityForWallet, isKYCVerified } from './providers/kyc.js';
import { checkResidency } from './providers/residency.js';
import { getWalletActivity30d } from './providers/activity.js';
import type { EligibilityInputs, EligibilityResult } from './types.js';

export async function checkUBIEligibility(input: EligibilityInputs): Promise<EligibilityResult> {
  const { walletAddress, now = new Date() } = input;
  const rules = cfg.ubi.eligibility;

  if (!rules) {
    // Default: everyone eligible if no rules configured
    return {
      eligible: true,
      requirements_met: {
        kyc_verified: true,
        wallet_age_days: 0,
        min_activity_threshold: true,
        residency_verified: true,
        sybil_check_passed: true
      }
    };
  }

  // Identity & KYC
  const identity = await getIdentityForWallet(walletAddress);
  const kyc_verified = rules.kyc_required ? Boolean(identity && await isKYCVerified(identity.identityId)) : true;

  // Wallet age
  const walletCreated = identity?.createdAtISO ? new Date(identity.createdAtISO) : null;
  const wallet_age_days = walletCreated ? Math.floor((now.getTime() - walletCreated.getTime()) / 86400_000) : 0;

  // Residency
  const residency_verified = await checkResidency(identity?.countryCode, cfg.ubi?.eligibility?.country_whitelist ?? []);

  // Activity threshold
  const activity = await getWalletActivity30d(walletAddress);
  const minAct = cfg.ubi?.eligibility?.min_activity_threshold ?? { tx_count_30d: 0, min_total_shards_30d: 0 };
  const min_activity_threshold = activity.txCount >= (minAct.tx_count_30d ?? 0)
    && activity.totalShardsTransacted >= BigInt(minAct.min_total_shards_30d ?? 0);

  // Sybil (placeholder)
  // TODO: enforce max_wallets_per_identity + device fingerprint logic
  const sybil_check_passed = true;

  const requirements = {
    kyc_verified,
    wallet_age_days,
    min_activity_threshold,
    residency_verified,
    sybil_check_passed
  };

  // Decision
  const eligible =
    kyc_verified &&
    wallet_age_days >= (rules?.active_wallet_days_min ?? 0) &&
    residency_verified &&
    min_activity_threshold &&
    sybil_check_passed;

  const reason = eligible ? undefined : 'One or more eligibility requirements not met';

  return { eligible, reason, requirements_met: requirements };
}

