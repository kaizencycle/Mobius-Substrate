#!/usr/bin/env bash
set -euo pipefail

# ╔═══════════════════════════════════════════════════════════════════╗
# ║ mobius_pulse_json.sh                                             ║
# ║ Generate a Sentinel-ready JSON pulse for the current repo state. ║
# ║                                                                   ║
# ║ Usage:                                                           ║
# ║   MOBIUS_CYCLE="C-150" MOBIUS_MII="0.972" ./mobius_pulse_json.sh ║
# ║                                                                   ║
# ║ Environment Variables (optional):                                ║
# ║   MOBIUS_CYCLE  - Current cycle label (e.g., "C-150")           ║
# ║   MOBIUS_MII    - Current MII estimate (e.g., "0.972")          ║
# ║   MOBIUS_SOURCE - Source tag (e.g., "manual", "nightly", "pr")  ║
# ║                                                                   ║
# ║ Requirements: git, jq, node (for turbo dry-run)                  ║
# ║ Optional: tree (for directory visualization)                      ║
# ╚═══════════════════════════════════════════════════════════════════╝

# Navigate to repository root
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

# Metadata
timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
head_commit="$(git rev-parse HEAD 2>/dev/null || echo "UNKNOWN")"
branch_name="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")"

# Recent commits (last 10) as JSON array
recent_commits_raw=""
if git log -10 --pretty=format:'%H|||%h|||%ad|||%s' --date=iso 2>/dev/null | head -10 > /tmp/commits_$$.txt; then
  recent_commits_raw="["
  first=true
  while IFS='|||' read -r hash short date subject; do
    # Escape special JSON characters in subject
    subject_escaped=$(echo "$subject" | sed 's/\\/\\\\/g; s/"/\\"/g; s/	/\\t/g' | tr -d '\n\r')
    if [ "$first" = true ]; then
      first=false
    else
      recent_commits_raw+=","
    fi
    recent_commits_raw+="{\"hash\":\"$hash\",\"short\":\"$short\",\"date\":\"$date\",\"subject\":\"$subject_escaped\"}"
  done < /tmp/commits_$$.txt
  recent_commits_raw+="]"
  rm -f /tmp/commits_$$.txt
fi

# Fallback to empty array if parsing failed
if [ -z "$recent_commits_raw" ] || [ "$recent_commits_raw" = "[" ]; then
  recent_commits_raw="[]"
fi

# Changed files in last commit
changed_files_raw="$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")"
if [ -n "$changed_files_raw" ]; then
  changed_files="$(printf '%s\n' "$changed_files_raw" | jq -R . | jq -s .)"
else
  changed_files="[]"
fi

# Staged files (uncommitted)
staged_files_raw="$(git diff --cached --name-only 2>/dev/null || echo "")"
if [ -n "$staged_files_raw" ]; then
  staged_files="$(printf '%s\n' "$staged_files_raw" | jq -R . | jq -s .)"
else
  staged_files="[]"
fi

# Directory tree (top 2 levels, excluding noisy dirs)
if command -v tree &> /dev/null; then
  dir_tree="$(tree -L 2 -I 'node_modules|.next|dist|out|coverage|cache|.turbo|.git|__pycache__|.pytest_cache|.mypy_cache' 2>/dev/null || echo "tree_not_available")"
else
  # Fallback to ls-based tree
  dir_tree="$(ls -la 2>/dev/null || echo "directory_listing_failed")"
fi
dir_tree_json="$(printf '%s\n' "$dir_tree" | jq -Rs .)"

# Turbo dry run (build graph) - with timeout to prevent hanging
turbo_dry_run="turbo_not_available"
if command -v npx &> /dev/null && [ -f "turbo.json" ]; then
  turbo_dry_run="$(timeout 30 npx --yes turbo run build --dry-run --filter='...' 2>/dev/null || echo "turbo_timeout_or_error")"
fi
turbo_dry_run_json="$(printf '%s\n' "$turbo_dry_run" | jq -Rs .)"

# Workflow names from GitHub Actions
workflow_names_raw="$(grep -h "^name:" .github/workflows/*.yml 2>/dev/null || echo "")"
if [ -n "$workflow_names_raw" ]; then
  workflow_names="$(printf '%s\n' "$workflow_names_raw" | sed 's/^name:[[:space:]]*//' | jq -R . | jq -s .)"
else
  workflow_names="[]"
fi

# Sentinel files (for integrity context)
sentinel_files="$(find sentinels -name "*.json" -o -name "*.yaml" -o -name "*.yml" 2>/dev/null | head -20 | jq -R . | jq -s . || echo "[]")"

# Package summary
package_count="$(find packages -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ' || echo "0")"
app_count="$(find apps -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ' || echo "0")"

# Basic repo stats
tracked_files_count="$(git ls-files 2>/dev/null | wc -l | tr -d ' ' || echo "0")"
branches_count="$(git branch --all 2>/dev/null | wc -l | tr -d ' ' || echo "0")"
# Sanitize remote URL to remove any embedded credentials
remote_url_raw="$(git remote get-url origin 2>/dev/null || echo "unknown")"
remote_url="$(echo "$remote_url_raw" | sed -E 's|://[^@]+@|://|g')"

# Tags
latest_tag="$(git describe --tags --abbrev=0 2>/dev/null || echo "no-tags")"
tags_count="$(git tag 2>/dev/null | wc -l | tr -d ' ' || echo "0")"

# Environment variables (with defaults)
cycle_label="${MOBIUS_CYCLE:-null}"
mii_estimate="${MOBIUS_MII:-null}"
source_tag="${MOBIUS_SOURCE:-manual}"

# Quote strings for JSON or keep null as-is
if [ "$cycle_label" != "null" ]; then
  cycle_label="\"$cycle_label\""
fi
if [ "$mii_estimate" != "null" ]; then
  mii_estimate="\"$mii_estimate\""
fi

# Build the final JSON output
cat <<EOF
{
  "pulseVersion": "1.0",
  "repo": {
    "root": "$ROOT_DIR",
    "name": "$(basename "$ROOT_DIR")",
    "head": "$head_commit",
    "branch": "$branch_name",
    "remoteUrl": "$remote_url",
    "trackedFiles": $tracked_files_count,
    "branchesCount": $branches_count,
    "packagesCount": $package_count,
    "appsCount": $app_count,
    "latestTag": "$latest_tag",
    "tagsCount": $tags_count
  },
  "meta": {
    "timestamp": "$timestamp",
    "sentinelHint": "ATLAS|AUREA|ECHO|HERMES|EVE|ZEUS",
    "cycleLabel": $cycle_label,
    "miiEstimate": $mii_estimate,
    "sourceTag": "$source_tag"
  },
  "git": {
    "head": "$head_commit",
    "branch": "$branch_name",
    "recentCommits": $recent_commits_raw,
    "changedFiles": $changed_files,
    "stagedFiles": $staged_files
  },
  "structure": {
    "dirTree": $dir_tree_json,
    "workflows": $workflow_names,
    "sentinelFiles": $sentinel_files
  },
  "buildGraph": {
    "turboDryRun": $turbo_dry_run_json
  }
}
EOF
