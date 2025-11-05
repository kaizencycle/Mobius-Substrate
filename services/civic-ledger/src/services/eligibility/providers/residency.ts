export async function checkResidency(countryCode: string | undefined, allowList: string[]): Promise<boolean> {
  if (!countryCode) return false;
  return allowList.includes(countryCode.toUpperCase());
}

