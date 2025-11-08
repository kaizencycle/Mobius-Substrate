/**
 * OAA Routing Engine v1
 * Mobius Systems — November 2025
 *
 * This module orchestrates the Mobius Cycle using MKM v0.1.
 * It dispatches tasks to Sentinels, validates outputs, computes pre-MII,
 * aggregates consensus packets, and prepares data for the Mobius Ledger.
 */

import fs from "node:fs";
import path from "node:path";

import type {
  ConsensusPacket,
  MKM,
  SentinelDefinition,
  SentinelInputs,
  SentinelOutputs,
} from "./types.js";
import { loadMKM } from "./utils/mkm.js";
import { callSentinel } from "./utils/sentinel_runner.js";
import { validateOutput } from "./utils/validator.js";
import { computePreMII } from "./utils/mii_engine.js";
import { timestamp } from "./utils/time.js";

export interface OAARouterOptions {
  mkmPath?: string;
  outputRootTemplate?: string;
}

export class OAARouter {
  private readonly mkm: MKM;
  private readonly sequence: string[];
  private readonly outputRoot: string;
  private readonly cycleStart: string;

  constructor(options: OAARouterOptions = {}) {
    this.mkm = loadMKM(options.mkmPath);
    this.sequence = [...this.mkm.routing.canonical_sequence];
    this.cycleStart = timestamp();

    const template = options.outputRootTemplate ?? this.mkm.files.output_root;
    this.outputRoot = template.replace("{timestamp}", this.cycleStart);
  }

  async runCycle(humanIntent: string): Promise<ConsensusPacket> {
    console.log("\n=== Starting Mobius Cycle ===");

    const cycleOutputs: Record<string, SentinelOutputs> = {};
    const sentinelScores: Record<string, number> = {};

    this.ensureDirectory(this.outputRoot);

    for (const sentinelName of this.sequence) {
      console.log(`\n→ Dispatching to Sentinel: ${sentinelName.toUpperCase()}`);

      const sentinel = this.getSentinelDefinition(sentinelName);
      const inputs = this.collectInputs(sentinel, cycleOutputs, humanIntent);

      const result = await callSentinel(sentinelName, inputs);

      validateOutput(sentinelName, sentinel, result);
      this.persistOutputs(sentinelName, sentinel, result);

      cycleOutputs[sentinelName] = result;
      const integrityScore =
        typeof result.integrity_score === "number" ? result.integrity_score : 1.0;
      sentinelScores[sentinelName] = integrityScore;
    }

    const mii = computePreMII(this.mkm, sentinelScores);
    console.log(`\n=== Pre-MII Score: ${mii.toFixed(4)} ===`);

    if (mii < this.mkm.consensus.mii_threshold) {
      throw new Error(
        `Integrity threshold not met: ${mii.toFixed(4)} < ${this.mkm.consensus.mii_threshold}`,
      );
    }

    const consensusPacket: ConsensusPacket = {
      timestamp: timestamp(),
      mii,
      outputs: cycleOutputs,
    };

    const packetPath = path.join(this.outputRoot, "consensus_packet.json");
    fs.writeFileSync(packetPath, JSON.stringify(consensusPacket, null, 2));

    console.log(
      "\n✅ Mobius Cycle Complete. Consensus packet generated at:",
      packetPath,
    );

    return consensusPacket;
  }

  private getSentinelDefinition(name: string): SentinelDefinition {
    const sentinel = this.mkm.sentinels[name];
    if (!sentinel) {
      throw new Error(`Sentinel ${name} is not defined in MKM v0.1`);
    }
    return sentinel;
  }

  private collectInputs(
    sentinel: SentinelDefinition,
    cycleOutputs: Record<string, SentinelOutputs>,
    humanIntent: string,
  ): SentinelInputs {
    const inputs: SentinelInputs = {};

    for (const source of sentinel.consumes ?? []) {
      if (source === "human_intent") {
        inputs.human_intent = humanIntent;
        continue;
      }

      if (source.includes(".")) {
        const [producerName, outputKey] = source.split(".", 2);
        if (!outputKey) {
          inputs[source] = this.resolveOutputByKey(source, cycleOutputs);
          continue;
        }

        const payload = cycleOutputs[producerName]?.[outputKey] ?? null;
        inputs[outputKey] = payload;
        continue;
      }

      inputs[source] = this.resolveOutputByKey(source, cycleOutputs);
    }

    return inputs;
  }

  private resolveOutputByKey(
    outputKey: string,
    cycleOutputs: Record<string, SentinelOutputs>,
  ): unknown {
    for (const outputs of Object.values(cycleOutputs)) {
      if (outputKey in outputs) {
        return outputs[outputKey];
      }
    }
    return null;
  }

  private persistOutputs(
    sentinelName: string,
    sentinel: SentinelDefinition,
    result: SentinelOutputs,
  ): void {
    for (const [key, value] of Object.entries(result)) {
      if (key === "integrity_score" || typeof value === "undefined") {
        continue;
      }

      const relativePath = sentinel.output_schema[key] ?? `${sentinelName}.${key}.json`;
      const targetPath = path.join(this.outputRoot, relativePath);
      this.ensureDirectory(path.dirname(targetPath));
      fs.writeFileSync(targetPath, JSON.stringify(value, null, 2));
    }
  }

  private ensureDirectory(targetPath: string): void {
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }
}
