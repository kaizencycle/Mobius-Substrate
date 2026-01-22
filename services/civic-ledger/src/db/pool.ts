import { Pool } from 'pg';

const useSSL = (process.env.PGSSL ?? 'false').toLowerCase() === 'true';
// Only disable certificate verification if explicitly set (e.g., for self-signed certs in dev)
const rejectUnauthorized = (process.env.PGSSL_REJECT_UNAUTHORIZED ?? 'true').toLowerCase() !== 'false';

// Database credentials - require environment variables for security
const pgPassword = process.env.PGPASSWORD;
if (!pgPassword) {
  console.warn('Warning: PGPASSWORD environment variable not set');
}

export const pool = new Pool({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'civic_ledger',
  user: process.env.PGUSER ?? 'postgres',
  password: pgPassword,
  ssl: useSSL ? { rejectUnauthorized } : undefined
});

export async function withTx<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

