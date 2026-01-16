# Mobius Branch Strategy

> EPICON-compliant branching — intent encoded in branch names.

## Branch Structure

| Branch | Purpose | Governance | Who Uses It |
|--------|---------|------------|-------------|
| `main` | Production, always deployable | Protected | Merges only |
| `claude/atlas` | Claude-driven development | ATLAS sentinel | Claude sessions |
| `cursor/aurea` | Cursor agent development | AUREA sentinel | Cursor background agents |
| `v0.x.x` tags | Release milestones | Immutable | Version snapshots |

**That's it.** Three active branches plus tags for releases.

## Philosophy

### `main` — The Cathedral

The `main` branch is the cathedral. Only merged, reviewed, EPICON-approved code lives here.

- Never work directly on `main`
- All changes come through PRs from working branches
- Protected by branch protection rules
- Requires passing CI + GI gate (≥ 0.95)

### `claude/atlas` — Anthropic Sessions

When working with Claude (Anthropic), development happens here.

- Named for **ATLAS** — the primary Anthropic sentinel
- Claude sessions push to this branch
- PR to `main` when work is ready for review
- Audit trail: commits here were made under ATLAS oversight

### `cursor/aurea` — Cursor Agents

When Cursor background agents work, they push here.

- Named for **AUREA** — the integrity sentinel (OpenAI-based)
- Cursor background tasks use this branch
- PR to `main` when work is complete
- Audit trail: commits here were made under AUREA oversight

### Version Tags

Use `git tag v0.2.0` rather than branches for releases.

- Tags are immutable pointers
- Branches imply ongoing work
- Tags create clean release history

## Naming Convention

The `{tool}/{sentinel}` pattern encodes:

1. **Who** did the work (which AI system)
2. **What governance** applies (which sentinel reviews)

This creates natural audit trails:
- Commits on `claude/atlas` → Claude sessions under ATLAS oversight
- Commits on `cursor/aurea` → Cursor agents under AUREA oversight

## Branch Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                         main                                 │
│                    (production)                              │
└─────────────────────────────────────────────────────────────┘
          ▲                              ▲
          │ PR + Review                  │ PR + Review
          │                              │
┌─────────┴─────────┐          ┌────────┴────────┐
│   claude/atlas    │          │   cursor/aurea  │
│  (Claude work)    │          │  (Cursor work)  │
└───────────────────┘          └─────────────────┘
```

## Feature Branches (Optional)

For specific features, use descriptive sub-branches:

```
claude/atlas/feature-name
cursor/aurea/fix-description
```

These merge back to their parent working branch first, then to `main`.

## Configuration

### Cursor Background Agents

Configure Cursor to use `cursor/aurea` by default for background tasks:

1. In Cursor settings, configure the default branch for Cloud Agents
2. All background agent work goes to `cursor/aurea`
3. Review and merge to `main` when ready

### Claude Sessions

When starting a Claude session:

```bash
git checkout claude/atlas
git pull origin claude/atlas
# ... work ...
git push origin claude/atlas
```

## Migration from Old Branches

After implementing this strategy, clean up old branches:

```bash
# Use the cleanup tools
./scripts/quick-cleanup.sh --dry-run  # Preview
./scripts/quick-cleanup.sh            # Execute

# Or interactive mode
./scripts/cleanup-branches.sh
```

See [BRANCH_CLEANUP.md](./BRANCH_CLEANUP.md) for detailed cleanup documentation.

## Branch Protection Rules

Recommended GitHub settings for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass
- ✅ Require linear history
- ✅ Automatically delete head branches (for PR branches)
- ✅ Restrict who can push (no direct pushes)

## Related Documents

- [Branch Cleanup Tools](./BRANCH_CLEANUP.md)
- [GI Gate Workflow](../../.github/workflows/gi-gate.yml)
- [EPICON Governance](../../GOVERNANCE/)

---

*"Memory with teeth — even for branch management."*

**Cycle:** C-198
**Last Updated:** 2026-01-16
