// C-148 • Strange Metamorphosis Loop
// Daily Reflection Model for PostgreSQL

import { Pool } from "pg";
import { DailyReflection } from "./types";

export class DailyReflectionModel {
  constructor(private pool: Pool) {}

  async upsert(reflection: DailyReflection): Promise<DailyReflection> {
    const {
      userId,
      reflectionDate,
      worldviewText,
      worldviewSentiment,
      moodLabel,
      moodIntensity,
      intentText,
      intentCategory,
      intentConfidence,
      echoScore,
      giScore,
      echoReviewStatus,
      ledgerAttestationId,
      metadata,
    } = reflection;

    const res = await this.pool.query(
      `
      INSERT INTO daily_reflections (
        user_id,
        reflection_date,
        worldview_text,
        worldview_sentiment,
        mood_label,
        mood_intensity,
        intent_text,
        intent_category,
        intent_confidence,
        echo_score,
        gi_score,
        echo_review_status,
        ledger_attestation_id,
        metadata
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      ON CONFLICT (user_id, reflection_date)
      DO UPDATE SET
        worldview_text = EXCLUDED.worldview_text,
        worldview_sentiment = EXCLUDED.worldview_sentiment,
        mood_label = EXCLUDED.mood_label,
        mood_intensity = EXCLUDED.mood_intensity,
        intent_text = EXCLUDED.intent_text,
        intent_category = EXCLUDED.intent_category,
        intent_confidence = EXCLUDED.intent_confidence,
        echo_score = EXCLUDED.echo_score,
        gi_score = EXCLUDED.gi_score,
        echo_review_status = EXCLUDED.echo_review_status,
        ledger_attestation_id = EXCLUDED.ledger_attestation_id,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *;
      `,
      [
        userId,
        reflectionDate,
        worldviewText ?? null,
        worldviewSentiment ?? null,
        moodLabel ?? null,
        moodIntensity ?? null,
        intentText ?? null,
        intentCategory ?? null,
        intentConfidence ?? null,
        echoScore ?? null,
        giScore ?? null,
        echoReviewStatus ?? "pending",
        ledgerAttestationId ?? null,
        metadata ? JSON.stringify(metadata) : "{}",
      ]
    );

    const row = res.rows[0];
    return this.mapRowToReflection(row);
  }

  async findByUserAndDate(
    userId: string,
    reflectionDate: string
  ): Promise<DailyReflection | null> {
    const res = await this.pool.query(
      `SELECT * FROM daily_reflections WHERE user_id = $1 AND reflection_date = $2`,
      [userId, reflectionDate]
    );
    if (!res.rowCount || res.rows.length === 0) return null;
    return this.mapRowToReflection(res.rows[0]);
  }

  private mapRowToReflection(row: any): DailyReflection {
    return {
      id: row.id,
      userId: row.user_id,
      reflectionDate: row.reflection_date,
      worldviewText: row.worldview_text,
      worldviewSentiment: row.worldview_sentiment,
      moodLabel: row.mood_label,
      moodIntensity: row.mood_intensity ? parseFloat(row.mood_intensity) : undefined,
      intentText: row.intent_text,
      intentCategory: row.intent_category,
      intentConfidence: row.intent_confidence ? parseFloat(row.intent_confidence) : undefined,
      echoScore: row.echo_score ? parseFloat(row.echo_score) : undefined,
      giScore: row.gi_score ? parseFloat(row.gi_score) : undefined,
      echoReviewStatus: row.echo_review_status,
      ledgerAttestationId: row.ledger_attestation_id,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
