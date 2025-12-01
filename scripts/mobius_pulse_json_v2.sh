#!/usr/bin/env bash
set -euo pipefail

# Mobius Repo Pulse JSON generator (v2 - C-151)
# Emits a MobiusPulse v1.0 JSON document to stdout with GI/MII scores.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

VERSION="1.0"
GENERATED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
CYCLE="${MOBIUS_CYCLE:-C-UNKNOWN}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

COMMIT_SHA="$(git rev-parse HEAD)"
COMMIT_AUTHOR="$(git log -1 --pretty=format:%an)"
COMMIT_MESSAGE="$(git log -1 --pretty=format:%s)"

# --- Repo tree info -----------------------------------------------------

apps_list=$(find apps -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sed 's|apps/||' | sort || true)
packages_list=$(find packages -maxdepth 1 -mindepth 1 -type d 2>/dev/null | sed 's|packages/||' | sort || true)
workflows_list=$(find .github/workflows -maxdepth 1 -mindepth 1 -type f -name "*.yml" -o -name "*.yaml" 2>/dev/null | sed 's|.github/workflows/||' | sort || true)

apps_json=$(printf '%s\n' $apps_list | grep -v '^$' | jq -R . | jq -s . 2>/dev/null || echo '[]')
packages_json=$(printf '%s\n' $packages_list | grep -v '^$' | jq -R . | jq -s . 2>/dev/null || echo '[]')
workflows_json=$(printf '%s\n' $workflows_list | grep -v '^$' | jq -R . | jq -s . 2>/dev/null || echo '[]')

total_files=$(git ls-files | wc -l | tr -d ' ')

# Language proportions (0–1) using cloc if available
if command -v cloc &> /dev/null; then
  total_lines=$(cloc --json . 2>/dev/null | jq '.SUM.code // 0' || echo "0")
  languages_json=$(
    cloc --json . 2>/dev/null \
      | jq '
          . as $root
          | ($root.SUM.code // 0) as $total
          | del(.header, .SUM)
          | to_entries
          | map({ key: .key, value: (if $total == 0 then 0 else (.value.code / $total) end) })
          | from_entries
        ' 2>/dev/null || echo '{}'
  )
else
  total_lines=$(git ls-files | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  languages_json='{}'
fi

# --- Integrity placeholders --------------------------------------------
# These should be filled in by your MCP / workflows.
GI_SCORE="${GI_SCORE:-0.95}"
MII_SCORE="${MII_SCORE:-0.95}"
MIC_MINTED="${MIC_MINTED:-0}"
MIC_BURNED="${MIC_BURNED:-0}"

# --- Emit JSON ---------------------------------------------------------

jq -n \
  --arg version "$VERSION" \
  --arg generatedAt "$GENERATED_AT" \
  --arg cycle "$CYCLE" \
  --arg branch "$BRANCH" \
  --arg sha "$COMMIT_SHA" \
  --arg author "$COMMIT_AUTHOR" \
  --arg message "$COMMIT_MESSAGE" \
  --argjson apps "$apps_json" \
  --argjson packages "$packages_json" \
  --argjson workflows "$workflows_json" \
  --argjson totalFiles "$total_files" \
  --argjson totalLines "$total_lines" \
  --argjson languages "$languages_json" \
  --arg gi "$GI_SCORE" \
  --arg mii "$MII_SCORE" \
  --argjson micMinted "$MIC_MINTED" \
  --argjson micBurned "$MIC_BURNED" '
{
  version: $version,
  generatedAt: $generatedAt,
  cycle: $cycle,
  branch: $branch,
  commit: {
    sha: $sha,
    author: $author,
    message: $message
  },
  tree: {
    apps: $apps,
    packages: $packages,
    workflows: $workflows
  },
  stats: {
    totalFiles: $totalFiles,
    totalLines: $totalLines,
    languages: $languages
  },
  integrity: {
    giScore: ($gi | tonumber),
    miiScore: ($mii | tonumber),
    micTestnet: {
      totalMinted: $micMinted,
      totalBurned: $micBurned
    }
  }
}
'
