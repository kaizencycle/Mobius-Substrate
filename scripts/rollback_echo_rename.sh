#!/usr/bin/env bash
#
# Rollback script for ECHO rename (SOLARA → ECHO)
#
# Usage:
#   ./scripts/rollback_echo_rename.sh [commit_sha]
#
# If commit_sha is provided, reverts that specific commit.
# Otherwise, finds the merge commit for the ECHO rename PR and reverts it.
#

set -euo pipefail

if [ $# -eq 1 ]; then
  COMMIT_SHA="$1"
else
  # Find the merge commit for ECHO rename
  COMMIT_SHA=$(git log --all --grep="rename SOLARA\|rename SOLARA\|feat.*echo\|ECHO.*sentinel" --format="%H" | head -1)
  
  if [ -z "$COMMIT_SHA" ]; then
    echo "❌ ERROR: Could not find ECHO rename commit"
    echo "   Please provide commit SHA manually: $0 <commit_sha>"
    exit 1
  fi
fi

echo "🔄 Rolling back ECHO rename..."
echo "📋 Commit: $COMMIT_SHA"
echo ""

# Show what will be reverted
echo "📊 Changes to be reverted:"
git show --stat "$COMMIT_SHA" | head -20
echo ""

read -p "⚠️  Proceed with revert? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Rollback cancelled"
  exit 1
fi

# Perform revert
git revert --no-edit "$COMMIT_SHA"

echo ""
echo "✅ Rollback complete"
echo ""
echo "📋 Next steps:"
echo "   1. Review the revert commit"
echo "   2. Run tests: pytest tests/migration/test_echo_migration.py"
echo "   3. If using compat shim, remove it: kubectl delete -f ops/echo-compat/"
echo "   4. Push: git push origin <branch-name>"
