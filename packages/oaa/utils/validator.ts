import type { SentinelDefinition, SentinelOutputs } from "../types.js";

export function validateOutput(
  name: string,
  sentinel: SentinelDefinition,
  result: SentinelOutputs,
): void {
  const allowedKeys = new Set(Object.keys(sentinel.output_schema ?? {}));

  for (const key of Object.keys(result)) {
    if (key === "integrity_score") {
      continue;
    }

    if (allowedKeys.size > 0 && !allowedKeys.has(key)) {
      console.warn(
        `[Validator] Sentinel ${name} produced unexpected output key: ${key}`,
      );
    }
  }

  for (const expected of sentinel.produces ?? []) {
    if (typeof result[expected] === "undefined") {
      console.warn(
        `[Validator] Sentinel ${name} did not produce expected output key: ${expected}`,
      );
    }
  }
}
