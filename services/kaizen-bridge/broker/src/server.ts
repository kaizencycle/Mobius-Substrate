import express from "express";
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

app.get("/health", (_req,res)=> res.json({ status:"ok", service:"kaizen-bridge-broker" }));
app.get("/events/relays", sseEndpoint);
app.post("/relay", makeRelayRoute(cfg));

export function start() {
  const port = cfg.listen.broker_port || 4010;
  app.listen(port, ()=> console.log(`🧠 kaizen-bridge broker on :${port}`));
}
export default app;
