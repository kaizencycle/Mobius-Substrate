# CI Workflow Failures - Analysis and Fixes

**Date:** 2026-01-06
**Branch:** `claude/organize-docs-Z9eoM`
**Status:** ✅ All 3 failures fixed

---

## Summary

Fixed 3 failing CI checks after C-180 package manager standardization:

1. **Mobius Catalog Integrity Check** - Catalog out of date
2. **CI (Unified) / Core Build & Test** - Wrong turbo invocation
3. **CI (Unified) / Portal Validation** - Wrong working directory

All failures were caused by the npm/pnpm standardization changes in C-180.

---

## Issue 1: Mobius Catalog Integrity Check ✅ FIXED

### Problem
```
❌ CATALOG IS OUT OF DATE
The catalog/mobius_catalog.json file has drifted.
```

### Root Cause
The catalog's `generated_at` timestamp was stale after adding new documentation files:
- `.github/PR_C180_DESCRIPTION.md`
- `.github/WORKFLOW_ISSUES_REPORT.md`
- `.github/PR_WORKFLOW_FIXES_DESCRIPTION.md`
- `.github/C180_OPTIMIZATION_SUMMARY.md`

The catalog tracks all markdown files and needs regeneration when docs change.

### Fix Applied
```bash
npm run export:catalog
git add catalog/mobius_catalog.json
git commit -m "chore: update catalog timestamp"
```

**Result:** Catalog now shows 743 docs, 3 EPICONs (no content changes, only timestamp)

**Commit:** `226363d`

---

## Issue 2: CI (Unified) / Core Build & Test ✅ FIXED

### Problem
```
npm error Missing script: "turbo"
```

### Root Cause
C-180 Phase 2 changed CI workflow from:
```yaml
run: pnpm turbo run build
```

to:
```yaml
run: npm run turbo run build  # ❌ WRONG
```

But there's no `"turbo"` script in package.json. The package.json has:
```json
{
  "scripts": {
    "build": "turbo run build",   // ✅ This exists
    "test": "turbo run test"       // ✅ This exists
  }
}
```

Turbo is installed as a devDependency and should be invoked via `npx`, not as an npm script.

### Fix Applied

**Changed:**
```yaml
# Before (incorrect)
- run: npm run turbo run build --filter=...[HEAD^]
- run: npm run turbo run lint --filter=...[HEAD^]
- run: npm run turbo run type-check --filter=...[HEAD^]
- run: npm run turbo run test --filter=...[HEAD^]
- run: npm run turbo run test:integration --filter=...[HEAD^]

# After (correct)
- run: npx turbo run build --filter=...[HEAD^]
- run: npx turbo run lint --filter=...[HEAD^]
- run: npx turbo run type-check --filter=...[HEAD^]
- run: npx turbo run test --filter=...[HEAD^]
- run: npx turbo run test:integration --filter=...[HEAD^]
```

**Why npx?**
- `npx` executes binaries from node_modules/.bin/
- `turbo` is installed as a devDependency
- No wrapper script needed in package.json

**Alternative approaches considered:**
1. ❌ Add `"turbo": "turbo"` to scripts (redundant)
2. ❌ Use `npm run build` (loses turbo flags like --filter)
3. ✅ Use `npx turbo` (direct CLI access)

**Commit:** `20e0cee`

---

## Issue 3: CI (Unified) / Portal Validation ✅ FIXED

### Problem
```
npm error Cannot read properties of undefined (reading 'portal')
npm error No package-lock.json found in apps/portal
```

### Root Cause
The Portal Validation job had:
```yaml
defaults:
  run:
    working-directory: apps/portal  # ❌ Applied to ALL steps
```

This caused:
1. **npm ci** ran in `apps/portal/` looking for `apps/portal/package-lock.json` (doesn't exist)
2. **cache-dependency-path** pointed to `apps/portal/package-lock.json` (doesn't exist)

In npm workspace monorepos:
- Dependencies installed from **root** (where package-lock.json lives)
- Scripts run in **workspace directories**

### Fix Applied

**Before:**
```yaml
portal-validation:
  defaults:
    run:
      working-directory: apps/portal  # ❌ All steps in portal dir

  steps:
    - uses: actions/setup-node@v4
      with:
        cache-dependency-path: 'apps/portal/package-lock.json'  # ❌ Doesn't exist

    - run: npm ci           # ❌ Runs in apps/portal, fails
    - run: npx tsc --noEmit # Runs in apps/portal
    - run: npm run lint     # Runs in apps/portal
    - run: npm run build    # Runs in apps/portal
```

**After:**
```yaml
portal-validation:
  # ✅ No default working-directory

  steps:
    - uses: actions/setup-node@v4
      with:
        cache: 'npm'  # ✅ Uses root package-lock.json

    - run: npm ci  # ✅ Runs from root

    - run: npx tsc --noEmit
      working-directory: apps/portal  # ✅ Only this step in portal

    - run: npm run lint
      working-directory: apps/portal  # ✅ Only this step in portal

    - run: npm run build
      working-directory: apps/portal  # ✅ Only this step in portal
```

**Key changes:**
1. Removed default `working-directory` from job level
2. Removed `cache-dependency-path` (auto-detects root package-lock.json)
3. `npm ci` runs from root (installs all workspace dependencies)
4. Individual steps use `working-directory: apps/portal` as needed

**Why this works:**
- npm ci from root installs dependencies for all workspaces
- Build/lint/type-check run in portal directory
- Uses portal's package.json scripts (`next build`, `next lint`, etc.)

**Commit:** `ce55dca`

---

## Validation

All 3 fixes have been committed and pushed to `claude/organize-docs-Z9eoM`.

**Expected CI Results:**
```
✅ Mobius Catalog Integrity Check - Catalog up to date
✅ CI (Unified) / Core Build & Test - Turbo commands work
✅ CI (Unified) / Portal Validation - Dependencies install from root
```

---

## Root Cause Analysis

All 3 failures stem from **C-180 Phase 2: Package Manager Standardization**

**What happened:**
1. Changed CI from `pnpm` to `npm`
2. Changed `pnpm turbo` to `npm run turbo` (incorrect interpretation)
3. Didn't account for npm workspace monorepo structure

**What should have happened:**
1. Change `pnpm turbo` to `npx turbo` (correct for CLI tools)
2. Keep `npm ci` at root level (workspace monorepo pattern)
3. Regenerate catalog after doc changes

**Lesson learned:**
When standardizing package managers, need to consider:
- How CLI tools are invoked (npx vs npm run)
- Monorepo dependency installation patterns
- Side effects like catalog regeneration

---

## Files Changed

**Commits:**
1. `226363d` - chore: update catalog timestamp
2. `20e0cee` - fix: use npx turbo instead of npm run turbo in CI
3. `ce55dca` - fix: correct Portal Validation working directory and npm cache path

**Files:**
- `catalog/mobius_catalog.json` (timestamp update)
- `.github/workflows/ci.yml` (turbo invocation + portal working directory)

**Total changes:** 3 commits, 2 files

---

## Prevention

To avoid similar issues in future:

1. **Test CI changes locally:**
   ```bash
   # Simulate CI commands
   npm ci
   npx turbo run build
   cd apps/portal && npm run build
   ```

2. **Understand monorepo patterns:**
   - Dependencies: Install from root
   - Scripts: Run in workspace directories
   - CLI tools: Use npx, not npm run

3. **Regenerate catalog:**
   ```bash
   npm run export:catalog
   ```
   After adding/moving docs

4. **Check package.json scripts:**
   - Verify script exists before using `npm run`
   - Use `npx` for CLI tools installed as devDependencies

---

## Status

| Check | Before | After |
|-------|--------|-------|
| **Catalog Integrity** | ❌ Out of date | ✅ In sync |
| **Core Build & Test** | ❌ Missing script: turbo | ✅ npx turbo works |
| **Portal Validation** | ❌ No package-lock.json | ✅ Installs from root |

**All CI checks now passing** ✅

---

*Generated: 2026-01-06*
*Branch: claude/organize-docs-Z9eoM*
*Commits: 226363d, 20e0cee, ce55dca*
