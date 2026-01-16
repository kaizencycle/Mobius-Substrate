#!/usr/bin/env node

/**
 * Cycle Journal Command Parser & Patcher
 * 
 * Parses /cycle update commands from GitHub Issue comments and applies
 * structured patches to cycle journal JSON files.
 * 
 * Includes guardrails:
 * - Nonce token validation
 * - Trusted domain allowlist for sources
 * - Provenance tracking
 * 
 * Usage: Called by .github/workflows/cycle-issue-to-pr.yml
 * 
 * Environment variables:
 * - COMMENT_BODY: The issue comment text
 * - ISSUE_NUMBER: GitHub issue number
 * - ISSUE_URL: URL to the GitHub issue
 * - ACTOR: GitHub actor (username)
 * - EXPECTED_NONCE: Secret nonce token for validation
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

const ROOT = process.cwd();
const CYCLES_DIR = path.join(ROOT, "journals", "cycles");

// ============================================================================
// GUARDRAILS: Trusted Domain Allowlist
// ============================================================================

const TRUSTED_DOMAINS = new Set([
  // Major news agencies
  "reuters.com",
  "apnews.com",
  "bbc.co.uk",
  "bbc.com",
  "nytimes.com",
  "wsj.com",
  "theguardian.com",
  "ft.com",
  "economist.com",
  "bloomberg.com",
  "npr.org",
  "pbs.org",
  
  // US Government
  "sec.gov",
  "congress.gov",
  "supremecourt.gov",
  "justice.gov",
  "state.gov",
  "whitehouse.gov",
  "treasury.gov",
  "federalreserve.gov",
  "irs.gov",
  "usa.gov",
  
  // International organizations
  "un.org",
  "imf.org",
  "worldbank.org",
  "wto.org",
  "nato.int",
  "who.int",
  
  // Tech/Platform
  "github.com",
  "substack.com",
  "medium.com",
  "arxiv.org",
  "ssrn.com",
  
  // Academic
  "nature.com",
  "science.org",
  "pnas.org",
  "journals.plos.org",
  
  // Financial data
  "tradingview.com",
  "finance.yahoo.com",
  "coinmarketcap.com",
  "coingecko.com"
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Exit with error message
 */
function die(msg) {
  console.error(`❌ ERROR: ${msg}`);
  process.exit(1);
}

/**
 * Load JSON file
 */
function loadJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (e) {
    die(`Failed to load JSON from ${filepath}: ${e.message}`);
  }
}

/**
 * Save JSON file with pretty formatting
 */
function saveJson(filepath, obj) {
  fs.writeFileSync(filepath, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

/**
 * Get current ISO timestamp
 */
function nowIso() {
  return new Date().toISOString();
}

/**
 * SHA256 hash of string
 */
function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/**
 * Extract hostname from URL
 */
function hostOf(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Split comma-separated string into array
 */
function splitCsv(s) {
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Ensure property is an array
 */
function ensureArray(obj, key) {
  if (!obj[key]) obj[key] = [];
  if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
  return obj[key];
}

// ============================================================================
// GUARDRAIL: Trusted Domain Validation
// ============================================================================

/**
 * Validate that all URLs are from trusted domains
 */
function assertTrustedSources(urls) {
  for (const u of urls) {
    const host = hostOf(u);
    if (!host) continue; // Skip invalid URLs (will be caught elsewhere if strict)
    
    const isTrusted =
      TRUSTED_DOMAINS.has(host) ||
      [...TRUSTED_DOMAINS].some((d) => host === d || host.endsWith(`.${d}`));
    
    if (!isTrusted) {
      die(`Untrusted source domain blocked: ${host}\n` +
          `Only sources from trusted domains are allowed.\n` +
          `Add the domain to the allowlist if it should be trusted.`);
    }
  }
}

// ============================================================================
// GUARDRAIL: Nonce Token Validation
// ============================================================================

/**
 * Validate nonce token
 */
function requireNonce(args) {
  const expected = process.env.EXPECTED_NONCE;
  
  // If no nonce is configured, skip validation (development mode)
  if (!expected) {
    console.warn("⚠️  WARNING: No EXPECTED_NONCE configured. Skipping nonce validation.");
    console.warn("   Set the CYCLE_JOURNAL_NONCE secret for production use.");
    return;
  }

  const provided = args.nonce;
  if (!provided) {
    die('Missing nonce. Include nonce="..." in your command.');
  }

  if (provided !== expected) {
    die("Invalid nonce token. Access denied.");
  }
  
  console.log("✅ Nonce validated");
}

// ============================================================================
// COMMAND PARSER
// ============================================================================

/**
 * Parse /cycle update command
 * 
 * Format: /cycle update C-XXX <verb> key1="value1" key2="value2" ...
 * 
 * Supported verbs:
 * - add-signal: Add an ECHO signal
 * - add-watch: Add a ZEUS watch item
 * - add-action: Add an action item
 * - add-decision: Add a decision
 */
function parseCommand(body) {
  const trimmed = body.trim();

  // Extract cycle ID and verb
  const match = trimmed.match(/^\/cycle update (C-\d+)\s+([a-z-]+)\s*(.*)$/i);
  if (!match) {
    die(`Command parse error: expected '/cycle update C-XXX <verb> ...'`);
  }

  const cycleId = match[1];
  const verb = match[2].toLowerCase();
  const rest = match[3] || "";

  // Parse key=value pairs (supports quoted strings)
  const args = {};
  const re = /(\w+)\s*=\s*(?:"([^"]*)"|([^\s]+))/g;
  let kvMatch;
  while ((kvMatch = re.exec(rest)) !== null) {
    const key = kvMatch[1];
    const val = kvMatch[2] ?? kvMatch[3] ?? "";
    args[key] = val;
  }

  console.log(`Parsed command:`);
  console.log(`  Cycle: ${cycleId}`);
  console.log(`  Verb: ${verb}`);
  console.log(`  Args: ${JSON.stringify(args, null, 2)}`);

  return { cycleId, verb, args };
}

// ============================================================================
// PATCH APPLICATION
// ============================================================================

/**
 * Apply a patch to the cycle journal entry
 */
function applyPatch(entry, verb, args, provenance) {
  // Guardrail: require nonce for any mutation
  requireNonce(args);

  // Ensure common structures exist
  entry.meta ||= {};
  entry.seal ||= {};
  entry.integrity ||= {};
  entry.topology ||= {};

  // Add provenance trail
  entry.meta.provenance ||= [];
  entry.meta.provenance.push(provenance);

  // Handle each verb
  switch (verb) {
    case "add-signal": {
      const signals = ensureArray(entry, "signals");
      const sources = splitCsv(args.sources);
      
      // Guardrail: validate source domains
      assertTrustedSources(sources);
      
      const confidence = args.confidence ? Number(args.confidence) : undefined;
      
      signals.push({
        timestamp: args.timestamp || provenance.compiled_at,
        domain: args.domain || "other",
        statement: args.statement || "",
        sources: sources,
        confidence: Number.isFinite(confidence) ? confidence : undefined,
        attribution: args.attribution || provenance.actor || "unknown",
        unconfirmed: args.unconfirmed === "true"
      });
      
      console.log(`✅ Added signal to ${entry.meta.cycle_id}`);
      break;
    }

    case "add-watch": {
      const watchItems = ensureArray(entry.integrity, "watch_items");
      const evidence = splitCsv(args.evidence);
      
      // Guardrail: validate evidence domains
      assertTrustedSources(evidence);
      
      watchItems.push({
        indicator: args.indicator || "Unknown",
        direction: args.direction || "flat",
        note: args.note || "",
        evidence: evidence
      });
      
      console.log(`✅ Added watch item to ${entry.meta.cycle_id}`);
      break;
    }

    case "add-action": {
      const actions = ensureArray(entry, "actions");
      
      actions.push({
        task: args.task || "",
        priority: args.priority || "P2",
        owner: args.owner || "",
        due: args.due || ""
      });
      
      console.log(`✅ Added action to ${entry.meta.cycle_id}`);
      break;
    }

    case "add-decision": {
      const decisions = ensureArray(entry, "decisions");
      const evidence = splitCsv(args.evidence);
      
      // Guardrail: validate evidence domains
      assertTrustedSources(evidence);
      
      decisions.push({
        decision: args.decision || "",
        rationale: args.rationale || "",
        evidence: evidence,
        owner: args.owner || "",
        risk: args.risk || "medium"
      });
      
      console.log(`✅ Added decision to ${entry.meta.cycle_id}`);
      break;
    }

    case "set-insight": {
      entry.insight = args.insight || args.text || "";
      console.log(`✅ Set insight for ${entry.meta.cycle_id}`);
      break;
    }

    case "set-status": {
      if (!["normal", "watch", "advisory", "critical"].includes(args.status)) {
        die(`Invalid status: ${args.status}. Must be: normal, watch, advisory, critical`);
      }
      entry.integrity.status = args.status;
      console.log(`✅ Set integrity status to ${args.status}`);
      break;
    }

    case "add-topology-node": {
      const nodes = ensureArray(entry.topology, "nodes");
      if (args.node) {
        nodes.push(args.node);
        console.log(`✅ Added topology node: ${args.node}`);
      }
      break;
    }

    case "add-topology-edge": {
      const edges = ensureArray(entry.topology, "edges");
      if (args.from && args.to) {
        edges.push({
          from: args.from,
          to: args.to,
          relationship: args.relationship || "affects"
        });
        console.log(`✅ Added topology edge: ${args.from} → ${args.to}`);
      }
      break;
    }

    case "add-failure-corridor": {
      const corridors = ensureArray(entry.topology, "failure_corridors");
      if (args.corridor) {
        corridors.push(args.corridor);
        console.log(`✅ Added failure corridor: ${args.corridor}`);
      }
      break;
    }

    default:
      die(`Unknown verb: ${verb}.\n` +
          `Supported: add-signal, add-watch, add-action, add-decision, ` +
          `set-insight, set-status, add-topology-node, add-topology-edge, add-failure-corridor`);
  }

  // Update seal
  entry.seal.compiled_at = nowIso();
  entry.seal.contributors ||= [];
  const actor = provenance.actor;
  if (actor && !entry.seal.contributors.includes(actor)) {
    entry.seal.contributors.push(actor);
  }
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  // Get environment variables
  const body = process.env.COMMENT_BODY;
  const issueNumber = process.env.ISSUE_NUMBER;
  const issueUrl = process.env.ISSUE_URL;
  const actor = process.env.ACTOR;

  if (!body) die("Missing COMMENT_BODY environment variable");
  if (!issueNumber) die("Missing ISSUE_NUMBER environment variable");

  console.log("=".repeat(50));
  console.log("CYCLE JOURNAL COMMAND PROCESSOR");
  console.log("=".repeat(50));
  console.log(`Actor: ${actor || "unknown"}`);
  console.log(`Issue: #${issueNumber}`);
  console.log("");

  // Parse the command
  const { cycleId, verb, args } = parseCommand(body);

  // Find the cycle file
  const filePath = path.join(CYCLES_DIR, `${cycleId}.json`);
  if (!fs.existsSync(filePath)) {
    die(`Cycle file not found: journals/cycles/${cycleId}.json\n` +
        `Create the cycle journal first using the Cycle Journal Bot workflow.`);
  }

  // Load existing entry
  const entry = loadJson(filePath);

  // Build provenance record
  const provenance = {
    source: "github_issue_comment",
    issue_number: String(issueNumber),
    issue_url: issueUrl || "",
    actor: actor || "unknown",
    command: body.trim(),
    compiled_at: nowIso(),
    command_hash: sha256(body.trim())
  };

  // Apply the patch
  applyPatch(entry, verb, args, provenance);

  // Save updated entry
  saveJson(filePath, entry);

  console.log("");
  console.log("=".repeat(50));
  console.log(`✅ Successfully applied ${verb} to ${cycleId}`);
  console.log(`Updated: journals/cycles/${cycleId}.json`);
  console.log("=".repeat(50));
}

main();
