#!/usr/bin/env node

/**
 * @fileoverview C-151 Coordination Score Calculator
 * @description Calculates weighted coordination score for sentinel attestation
 * @author Mobius Systems Foundation
 * @version 1.0.0
 * @cycle C-151
 * 
 * Formula:
 * score = (0.4 * apps + 0.3 * packages + 0.2 * workflows + 0.1 * drift_bonus) * uptime_multiplier
 * 
 * Usage:
 *   node calculate_coordination_score.js <SENTINEL_ID> <PULSE_FILE>
 *   node calculate_coordination_score.js ATLAS pulse.json
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const WEIGHTS = {
  apps: 0.4,
  packages: 0.3,
  workflows: 0.2,
  drift: 0.1,
};

const SENTINEL_SPECIALIZATIONS = {
  ATLAS: { apps: 1.2, packages: 1.0, workflows: 1.0 },      // App specialist
  AUREA: { apps: 1.0, packages: 1.3, workflows: 1.0 },      // Package specialist
  ECHO: { apps: 1.0, packages: 1.0, workflows: 1.2 },       // Workflow specialist
  EVE: { apps: 1.0, packages: 1.1, workflows: 1.1 },        // Balanced
  HERMES: { apps: 1.1, packages: 1.0, workflows: 1.1 },     // Communication
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node calculate_coordination_score.js <SENTINEL_ID> <PULSE_FILE>');
    console.error('Example: node calculate_coordination_score.js ATLAS pulse.json');
    process.exit(1);
  }
  
  const [sentinelId, pulseFile] = args;
  
  // Load pulse data
  let pulse;
  try {
    const pulseContent = fs.readFileSync(pulseFile, 'utf8');
    pulse = JSON.parse(pulseContent);
  } catch (error) {
    console.error(`Failed to load pulse file: ${error.message}`);
    process.exit(1);
  }
  
  // Extract metrics from pulse
  const metrics = extractMetrics(pulse, sentinelId);
  
  // Calculate score
  const score = calculateScore(metrics, sentinelId);
  
  // Output score (for GitHub Actions)
  console.log(score.toFixed(2));
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

function extractMetrics(pulse, sentinelId) {
  // Handle different pulse schema versions
  const structure = pulse.structure || {};
  const integrity = pulse.integrity || {};
  const sentinelData = pulse.sentinels?.[sentinelId] || {};
  
  // Extract app count
  let apps = 0;
  if (Array.isArray(structure.apps)) {
    apps = structure.apps.length;
  } else if (typeof structure.apps === 'number') {
    apps = structure.apps;
  } else if (pulse.apps) {
    apps = typeof pulse.apps === 'number' ? pulse.apps : 9; // Default
  }
  
  // Extract package count
  let packages = 0;
  if (Array.isArray(structure.packages)) {
    packages = structure.packages.length;
  } else if (typeof structure.packages === 'number') {
    packages = structure.packages;
  } else if (pulse.packages) {
    packages = typeof pulse.packages === 'number' ? pulse.packages : 5;
  }
  
  // Extract workflow count
  let workflows = 0;
  if (structure.workflows) {
    workflows = typeof structure.workflows.count === 'number' 
      ? structure.workflows.count 
      : 27; // Default
  } else if (pulse.workflows) {
    workflows = typeof pulse.workflows === 'number' ? pulse.workflows : 27;
  }
  
  // Extract drift events
  let driftEvents = 0;
  if (Array.isArray(integrity.drift_events)) {
    driftEvents = integrity.drift_events.length;
  } else if (typeof integrity.drift === 'number') {
    driftEvents = integrity.drift;
  }
  
  // Extract uptime (default to 30 days if not specified)
  const uptimeDays = sentinelData.uptime_days 
    || pulse.sentinel_uptime_days 
    || 30;
  
  return {
    appsValidated: apps,
    packagesAudited: packages,
    workflowsChecked: workflows,
    driftEventsResolved: driftEvents,
    sentinelUptimeDays: uptimeDays,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCORE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateScore(metrics, sentinelId) {
  // Get sentinel specializations (default to 1.0 for unknown sentinels)
  const specialization = SENTINEL_SPECIALIZATIONS[sentinelId] || {
    apps: 1.0,
    packages: 1.0,
    workflows: 1.0,
  };
  
  // Calculate weighted base score
  const appScore = WEIGHTS.apps * metrics.appsValidated * specialization.apps;
  const packageScore = WEIGHTS.packages * metrics.packagesAudited * specialization.packages;
  const workflowScore = WEIGHTS.workflows * metrics.workflowsChecked * specialization.workflows;
  
  // Drift bonus: reward for resolved drift (max 10 points)
  const driftBonus = WEIGHTS.drift * Math.max(0, 10 - metrics.driftEventsResolved);
  
  const baseScore = appScore + packageScore + workflowScore + driftBonus;
  
  // Uptime multiplier: logarithmic scaling
  const uptimeMultiplier = 1 + Math.log(Math.max(1, metrics.sentinelUptimeDays));
  
  // Final score (capped at 100)
  const finalScore = Math.min(100, baseScore * uptimeMultiplier);
  
  return finalScore;
}

// ═══════════════════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════════════════

main();
