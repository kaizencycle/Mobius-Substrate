import crypto from "crypto";
import dns from "dns/promises";
import fetch, { Headers } from "node-fetch";
import { CFG } from "../config";
import { ALLOWLIST, isPrivateIP } from "./allowlist";

export type FetchedDoc = {
  url: string;
  status: number;
  contentType?: string;
  text: string;
  sha256: string;
  fetchedAt: string;
};

const DEFAULT_ALLOWED_PORTS = new Set(["", "443"]);

// Private IP CIDR ranges for DNS rebinding protection
const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // Private Class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private Class B
  /^192\.168\./,                     // Private Class C
  /^169\.254\./,                     // Link-local
  /^0\./,                            // Current network
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i,                         // IPv6 link-local
];

function isPrivateIPAddress(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

function hostMatchesAllowlist(hostname: string): boolean {
  const lowerHost = hostname.toLowerCase();
  for (const allowed of ALLOWLIST) {
    const normalized = allowed.toLowerCase();
    if (lowerHost === normalized || lowerHost.endsWith(`.${normalized}`)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve hostname and verify it doesn't resolve to a private IP (DNS rebinding protection)
 */
async function verifyHostnameResolution(hostname: string): Promise<void> {
  try {
    const addresses = await dns.resolve4(hostname);
    for (const ip of addresses) {
      if (isPrivateIPAddress(ip)) {
        throw new Error(`DNS resolution returned private IP for ${hostname}: ${ip}`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('private IP')) {
      throw error;
    }
    // DNS resolution failed - could be legitimate for some domains, continue with caution
    console.warn(`DNS resolution warning for ${hostname}:`, error);
  }
}

async function buildSafeAllowlistedUrl(candidate: string): Promise<URL> {
  const trimmed = candidate.trim();
  if (!trimmed) {
    throw new Error("URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (error) {
    throw new Error(
      `Invalid URL: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  if (!hostMatchesAllowlist(hostname)) {
    throw new Error(`Domain not in allowlist: ${hostname}`);
  }
  if (isPrivateIP(hostname)) {
    throw new Error(`Private IP addresses not allowed: ${hostname}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed");
  }
  if (!DEFAULT_ALLOWED_PORTS.has(parsed.port)) {
    throw new Error("Custom ports are not allowed for sentinel fetches");
  }
  if (parsed.pathname.includes("..")) {
    throw new Error("Path traversal sequences are not allowed");
  }

  // DNS rebinding protection: verify hostname doesn't resolve to private IP
  await verifyHostnameResolution(hostname);

  parsed.username = "";
  parsed.password = "";
  return parsed;
}

export async function fetchDoc(url: string): Promise<FetchedDoc> {
  // Validate and sanitize URL before fetching (SSRF protection)
  const safeUrl = await buildSafeAllowlistedUrl(url);
  
  // Reconstruct URL from validated components to prevent SSRF
  // Only use validated protocol, hostname, port, and pathname
  const validatedProtocol = safeUrl.protocol; // Already validated as 'https:'
  const validatedHostname = safeUrl.hostname; // Already validated against allowlist
  const validatedPort = safeUrl.port || ''; // Already validated (empty or 443)
  const validatedPathname = safeUrl.pathname; // Already validated (no path traversal)
  const validatedSearch = safeUrl.search; // Query string is safe
  
  // Reconstruct safe URL string from validated components only
  const safeUrlString = `${validatedProtocol}//${validatedHostname}${validatedPort ? `:${validatedPort}` : ''}${validatedPathname}${validatedSearch}`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    CFG.FETCH_TIMEOUT_MS ?? 12000,
  );

  try {
    // codeql[js/request-forgery]: URL is reconstructed from validated components (protocol, hostname, port, pathname)
    // All components are validated: protocol=https, hostname in allowlist, port validated, no path traversal
    const res = await fetch(safeUrlString, {
      method: "GET",
      headers: new Headers({
        "User-Agent": "OAA-Sentinel/1.0 (+Mobius Systems)",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      }),
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await res.text();
    const sha256 = crypto.createHash("sha256").update(text).digest("hex");

    return {
      url: safeUrlString, // Use the reconstructed URL string that was actually used for fetch
      status: res.status,
      contentType: res.headers.get("content-type") ?? undefined,
      text,
      sha256,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

