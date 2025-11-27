export function parseNumberParam(
  value: unknown,
  fallback: number,
  options: { min?: number; max?: number } = {}
): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  if (options.min !== undefined && parsed < options.min) {
    return options.min;
  }

  if (options.max !== undefined && parsed > options.max) {
    return options.max;
  }

  return parsed;
}

export function parseTopicsParam(value: unknown): string[] | undefined {
  if (typeof value === "string") {
    const items = value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 0);
    return items.length > 0 ? items : undefined;
  }

  if (Array.isArray(value)) {
    const items = value
      .map((part) => String(part).trim().toLowerCase())
      .filter((part) => part.length > 0);
    return items.length > 0 ? items : undefined;
  }

  return undefined;
}
