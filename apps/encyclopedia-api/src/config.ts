export interface EncyclopediaConfig {
  port: number;
  adminToken?: string;
}

export function loadConfig(): EncyclopediaConfig {
  return {
    port: Number(process.env.PORT ?? 4100),
    adminToken: process.env.ENCYCLOPEDIA_ADMIN_TOKEN,
  };
}
