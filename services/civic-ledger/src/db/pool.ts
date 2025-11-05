import { Pool } from 'pg';

const useSSL = (process.env.PGSSL ?? 'false').toLowerCase() === 'true';

export const pool = new Pool({
  host: process.env.PGHOST ?? '127.0.0.1',
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'civic_ledger',
  user: process.env.PGUSER ?? 'civic',
  password: process.env.PGPASSWORD ?? 'civic',
  ssl: useSSL ? { rejectUnauthorized: false } : undefined
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

