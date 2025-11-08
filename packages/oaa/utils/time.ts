export const timestamp = (): string =>
  new Date().toISOString().replace(/[:.]/g, "-");
