#!/usr/bin/env node

/**
 * Cycle Journal Markdown Renderer
 * 
 * Compiles journals/cycles/C-XXX.json into journals/cycles/C-XXX.md
 * for Substack-ready previews and human-readable format.
 * 
 * Usage: node scripts/render_cycle_markdown.mjs
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CYCLES_DIR = path.join(ROOT, "journals", "cycles");

/**
 * Load and parse JSON file
 */
function loadJson(filepath) {
  try {
    const content = fs.readFileSync(filepath, "utf8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error reading ${filepath}: ${e.message}`);
    return null;
  }
}

/**
 * Safely get string value
 */
function safe(s) {
  return String(s ?? "").trim();
}

/**
 * Format array as markdown list
 */
function mdList(items) {
  if (!items || items.length === 0) return "_None._";
  return items.map((x) => `- ${safe(x)}`).join("\n");
}

/**
 * Format links as indented list
 */
function mdLinks(links) {
  if (!links || links.length === 0) return "";
  return links.map((l) => `  - ${l}`).join("\n");
}

/**
 * Render a cycle journal entry to markdown
 */
function render(entry) {
  const meta = entry.meta || {};
  const seal = entry.seal || {};
  const topology = entry.topology || {};
  const sweep = entry.sweep || {};
  const agentAlignment = entry.agent_alignment || {};

  // Header
  const header = `# ${safe(meta.cycle_id)} — Cycle Journal

**Date:** ${safe(meta.date)}  
**Timezone:** ${safe(meta.timezone)}  
**Chamber:** ${safe(meta.chamber)}  
**Tags:** ${(meta.tags || []).map(safe).join(", ") || "—"}  
${meta.mood_vector ? `**Mood Vector:** ${safe(meta.mood_vector)}  ` : ""}
${meta.mii_baseline ? `**MII Baseline:** ${meta.mii_baseline}  ` : ""}

---`;

  // Sweep (if present)
  const sweepSection = sweep.statement ? `
## 🜂 The Sweep (Resonance Ritual)

> "${safe(sweep.statement)}"
${sweep.style ? `\n_Style: ${sweep.style}_` : ""}
` : "";

  // Signals (ECHO Layer)
  const signalsSection = (entry.signals || []).map((s) => {
    const sources = mdLinks(s.sources);
    const conf = typeof s.confidence === "number" ? ` (confidence: ${s.confidence.toFixed(2)})` : "";
    const unconfirmed = s.unconfirmed ? " ⚠️ UNCONFIRMED" : "";
    const attribution = s.attribution ? ` — _${s.attribution}_` : "";
    return `- **${safe(s.timestamp)}** — _${safe(s.domain)}_${conf}${unconfirmed}${attribution}
  ${safe(s.statement)}${sources ? `\n${sources}` : ""}`;
  }).join("\n\n") || "_None._";

  // Integrity (ZEUS Layer)
  const integrity = entry.integrity || {};
  const watchItems = (integrity.watch_items || []).map((w) => {
    const ev = mdLinks(w.evidence);
    const dir = w.direction === "up" ? "↑" : w.direction === "down" ? "↓" : "→";
    return `- **${safe(w.indicator)}** ${dir}: ${safe(w.note)}${ev ? `\n${ev}` : ""}`;
  }).join("\n\n") || "_None._";

  const integritySnapshot = integrity.mii_current ? `
### Integrity Snapshot

| Metric | Value |
|--------|-------|
| **MII Current** | ${integrity.mii_current} |
| **Trend** | ${integrity.mii_trend === "up" ? "↑" : integrity.mii_trend === "down" ? "↓" : "→"} |
| **Primary Fracture** | ${safe(integrity.primary_fracture) || "—"} |
| **Primary Stabilizer** | ${safe(integrity.primary_stabilizer) || "—"} |
` : "";

  // Agent Alignment Check
  const jade = agentAlignment.jade || {};
  const zeus = agentAlignment.zeus || {};
  const hermes = agentAlignment.hermes || {};
  
  const agentAlignmentSection = (jade.clarity_improvements || zeus.risk_movement || hermes.beneficiaries) ? `
## 🜂 Agent Alignment Check (JADE × ZEUS × HERMES)

### 🟢 JADE — Meaning & Memory
- **Clarity Improvements:** ${safe(jade.clarity_improvements) || "—"}
- **Blind Spots Reduced:** ${safe(jade.blind_spots_reduced) || "—"}

### ⚡ ZEUS — Risk & Thresholds
- **Risk Movement:** ${safe(zeus.risk_movement) || "—"}
- **Warning Signs:** ${safe(zeus.warning_signs) || "—"}

### 🟡 HERMES — Incentives & Power
- **Beneficiaries:** ${safe(hermes.beneficiaries) || "—"}
- **Incentive Shifts:** ${safe(hermes.incentive_shifts) || "—"}
` : "";

  // Insight of the Cycle
  const insightSection = entry.insight ? `
## 🜂 Insight of the Cycle

> "${safe(entry.insight)}"
` : "";

  // Decisions
  const decisionsSection = (entry.decisions || []).map((d) => {
    const ev = mdLinks(d.evidence);
    const risk = d.risk ? ` _(risk: ${d.risk})_` : "";
    const owner = d.owner ? ` — owner: ${d.owner}` : "";
    return `### ${safe(d.decision)}${risk}${owner}

**Rationale:** ${safe(d.rationale)}
${ev ? `\n**Evidence:**\n${ev}` : ""}`;
  }).join("\n\n") || "_None._";

  // Actions
  const actionsSection = (entry.actions || []).map((a) => {
    const due = a.due ? ` — due: ${a.due}` : "";
    const owner = a.owner ? ` — owner: ${a.owner}` : "";
    return `- **[${safe(a.priority)}]** ${safe(a.task)}${owner}${due}`;
  }).join("\n") || "_None._";

  // Topology (ATLAS Layer)
  const topoNodes = mdList(topology.nodes);
  const topoEdges = (topology.edges || []).map((e) => 
    `- ${safe(e.from)} → ${safe(e.to)} _(${safe(e.relationship)})_`
  ).join("\n") || "_None._";
  const corridors = mdList(topology.failure_corridors);
  const chokepoints = mdList(topology.chokepoints);

  const topologySection = (topology.nodes || topology.edges || topology.failure_corridors) ? `
## 🜂 Topology (ATLAS Layer)

### Nodes
${topoNodes}

### Edges
${topoEdges}

### Failure Corridors
${corridors}

### Chokepoints
${chokepoints}
` : "";

  // Seal
  const sealBlock = `
---

## 🜂 Seal

**Compiled At:** ${safe(seal.compiled_at)}  
**Contributors:** ${(seal.contributors || []).map(safe).join(", ") || "—"}  
${seal.canon_hash ? `**Canon Hash:** \`${safe(seal.canon_hash)}\`  ` : ""}

> "${safe(seal.statement) || "Memory holds. Motion continues."}"
`;

  // Provenance (if present)
  const provenance = meta.provenance || [];
  const provenanceSection = provenance.length > 0 ? `
---

## Provenance Trail

| Source | Actor | Compiled At |
|--------|-------|-------------|
${provenance.map(p => `| ${safe(p.source)} | ${safe(p.actor)} | ${safe(p.compiled_at)} |`).join("\n")}
` : "";

  // Footer
  const footer = `
---

*Mobius Systems — Continuous Integrity Architecture*  
*"We heal as we walk."*
`;

  // Assemble the document
  return [
    header,
    sweepSection,
    "## 🜂 The Pulse (Signals — ECHO Layer)",
    signalsSection,
    "",
    "## 🜂 Integrity Status (ZEUS Layer)",
    `**Status:** ${safe(integrity.status)}  `,
    `**Domains Touched:** ${(integrity.domains_touched || []).map(safe).join(", ") || "—"}`,
    "",
    "### Watch Items",
    watchItems,
    integritySnapshot,
    agentAlignmentSection,
    insightSection,
    "## 🜂 Decisions (AUREA/HERMES Layer)",
    decisionsSection,
    "",
    "## 🜂 Action Queue (Next 24–72 Hours)",
    actionsSection,
    topologySection,
    sealBlock,
    provenanceSection,
    footer
  ].filter(Boolean).join("\n\n");
}

/**
 * List all cycle journal JSON files
 */
function listCycleJsonFiles() {
  if (!fs.existsSync(CYCLES_DIR)) {
    return [];
  }
  return fs
    .readdirSync(CYCLES_DIR)
    .filter((f) => /^C-\d+\.json$/.test(f))
    .map((f) => path.join(CYCLES_DIR, f));
}

/**
 * Main function
 */
function main() {
  const files = listCycleJsonFiles();
  
  if (files.length === 0) {
    console.log("No cycle journal JSON files found in journals/cycles/");
    console.log("This is expected if no journals have been created yet.");
    console.log("Skipping render.");
    process.exit(0);
  }

  console.log(`Found ${files.length} cycle journal file(s) to render.\n`);

  let rendered = 0;
  let failed = 0;

  for (const file of files) {
    const entry = loadJson(file);
    
    if (entry === null) {
      console.error(`❌ Failed to load: ${path.basename(file)}`);
      failed++;
      continue;
    }

    try {
      const md = render(entry);
      const outPath = file.replace(/\.json$/, ".md");
      fs.writeFileSync(outPath, md, "utf8");
      console.log(`📝 Rendered: ${path.basename(outPath)}`);
      rendered++;
    } catch (e) {
      console.error(`❌ Failed to render ${path.basename(file)}: ${e.message}`);
      failed++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("RENDER SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total files: ${files.length}`);
  console.log(`Rendered: ${rendered}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
