// MIC/KS Conversion Utilities
// Cycle: C-151

import { KS_PER_MIC, MIC_DECIMALS } from './constants';

/**
 * Convert MIC to Kaizen Shards (KS)
 * 
 * @param mic - Amount in MIC
 * @returns Amount in KS (integer)
 * @throws Error if mic is negative
 */
export function micToKS(mic: number): number {
  if (mic < 0) {
    throw new Error('Negative MIC not allowed');
  }
  return Math.round(mic * KS_PER_MIC);
}

/**
 * Convert Kaizen Shards (KS) to MIC
 * 
 * @param ks - Amount in KS (integer)
 * @returns Amount in MIC
 * @throws Error if ks is not an integer or is negative
 */
export function ksToMIC(ks: number): number {
  if (!Number.isInteger(ks)) {
    throw new Error('KS must be an integer');
  }
  if (ks < 0) {
    throw new Error('Negative KS not allowed');
  }
  return ks / KS_PER_MIC;
}

/**
 * Format MIC for display with proper precision
 * 
 * @param mic - Amount in MIC
 * @returns Formatted string with 6 decimal places
 */
export function formatMIC(mic: number): string {
  return mic.toFixed(MIC_DECIMALS);
}

/**
 * Format KS for display with thousands separators
 * 
 * @param ks - Amount in KS
 * @returns Formatted string with commas
 */
export function formatKS(ks: number): string {
  return ks.toLocaleString('en-US');
}

/**
 * Validate that MIC and KS are consistent
 * 
 * @param mic - Amount in MIC
 * @param ks - Amount in KS
 * @returns True if consistent, false otherwise
 */
export function validateConsistency(mic: number, ks: number): boolean {
  const expectedKS = micToKS(mic);
  return expectedKS === ks;
}

/**
 * Create a balance object with both MIC and KS
 * 
 * @param mic - Amount in MIC
 * @returns Object with both representations
 */
export function createBalance(mic: number): { mic: number; ks: number } {
  return {
    mic: Number(mic.toFixed(MIC_DECIMALS)),
    ks: micToKS(mic)
  };
}

/**
 * Parse a currency string to MIC
 * Handles both MIC and KS input formats
 * 
 * @param value - String like "1.5 MIC" or "150000 KS"
 * @returns Amount in MIC
 */
export function parseCurrency(value: string): number {
  const normalized = value.trim().toUpperCase();
  
  if (normalized.endsWith('MIC')) {
    const num = parseFloat(normalized.replace('MIC', '').trim());
    return isNaN(num) ? 0 : num;
  }
  
  if (normalized.endsWith('KS')) {
    const num = parseInt(normalized.replace('KS', '').trim().replace(/,/g, ''), 10);
    return isNaN(num) ? 0 : ksToMIC(num);
  }
  
  // Assume MIC if no suffix
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

/**
 * Add two MIC amounts safely
 * 
 * @param a - First amount in MIC
 * @param b - Second amount in MIC
 * @returns Sum in MIC with proper precision
 */
export function addMIC(a: number, b: number): number {
  // Use KS for precision
  const sumKS = micToKS(a) + micToKS(b);
  return ksToMIC(sumKS);
}

/**
 * Subtract MIC amounts safely
 * 
 * @param a - Amount to subtract from (MIC)
 * @param b - Amount to subtract (MIC)
 * @returns Difference in MIC (clamped to 0)
 */
export function subtractMIC(a: number, b: number): number {
  const diffKS = Math.max(0, micToKS(a) - micToKS(b));
  return ksToMIC(diffKS);
}
