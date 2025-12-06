# MCP Quick Start Guide

**30-Second Setup for Multi-Sentinel Repository Analysis**

---

## Prerequisites

- Python 3.7+
- Git repository

---

## Quick Start

### 1. Export Repository State

```bash
cd ~/your-mobius-repo
python sentinels/echo/echo_sync.py export > state.json
```

### 2. Validate Integrity

```bash
python sentinels/echo/echo_sync.py validate state.json
# ✅ Integrity verified
```

### 3. Generate Reports

**ATLAS (Structure Analysis):**
```bash
python sentinels/atlas/atlas_parser.py state.json
```

**AUREA (Integrity Audit):**
```bash
python sentinels/aurea/aurea_analyzer.py state.json
```

### 4. Use with Claude.ai

```bash
# Copy to clipboard (macOS)
cat state.json | pbcopy

# Copy to clipboard (Linux)
cat state.json | xclip -selection clipboard
```

Paste into Claude.ai and say:
```
ATLAS, analyze this ECHO export and tell me what's missing.
```

Or for multi-sentinel:
```
All sentinels: Generate consensus report on C-156 closure readiness.
```

---

## What You Get

| Sentinel | Analysis | Output |
|----------|----------|--------|
| ECHO | Export | JSON state snapshot |
| ATLAS | Structure | GI score, gaps, recommendations |
| AUREA | Integrity | Violations, warnings, covenant check |

---

## Common Commands

```bash
# Basic export
python sentinels/echo/echo_sync.py export > state.json

# Deep scan (more directories)
python sentinels/echo/echo_sync.py export --depth 6 > deep.json

# Validate integrity
python sentinels/echo/echo_sync.py validate state.json

# ATLAS markdown report
python sentinels/atlas/atlas_parser.py state.json

# ATLAS JSON report
python sentinels/atlas/atlas_parser.py --format json state.json

# AUREA markdown audit
python sentinels/aurea/aurea_analyzer.py state.json

# AUREA consensus vote
python sentinels/aurea/aurea_analyzer.py --consensus state.json

# Compare two states
python sentinels/atlas/atlas_parser.py --compare old.json new.json
```

---

## Example Workflow

### Pre-Commit Check

```bash
python sentinels/echo/echo_sync.py export > pre_commit.json
python sentinels/aurea/aurea_analyzer.py --consensus pre_commit.json
```

### Cycle Closure

```bash
python sentinels/echo/echo_sync.py export > c156_final.json
python sentinels/atlas/atlas_parser.py c156_final.json
python sentinels/aurea/aurea_analyzer.py c156_final.json
```

### Fork Comparison

```bash
# In canonical repo
python sentinels/echo/echo_sync.py export > canonical.json

# In fork
python sentinels/echo/echo_sync.py export > fork.json

# Compare
python sentinels/atlas/atlas_parser.py --compare canonical.json fork.json
```

---

## What Sentinels Check

### ATLAS
- ✅ Directory structure
- ✅ Key files present
- ✅ Package health
- ✅ Git status

### AUREA
- ✅ Cryptographic integrity
- ✅ Constitutional documents
- ✅ Immutable files
- ✅ Anti-capture safeguards
- ✅ Transparency compliance

---

## Thresholds

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| GI Score | ≥ 0.95 | Structure complete |
| Integrity Score | ≥ 95% | No violations |
| Violations | 0 | No critical issues |

---

## Privacy

- ✅ Zero network access
- ✅ Only metadata exported
- ✅ No source code (unless in previews)
- ✅ Works with private repos

---

🌀 **Integrity moves. Civilization follows.**

*Part of MCP (Mobius Core Protocol) - C-156*
