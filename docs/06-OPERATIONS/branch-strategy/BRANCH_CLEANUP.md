# Mobius Branch Cleanup Tools

> EPICON-compliant branch management — intent before deletion.

## Quick Start

### One-liner: Delete all merged branches

```bash
# Preview what would be deleted
./scripts/quick-cleanup.sh --dry-run

# Actually delete
./scripts/quick-cleanup.sh
```

### Interactive: Full branch management

```bash
./scripts/cleanup-branches.sh
```

## Philosophy

These scripts embody the EPICON principle: **no consequential action without explicit, recorded intent.**

Every deletion:
1. Declares intent (what, why)
2. Requires confirmation
3. Logs the action with timestamp and operator

## Scripts

### `quick-cleanup.sh`

Fast cleanup of merged branches. Use when you just want to clear out branches that have been merged to main.

**Features:**
- Fetches and prunes automatically
- Shows what will be deleted before acting
- Supports `--dry-run` flag
- Logs EPICON intent
- Protects canonical branches (`main`, `claude/atlas`, `cursor/aurea`)

### `cleanup-branches.sh`

Interactive branch management with full analysis.

**Features:**
- **Analyze**: View all branches with status (merged/stale/active)
- **Delete merged**: Bulk delete branches merged to main
- **Review stale**: Interactive review of branches >30 days old
- **Dry run mode**: Preview without actual deletions
- **Full logging**: Every action logged with EPICON intent

## Branch Categories

| Status | Icon | Meaning | Action |
|--------|------|---------|--------|
| Protected | 🔒 | main, master, develop, claude/atlas, cursor/aurea | Never delete |
| Merged | ✅ | Merged to main | Safe to delete |
| Stale | ⚠️ | >30 days inactive | Review before delete |
| Active | 🔵 | Recent activity | Keep |

## Usage Examples

### Analyze Current Branches

```bash
$ ./scripts/cleanup-branches.sh
# Select option 1

STATUS   BRANCH                                             AGE   LAST COMMIT
──────── ────────────────────────────────────────────────── ──── ──────────────
🔒 protected main                                            0d   chore: update deps
🔒 protected claude/atlas                                    1d   feat: add new feature
🔒 protected cursor/aurea                                    2d   fix: resolve bug
✅ merged   cursor/old-feature-abc1                         15d   feat: completed feature
⚠️ stale    claude/abandoned-work-xyz2                       45d   wip: incomplete
🔵 active   cursor/current-work-def3                          3d   feat: in progress
```

### Delete Merged Branches

```bash
$ ./scripts/quick-cleanup.sh
🌀 Mobius Quick Branch Cleanup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Merged branches to delete (3):
  - cursor/old-feature-abc1
  - claude/completed-fix-ghi4
  - cursor/another-merged-jkl5

Delete these branches? [y/N]: y

📋 EPICON Intent: delete_merged_branches
   Scope: 3 branches
   Rationale: Removing branches merged to main
   Timestamp: 2026-01-16T22:00:00Z

Deleting cursor/old-feature-abc1... ✅
Deleting claude/completed-fix-ghi4... ✅
Deleting cursor/another-merged-jkl5... ✅

✅ Cleanup complete.
```

## Log Format

All actions are logged to `branch_cleanup_YYYYMMDD_HHMMSS.log`:

```
=== EPICON INTENT ===
action: delete_branches
scope: 3 merged branches
rationale: Removing branches merged to main
timestamp: 2026-01-16T22:00:00Z
operator: Michael Judan <michaeljjudan@gmail.com>

  ✅ Deleted cursor/old-feature-abc1
  ✅ Deleted claude/completed-fix-ghi4
  ✅ Deleted cursor/another-merged-jkl5
```

## GitHub Settings Recommendation

Enable auto-delete for merged PR branches:

1. Go to repo Settings → General
2. Find "Pull Requests" section
3. Check "Automatically delete head branches"

This prevents branch accumulation from merged PRs.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DRY_RUN` | `true` | If true, no actual deletions |
| `INTENT_REQUIRED` | `true` | If true, require confirmation |

Example:
```bash
DRY_RUN=false ./scripts/cleanup-branches.sh
```

## CI Integration

For automated cleanup in CI (use with caution):

```yaml
# .github/workflows/branch-cleanup.yml
name: Branch Cleanup
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Delete merged branches
        run: |
          git fetch --prune origin
          PROTECTED="main\|master\|develop\|HEAD\|claude/atlas\|cursor/aurea"
          for branch in $(git branch -r --merged origin/main | grep -v "$PROTECTED"); do
            branch_name=${branch#origin/}
            echo "Deleting $branch_name"
            git push origin --delete "$branch_name" || true
          done
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Troubleshooting

### Permission Denied

```
error: unable to delete 'branch-name': remote ref does not exist
```

The branch may have already been deleted or you lack push permissions.

### Protected Branch

```
remote: error: refusing to delete the current branch
```

You cannot delete a branch you're currently on. Switch to `main` first.

### Branch Has Open PR

Before deleting, check if a branch has an open PR:

```bash
gh pr list --head "branch-name" --state open
```

## Related Documents

- [Branch Strategy](./README.md)
- [GI Gate Workflow](../../.github/workflows/gi-gate.yml)

---

*"Memory with teeth — even for branch management."*

**Cycle:** C-198
**Last Updated:** 2026-01-16
