#!/bin/bash
# Vercel install script to force npm install instead of npm ci
# This ensures compatibility with the lockfileVersion 3 package-lock.json

set -e

echo "Running custom install command..."
echo "Working directory: $(pwd)"

# Navigate to workspace root if not already there
if [ ! -f "package.json" ]; then
  echo "Changing to workspace root..."
  cd ../..
fi

echo "Current directory: $(pwd)"
echo "Checking for package-lock.json..."
ls -la package-lock.json || echo "package-lock.json not found!"

# Use npm install with legacy peer deps flag
echo "Running: npm install --legacy-peer-deps"
npm install --legacy-peer-deps

echo "Install completed successfully!"
