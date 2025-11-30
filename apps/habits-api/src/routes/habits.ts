// Mobius Habits API Routes
// C-150: Reflections, Shield, Identity, Insights

import { Router } from 'express';
import { Pool } from 'pg';
import { computeMII, calculateShieldCompletionScore } from '@civic/integrity-core';
import { awardMIC, calculateWeeklyBonus } from '@civic/integrity-core';
import { checkShards, KaizenShardType } from '@civic/integrity-core';

const router = Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// GET /habits/dashboard?userId=kaizen
router.get('/dashboard', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'kaizen';
    const today = new Date().toISOString().slice(0, 10);

    const client = await pool.connect();
    try {
      const [reflection, shield] = await Promise.all([
        client.query(
          `SELECT worldview_text, mood_label, mood_intensity, intent_text, 
                  echo_score, gi_score, reflection_date
           FROM daily_reflections
           WHERE user_id = $1 AND reflection_date = $2
           LIMIT 1`,
          [userId, today]
        ),
        client.query(
          `SELECT *, week_start_date
           FROM citizen_shield_runs
           WHERE user_id = $1
           ORDER BY week_start_date DESC
           LIMIT 1`,
          [userId]
        ),
      ]);

      // Calculate current streak
      const streakResult = await client.query(
        `SELECT COUNT(*) as streak
         FROM (
           SELECT reflection_date,
                  ROW_NUMBER() OVER (ORDER BY reflection_date DESC) as rn,
                  reflection_date - (ROW_NUMBER() OVER (ORDER BY reflection_date DESC) || ' days')::interval as grp
           FROM daily_reflections
           WHERE user_id = $1
         ) t
         WHERE grp = (SELECT grp FROM (
           SELECT reflection_date,
                  ROW_NUMBER() OVER (ORDER BY reflection_date DESC) as rn,
                  reflection_date - (ROW_NUMBER() OVER (ORDER BY reflection_date DESC) || ' days')::interval as grp
           FROM daily_reflections
           WHERE user_id = $1
           ORDER BY reflection_date DESC
           LIMIT 1
         ) t2)`,
        [userId]
      );

      const streak = parseInt(streakResult.rows[0]?.streak || '0', 10);

      // Get total MIC
      const micResult = await client.query(
        `SELECT COALESCE(SUM(mic_points_awarded), 0) as total_mic
         FROM testnet_rewards
         WHERE user_id = $1`,
        [userId]
      );

      const totalMIC = parseInt(micResult.rows[0]?.total_mic || '0', 10);

      // Calculate MII
      const reflectionData = reflection.rows[0] ? {
        gi_score: reflection.rows[0].gi_score,
        echo_score: reflection.rows[0].echo_score,
      } : null;

      const shieldData = shield.rows[0] ? {
        completion_score: shield.rows[0].completion_score,
        gi_estimate: shield.rows[0].gi_estimate,
      } : null;

      const mii = computeMII(reflectionData, shieldData);

      res.json({
        userId,
        reflection: reflection.rows[0] ?? null,
        shield: shield.rows[0] ?? null,
        streak,
        totalMIC,
        mii,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /habits/reflection
router.post('/reflection', async (req, res) => {
  try {
    const {
      userId = 'kaizen',
      worldviewText,
      moodLabel,
      moodIntensity = 0.5,
      intentText,
    } = req.body ?? {};

    if (!worldviewText || !moodLabel || !intentText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const today = new Date().toISOString().slice(0, 10);
    const client = await pool.connect();

    try {
      // Insert or update reflection
      await client.query(
        `INSERT INTO daily_reflections (
          user_id, reflection_date, worldview_text,
          mood_label, mood_intensity, intent_text,
          echo_score, gi_score, echo_review_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 0.97, 0.96, 'verified')
        ON CONFLICT (user_id, reflection_date) DO UPDATE
          SET worldview_text = EXCLUDED.worldview_text,
              mood_label = EXCLUDED.mood_label,
              mood_intensity = EXCLUDED.mood_intensity,
              intent_text = EXCLUDED.intent_text,
              updated_at = NOW()`,
        [userId, today, worldviewText, moodLabel, moodIntensity, intentText]
      );

      // Get reflection data for MII calculation
      const reflectionResult = await client.query(
        `SELECT echo_score, gi_score
         FROM daily_reflections
         WHERE user_id = $1 AND reflection_date = $2`,
        [userId, today]
      );

      // Get current week's shield
      const weekStart = getWeekStart(new Date());
      const shieldResult = await client.query(
        `SELECT completion_score, gi_estimate
         FROM citizen_shield_runs
         WHERE user_id = $1 AND week_start_date = $2`,
        [userId, weekStart]
      );

      const reflectionData = reflectionResult.rows[0] ? {
        gi_score: reflectionResult.rows[0].gi_score,
        echo_score: reflectionResult.rows[0].echo_score,
      } : null;

      const shieldData = shieldResult.rows[0] ? {
        completion_score: shieldResult.rows[0].completion_score,
        gi_estimate: shieldResult.rows[0].gi_estimate,
      } : null;

      const mii = computeMII(reflectionData, shieldData);
      const micAwarded = awardMIC(mii);

      // Award MIC if eligible
      if (micAwarded > 0) {
        await client.query(
          `INSERT INTO testnet_rewards (
            user_id, date, mic_points_awarded, reason, mii_snapshot
          )
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT DO NOTHING`,
          [userId, today, micAwarded, 'daily_reflection', mii]
        );
      }

      // Check for Kaizen Shards (simplified - would need full stats)
      // This is a placeholder - full implementation would query user stats

      res.json({
        status: 'ok',
        mii_daily: mii,
        mic_awarded: micAwarded,
        kaizen_shard_unlocked: false,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Reflection submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /habits/shield/submit
router.post('/shield/submit', async (req, res) => {
  try {
    const { userId = 'kaizen', step, completed } = req.body ?? {};

    if (!step || typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Missing step or completed status' });
    }

    const weekStart = getWeekStart(new Date());
    const client = await pool.connect();

    try {
      // Get or create shield run for this week
      const existing = await client.query(
        `SELECT * FROM citizen_shield_runs
         WHERE user_id = $1 AND week_start_date = $2`,
        [userId, weekStart]
      );

      const stepColumn = `step_${step}`;
      const validSteps = ['update_devices', 'router_hygiene', 'browser_lockdown', '2fa_check', 'backup_essentials'];
      
      if (!validSteps.includes(step)) {
        return res.status(400).json({ error: 'Invalid step name' });
      }

      if (existing.rows.length === 0) {
        // Create new shield run
        const steps: Record<string, boolean> = {
          step_update_devices: false,
          step_router_hygiene: false,
          step_browser_lockdown: false,
          step_2fa_check: false,
          step_backup_essentials: false,
        };
        steps[stepColumn] = completed;

        const completionScore = calculateShieldCompletionScore({
          step_update_devices: steps.step_update_devices,
          step_router_hygiene: steps.step_router_hygiene,
          step_browser_lockdown: steps.step_browser_lockdown,
          step_2fa_check: steps.step_2fa_check,
          step_backup_essentials: steps.step_backup_essentials,
        });

        await client.query(
          `INSERT INTO citizen_shield_runs (
            user_id, week_start_date,
            step_update_devices, step_router_hygiene, step_browser_lockdown,
            step_2fa_check, step_backup_essentials,
            completion_score, gi_estimate
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0.95)`,
          [
            userId,
            weekStart,
            steps.step_update_devices,
            steps.step_router_hygiene,
            steps.step_browser_lockdown,
            steps.step_2fa_check,
            steps.step_backup_essentials,
            completionScore,
          ]
        );
      } else {
        // Update existing shield run
        await client.query(
          `UPDATE citizen_shield_runs
           SET ${stepColumn} = $1,
               updated_at = NOW()
           WHERE user_id = $2 AND week_start_date = $3`,
          [completed, userId, weekStart]
        );

        // Recalculate completion score
        const updated = await client.query(
          `SELECT step_update_devices, step_router_hygiene, step_browser_lockdown,
                  step_2fa_check, step_backup_essentials
           FROM citizen_shield_runs
           WHERE user_id = $1 AND week_start_date = $2`,
          [userId, weekStart]
        );

        if (updated.rows.length > 0) {
          const completionScore = calculateShieldCompletionScore({
            step_update_devices: updated.rows[0].step_update_devices,
            step_router_hygiene: updated.rows[0].step_router_hygiene,
            step_browser_lockdown: updated.rows[0].step_browser_lockdown,
            step_2fa_check: updated.rows[0].step_2fa_check,
            step_backup_essentials: updated.rows[0].step_backup_essentials,
          });

          await client.query(
            `UPDATE citizen_shield_runs
             SET completion_score = $1
             WHERE user_id = $2 AND week_start_date = $3`,
            [completionScore, userId, weekStart]
          );

          // Award weekly bonus if all steps complete
          if (completionScore >= 1.0) {
            const reflectionCount = await client.query(
              `SELECT COUNT(*) as count
               FROM daily_reflections
               WHERE user_id = $1
                 AND reflection_date >= $2
                 AND reflection_date < $2 + INTERVAL '7 days'`,
              [userId, weekStart]
            );

            const count = parseInt(reflectionCount.rows[0]?.count || '0', 10);
            const bonus = calculateWeeklyBonus(count, true);

            if (bonus > 0) {
              await client.query(
                `INSERT INTO testnet_rewards (
                  user_id, date, mic_points_awarded, reason, mii_snapshot
                )
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING`,
                [userId, weekStart, bonus, 'weekly_shield_bonus', 0.95]
              );
            }
          }
        }
      }

      const final = await client.query(
        `SELECT completion_score, gi_estimate
         FROM citizen_shield_runs
         WHERE user_id = $1 AND week_start_date = $2`,
        [userId, weekStart]
      );

      res.json({
        completion_score: final.rows[0]?.completion_score || 0,
        gi_estimate: final.rows[0]?.gi_estimate || 0.95,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Shield submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /habits/identity
router.get('/identity', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'kaizen';
    const client = await pool.connect();

    try {
      const [micResult, shardsResult] = await Promise.all([
        client.query(
          `SELECT COALESCE(SUM(mic_points_awarded), 0) as total_mic
           FROM testnet_rewards
           WHERE user_id = $1`,
          [userId]
        ),
        client.query(
          `SELECT DISTINCT unnest(kaizen_shards_awarded) as shard
           FROM testnet_rewards
           WHERE user_id = $1 AND kaizen_shards_awarded IS NOT NULL`,
          [userId]
        ),
      ]);

      // Calculate average MII
      const miiResult = await client.query(
        `SELECT AVG(mii_snapshot) as avg_mii
         FROM testnet_rewards
         WHERE user_id = $1 AND mii_snapshot IS NOT NULL`,
        [userId]
      );

      res.json({
        mobius_id: userId,
        mic_total: parseInt(micResult.rows[0]?.total_mic || '0', 10),
        kaizen_shards: shardsResult.rows.map((r) => r.shard) as KaizenShardType[],
        mii_average: parseFloat(miiResult.rows[0]?.avg_mii || '0'),
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /habits/insights
router.get('/insights', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'kaizen';
    const client = await pool.connect();

    try {
      // Calculate streak
      const streakResult = await client.query(
        `SELECT COUNT(*) as streak
         FROM (
           SELECT reflection_date,
                  ROW_NUMBER() OVER (ORDER BY reflection_date DESC) as rn,
                  reflection_date - (ROW_NUMBER() OVER (ORDER BY reflection_date DESC) || ' days')::interval as grp
           FROM daily_reflections
           WHERE user_id = $1
         ) t
         WHERE grp = (SELECT grp FROM (
           SELECT reflection_date,
                  ROW_NUMBER() OVER (ORDER BY reflection_date DESC) as rn,
                  reflection_date - (ROW_NUMBER() OVER (ORDER BY reflection_date DESC) || ' days')::interval as grp
           FROM daily_reflections
           WHERE user_id = $1
           ORDER BY reflection_date DESC
           LIMIT 1
         ) t2)`,
        [userId]
      );

      const streak = parseInt(streakResult.rows[0]?.streak || '0', 10);

      // Get today's MII
      const today = new Date().toISOString().slice(0, 10);
      const reflectionResult = await client.query(
        `SELECT echo_score, gi_score
         FROM daily_reflections
         WHERE user_id = $1 AND reflection_date = $2`,
        [userId, today]
      );

      const weekStart = getWeekStart(new Date());
      const shieldResult = await client.query(
        `SELECT completion_score
         FROM citizen_shield_runs
         WHERE user_id = $1 AND week_start_date = $2`,
        [userId, weekStart]
      );

      const reflectionData = reflectionResult.rows[0] ? {
        gi_score: reflectionResult.rows[0].gi_score,
        echo_score: reflectionResult.rows[0].echo_score,
      } : null;

      const shieldData = shieldResult.rows[0] ? {
        completion_score: shieldResult.rows[0].completion_score,
      } : null;

      const mii = computeMII(reflectionData, shieldData);

      // Get weekly shield completion
      const shieldWeekly = shieldResult.rows[0]?.completion_score || 0;

      // Get graph points (last 7 days)
      const graphResult = await client.query(
        `SELECT reflection_date, echo_score, gi_score
         FROM daily_reflections
         WHERE user_id = $1
           AND reflection_date >= CURRENT_DATE - INTERVAL '7 days'
         ORDER BY reflection_date ASC`,
        [userId]
      );

      const graphPoints = graphResult.rows.map((row) => {
        const shieldForDate = shieldData; // Simplified - would need per-day shield data
        return {
          date: row.reflection_date,
          mii: computeMII(
            { gi_score: row.gi_score, echo_score: row.echo_score },
            shieldForDate
          ),
        };
      });

      res.json({
        streak,
        mii_daily: mii,
        shield_weekly: shieldWeekly,
        graph_points: graphPoints,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get week start (Monday)
function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Adjust to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default router;
