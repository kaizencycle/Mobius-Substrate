import express from "express";
import rateLimit from "express-rate-limit";
import { makeRelayRoute } from "./routes/relay.js";
import { sseEndpoint } from "./events.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadConfig() {
  const cfgPath = path.join(__dirname, "../../../configs/kaizen_bridge.yaml");
  const content = fs.readFileSync(cfgPath, "utf8");
  return yaml.parse(content);
}

const cfg = loadConfig();
const app = express();
app.use(express.json({ limit: "512kb" }));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { error: "Rate limit exceeded", status: "error" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/health", (_req,res)=> res.json({ status:"ok", service:"kaizen-bridge-broker" }));
app.get("/events/relays", sseEndpoint);
app.post("/relay", makeRelayRoute(cfg));

export function start() {
  const port = cfg.listen.broker_port || 4010;
  app.listen(port, ()=> console.log(`🧠 kaizen-bridge broker on :${port}`));
}
export default app;
