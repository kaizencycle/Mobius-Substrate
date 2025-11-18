import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

export type SentinelName = "AUREA" | "ATLAS" | "JADE";

// Get the directory of this module (not the current working directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_LEDGER_PATH =
  process.env.MOBIUS_LEDGER_PATH ||
  path.join(__dirname, "..", "..", "data", "ledger.json");

export interface LedgerEntry {
  timestamp: string;
  sentinel: SentinelName;
  prompt: string;
  atlasView?: string;
  jadeView?: string;
  finalAnswer: string;
  giScore?: number;
}

function ensureLedgerDir() {
  const dir = path.dirname(DEFAULT_LEDGER_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function appendLedgerEntry(entry: LedgerEntry): void {
  ensureLedgerDir();

  let entries: LedgerEntry[] = [];
  if (fs.existsSync(DEFAULT_LEDGER_PATH)) {
    try {
      const raw = fs.readFileSync(DEFAULT_LEDGER_PATH, "utf8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        // Validate that parsed JSON is actually an array
        if (Array.isArray(parsed)) {
          entries = parsed as LedgerEntry[];
        } else {
          // If valid JSON but not an array, reset to empty array
          entries = [];
        }
      }
    } catch {
      // If corrupted or invalid JSON, start a new file (better than crashing silently)
      entries = [];
    }
  }

  entries.push(entry);
  fs.writeFileSync(DEFAULT_LEDGER_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export function loadLedgerSummary(): { giAvg: number | null; count: number } {
  try {
    if (!fs.existsSync(DEFAULT_LEDGER_PATH)) {
      return { giAvg: null, count: 0 };
    }

    const raw = fs.readFileSync(DEFAULT_LEDGER_PATH, "utf8");
    if (!raw.trim()) return { giAvg: null, count: 0 };

    const entries: LedgerEntry[] = JSON.parse(raw);
    if (!Array.isArray(entries) || entries.length === 0) {
      return { giAvg: null, count: 0 };
    }

    const lastN = entries.slice(-10);
    const scores = lastN
      .map(e => (typeof e.giScore === "number" ? e.giScore : null))
      .filter((x): x is number => x !== null);

    if (scores.length === 0) {
      return { giAvg: null, count: entries.length };
    }

    const giAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { giAvg, count: entries.length };
  } catch {
    return { giAvg: null, count: 0 };
  }
}

export function getLedgerPath(): string {
  return DEFAULT_LEDGER_PATH;
}

