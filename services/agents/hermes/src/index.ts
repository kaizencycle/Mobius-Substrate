import express from "express";
import { routes } from "./routes.js";

const app = express();
app.use(express.json());
app.get("/health", routes.health);
app.post("/federate/hermes-to-aurea", routes.federate);

const PORT = process.env.PORT ?? 4020;
app.listen(PORT, () => console.log(`🛰️  HERMES agent on :${PORT}`));
