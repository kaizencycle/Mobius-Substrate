# EPICON: Intent & Decision Records

This directory contains EPICON files – the **intent layer** of the Mobius Substrate.

Each EPICON is a Markdown file with YAML frontmatter that describes:

- What decision/design/reflection is being made
- Under which cycle / tier / scope
- What assumptions and tradeoffs were considered
- What risks and integrity notes apply

## Creating a New EPICON

1. **Start from the template:**

   ```bash
   mkdir -p epicon/C-XXX
   cp epicon/TEMPLATE_EPICON.md epicon/C-XXX/EPICON_C-XXX_DVA-LITE_your-topic_v1.md
   ```

2. **Update the frontmatter fields:**
   - `epicon_id` — unique identifier (keep the pattern: `EPICON_C-XXX_TIER_slug_v1`)
   - `title` — clear, descriptive title
   - `cycle`, `epoch`, `tier` — where this EPICON lives
   - `epicon_type` — `design` | `decision` | `reflection` | `incident` | `spec`
   - `status` — `draft` | `active` | `deprecated` | `superseded`
   - `tags` — help search and routing
   - `summary` — 1–2 sentence explanation for fast agent routing

3. **Fill in the sections:**
   - Context
   - Assumptions
   - Options considered
   - Decision / design
   - Risk & integrity notes
   - Implementation links
   - Reflection hook

## Naming Convention

```
EPICON_C-<CYCLE>_<TIER>_<slug>_v<VERSION>.md
```

**Examples:**
- `EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1.md`
- `EPICON_C-173_DVA-LITE_routing-guardian_v1.md`
- `EPICON_C-180_DVA-HIVE_corporate-node-adoption_v1.md`

## Catalog Integration

Whenever EPICONs change, regenerate the catalog:

```bash
npm run export:catalog
```

This updates `catalog/mobius_catalog.json`, which DVA / MCP-style agents use to discover EPICONs and route queries.

## For DVA Agents

Use `tools/mobiusCatalogTool.ts` to query EPICONs:

```typescript
import { listEpicons, getEpiconById, searchCatalog } from "./tools/mobiusCatalogTool";

// List all active EPICONs
const epicons = await listEpicons({ status: "active" });

// Get by tier
const dvaLiteEpicons = await listEpicons({ tier: "DVA.LITE" });

// Get specific EPICON
const epicon = await getEpiconById("EPICON_C-151_SUBSTRATE_mcp-repo-scanner_v1");

// Search
const results = await searchCatalog("routing");
```

---

*"We heal as we walk." — Mobius Systems*
