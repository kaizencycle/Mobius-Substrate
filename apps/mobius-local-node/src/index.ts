import readline from "readline";
import {
  loadLedgerSummary,
  getLedgerPath,
  SentinelName
} from "./core/ledger.js";
import { routePromptToSentinel } from "./core/sentinels.js";

async function mainLoop() {
  let activeSentinel: SentinelName = "AUREA";

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (q: string) =>
    new Promise<string>(resolve => rl.question(q, resolve));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.clear();

    const summary = loadLedgerSummary();
    const giDisplay =
      summary.giAvg != null ? summary.giAvg.toFixed(3) : "n/a";

    console.log("MOBIUS LOCAL NODE v0.2 — OFFLINE SENTINEL");
    console.log("==========================================");
    console.log(`Model          : ${process.env.MOBIUS_MODEL || "llama3.1"}`);
    console.log(`Ledger         : ${getLedgerPath()}`);
    console.log("------------------------------------------");
    console.log(`Active Sentinel: ${activeSentinel}`);
    console.log(`GI (last 10)   : ${giDisplay}`);
    console.log(`Entries        : ${summary.count}`);
    console.log("------------------------------------------");
    console.log("1) Ask Mobius");
    console.log("2) Switch Sentinel (AUREA / ATLAS / JADE)");
    console.log("3) View ledger file path");
    console.log("4) Exit");
    console.log("------------------------------------------");

    const choice = await ask("Select option: ");

    if (choice === "1") {
      const prompt = await ask("\n💬 Your question:\n> ");
      console.log(
        `\n🔮 ${activeSentinel} is thinking${
          activeSentinel === "AUREA" ? " (with ATLAS + JADE)..." : "..."
        }`
      );

      try {
        const answer = await routePromptToSentinel(prompt, activeSentinel);
        console.log("\n🧠 Mobius:\n");
        console.log(answer);
      } catch (err: any) {
        console.error("\n❌ Error from local LLM:");
        console.error(err?.message ?? String(err));
      }

      await ask("\n(press Enter to continue)");
    } else if (choice === "2") {
      const newSentinel = await ask(
        "Enter sentinel [AUREA / ATLAS / JADE]: "
      );
      const upper = newSentinel.trim().toUpperCase();
      if (upper === "AUREA" || upper === "ATLAS" || upper === "JADE") {
        activeSentinel = upper as SentinelName;
      } else {
        console.log("Unknown sentinel. Keeping current.");
        await ask("(press Enter to continue)");
      }
    } else if (choice === "3") {
      console.log(`\nLedger path:\n${getLedgerPath()}`);
      await ask("\n(press Enter to continue)");
    } else if (choice === "4") {
      console.log("\nShutting down Mobius Local Node. 🛡️");
      break;
    } else {
      console.log("Unknown option.");
      await ask("(press Enter to continue)");
    }
  }

  rl.close();
}

mainLoop().catch(err => {
  console.error("Fatal error in Mobius Local Node:", err);
  process.exit(1);
});

