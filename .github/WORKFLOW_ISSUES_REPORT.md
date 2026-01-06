# GitHub Workflows - Issues Report

**Date:** 2026-01-05
**Total Workflows:** 20
**YAML Syntax Status:** ✅ All Valid (after fixes)
**Runtime Issues:** ⚠️ 6 workflows have missing dependencies

---

## ✅ Fixed Issues (Committed)

### 1. **anti-nuke.yml** - YAML Syntax Error (FIXED)

**Issue:** Heredoc Python code had zero indentation, breaking YAML context
**Location:** Lines 48-56
**Error:** `could not find expected ':' at line 51`

**Root Cause:**
```yaml
run: |
  RATIO=$(python3 - <<'PY'
import sys              # ❌ No indentation - YAML thinks this is a root-level key
deletes = int(...)      # ❌ No indentation
PY
 "$DELETES" "$TOTAL")  # ❌ Wrong position for arguments
```

**Fix Applied:**
```yaml
run: |
  RATIO=$(python3 - "$DELETES" "$TOTAL" <<'PY'
  import sys            # ✅ Properly indented
  deletes = int(...)    # ✅ Properly indented
  PY
  )                     # ✅ Arguments before heredoc
```

**Status:** ✅ Committed in `58286e9`

---

### 2. **gi-gate.yml** - YAML Syntax Error (FIXED)

**Issue:** Heredoc Python code had zero indentation
**Location:** Lines 34-47
**Error:** `could not find expected ':' at line 36`

**Root Cause:**
```yaml
run: |
  python3 - <<'PY'
import os               # ❌ No indentation
import sys              # ❌ No indentation
```

**Fix Applied:**
```yaml
run: |
  python3 - <<'PY'
  import os             # ✅ Properly indented
  import sys            # ✅ Properly indented
  ```

**Status:** ✅ Committed in `58286e9`

---

## ⚠️ Missing Script Dependencies (Needs Attention)

These workflows will **fail at runtime** because they reference scripts that don't exist:

### 3. **drift-compliance.yml** - Missing drift_check.py

**Issue:** References non-existent script
**Location:** Line 30
**Command:** `python tools/drift_check.py docs/06-OPERATIONS/drift-control/drift_test_vectors.json`

**Impact:** ❌ Workflow will fail when triggered
**Priority:** HIGH - This workflow runs on every PR

**Options:**
1. Create `tools/drift_check.py` with drift validation logic
2. Disable the workflow until the tool is implemented
3. Update the path if the script exists elsewhere

---

### 4. **guardian.yml** - Missing kaizen_guardian.py

**Issue:** References non-existent script
**Location:** Line 48
**Command:** `python scripts/ceremonial_summons/kaizen_guardian.py`

**Impact:** ❌ Workflow will fail when triggered
**Priority:** MEDIUM - Conditional workflow (on specific events)

**Recommendation:** Create the script or disable the workflow

---

### 5. **mobius-divergence-dashboard.yml** - Missing dashboard generator

**Issue:** References non-existent script
**Location:** Line 36
**Command:** `python .github/scripts/generate_divergence_dashboard.py`

**Impact:** ❌ Workflow will fail on schedule
**Priority:** MEDIUM - Runs on schedule (weekly)

**Recommendation:** Create the dashboard generator script

---

### 6. **mobius-pr-assistant.yml** - Missing PR bot

**Issue:** References non-existent script
**Location:** Line 70
**Command:** `python .github/scripts/mobius_pr_bot.py`

**Impact:** ❌ Workflow will fail on PR events
**Priority:** HIGH - Runs on every PR

**Recommendation:** Create the PR assistant script or disable

---

### 7. **mobius-pulse-unified.yml** - Missing weekly digest

**Issue:** References non-existent script
**Location:** Line 263
**Command:** `python .github/scripts/weekly_digest.py --days 7`

**Impact:** ⚠️ Workflow continues (has `continue-on-error: true`)
**Priority:** LOW - Gracefully handles failure

**Recommendation:** Create weekly digest script (non-blocking)

---

### 8. **mobius-sync-unified.yml** - Missing manifest validator

**Issue:** References non-existent script
**Location:** Line 70
**Command:** `python scripts/validate_manifest.py`

**Impact:** ❌ Workflow will fail when triggered
**Priority:** MEDIUM - Runs on push/PR

**Recommendation:** Create manifest validator or update path

---

## 📊 Summary

| Status | Count | Workflows |
|--------|-------|-----------|
| ✅ **Valid YAML** | 20 | All workflows |
| ✅ **Fixed** | 2 | anti-nuke.yml, gi-gate.yml |
| ⚠️ **Missing Scripts** | 6 | drift-compliance, guardian, divergence-dashboard, pr-assistant, pulse-unified, sync-unified |
| 🟢 **No Issues** | 12 | catalog-check, ci, codeql, epicon03-consensus, merge-gate, etc. |

---

## 🔧 Recommended Actions

### Immediate (High Priority)

1. **drift-compliance.yml**
   - Create `tools/drift_check.py` OR
   - Disable workflow until implemented

2. **mobius-pr-assistant.yml**
   - Create `.github/scripts/mobius_pr_bot.py` OR
   - Disable workflow until implemented

### Short Term (Medium Priority)

3. **guardian.yml** - Create ceremonial summons script
4. **mobius-divergence-dashboard.yml** - Create dashboard generator
5. **mobius-sync-unified.yml** - Create manifest validator

### Long Term (Low Priority)

6. **mobius-pulse-unified.yml** - Create weekly digest (already has error handling)

---

## 🎯 Quick Fix Options

### Option 1: Disable Problematic Workflows

Add to each affected workflow:
```yaml
on:
  workflow_dispatch:  # Only manual trigger
  # Comment out automatic triggers until scripts are ready
```

### Option 2: Add Graceful Failure Handling

Add to each script step:
```yaml
- name: Run script
  continue-on-error: true  # Don't fail the workflow
  run: |
    if [ -f "path/to/script.py" ]; then
      python path/to/script.py
    else
      echo "::warning::Script not found, skipping..."
    fi
```

### Option 3: Create Stub Scripts

Create minimal placeholder scripts that pass:
```python
#!/usr/bin/env python3
# TODO: Implement actual logic
print("Script not yet implemented")
exit(0)
```

---

## ✅ YAML Validation Results

All 20 workflows now pass YAML syntax validation:

```
✅ anti-nuke.yml
✅ catalog-check.yml
✅ ci.yml
✅ codeql.yml
✅ drift-compliance.yml
✅ epicon03-consensus.yml
✅ gi-gate.yml
✅ guardian.yml
✅ mkdocs-pages.yml
✅ mobius-auto-consensus-label.yml
✅ mobius-divergence-dashboard.yml
✅ mobius-merge-gate.yml
✅ mobius-operator-merge.yml
✅ mobius-pr-assistant.yml
✅ mobius-pulse-unified.yml
✅ mobius-sync-unified.yml
✅ publish-sr.yml
✅ security-audit.yml
✅ sentinel-heartbeat.yml
✅ sigstore-attest.yml
```

---

## 📝 Notes

- **YAML syntax errors** (anti-nuke.yml, gi-gate.yml) have been **FIXED** and committed
- **Missing scripts** are runtime issues that need new files created
- All workflows with missing scripts will show **file not found** errors when triggered
- No security issues or malicious code detected
- All third-party actions are from official/trusted sources

---

**Generated:** 2026-01-05
**Commit:** `58286e9` (YAML fixes)
**Branch:** `claude/organize-docs-Z9eoM`
