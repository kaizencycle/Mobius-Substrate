import { loadConfig } from "./config";
import { createServer } from "./server";

const config = loadConfig();
const app = createServer(config);

app.listen(config.port, () => {
  console.log(`[encyclopedia-api] listening on port ${config.port}`);
});
