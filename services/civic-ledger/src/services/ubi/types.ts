export interface UBIConfig {
  unit: 'shards';
  cadence: 'monthly';
  epoch_length_days: number;
  funding_weights: { alpha_issuance: number; beta_decay: number };
  caps: { max_share_of_reserves: number; max_share_of_circulating: number };
  gi_thresholds: {
    bonus: { min: number; g: number };
    normal: { min: number; g: number };
    throttle: { min: number; g: number };
    halt: { min: number; g: number };
  };
  price_stability: { enabled: boolean; min_multiplier: number; max_multiplier: number };
  gi_calculation?: { method: string; lookback_days: number; min_samples: number; outlier_rejection: boolean };
}

