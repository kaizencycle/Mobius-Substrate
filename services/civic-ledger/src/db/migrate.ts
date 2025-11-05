import fs from 'node:fs';
import path from 'node:path';
import { pool } from './pool.js';

async function ensureMigrationTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function applied(): Promise<Set<string>> {
  const res = await pool.query('SELECT name FROM _migrations');
  return new Set(res.rows.map((r: any) => r.name));
}

async function runFile(name: string, sql: string) {
  await pool.query(sql);
  await pool.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [name]);
}

async function recreateIfAsked() {
  if (process.argv.includes('--recreate')) {
    // Danger: dev-only convenience
    await pool.query('DROP TABLE IF EXISTS epoch_attestations CASCADE');
    await pool.query('DROP TABLE IF EXISTS gi_samples CASCADE');
    await pool.query('DROP TABLE IF EXISTS _migrations CASCADE');
  }
}

async function main() {
  await recreateIfAsked();
  await ensureMigrationTable();
  const done = await applied();

  const dir = path.resolve(process.cwd(), 'src/db/migrations');
  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const f of files) {
    if (done.has(f)) continue;
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    console.log('Applying migration:', f);
    await runFile(f, sql);
  }
  console.log('Migrations complete.');
  process.exit(0);
}

main().catch(e => {
  console.error('Migration failed:', e);
  process.exit(1);
});

