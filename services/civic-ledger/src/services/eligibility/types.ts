export type EligibilityRequirements = {
  kyc_verified: boolean;
  wallet_age_days: number;
  min_activity_threshold: boolean;
  residency_verified: boolean;
  sybil_check_passed: boolean;
};

export type EligibilityResult = {
  eligible: boolean;
  reason?: string;
  requirements_met: EligibilityRequirements;
};

export type IdentityRecord = {
  identityId: string;        // from KYC
  countryCode?: string;      // ISO-3166-1 alpha-2
  createdAtISO: string;      // wallet creation time
};

export type WalletActivity30d = {
  txCount: number;
  totalShardsTransacted: bigint;
};

export type EligibilityInputs = {
  walletAddress: string;
  now?: Date;
};

