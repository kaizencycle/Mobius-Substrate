# 🚀 Claude Code Setup Guide for Mobius-Substrate

**Status:** ✅ Context Mesh Active
**Files:** 4 CLAUDE.md files (root + 3 workspaces)
**Token Budget:** ~7,250 tokens (3.6%) + ~192,750 available (96.4%)
**Created:** C-180 (2026-01-09)

---

## 🎯 What's Been Set Up

### Context Mesh (CLAUDE.md Files)
We've created a strategic "context mesh" that Claude Code automatically loads:

```
Mobius-Substrate/
├── CLAUDE.md              ✅ Root monorepo guide (400 lines)
├── apps/CLAUDE.md         ✅ Applications workspace (300 lines)
├── packages/CLAUDE.md     ✅ Shared packages (350 lines)
└── .github/CLAUDE.md      ✅ CI/CD workflows (400 lines)
```

**Benefits:**
- ~40% token reduction vs naive file reading
- Instant access to monorepo structure
- Workspace-specific conventions
- Common commands and troubleshooting

---

## 🏃 Quick Start

### 1. Verify Context Mesh is Active

Open Claude Code and ask:
```
"What is the structure of this monorepo?"
```

Claude should reference information from the CLAUDE.md files without you opening them.

### 2. Test Multi-Directory Support

```bash
# In Claude Code session
/add-dir apps/portal
/add-dir packages/integrity-core

# Then ask:
"Show me how integrity-core is used in the portal app"
```

Claude now has context for both directories and their CLAUDE.md files.

### 3. Try Common Tasks

Ask Claude:
```
"How do I build just the affected packages?"
"What's the process for adding a new app?"
"Why did the catalog check fail?"
"How do I fix Anti-Nuke violations?"
```

All answers should come from CLAUDE.md context.

---

## 📚 Next Steps to Maximize Features

### Phase 1: Advanced Context Management

#### Add Workspace-Specific CLAUDE.md (Optional)
For frequently modified apps/packages:

```bash
# Example: Portal-specific context
cat > apps/portal/CLAUDE.md << 'EOF'
# Portal Application

**Type:** Next.js app
**Port:** 3002
**Purpose:** Main Kaizen OS portal

## Architecture
- App Router (Next.js 14)
- Server Components
- API routes in /api

## Key Features
- User authentication
- Integrity dashboard
- Civic attestations

## Environment Variables
NEXT_PUBLIC_API_BASE=https://api.kaizen.os
NEXT_PUBLIC_PORTAL_ORIGIN=https://kaizen.os
NEXT_PUBLIC_ENABLE_SOLARA=true

## Common Issues
See parent apps/CLAUDE.md for general app issues.
EOF

git add apps/portal/CLAUDE.md
git commit -m "docs: add portal-specific CLAUDE.md context"
```

**When to add workspace-specific files:**
- App/package you work on daily
- Complex architecture needing detailed docs
- Unique conventions not in parent CLAUDE.md

---

### Phase 2: Configure MCP Servers

#### Install GitHub MCP (Recommended)

**Benefits:**
- Search monorepo for symbol usage
- Query recent PR changes
- Access live repo data
- CI/CD status integration

**Setup:**
```bash
# Interactive wizard
claude mcp add

# Follow prompts:
# 1. Select "GitHub MCP Server"
# 2. Enter your GitHub token
# 3. Confirm configuration
```

**Manual config** (`~/.claude.json`):
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Test:**
```
# In Claude Code
"Using GitHub MCP, find all uses of calculateMII across the repo"
```

---

#### PostgreSQL MCP (For Database Work)

**Setup:**
```bash
claude mcp add
# Select: PostgreSQL MCP
```

**Config:**
```json
{
  "mcpServers": {
    "postgresql": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mobius"
      }
    }
  }
}
```

**Use cases:**
- Query database schema
- Generate migrations
- Debug SQL queries
- Analyze table relationships

---

### Phase 3: Set Up Hooks

#### Pre-Commit Hook (Test Validation)

**Purpose:** Ensure tests pass before committing

```bash
# Create hook file
mkdir -p ~/.claude/hooks
cat > ~/.claude/hooks/pre-commit.sh << 'EOF'
#!/bin/bash
# Pre-commit hook: Run tests before allowing commits

if git diff --cached --quiet; then
  exit 0  # No staged changes
fi

echo "🧪 Running tests before commit..."

cd "$(git rev-parse --show-toplevel)"

# Run tests
npm run test || {
  echo ""
  echo "❌ Tests failed! Fix before committing."
  echo "   Run: npm run test"
  echo ""
  exit 1
}

echo "✅ Tests passed!"
EOF

chmod +x ~/.claude/hooks/pre-commit.sh
```

**Configure** (`~/.claude.json`):
```json
{
  "hooks": {
    "preToolUse": "~/.claude/hooks/pre-commit.sh"
  }
}
```

---

#### Post-Edit Hook (Auto-format)

**Purpose:** Automatically format files after editing

```bash
cat > ~/.claude/hooks/post-edit.sh << 'EOF'
#!/bin/bash
# Post-edit hook: Auto-format TypeScript/JavaScript files

FILE="$1"

if [[ "$FILE" == *.ts || "$FILE" == *.tsx || "$FILE" == *.js || "$FILE" == *.jsx ]]; then
  cd "$(git rev-parse --show-toplevel)"
  npx prettier --write "$FILE" 2>/dev/null
  echo "✨ Formatted $FILE"
fi
EOF

chmod +x ~/.claude/hooks/post-edit.sh
```

**Configure:**
```json
{
  "hooks": {
    "postToolUse": "~/.claude/hooks/post-edit.sh"
  }
}
```

---

#### Catalog Regeneration Hook

**Purpose:** Auto-regenerate catalog after doc changes

```bash
cat > ~/.claude/hooks/catalog-check.sh << 'EOF'
#!/bin/bash
# Catalog check hook: Ensure catalog is fresh

cd "$(git rev-parse --show-toplevel)"

# Check if any docs or EPICONs changed
DOCS_CHANGED=$(git diff --name-only --cached | grep -E '\.md$|EPICON/' || true)

if [ -n "$DOCS_CHANGED" ]; then
  echo "📚 Docs changed, regenerating catalog..."
  npm run export:catalog >/dev/null 2>&1

  # Check if catalog changed
  if ! git diff --quiet catalog/mobius_catalog.json; then
    git add catalog/mobius_catalog.json
    echo "✅ Catalog updated automatically"
  fi
fi
EOF

chmod +x ~/.claude/hooks/catalog-check.sh
```

**Configure:**
```json
{
  "hooks": {
    "stop": "~/.claude/hooks/catalog-check.sh"
  }
}
```

---

### Phase 4: Advanced Indexing (For Large Repos)

#### Zilliz Claude Context MCP

**When to use:**
- Repository has 10,000+ files
- Frequent cross-workspace searches
- Need semantic code search

**Install:**
```bash
npm install -g @zilliztech/claude-context
```

**Index monorepo:**
```bash
cd ~/Mobius-Substrate
claude-context index .
```

**Claude Code integration:**
```json
{
  "mcpServers": {
    "claude-context": {
      "command": "claude-context",
      "args": ["serve", "."]
    }
  }
}
```

**Usage:**
```
"Find all implementations of MII calculation"
# Returns only relevant code slices, not entire files
```

---

## 🎯 Common Workflows

### Starting Work on a Feature

```bash
# 1. In Claude Code, add relevant directories
/add-dir apps/portal
/add-dir packages/integrity-core

# 2. Ask Claude about the codebase
"Explain how the portal calculates MII using integrity-core"

# 3. Make changes (Claude has full context)
"Add a new MII display component to the portal dashboard"

# 4. Claude auto-formats (if hook configured)
# ✨ Formatted apps/portal/src/components/MIIDisplay.tsx

# 5. Tests run automatically (if hook configured)
# 🧪 Running tests before commit...
# ✅ Tests passed!

# 6. Commit
"Commit these changes with a descriptive message"
```

---

### Debugging CI Failures

```bash
# 1. Ask Claude to check workflow docs
"Why did the catalog check fail?"
# Claude references .github/CLAUDE.md

# 2. Get fix instructions
"How do I regenerate the catalog?"
# Claude: npm run export:catalog

# 3. Execute fix
"Run the catalog regeneration command"

# 4. Verify
"Check if the catalog is now in sync"
```

---

### Adding a New Package

```bash
# 1. Get template from docs
"Show me how to create a new package in the monorepo"
# Claude references packages/CLAUDE.md

# 2. Create package structure
"Create a new package called @civic/my-package with the standard template"

# 3. Add dependencies
"This package needs integrity-core. Add it to package.json"

# 4. Build and test
"Build the new package and run tests"
```

---

## 📊 Monitoring Token Usage

### Check Context Size

In Claude Code, ask:
```
"How much context are you using from CLAUDE.md files?"
```

Claude should report ~7,250 tokens (3.6% of budget).

### Optimize if Needed

If context >20k tokens (10%):
1. Split large CLAUDE.md files
2. Move detailed docs to separate files
3. Keep each CLAUDE.md under 10k words
4. Reference external docs instead of embedding

---

## 🔧 Troubleshooting

### CLAUDE.md Not Loading

**Issue:** Claude doesn't seem to know about monorepo structure

**Fix:**
```bash
# 1. Verify files exist
ls -la CLAUDE.md apps/CLAUDE.md packages/CLAUDE.md .github/CLAUDE.md

# 2. Restart Claude Code session
# 3. Ask explicit question:
"What does the root CLAUDE.md say about the monorepo structure?"
```

---

### MCP Server Not Working

**Issue:** "GitHub MCP not found" or similar

**Fix:**
```bash
# 1. Check configuration
cat ~/.claude.json | grep -A10 "mcpServers"

# 2. Test installation
npx @modelcontextprotocol/server-github --version

# 3. Check token
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# 4. Restart Claude Code
```

---

### Hooks Not Firing

**Issue:** Pre-commit hook doesn't run tests

**Fix:**
```bash
# 1. Verify hook file exists
ls -la ~/.claude/hooks/pre-commit.sh

# 2. Check executable permission
chmod +x ~/.claude/hooks/pre-commit.sh

# 3. Test hook manually
~/.claude/hooks/pre-commit.sh

# 4. Check configuration
cat ~/.claude.json | grep -A5 "hooks"
```

---

## 📈 Metrics & Success Indicators

### After 1 Week

- [ ] Used `/add-dir` at least 5 times
- [ ] Asked 10+ questions answered by CLAUDE.md files
- [ ] Configured at least 1 MCP server
- [ ] Set up at least 1 hook
- [ ] Token usage consistently <10% for context

### After 1 Month

- [ ] Created 2-3 workspace-specific CLAUDE.md files
- [ ] All team members using context mesh
- [ ] Average task completion time reduced by 20%
- [ ] Fewer "how do I..." questions in chat
- [ ] CI failures down (hooks catching issues earlier)

---

## 🎓 Learning Resources

### Official Docs
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Multi-Directory Support](https://apidog.com/blog/claude-code-multi-directory-support/)
- [MCP Documentation](https://code.claude.com/docs/en/mcp)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)

### Community
- [DEV: Organizing CLAUDE.md in Monorepo](https://dev.to/anvodev/how-i-organized-my-claudemd-in-a-monorepo-with-too-many-contexts-37k7)
- [Best MCP Servers 2026](https://www.builder.io/blog/best-mcp-servers-2026)

### Internal Docs
- `CLAUDE.md` - Monorepo overview
- `.github/CLAUDE.md` - CI/CD workflows
- `apps/CLAUDE.md` - Application guides
- `packages/CLAUDE.md` - Package development

---

## 🚀 Next Actions (Your Choice)

Pick what interests you most:

### 🟢 Easy Wins (Do First)
1. **Test context mesh** - Ask Claude about monorepo structure
2. **Try /add-dir** - Add 2-3 directories and test queries
3. **Configure GitHub MCP** - 5 minutes, huge value

### 🟡 Medium Effort (High Value)
4. **Set up pre-commit hook** - Catch test failures early
5. **Add portal-specific CLAUDE.md** - For main app you work on
6. **Configure post-edit hook** - Auto-formatting

### 🔴 Advanced (Optional)
7. **Set up Zilliz indexing** - For semantic code search
8. **Create custom MCP server** - For EPICON validation
9. **Multi-root VS Code workspace** - Full IDE integration

---

## 💡 Pro Tips

1. **Start small:** Just use the context mesh for a week before adding MCP servers
2. **One hook at a time:** Add pre-commit, test it, then add post-edit
3. **Ask Claude:** Use `/help` in Claude Code for inline documentation
4. **Team adoption:** Share this guide with teammates
5. **Iterate:** Refine CLAUDE.md files as you learn what's useful

---

## 📞 Need Help?

- **Claude Code issues:** Check official docs (links above)
- **Monorepo questions:** Reference CLAUDE.md files
- **CI/CD questions:** See `.github/CLAUDE.md`
- **Hook problems:** Test scripts manually first

---

*"We heal as we walk." — Mobius Substrate* 🌀

**Created:** C-180 (2026-01-09)
**Maintained by:** ATLAS Agent
**Status:** Active, Ready to Use
