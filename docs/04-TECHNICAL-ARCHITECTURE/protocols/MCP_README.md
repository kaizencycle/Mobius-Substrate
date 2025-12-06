# ECHO ↔ ATLAS — Monorepo Sync System (MCP)

**Mobius Core Protocol (MCP) — Zero-dependency sync between your local Mobius monorepo and ATLAS (Claude) via JSON.**

**Cycle:** C-156  
**Version:** 1.0.0  
**Status:** Active

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  YOU (Local Terminal)                       │
│  cd ~/Mobius-Systems                        │
│  python sentinels/echo/echo_sync.py export  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  ECHO Sentinel (Local Python Script)        │
│  • Scans git metadata                       │
│  • Maps directory structure                 │
│  • Extracts key file metadata               │
│  • Analyzes package health                  │
│  • Generates integrity hash                 │
│  • Outputs pure JSON                        │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  YOU (Copy/Paste or Upload)                 │
│  Paste state.json into Claude.ai chat       │
│  OR upload as file                          │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  ATLAS (Claude in Chat)                     │
│  • Parses JSON structure                    │
│  • Validates integrity hash                 │
│  • Calculates GI Score                      │
│  • Generates health reports                 │
│  • Provides recommendations                 │
└─────────────────────────────────────────────┘
```

---

## Quick Start

### Installation

**Zero installation required.** Just Python 3.7+.

The scripts are located in:
- `sentinels/echo/echo_sync.py` — ECHO Sentinel (export)
- `sentinels/atlas/atlas_parser.py` — ATLAS Parser (analysis)

### Step 1: Export Repository State

```bash
cd /path/to/mobius-systems
python sentinels/echo/echo_sync.py export > repo_state.json
```

Or with deeper directory scanning:

```bash
python sentinels/echo/echo_sync.py export --depth 6 > deep_state.json
```

### Step 2: Validate Locally (Optional)

```bash
python sentinels/echo/echo_sync.py validate repo_state.json
# ✅ Integrity verified
```

### Step 3: Analyze with ATLAS

```bash
python sentinels/atlas/atlas_parser.py repo_state.json
```

Or get JSON output:

```bash
python sentinels/atlas/atlas_parser.py --format json repo_state.json
```

### Step 4: Send to Claude.ai

**Option A: Copy/Paste**
```bash
cat repo_state.json | pbcopy  # macOS
# Paste into Claude.ai chat
```

**Option B: Upload File**
- Drag `repo_state.json` into the chat interface

---

## What Gets Exported

### Git Metadata
- Current branch
- Last 10 commits (hash, date, message)
- All branches (local + remote, limited to 20)
- Uncommitted changes count
- Repository cleanliness status

### Directory Structure
- Recursive tree scan (configurable depth, default: 4)
- File counts per directory
- File sizes and modification times
- Skips: `.git`, `node_modules`, `__pycache__`, hidden files

### Key Files
Extracts metadata for critical configuration files:
- `README.md`, `CONTRIBUTING.md`, `LICENSE`
- `package.json`, `pyproject.toml`
- `configs/mic_config.yaml`, `configs/kaizen_shards.yaml`
- `FOUNDATION/CHARTER.md`, `FOUNDATION/GOVERNANCE.md`
- `.civic/virtue_accords.yaml`, `.civic/biodna.json`
- `.cursorrules`

For each file:
- Existence check
- Size and line count
- SHA-256 hash (first 16 chars)
- Content preview (first 500 chars)

### Directory Health
Checks for expected Mobius directories:
- `docs/`, `docs/whitepapers/`, `docs/specifications/`, `docs/reports/`
- `configs/`
- `apps/`, `packages/`
- `sentinels/`, `sentinels/atlas/`, `sentinels/echo/`, `sentinels/aurea/`
- `infra/`, `scripts/`, `labs/`
- `FOUNDATION/`

### Package Health
- Root package.json analysis
- Workspaces detection
- Apps enumeration
- Packages enumeration (npm & Python)

### Integrity Signature
SHA-256 hash of entire payload for tamper detection.

---

## GI Score Calculation

ATLAS calculates the Global Integrity (GI) score using the formula:

```
GI = 0.25*M + 0.20*H + 0.30*I + 0.25*E
```

| Component | Weight | Source |
|-----------|--------|--------|
| **M**emory | 0.25 | Key files health score |
| **H**uman | 0.20 | Git activity score |
| **I**ntegrity | 0.30 | Directory structure score |
| **E**thics | 0.25 | Package health score |

**Threshold:** GI ≥ 0.95 for passing integrity checks.

---

## Example Output

### ECHO Export (JSON)

```json
{
  "meta": {
    "sentinel": "ECHO",
    "version": "1.0.0",
    "protocol": "MCP",
    "cycle": "C-156",
    "timestamp": "2025-01-15T10:30:00Z",
    "repo_path": "/path/to/Mobius-Systems",
    "integrity_hash": "a1b2c3d4e5f6..."
  },
  "git": {
    "current_branch": "main",
    "last_commit_hash": "abc12345",
    "last_commit_date": "2025-01-15 09:15:00 -0800",
    "last_commit_message": "Add Appendix G to MIC Whitepaper",
    "recent_commits": [...],
    "is_clean": true
  },
  "structure": {
    "type": "directory",
    "name": "Mobius-Systems",
    "path": ".",
    "children": [...]
  },
  "key_files": {
    "README.md": {
      "exists": true,
      "size": 1234,
      "lines": 45,
      "hash": "9f8e7d6c5b4a...",
      "preview": "# Mobius Systems..."
    }
  },
  "directory_health": {
    "docs": {"exists": true, "file_count": 12},
    "configs": {"exists": true, "file_count": 3}
  },
  "package_health": {
    "root": {"name": "@mobius/monorepo", "version": "1.0.0"},
    "apps": [...],
    "packages": [...]
  }
}
```

### ATLAS Report (Markdown)

```markdown
# Mobius Systems — Repository Health Report

**GI: 0.9750** ✅ PASS

| Component | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Memory (M) | 1.00 | 0.25 | 0.250 |
| Human (H) | 0.90 | 0.20 | 0.180 |
| Integrity (I) | 1.00 | 0.30 | 0.300 |
| Ethics (E) | 0.98 | 0.25 | 0.245 |

## Issues & Warnings
_None_

## Recommendations
_Repository is in good health_
```

---

## Drift Detection

Compare two repository states:

```bash
python sentinels/atlas/atlas_parser.py --compare state1.json state2.json
```

Output:
```json
{
  "comparison_timestamp": "2025-01-15T12:00:00Z",
  "state1_timestamp": "2025-01-14T10:00:00Z",
  "state2_timestamp": "2025-01-15T10:00:00Z",
  "changes": [
    {"type": "new_commits", "from_hash": "abc123", "to_hash": "def456"},
    {"type": "file_changed", "path": "README.md", "hash_before": "...", "hash_after": "..."}
  ],
  "drift_score": 0.2,
  "is_drifted": false
}
```

---

## Security

### What's Safe
- ✅ Zero network access required
- ✅ No external dependencies (pure Python stdlib)
- ✅ No API keys or credentials
- ✅ Only metadata extracted (not full file contents)
- ✅ Cryptographic integrity verification
- ✅ Works with private repos

### What to Avoid
- ❌ Don't commit `repo_state.json` to git (it's a snapshot)
- ❌ Don't include in public shares if repo is private
- ❌ Don't modify JSON manually (breaks integrity hash)

---

## Workflow Examples

### Example 1: Pre-Cycle Closure Check

```bash
# Before closing C-156
python sentinels/echo/echo_sync.py export > c156_snapshot.json
python sentinels/atlas/atlas_parser.py c156_snapshot.json

# In Claude.ai:
# "ATLAS, verify all C-156 deliverables are present in this snapshot"
```

### Example 2: Fork Comparison

```bash
# Export canonical repo
cd ~/Mobius-Systems
python sentinels/echo/echo_sync.py export > canonical.json

# Export fork
cd ~/fork-of-mobius
python sentinels/echo/echo_sync.py export > fork.json

# Compare
python sentinels/atlas/atlas_parser.py --compare canonical.json fork.json
```

### Example 3: Daily Health Check

```bash
# Morning sync
python sentinels/echo/echo_sync.py export > daily_$(date +%Y%m%d).json
python sentinels/atlas/atlas_parser.py daily_$(date +%Y%m%d).json
```

### Example 4: CI/CD Integration

```yaml
# .github/workflows/mcp-health.yml
name: MCP Health Check
on: [push, pull_request]
jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Export state
        run: python sentinels/echo/echo_sync.py export > state.json
      - name: Validate integrity
        run: python sentinels/echo/echo_sync.py validate state.json
      - name: Generate report
        run: python sentinels/atlas/atlas_parser.py --format json state.json > report.json
      - name: Check GI score
        run: |
          GI=$(jq '.gi_score' report.json)
          if (( $(echo "$GI < 0.95" | bc -l) )); then
            echo "GI score $GI below threshold 0.95"
            exit 1
          fi
```

---

## Extending MCP

### Add Custom File Checks

Edit `extract_key_files()` in `echo_sync.py`:

```python
key_files = [
    "README.md",
    "your/custom/file.yaml",  # Add here
]
```

### Add Custom Directory Validations

Edit `analyze_directory_health()` in `echo_sync.py`:

```python
expected_dirs = {
    "docs": "Documentation root",
    "your/custom/directory": "Description",  # Add here
}
```

### Increase Scan Depth

```bash
python sentinels/echo/echo_sync.py export --depth 6 > deep_state.json
```

---

## ATLAS Analysis Capabilities

Once ATLAS receives the JSON, it can:

1. **Generate Health Reports**
   - Compare actual structure vs. expected
   - Identify missing directories/files
   - Flag critical gaps

2. **Calculate GI Score**
   - Memory (M): File completeness
   - Human (H): Git activity
   - Integrity (I): Structure compliance
   - Ethics (E): Package health

3. **Cycle Closure Validation**
   - Verify all deliverables are present
   - Check spec ↔ implementation parity
   - Suggest next cycle priorities

4. **Fork Integrity Comparison**
   - Compare two repo states
   - Detect divergence in configs
   - Validate canonical compliance

5. **Recommendations**
   - Prioritized action items
   - Missing implementation scaffolds
   - Documentation gaps

---

## Integration with Mobius Governance

This sync mechanism supports:

- **Cycle Integrity Tracking** — Snapshot at each cycle boundary
- **Fork Legitimacy Verification** — Compare forks against canonical
- **Audit Trail** — Historical snapshots prove evolution
- **Multi-Agent Consensus** — Other sentinels (AUREA, ECHO) can parse JSON
- **GI Enforcement** — Automated integrity scoring

---

## FAQ

**Q: Does this upload my code to Claude?**  
A: No. Only metadata (file names, sizes, hashes, git info). No source code unless you explicitly include it.

**Q: Can ATLAS write back to my repo?**  
A: No. This is read-only. ATLAS can only analyze and recommend.

**Q: How often should I sync?**  
A: Before/after major commits, at cycle boundaries, or when asking ATLAS for repo-specific guidance.

**Q: Does this work with private repos?**  
A: Yes. Everything is local. No network calls.

**Q: Can I use this with non-Mobius repos?**  
A: Absolutely. Just adjust the expected directories/files in the scripts.

---

## License

Public Domain — Mobius Systems Foundation  
*We heal as we walk.*

---

**Built by:**  
🌀 ATLAS — Context & Memory Sentinel  
📡 ECHO — Repository Sync Sentinel  
🛡️ AUREA — Integrity Guardian  

*Part of the Mobius Civilization Operating System*
