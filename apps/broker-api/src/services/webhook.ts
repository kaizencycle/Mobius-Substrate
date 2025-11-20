import fetch from 'node-fetch';

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/,
  /^127\./,
  /^192\.168\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
];

const DEFAULT_WEBHOOK_HOSTS = [
  'hooks.slack.com',
  'hooks.slack-edge.com',
  'discord.com',
  'discordapp.com',
];

function normalizeHostEntry(entry?: string): string | null {
  if (!entry) {
    return null;
  }
  const trimmed = entry.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.includes('://')) {
    try {
      return new URL(trimmed).hostname.toLowerCase();
    } catch {
      return null;
    }
  }
  return trimmed.toLowerCase();
}

type WebhookConfig = {
  hostAllowlist: string[];
  allowedPorts: Set<string>;
  source: 'env' | 'default';
};

let cachedConfig: WebhookConfig | null = null;
let cachedEnvKey: string | null = null;
let warnedAllowlistFallback = false;
let warnedPortFallback = false;

function envKey(): string {
  return [
    process.env.BROKER_WEBHOOK_ALLOWLIST ?? '',
    process.env.BROKER_WEBHOOK_ALLOWED_PORTS ?? '',
    process.env.BROKER_WEBHOOK_ALLOW_DEFAULTS ?? '',
    process.env.NODE_ENV ?? ''
  ].join('|');
}

function buildWebhookConfig(): WebhookConfig {
  const configuredWebhookHosts = (process.env.BROKER_WEBHOOK_ALLOWLIST || '')
    .split(',')
    .map(normalizeHostEntry)
    .filter((value): value is string => Boolean(value));

  const allowDefaults =
    process.env.BROKER_WEBHOOK_ALLOW_DEFAULTS === 'true' ||
    ['development', 'test'].includes(process.env.NODE_ENV ?? '');

  let hostAllowlist = configuredWebhookHosts;
  let source: WebhookConfig['source'] = 'env';

  if (!hostAllowlist.length) {
    if (!allowDefaults) {
      throw new Error(
        'BROKER_WEBHOOK_ALLOWLIST is empty. Explicitly configure allowed webhook hosts for this environment.'
      );
    }
    hostAllowlist = DEFAULT_WEBHOOK_HOSTS;
    source = 'default';
    if (!warnedAllowlistFallback) {
      console.warn(
        '[broker:webhook] Falling back to DEFAULT_WEBHOOK_HOSTS. Set BROKER_WEBHOOK_ALLOWLIST to avoid this warning.'
      );
      warnedAllowlistFallback = true;
    }
  }

  const configuredWebhookPorts = (process.env.BROKER_WEBHOOK_ALLOWED_PORTS || '')
    .split(',')
    .map((port) => port.trim())
    .filter(Boolean);

  let portAllowlist = configuredWebhookPorts;
  if (!portAllowlist.length) {
    if (!warnedPortFallback) {
      console.warn('[broker:webhook] No BROKER_WEBHOOK_ALLOWED_PORTS provided. Defaulting to 443.');
      warnedPortFallback = true;
    }
    portAllowlist = ['443'];
  }

  return {
    hostAllowlist: Array.from(new Set(hostAllowlist)),
    allowedPorts: new Set([...new Set(portAllowlist), '443']),
    source
  };
}

function shouldHotReload(): boolean {
  return process.env.BROKER_WEBHOOK_HOT_RELOAD === 'true';
}

export function getWebhookConfig(force = false): WebhookConfig {
  const key = envKey();
  if (
    !cachedConfig ||
    force ||
    (shouldHotReload() && key !== cachedEnvKey)
  ) {
    cachedConfig = buildWebhookConfig();
    cachedEnvKey = key;
  }
  return cachedConfig;
}

export function refreshWebhookConfig(): WebhookConfig {
  cachedConfig = buildWebhookConfig();
  cachedEnvKey = envKey();
  return cachedConfig;
}

function hostMatchesAllowlist(hostname: string, config: WebhookConfig): boolean {
  const lowerHost = hostname.toLowerCase();
  return config.hostAllowlist.some((entry) => {
    const normalized = entry.startsWith('*.') ? entry.slice(2) : entry;
    if (!normalized) {
      return false;
    }
    return lowerHost === normalized || lowerHost.endsWith(`.${normalized}`);
  });
}

/**
 * Validate webhook URL to prevent SSRF attacks
 */
function validateWebhookUrl(url: string): URL {
  if (!url || typeof url !== 'string') {
    throw new Error('Invalid webhook URL: must be a non-empty string');
  }
  
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid webhook URL format: ${url}`);
  }
  
  if (parsedUrl.protocol !== 'https:') {
    throw new Error(`Only HTTPS webhooks allowed: ${url}`);
  }
  
  const config = getWebhookConfig();
  const hostname = parsedUrl.hostname.toLowerCase();
  if (PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    throw new Error(`Private IP addresses not allowed in webhook URL: ${hostname}`);
  }
  
  if (!hostMatchesAllowlist(hostname, config)) {
    throw new Error(`Webhook host is not allowlisted: ${hostname}`);
  }
  
  const effectivePort = parsedUrl.port || '443';
  if (!config.allowedPorts.has(effectivePort)) {
    throw new Error(`Webhook port is not allowed: ${effectivePort}`);
  }
  
  if (parsedUrl.pathname.includes('..') || parsedUrl.pathname.includes('//')) {
    throw new Error(`Path traversal not allowed in webhook URL: ${parsedUrl.pathname}`);
  }
  
  parsedUrl.username = '';
  parsedUrl.password = '';
  return parsedUrl;
}

export async function notifyWebhook(url: string, payload: any): Promise<void> {
  let safeUrl: URL;
  try {
    safeUrl = validateWebhookUrl(url);
  } catch (error) {
    console.error('Webhook URL validation failed:', error);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(safeUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Webhook notification failed: ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Webhook notification timeout after 5 seconds');
    } else {
      console.error('Webhook notification error:', error);
    }
  } finally {
    clearTimeout(timeout);
  }
}
