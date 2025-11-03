#!/usr/bin/env bash
#
# Pre-commit validator: catch SOLARA/DeepSeek remnants and confirm ECHO config
#
# This script ensures:
# 1. No stray SOLARA/DeepSeek references (except in docs/archive)
# 2. ECHO sentinel exists and is properly configured
# 3. Anchor manifest has echo→lab7-proof mapping
# 4. Witness chain includes ZEUS
# 5. CI patterns are correct
#

set -euo pipefail

ERRORS=0
WARNINGS=0

echo "🔍 Validating SOLARA → ECHO rename..."
echo ""

# Check 1: SOLARA references (excluding archive/docs)
echo "📋 Check 1: Searching for SOLARA references..."
SOLARA_REFS=$(grep -r "SOLARA\|solara" --exclude-dir={node_modules,.git,venv,__pycache__,.pytest_cache} \
  --exclude="*.lock" --exclude="*.min.js" \
  . 2>/dev/null | grep -v "docs/archive\|docs/companions\|\.git" | grep -v "validate_rename.sh" || true)

if [ -n "$SOLARA_REFS" ]; then
  echo "⚠️  Found SOLARA references (excluding archive):"
  echo "$SOLARA_REFS" | head -20
  echo ""
  ((WARNINGS++))
else
  echo "✅ No SOLARA references found (excluding archive)"
fi

# Check 2: DeepSeek references (should be fine as provider, but check for sentinel usage)
echo ""
echo "📋 Check 2: Searching for DeepSeek sentinel references..."
DEEPSEEK_SENTINEL_REFS=$(grep -r "deepseek.*sentinel\|SOLARA.*deepseek" \
  --exclude-dir={node_modules,.git,venv,__pycache__,.pytest_cache} \
  --exclude="*.lock" --exclude="*.min.js" \
  . 2>/dev/null | grep -v "docs/archive\|\.git" || true)

if [ -n "$DEEPSEEK_SENTINEL_REFS" ]; then
  echo "⚠️  Found DeepSeek sentinel references:"
  echo "$DEEPSEEK_SENTINEL_REFS" | head -10
  echo ""
  ((WARNINGS++))
else
  echo "✅ No DeepSeek sentinel references found"
fi

# Check 3: ECHO sentinel exists
echo ""
echo "📋 Check 3: Verifying ECHO sentinel exists..."
if [ ! -f "sentinels/echo/__init__.py" ]; then
  echo "❌ ERROR: sentinels/echo/__init__.py not found"
  ((ERRORS++))
else
  echo "✅ ECHO sentinel stub exists"
fi

if [ ! -f "sentinels/echo/manifest.json" ]; then
  echo "❌ ERROR: sentinels/echo/manifest.json not found"
  ((ERRORS++))
else
  echo "✅ ECHO manifest exists"
fi

# Check 4: Anchor manifest
echo ""
echo "📋 Check 4: Verifying anchor manifest..."
if [ ! -f "configs/anchors/sentinels.yaml" ]; then
  echo "❌ ERROR: configs/anchors/sentinels.yaml not found"
  ((ERRORS++))
else
  echo "✅ Anchor manifest exists"
  
  # Check for echo entry
  if ! grep -q "id: echo\|name: ECHO" configs/anchors/sentinels.yaml; then
    echo "❌ ERROR: ECHO not found in anchor manifest"
    ((ERRORS++))
  else
    echo "✅ ECHO found in anchor manifest"
  fi
  
  # Check for lab7-proof mapping
  if ! grep -q "anchor_for_lab: lab7-proof" configs/anchors/sentinels.yaml; then
    echo "⚠️  WARNING: lab7-proof mapping not found (may be in echo section)"
    ((WARNINGS++))
  else
    echo "✅ lab7-proof mapping found"
  fi
  
  # Check for ZEUS witness chain
  if ! grep -q "witness_chain.*ZEUS\|witness.*ZEUS" configs/anchors/sentinels.yaml; then
    echo "⚠️  WARNING: ZEUS witness chain not explicitly found"
    ((WARNINGS++))
  else
    echo "✅ ZEUS witness chain found"
  fi
fi

# Check 5: CI workflow
echo ""
echo "📋 Check 5: Verifying CI workflow..."
if [ ! -f ".github/workflows/attest-proof.yml" ]; then
  echo "⚠️  WARNING: .github/workflows/attest-proof.yml not found"
  ((WARNINGS++))
else
  echo "✅ Attest-proof workflow exists"
  
  # Check for *-proof pattern
  if ! grep -q "lab.*-proof\|\\*-proof" .github/workflows/attest-proof.yml; then
    echo "⚠️  WARNING: *-proof pattern not found in CI workflow"
    ((WARNINGS++))
  else
    echo "✅ *-proof pattern found in CI"
  fi
fi

# Check 6: Consensus config (if exists)
echo ""
echo "📋 Check 6: Checking consensus config..."
if [ -f "packages/policy/consensus_config.yaml" ]; then
  if grep -q "SOLARA:" packages/policy/consensus_config.yaml && ! grep -q "ECHO:" packages/policy/consensus_config.yaml; then
    echo "⚠️  WARNING: consensus_config.yaml still has SOLARA, may need ECHO entry"
    ((WARNINGS++))
  else
    echo "✅ Consensus config check passed"
  fi
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ Validation FAILED: $ERRORS error(s) found"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  Validation PASSED with $WARNINGS warning(s)"
  exit 0
else
  echo "✅ Validation PASSED: All checks green"
  exit 0
fi
