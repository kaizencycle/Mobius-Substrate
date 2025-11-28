#!/usr/bin/env node

/**
 * Build script for broker-api dependencies
 * Builds @mobius/echo-layer and @mobius/tokenomics-engine before building broker-api
 * Can be run from any directory within the monorepo
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Find the monorepo root by looking for package.json with workspaces
function findRoot() {
  let current = __dirname;
  while (current !== path.dirname(current)) {
    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.workspaces) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  throw new Error('Could not find monorepo root');
}

const root = findRoot();
console.log(`Building dependencies from root: ${root}`);

try {
  // Build echo-layer
  console.log('Building @mobius/echo-layer...');
  execSync('npm run build --workspace=packages/echo-layer', {
    cwd: root,
    stdio: 'inherit'
  });

  // Build tokenomics-engine
  console.log('Building @mobius/tokenomics-engine...');
  execSync('npm run build --workspace=packages/tokenomics-engine', {
    cwd: root,
    stdio: 'inherit'
  });

  console.log('✓ Dependencies built successfully');
} catch (error) {
  console.error('✗ Failed to build dependencies:', error.message);
  process.exit(1);
}

