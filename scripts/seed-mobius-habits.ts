// Seed script for Mobius Habits testnet
// C-150: Creates initial data for habit profiles, shield runs, and sample reflections

import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL not set');
  }

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  const userId = 'kaizen';

  console.log('🔌 Connected to database');

  // 1) Ensure habit profile exists
  await client.query(
    `
    INSERT INTO habit_profiles (user_id, timezone)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE
      SET timezone = EXCLUDED.timezone,
          updated_at = NOW()
    `,
    [userId, 'America/New_York']
  );
  console.log('✅ habit_profile ensured for kaizen');

  // 2) Create this week's shield run if missing
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  // normalize to Monday as week start
  const day = weekStart.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  weekStart.setDate(weekStart.getDate() + diff);

  const weekStartStr = weekStart.toISOString().slice(0, 10);

  await client.query(
    `
    INSERT INTO citizen_shield_runs (
      user_id,
      week_start_date,
      step_update_devices,
      step_router_hygiene,
      step_browser_lockdown,
      step_2fa_check,
      step_backup_essentials,
      completion_score,
      gi_estimate
    )
    VALUES ($1, $2, FALSE, FALSE, FALSE, FALSE, FALSE, 0.0, 0.95)
    ON CONFLICT (user_id, week_start_date) DO NOTHING
    `,
    [userId, weekStartStr]
  );
  console.log(`✅ citizen_shield_run ensured for week ${weekStartStr}`);

  // 3) Optional: insert a sample daily_reflections row if none today
  const today = new Date().toISOString().slice(0, 10);
  const res = await client.query(
    `
    SELECT 1
    FROM daily_reflections
    WHERE user_id = $1 AND reflection_date = $2
    LIMIT 1
    `,
    [userId, today]
  );

  if (res.rowCount === 0) {
    await client.query(
      `
      INSERT INTO daily_reflections (
        user_id,
        reflection_date,
        worldview_text,
        mood_label,
        mood_intensity,
        intent_text,
        intent_category,
        echo_score,
        gi_score,
        echo_review_status
      )
      VALUES (
        $1,
        $2,
        'Seeding Mobius Habits. Small rituals, strong integrity.',
        'focused',
        0.9,
        'Connect Mobius Habits UI to backend.',
        'infrastructure',
        0.97,
        0.96,
        'verified'
      )
      `,
      [userId, today]
    );
    console.log(`✅ daily_reflections seeded for ${today}`);
  } else {
    console.log('ℹ️ daily_reflections already exists for today');
  }

  await client.end();
  console.log('✨ Seed complete');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
