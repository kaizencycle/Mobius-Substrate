import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL ?? process.env.INTEGRITY_CACHE_DB_URL;

if (!connectionString) {
  console.warn('[dbPool] DATABASE_URL not set. Using default local connection.');
}

export const dbPool = new Pool({
  connectionString,
  max: Number(process.env.DB_POOL_MAX ?? 10),
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? 30_000),
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONN_TIMEOUT_MS ?? 2_000),
});

dbPool.on('error', (err) => {
  console.error('[dbPool] Unexpected error on idle client', err);
});
