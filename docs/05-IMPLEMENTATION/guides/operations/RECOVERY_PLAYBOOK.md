# Recovery Playbook

## Purpose

This document provides step-by-step recovery procedures in case a bad PR merges or destructive changes are introduced to the repository.

**Important:** Always prefer non-destructive revert operations over hard resets when possible.

---

## Scenario 1: Bad PR Merged (Prefer Revert)

If a bad commit has been merged to `main`:

### Step 1: Identify the bad commit(s)

```bash
# View recent commit history
git log --oneline --decorate --graph -20

# Or view with more detail
git log --oneline --decorate --graph --all
```

### Step 2: Revert the commit

**For a single commit:**
```bash
# Revert creates a new inverse commit (preserves history)
git revert <bad_sha>

# Push the revert
git push origin main
```

**For a merge commit:**
```bash
# Revert merge commit (use -m 1 to revert to first parent)
git revert -m 1 <merge_commit_sha>

# Push the revert
git push origin main
```

**For multiple commits:**
```bash
# Revert a range of commits (newest first)
git revert <newest_bad_sha>..<oldest_bad_sha>

# Or revert individually
git revert <sha1>
git revert <sha2>
git revert <sha3>

# Push all reverts
git push origin main
```

---

## Scenario 2: Bad PR Open (Not Merged)

If a destructive PR is still open:

1. **Close the PR** via GitHub UI (do not merge)
2. Delete the branch if safe to do so
3. Create a new PR with the correct changes

---

## Scenario 3: Main Branch Truly Wiped (Last Resort)

**⚠️ WARNING:** Only use this if reverts are not possible or if the repository state is completely corrupted.

### Step 1: Identify the last good commit

```bash
# View reflog to find the last known good state
git reflog

# Or check remote state
git fetch origin
git log origin/main --oneline -20
```

### Step 2: Hard reset to good commit

```bash
# Switch to main branch
git checkout main

# Reset to the last good commit (use exact SHA you trust)
git reset --hard <good_sha>

# Force push with lease (safer than --force)
git push --force-with-lease origin main
```

**Why `--force-with-lease`?** It prevents overwriting remote changes if someone else pushed while you were fixing things.

---

## Scenario 4: Recover Specific Deleted Files

If you need to restore specific files without reverting entire commits:

### Step 1: Create a restoration branch

```bash
git checkout -b restore-files
```

### Step 2: Restore files from a good commit

```bash
# Restore a single file
git checkout <good_sha> -- path/to/file

# Restore an entire directory
git checkout <good_sha> -- path/to/important/dir

# Restore multiple paths
git checkout <good_sha> -- path/to/file1 path/to/file2 path/to/dir/
```

### Step 3: Commit and push

```bash
git add .
git commit -m "restore: bring back files from <good_sha>"
git push -u origin restore-files
```

### Step 4: Open PR for review

Open a PR to merge `restore-files` into `main` and ensure all guardrails pass.

---

## Quick Reference Commands

```bash
# View recent commits
git log --oneline --decorate --graph -10

# Revert a commit
git revert <sha>

# Revert a merge commit
git revert -m 1 <merge_sha>

# View reflog (for finding lost commits)
git reflog

# Hard reset to a commit (dangerous!)
git reset --hard <sha>

# Restore specific files
git checkout <good_sha> -- path/to/file

# Safe force push
git push --force-with-lease origin main
```

---

## Prevention

These guardrails prevent destructive changes:

1. **Anti-nuke workflow** (`.github/workflows/anti-nuke.yml`) - Blocks PRs with excessive deletions
2. **Codex policy** (`.github/codex-policy.yml`) - Enforces additive-only mode
3. **Branch protection** - Requires PRs, blocks force-push, requires approvals
4. **GI gates** - Ensures integrity checks pass before merge

Always review PRs carefully, especially those with deletions in protected paths.

---

## Emergency Contacts

If you need help recovering:
- Check `.github/CODEOWNERS` for code owners
- Review CI/CD logs for what changed
- Use `git reflog` to find lost commits

---

*Last updated: 2025-01-27*
