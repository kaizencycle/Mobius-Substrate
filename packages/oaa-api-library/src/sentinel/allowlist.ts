const BASE_HOSTS = [
  "reuters.com",
  "apnews.com",
  "bloomberg.com",
  "who.int",
  "nasa.gov",
  "ecb.europa.eu",
  "bis.org",
  "fema.gov",
  "civil-protection-humanitarian-aid.ec.europa.eu",
  "ec.europa.eu",
  "bsi.bund.de",
];

export const ALLOWLIST = new Set(BASE_HOSTS);

/**
 * Block private/internal IP addresses and localhost to prevent SSRF attacks
 */
export function isPrivateIP(hostname: string): boolean {
  // Block localhost variants
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return true;
  }
  
  // Block private IP ranges (RFC 1918)
  const privatePatterns = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
    /^192\.168\./,             // 192.168.0.0/16
    /^169\.254\./,             // Link-local (169.254.0.0/16)
    /^0\./,                    // 0.0.0.0/8
  ];
  
  return privatePatterns.some(pattern => pattern.test(hostname));
}

/**
 * Validate URL is safe from SSRF attacks
 */
export function isAllowed(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    
    // Block private/internal IPs
    if (isPrivateIP(host)) {
      return false;
    }
    
    // Require HTTPS protocol (prevents redirect attacks)
    if (parsed.protocol !== 'https:') {
      return false;
    }
    
    // Block path traversal attempts
    if (parsed.pathname.includes('..') || parsed.pathname.includes('//')) {
      return false;
    }
    
    // Check against allowlist
    for (const allowed of ALLOWLIST) {
      if (host === allowed) {
        return true;
      }
      if (host.endsWith(`.${allowed}`)) {
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Ensure URL is allowed and safe from SSRF attacks
 * Throws if URL is not in allowlist or contains SSRF indicators
 */
export function ensureAllowed(urlStr: string): string {
  if (!isAllowed(urlStr)) {
    throw new Error(`Domain not in allowlist or SSRF risk detected: ${urlStr}`);
  }
  return urlStr;
}

