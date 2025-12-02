import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import { hmacMiddleware } from "./hmac";

const app = express();

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: "Rate limit exceeded", ok: false },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Preserve raw body for HMAC
app.use(bodyParser.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf.toString(); }
}));

// HMAC gate for all agent-originated traffic
app.use("/agent", hmacMiddleware());

// Example routed endpoint controlled by agents (behind gateway)
app.post("/agent/status", (req, res) => {
  // Ensure this logic only touches allowed domains/paths per policy (enforced upstream in your agent)
  res.json({ ok: true, received: req.body, at: new Date().toISOString() });
});

const port = process.env.PORT || 7860;
app.listen(port, () => console.log(`[gateway] listening on :${port}`));


