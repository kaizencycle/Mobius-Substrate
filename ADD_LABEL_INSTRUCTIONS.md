# 🏷️ How to Add the Label

I don't have direct access to the GitHub API from this environment, but adding the label is very simple via the GitHub web interface.

---

## Quick Steps

### Option 1: Via PR Page (Easiest) ✅

1. **Go to your PR on GitHub:**
   ```
   https://github.com/kaizencycle/Mobius-Substrate/pulls
   ```
   Look for the PR from branch `claude/find-perf-issues-mkip0uqf7otxvsrb-fXC5l`

2. **On the right sidebar, find "Labels"**
   - Click on the ⚙️ gear icon next to "Labels"

3. **Type or select:** `consensus:approved`

4. **Click outside the menu** to save

That's it! ✅

---

## Option 2: Via GitHub CLI (If Installed)

If you have the GitHub CLI (`gh`) installed locally:

```bash
# Navigate to the repo
cd /path/to/Mobius-Substrate

# Add the label
gh pr edit <PR_NUMBER> --add-label "consensus:approved"
```

---

## Option 3: Via API (If You Have a Token)

If you have a GitHub personal access token:

```bash
export GITHUB_TOKEN="your_token_here"
./add-label.sh
```

---

## What Happens Next?

Once you add the `consensus:approved` label:

1. ✅ **Merge Gate check will update** and wait for approval
2. 🔄 **CI workflows will continue running**
3. ⏳ **You still need 1 CODEOWNER approval** (kaizencycle or michaeljudan)

After approval, the merge gate will pass and the PR can be merged! 🎉

---

## Current PR Status

- Branch: `claude/find-perf-issues-mkip0uqf7otxvsrb-fXC5l`
- Repo: `kaizencycle/Mobius-Substrate`
- Commits: 7
- Status: ✅ All fixes implemented, catalog updated
- Checks:
  - ✅ Catalog Integrity (fixed)
  - ⏳ Merge Gate (needs label + approval)

---

## Screenshot Reference

When you open the PR, you'll see something like this on the right sidebar:

```
┌─────────────────────────┐
│ Reviewers               │
│ └─ (Add reviewers)      │
│                         │
│ Assignees               │
│ └─ (Add assignees)      │
│                         │
│ Labels                  │  ← Click the ⚙️ here
│ └─ ⚙️                   │
│                         │
│ Projects                │
│ └─ (Add to project)     │
└─────────────────────────┘
```

After clicking the ⚙️ next to "Labels", you'll see a searchable list. Type `consensus:approved` and select it!

---

**Need help?** The PR is ready - just need that label! 🏷️
