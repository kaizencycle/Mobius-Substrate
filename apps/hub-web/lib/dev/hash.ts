// Stub module for hashing utilities
import crypto from 'crypto';

export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function shaHex(data: string): Promise<string> {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}

export default { hashData, shaHex, verifyHash };
