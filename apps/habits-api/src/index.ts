// Mobius Habits API
// C-150: Daily Reflections + Citizen Shield endpoints

import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import habitsRouter from './routes/habits';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Trust proxy for accurate IP detection behind reverse proxies
app.set('trust proxy', 1);

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.path === '/health', // Skip health checks
});

// Strict rate limiter for write operations: 20 requests per minute
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Write rate limit exceeded, please slow down.' },
});

app.use(globalLimiter);

// Health check (not rate limited)
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mobius-habits-api', version: '1.0.0' });
});

// API routes with write limiter applied to POST endpoints
app.use('/habits', habitsRouter);

// Export rate limiters for route-level use
export { writeLimiter };

const port = process.env.PORT || 4005;
app.listen(port, () => {
  console.log(`🌀 Mobius Habits API listening on port ${port}`);
});
