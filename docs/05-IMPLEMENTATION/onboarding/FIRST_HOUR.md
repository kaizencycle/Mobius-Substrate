# Your First Hour in Mobius

**A quick-start guide for human contributors.**

---

## Welcome to Civic Engineering

Mobius is civic infrastructure for AI governance. Your contributions help build systems that are transparent, accountable, and human-centered.

This guide gets you from zero to first PR in under an hour.

---

## Step 1: Set Up Your Environment (10 minutes)

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Systems.git
cd kaizen-os

# Install dependencies
npm install

# Verify installation
npm run build
```

### Using DevContainer (Recommended)

If you have VS Code and Docker:

1. Open the repository in VS Code
2. Click "Reopen in Container" when prompted
3. Wait for container to build
4. You're ready to go

---

## Step 2: Run Tests (5 minutes)

Verify everything works:

```bash
# Run all tests
npm run test

# Run linter
npm run lint

# Type check
npm run type-check
```

All green? You're ready to contribute.

---

## Step 3: Read the Essentials (15 minutes)

Before writing code, understand the context:

| Document | What You'll Learn |
|----------|-------------------|
| [CONTRIBUTING.md](../../../CONTRIBUTING.md) | How to submit changes |
| [GOVERNANCE.md](../../GOVERNANCE.md) | How decisions are made |
| [ROLES.md](../../../GOVERNANCE/ROLES.md) | Contributor levels and progression |

Key concepts:
- **MII**: Mobius Integrity Index (target: ≥ 0.95)
- **EPICON**: Intent declaration system
- **ZEUS**: Policy enforcement
- **Sentinels**: AI agents that review and assist

---

## Step 4: Find Your First Issue (10 minutes)

Look for issues labeled:
- `good first issue` - Perfect for newcomers
- `help wanted` - Community contributions welcome
- `documentation` - Low-risk, high-impact

Browse: [Issues → Good First Issues](https://github.com/kaizencycle/Mobius-Systems/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)

---

## Step 5: Create Your Branch (2 minutes)

```bash
# Ensure you're on main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feat/your-username/short-description

# Example:
git checkout -b feat/alice/fix-readme-typo
```

---

## Step 6: Make Your Changes

### For Documentation Changes (Tier 0)

Edit files directly. Ensure:
- Clear, accurate information
- Consistent formatting
- No broken links

### For Code Changes (Tier 1+)

Follow these steps:
1. Write tests first (if applicable)
2. Implement your change
3. Run tests locally
4. Check lint passes

```bash
# Run your tests
npm run test

# Check lint
npm run lint

# Type check
npm run type-check
```

---

## Step 7: Commit and Push (5 minutes)

### Commit Message Format

Use conventional commits:

```bash
git add .
git commit -m "feat(docs): add first-hour onboarding guide"
```

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Push Your Branch

```bash
git push -u origin feat/your-username/short-description
```

---

## Step 8: Open Your PR (5 minutes)

1. Go to GitHub and open a Pull Request
2. Use the PR template
3. Fill in all sections:
   - Summary of changes
   - Risk tier (probably 0 or 1)
   - Testing done
   - Related issues

### PR Checklist

- [ ] Title follows conventional commit format
- [ ] Description explains what and why
- [ ] Tests pass locally
- [ ] Lint passes locally
- [ ] Documentation updated if needed

---

## What Happens Next

1. **Automated checks** run (CI, lint, type-check)
2. **Sentinel review** (AI provides feedback)
3. **Human review** (maintainer reviews)
4. **Merge** when all checks pass

Typical timeline: 24-48 hours for standard PRs.

---

## Getting Help

- **Questions?** Open a Discussion on GitHub
- **Stuck?** Check existing issues for similar problems
- **Confused?** Read the docs in `/docs/`

---

## Contributor Progression

You start as **H1 Contributor**. As you contribute:

| Level | Requirements | Unlock |
|-------|--------------|--------|
| **H1** | First merged PR | Submit PRs |
| **H2** | Multiple quality contributions | Review others' PRs |
| **H3** | Sustained high-quality work | Merge to main |

See [ROLES.md](../../../GOVERNANCE/ROLES.md) for full details.

---

## Quick Reference

### Common Commands

```bash
npm install          # Install dependencies
npm run build        # Build all packages
npm run test         # Run tests
npm run lint         # Check code style
npm run type-check   # TypeScript validation
npm run dev          # Start dev servers
```

### Key Directories

```
/apps/          # Applications
/packages/      # Shared libraries
/docs/          # Documentation
/sentinels/     # AI agents
/tests/         # Test suites
```

### Integrity Rules

- MII must remain ≥ 0.95
- All changes need EPICON intent
- No bypassing tests or reviews
- Document your reasoning

---

## Welcome to the Team

You're now part of civic infrastructure development.

Remember:
- Quality over speed
- Intent over action
- Memory over momentum

We heal as we walk.

---

*Questions? Open an issue or discussion.*

*Last updated: C-200*
