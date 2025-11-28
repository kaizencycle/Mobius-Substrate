// C-148 • Strange Metamorphosis Loop
// Daily Reflections API Routes

import { Router } from "express";
import { Pool } from "pg";
import { DailyReflectionModel } from "@mobius/echo-layer";
import { scoreReflection } from "../../services/echo/reflectionScoring";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const router = Router();
const model = new DailyReflectionModel(pool);

// POST /v1/reflections/daily
router.post("/v1/reflections/daily", async (req, res, next) => {
    try {
      const {
        user_id,
        date,
        worldview_text,
        mood_label,
        mood_intensity,
        intent_text,
        intent_category,
        metadata,
      } = req.body || {};

      if (!user_id || !date) {
        return res.status(400).json({
          error: "user_id and date are required",
        });
      }

      const scores = await scoreReflection({
        worldviewText: worldview_text,
        moodLabel: mood_label,
        moodIntensity: mood_intensity,
        intentText: intent_text,
      });

      const saved = await model.upsert({
        userId: user_id,
        reflectionDate: date,
        worldviewText: worldview_text,
        moodLabel: mood_label,
        moodIntensity: mood_intensity,
        intentText: intent_text,
        intentCategory: intent_category,
        echoScore: scores.echoScore,
        giScore: scores.giScore,
        echoReviewStatus: scores.reviewStatus,
        metadata,
      });

      res.json(saved);
    } catch (err) {
      next(err);
    }
  });

// GET /v1/reflections/daily/:userId
router.get("/v1/reflections/daily/:userId", async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ error: "date query param required" });
      }
      const reflection = await model.findByUserAndDate(
        userId,
        String(date)
      );
      if (!reflection) {
        return res.status(404).json({ error: "not_found" });
      }
      res.json(reflection);
    } catch (err) {
      next(err);
    }
  });

export default router;
