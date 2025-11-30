// Mobius Habits API
// C-150: Daily Reflections + Citizen Shield endpoints

import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import habitsRouter from './routes/habits';

dotenv.config();

const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mobius-habits-api', version: '1.0.0' });
});

// API routes
app.use('/habits', habitsRouter);

const port = process.env.PORT || 4005;
app.listen(port, () => {
  console.log(`🌀 Mobius Habits API listening on port ${port}`);
});
