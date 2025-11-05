import express from "express";
import { routes } from "./routes.js";

const app = express();
app.use(express.json());
app.get("/health", routes.health);
app.post("/ingest/projected", routes.applyProjected);

const PORT = process.env.PORT ?? 4021;
app.listen(PORT, () => console.log(`🧭  AUREA agent on :${PORT}`));
