// Database migration utilities and connection setup
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function runMigration(version: number, name: string, sql: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, skipping migration');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if migration already applied
    const checkResult = await client.query(
      'SELECT version FROM schema_migrations WHERE version = $1',
      [version]
    );
    
    if (checkResult.rows.length > 0) {
      console.log(`Migration ${version} (${name}) already applied, skipping`);
      await client.query('COMMIT');
      return;
    }
    
    // Run migration
    await client.query(sql);
    
    // Record migration
    await client.query(
      'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
      [version, name]
    );
    
    await client.query('COMMIT');
    console.log(`Migration ${version} (${name}) applied successfully`);
  } catch (error: any) {
    await client.query('ROLLBACK');
    // If schema_migrations table doesn't exist, create it first
    if (error.code === '42P01') {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      await client.query('COMMIT');
      // Retry migration
      return runMigration(version, name, sql);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getDatabaseClient(): Promise<PoolClient> {
  return await pool.connect();
}

export { pool };
