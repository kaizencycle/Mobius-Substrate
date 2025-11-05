import type { IdentityRecord } from '../types.js';

export async function getIdentityForWallet(walletAddress: string): Promise<IdentityRecord | null> {
  // TODO: integrate with real identity / KYC provider
  // returning a harmless mock for now
  return {
    identityId: `mock-${walletAddress.slice(0, 6)}`,
    countryCode: 'US',
    createdAtISO: new Date(Date.now() - 21 * 86400_000).toISOString()
  };
}

export async function isKYCVerified(identityId: string): Promise<boolean> {
  // TODO: call KYC provider API
  return true; // mock: everyone verified in dev
}

