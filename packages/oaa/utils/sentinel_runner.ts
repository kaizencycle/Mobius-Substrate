import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { SentinelInputs, SentinelOutputs } from "../types.js";

type SentinelModule = {
  run?: (inputs: SentinelInputs) => Promise<SentinelOutputs> | SentinelOutputs;
};

function resolveSentinelModule(name: string): string {
  const root = path.join(process.cwd(), "sentinels");
  const candidates = [
    path.join(root, `${name}.ts`),
    path.join(root, `${name}.js`),
    path.join(root, name, "index.ts"),
    path.join(root, name, "index.js"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Sentinel ${name} module not found. Checked candidates: ${candidates.join(", ")}`,
  );
}

export async function callSentinel(
  name: string,
  inputs: SentinelInputs,
): Promise<SentinelOutputs> {
  const modulePath = resolveSentinelModule(name);
  const moduleUrl = pathToFileURL(modulePath).href;
  const module = (await import(moduleUrl)) as SentinelModule;

  if (typeof module.run !== "function") {
    throw new Error(`Sentinel ${name} missing export: run()`);
  }

  const result = await module.run(inputs);
  if (!result || typeof result !== "object") {
    throw new Error(`Sentinel ${name} returned an invalid result payload`);
  }

  return result as SentinelOutputs;
}
