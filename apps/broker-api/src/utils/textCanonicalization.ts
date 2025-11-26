/**
 * Text Canonicalization Utilities
 * Normalizes questions for exact cache key matching
 */

import crypto from 'crypto';

/**
 * Normalize text for canonical comparison
 * - Trim whitespace
 * - Normalize multiple spaces to single space
 * - Convert to lowercase
 */
export function canonicalizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Generate canonical key (SHA-256 hash) for exact cache lookup
 */
export function canonicalizeKey(input: string): string {
  const norm = canonicalizeText(input);
  return crypto.createHash('sha256').update(norm, 'utf8').digest('hex');
}

