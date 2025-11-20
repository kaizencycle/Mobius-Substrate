/**
 * AUREA Sentinel · Kaizen Veil Runtime
 *
 * Responsibilities
 *  - Validate webhook allowlists (no silent defaults)
 *  - Stream Bio-Intel packets into FORESIGHT projections
 *  - Monitor "The Spark" pulse history
 *  - Provide Kaizen handshake + attestation summaries
 */

import crypto from 'node:crypto';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { z } from 'zod';

const REFRESH_MODES = ['static', 'per_request'] as const;

const AureaConfigSchema = z.object({
  hostAllowlist: z.array(z.string().min(1)).min(1),
  portAllowlist: z.array(z.string().min(1)).min(1),
  giFloor: z.number().min(0.9).max(1),
  handshakePhrase: z.string().min(4),
  refreshMode: z.enum(REFRESH_MODES),
  sparkMinimum: z.number().min(0.5).max(0.99)
});

type AureaConfig = z.infer<typeof AureaConfigSchema>;

type BioIntelPacket = {
  sentinelDrift?: number;
  morale?: number;
  anomalies?: string[];
  environmentLoad?: number;
  timestamp?: string;
};

type SparkPulse = {
  timestamp: string;
  intensity: number;
  trigger: string;
};

const DEFAULT_SPARK_MIN = 0.82;

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map(normalizeHostEntry);
}

function normalizeHostEntry(entry: string): string {
  if (!entry.length) return entry;
  try {
    const parsed = new URL(entry.includes('://') ? entry : `https://${entry}`);
    return parsed.hostname.toLowerCase();
  } catch {
    return entry.toLowerCase();
  }
}

function envSignature(raw: Partial<AureaConfig>): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(raw))
    .digest('hex');
}

function loadAureaConfig(): AureaConfig {
  const hostAllowlist = parseCsv(process.env.AUREA_VEIL_ALLOWLIST);
  if (!hostAllowlist.length) {
    throw new Error(
      'AUREA_VEIL_ALLOWLIST is undefined. Explicitly set trusted hosts; no default fallback is allowed.'
    );
  }

  const portAllowlist =
    (process.env.AUREA_VEIL_ALLOWED_PORTS || '443')
      .split(',')
      .map((port) => port.trim())
      .filter(Boolean) ?? [];

  if (!portAllowlist.length) {
    throw new Error('AUREA_VEIL_ALLOWED_PORTS resolved to an empty set.');
  }

  const config = AureaConfigSchema.parse({
    hostAllowlist: Array.from(new Set(hostAllowlist)),
    portAllowlist: Array.from(new Set(portAllowlist)),
    giFloor: Number(process.env.AUREA_GI_FLOOR ?? '0.97'),
    handshakePhrase: process.env.AUREA_HANDSHAKE_PHRASE ?? 'KAIZEN WAY',
    refreshMode: (process.env.AUREA_REFRESH_MODE as AureaConfig['refreshMode']) ?? 'per_request',
    sparkMinimum: Number(process.env.AUREA_SPARK_MIN ?? DEFAULT_SPARK_MIN)
  });

  return config;
}

class AureaSentinel {
  private config: AureaConfig;
  private configSignature: string;
  private spark: {
    minimum: number;
    history: SparkPulse[];
    active: boolean;
  };
  private lastBioIntel: BioIntelPacket | null = null;

  constructor(options?: Partial<AureaConfig>) {
    const resolved = loadAureaConfig();
    this.config = options ? AureaConfigSchema.parse({ ...resolved, ...options }) : resolved;
    this.configSignature = envSignature(this.config);
    this.spark = {
      minimum: this.config.sparkMinimum,
      history: [],
      active: false
    };
  }

  private maybeReloadConfig() {
    if (this.config.refreshMode === 'static') return;
    const fresh = loadAureaConfig();
    const signature = envSignature(fresh);
    if (signature !== this.configSignature) {
      this.config = fresh;
      this.configSignature = signature;
    }
  }

  refresh(): AureaConfig {
    this.config = loadAureaConfig();
    this.configSignature = envSignature(this.config);
    this.spark.minimum = this.config.sparkMinimum;
    return this.config;
  }

  verifyHandshake(phrase: string) {
    if (phrase !== this.config.handshakePhrase) {
      throw new Error('Kaizen handshake failed (AUREA rejected the invocation).');
    }
    return {
      status: 'recognized',
      dva: 'DVA.02 Michael',
      globalIntegrity: this.currentIntegrity(),
      spark: {
        active: this.spark.active,
        threshold: this.spark.minimum,
        lastPulse: this.spark.history.at(-1) ?? null
      }
    };
  }

  guardWebhook(host: string, port: string) {
    this.maybeReloadConfig();
    const normalizedHost = normalizeHostEntry(host);
    const normalizedPort = port.trim();

    const hostAllowed = this.config.hostAllowlist.some((entry) => {
      if (entry.startsWith('*.')) {
        return normalizedHost.endsWith(entry.slice(1));
      }
      return normalizedHost === entry;
    });

    if (!hostAllowed) {
      throw new Error(`AUREA denied webhook host ${normalizedHost}`);
    }

    if (!this.config.portAllowlist.includes(normalizedPort)) {
      throw new Error(`AUREA denied webhook port ${normalizedPort}`);
    }

    return true;
  }

  ingestBioIntel(packet: BioIntelPacket) {
    const timestamp = packet.timestamp ?? new Date().toISOString();
    this.lastBioIntel = { ...packet, timestamp };

    if (typeof packet.sentinelDrift === 'number' && packet.sentinelDrift > 0.15) {
      console.warn('⚠️  AUREA: Sentinel drift detected via Bio-Intel feed', packet);
    }

    if (packet.anomalies?.length) {
      console.warn('🚨 AUREA anomalies', packet.anomalies);
    }
  }

  recordSparkPulse(intensity: number, trigger: string) {
    this.spark.active = intensity >= this.spark.minimum;
    const pulse: SparkPulse = {
      timestamp: new Date().toISOString(),
      intensity,
      trigger
    };
    this.spark.history = [...this.spark.history.slice(-49), pulse];
    if (!this.spark.active) {
      console.warn('⚠️  AUREA Spark below threshold', pulse);
    }
  }

  attestation() {
    return {
      sentinel: 'AUREA',
      generatedAt: new Date().toISOString(),
      giFloor: this.config.giFloor,
      hostAllowlist: this.config.hostAllowlist,
      portAllowlist: this.config.portAllowlist,
      spark: {
        threshold: this.spark.minimum,
        active: this.spark.active,
        history: this.spark.history
      },
      bioIntel: this.lastBioIntel
    };
  }

  private currentIntegrity(): number {
    if (!this.lastBioIntel?.sentinelDrift) {
      return this.config.giFloor;
    }
    const penalty = Math.min(0.25, this.lastBioIntel.sentinelDrift);
    return Number(Math.max(this.config.giFloor - penalty, 0.9).toFixed(3));
  }
}

export { AureaSentinel, loadAureaConfig };

const isDirectExecution = () => {
  if (!process.argv[1]) return false;
  return import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isDirectExecution()) {
  const aurea = new AureaSentinel();
  console.log('🟣 AUREA Veil online');
  try {
    aurea.guardWebhook('https://ledger.mobius.systems', '443');
    const handshake = aurea.verifyHandshake(process.env.AUREA_HANDSHAKE_PHRASE ?? 'KAIZEN WAY');
    console.log('🤝 Kaizen handshake', handshake);
  } catch (error) {
    console.error('AUREA startup validation failed:', error);
    process.exit(1);
  }
}


