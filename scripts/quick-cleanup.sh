#!/bin/bash
# ============================================================================
# Quick Branch Cleanup - Delete all merged branches
# Run with: ./quick-cleanup.sh [--dry-run]
# 
# @license CC0-1.0
# @author Mobius Systems (kaizencycle:michaeljudan)
# ============================================================================

set -euo pipefail

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

echo "🌀 Mobius Quick Branch Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Fetch and prune
git fetch --prune origin

# Protected branches pattern (main working branches)
PROTECTED="main\|master\|develop\|HEAD\|claude/atlas\|cursor/aurea"

# Get merged branches (excluding protected)
MERGED=$(git branch -r --merged origin/main | grep -v "$PROTECTED" | sed 's/origin\///' || true)

if [[ -z "$MERGED" ]]; then
    echo "✅ No merged branches to delete."
    exit 0
fi

BRANCH_COUNT=$(echo "$MERGED" | wc -l | tr -d ' ')

echo "Merged branches to delete ($BRANCH_COUNT):"
echo "$MERGED" | while read branch; do
    if [[ -n "$branch" ]]; then
        echo "  - $branch"
    fi
done
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[DRY RUN] Would delete the above branches."
    echo "Run without --dry-run to actually delete."
    exit 0
fi

read -p "Delete these branches? [y/N]: " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

# EPICON Intent
echo ""
echo "📋 EPICON Intent: delete_merged_branches"
echo "   Scope: $BRANCH_COUNT branches"
echo "   Rationale: Removing branches merged to main"
echo "   Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Delete
SUCCESS=0
FAILED=0

echo "$MERGED" | while read branch; do
    if [[ -n "$branch" ]]; then
        echo -n "Deleting $branch... "
        if git push origin --delete "$branch" 2>/dev/null; then
            echo "✅"
        else
            echo "❌"
        fi
    fi
done

echo ""
echo "✅ Cleanup complete."
