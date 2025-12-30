# EPICON - Epistemic Constraint Documents

This directory contains **EPICON** (Epistemic Constraint) documents - reasoning artifacts that capture the *why* behind decisions, designs, and system changes in Mobius-Substrate.

## What is an EPICON?

An EPICON is a structured document that records:

- **Context** - What system/constraints we're operating in
- **Assumptions** - What we believe to be true
- **Problem Statement** - What exactly we're solving
- **Options Considered** - Alternatives we evaluated
- **Decision/Design** - What we chose and why
- **Risk & Integrity Notes** - Tradeoffs and failure modes
- **Reflection Hooks** - Questions for future evaluation

EPICONs are the "institutional memory" of the Mobius system - they let DVA agents and humans understand not just *what* the code does, but *why* it exists.

## Directory Structure

```
epicon/
├── README.md                    # This file
├── TEMPLATE_EPICON.md           # Copy this for new EPICONs
├── C-151/                       # EPICONs from Cycle 151
│   ├── EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1.md
│   └── ...
├── C-152/                       # EPICONs from Cycle 152
│   └── ...
└── ...
```

## Naming Convention

```
EPICON_C-<CYCLE>_<TIER>_<slug>_v<VERSION>.md
```

| Part | Description | Examples |
|------|-------------|----------|
| `C-<CYCLE>` | Command cycle number | `C-151`, `C-173` |
| `<TIER>` | DVA tier or SUBSTRATE | `DVA-LITE`, `DVA-ONE`, `DVA-FULL`, `DVA-HIVE`, `SUBSTRATE` |
| `<slug>` | Short descriptive name | `routing-guardian`, `mcp-repo-scanner` |
| `v<VERSION>` | Version number | `v1`, `v2` |

**Examples:**
- `EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1.md`
- `EPICON_C-173_DVA-LITE_routing-guardian_v1.md`
- `EPICON_C-180_DVA-HIVE_corporate-node-adoption_v1.md`

## Creating a New EPICON

1. **Copy the template:**
   ```bash
   mkdir -p epicon/C-XXX
   cp epicon/TEMPLATE_EPICON.md epicon/C-XXX/EPICON_C-XXX_TIER_slug_v1.md
   ```

2. **Update the frontmatter:**
   - Set `epicon_id` to match filename
   - Fill in `title`, `cycle`, `tier`, etc.
   - Add relevant `tags`
   - Set `created_at` and `updated_at`

3. **Write the body:**
   - Follow the template structure
   - Be specific about context and assumptions
   - Document all options considered
   - Include concrete implementation links

4. **Export the catalog:**
   ```bash
   npm run export:catalog
   ```

5. **Commit:**
   ```bash
   git add epicon/ catalog/mobius_catalog.json
   git commit -m "epicon: add EPICON for <description>"
   ```

## Frontmatter Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `epicon_id` | string | ✅ | Unique identifier matching filename |
| `title` | string | ✅ | Human-readable title |
| `author_name` | string | ✅ | Author's name |
| `author_wallet` | string | ❌ | MIC wallet ID |
| `cycle` | string | ✅ | Command cycle (e.g., "C-151") |
| `epoch` | string | ❌ | Epoch reference |
| `tier` | string | ✅ | DVA tier or SUBSTRATE |
| `scope.domain` | string | ✅ | Domain (e.g., "traffic", "governance") |
| `scope.system` | string | ✅ | System (e.g., "city-grid", "mcp") |
| `scope.environment` | string | ✅ | Environment (testnet/mainnet/sim) |
| `epicon_type` | string | ✅ | Type: design/decision/reflection/incident/spec |
| `status` | string | ✅ | Status: draft/active/deprecated/superseded |
| `related_prs` | array | ❌ | Related GitHub PR URLs |
| `related_commits` | array | ❌ | Related commit hashes |
| `related_epicons` | array | ❌ | Related EPICON IDs |
| `tags` | array | ✅ | Searchable keywords |
| `integrity_index_baseline` | number | ❌ | MII score when authored |
| `risk_level` | string | ✅ | Risk: low/medium/high/critical |
| `created_at` | string | ✅ | ISO 8601 timestamp |
| `updated_at` | string | ✅ | ISO 8601 timestamp |
| `version` | number | ✅ | Version number |
| `summary` | string | ✅ | One-line summary |

## EPICON Types

| Type | When to Use |
|------|-------------|
| `design` | New system/feature design |
| `decision` | Architectural or policy decision |
| `reflection` | Post-implementation reflection |
| `incident` | Incident postmortem |
| `spec` | Technical specification |

## For DVA Agents

EPICONs are indexed in `catalog/mobius_catalog.json`. Agents can:

1. **List all EPICONs:**
   ```
   list_epicons(subpath="epicon")
   ```

2. **Search by keyword:**
   ```
   search_files(subpath="epicon", query="DVA.HIVE")
   ```

3. **Read specific EPICON:**
   ```
   read_file(filePath="epicon/C-151/EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1.md")
   ```

4. **Get full catalog:**
   ```
   read_file(filePath="catalog/mobius_catalog.json")
   ```

## Relationship to Code

```
commits → show WHAT changed
EPICONs → show WHY it changed
reflections → show WHAT resulted
```

EPICONs bridge the gap between code and intent, enabling:
- Institutional memory
- Audit trails
- Drift detection
- Knowledge transfer

## Contributing

1. Every significant decision should have an EPICON
2. Use the template - don't skip sections
3. Be honest about risks and tradeoffs
4. Link to related PRs/commits
5. Update the catalog after adding/modifying EPICONs

---

*"We heal as we walk." — Mobius Systems*
