import bodyParser from "body-parser";
import express from "express";
import { EncyclopediaConfig, loadConfig } from "./config";
import { createInMemoryEncyclopediaRepo } from "./db/encyclopediaRepo";
import { createAdminRouter } from "./routes/admin";
import { createPublicRouter } from "./routes/public";

export function createServer(
  config: EncyclopediaConfig = loadConfig()
) {
  const app = express();
  const repo = createInMemoryEncyclopediaRepo();

  app.use(bodyParser.json());

  app.use(createPublicRouter(repo));
  app.use(createAdminRouter(repo, { adminToken: config.adminToken }));

  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  return app;
}
