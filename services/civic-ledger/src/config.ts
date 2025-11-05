import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type UbiConfig = {
  unit: 'shards' | 'credits';
  cadence: 'monthly' | 'weekly';
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
  eligibility?: {
    kyc_required: boolean;
    active_wallet_days_min: number;
    min_activity_threshold?: { tx_count_30d: number; min_total_shards_30d: number };
    residency_rules?: string;
    country_whitelist?: string[];
    sybil?: { max_wallets_per_identity: number; device_fingerprint_required: boolean };
  };
};

export type IntegrityConfig = {
  ubi: UbiConfig;
  gi?: {
    aggregator?: {
      url?: string;
      twa_lookback_days?: number;
      min_samples?: number;
      outlier_rejection?: boolean;
    };
    thresholds?: {
      warn?: number;
      halt?: number;
    };
  };
  treasury?: { reserves12m?: number };
  metrics?: { circulatingShards?: number };
};

function loadYaml(file: string): any {
  // Resolve from service root (services/civic-ledger/) to repo root
  // __dirname is: services/civic-ledger/src/dist (build) or services/civic-ledger/src (source)
  // From src: ../.. -> services/civic-ledger
  // From services/civic-ledger: .. -> repo root
  const serviceRoot = path.resolve(__dirname, '../../');
  const repoRoot = path.resolve(serviceRoot, '..');
  const configPath = path.join(repoRoot, file);
  
  if (!fs.existsSync(configPath)) {
    console.warn(`Config file not found: ${configPath}, using defaults`);
    return { ubi: getDefaultUBIConfig() };
  }
  
  const raw = fs.readFileSync(configPath, 'utf8');
  return parse(raw);
}

function getDefaultUBIConfig(): UbiConfig {
  return {
    unit: 'shards',
    cadence: 'monthly',
    epoch_length_days: 90,
    funding_weights: { alpha_issuance: 0.20, beta_decay: 0.60 },
    caps: { max_share_of_reserves: 0.10, max_share_of_circulating: 0.02 },
    gi_thresholds: {
      bonus: { min: 0.990, g: 1.05 },
      normal: { min: 0.970, g: 1.00 },
      throttle: { min: 0.950, g: 0.85 },
      halt: { min: 0.900, g: 0.00 }
    },
    price_stability: { enabled: false, min_multiplier: 1.00, max_multiplier: 1.00 }
  };
}

const cfg: IntegrityConfig = loadYaml('configs/integrity_units.yaml');
export default cfg;

