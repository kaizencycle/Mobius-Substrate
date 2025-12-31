/**
 * tools/mobiusCatalogTool.ts
 *
 * Mobius Catalog Tool
 * Lightweight helper for DVA agents / MCP-style tools.
 *
 * Loads catalog/mobius_catalog.json and exposes:
 * - loadCatalog()
 * - listEpicons(filter?)
 * - getEpiconById(id)
 * - listDocs()
 * - searchCatalog(query)
 *
 * @author Michael Judan
 * @license MIT
 */

import fs from "fs/promises";
import path from "path";

// ============================================================================
// TYPES
// ============================================================================

export type EpiconEntry = {
  epicon_id: string;
  path: string;
  title: string;
  cycle: string | null;
  epoch: string | null;
  tier: string | null;
  epicon_type: string | null;
  status: string;
  author_name: string | null;
  author_wallet: string | null;
  tags: string[];
  related_prs: string[];
  related_commits: string[];
  related_epicons: string[];
  integrity_index_baseline: number | null;
  risk_level: string | null;
  created_at: string | null;
  updated_at: string | null;
  content_hash: string;
  summary: string;
};

export type DocEntry = {
  path: string;
  title: string;
  category: string;
  tags: string[];
  content_hash: string;
  summary: string;
};

export type Catalog = {
  mobius_catalog_version: string;
  generated_at: string;
  repo: {
    name: string;
    url: string;
    default_branch: string;
    commit: string;
  };
  stats: {
    epiconCount: number;
    docCount: number;
  };
  epicons: EpiconEntry[];
  docs: DocEntry[];
};

export type EpiconFilter = {
  tier?: string;
  cycle?: string;
  status?: string;
  tag?: string;
  epicon_type?: string;
  author_name?: string;
  risk_level?: string;
};

export type SearchResult = {
  type: "epicon" | "doc";
  path: string;
  title: string;
  matchedField: string;
  score: number;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const repoRoot = process.cwd();
const CATALOG_PATH = path.join(repoRoot, "catalog", "mobius_catalog.json");

// Simple in-memory cache
let cachedCatalog: Catalog | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Load the Mobius catalog (with simple in-memory cache).
 * Cache expires after 1 minute to pick up changes during development.
 */
export async function loadCatalog(forceRefresh = false): Promise<Catalog> {
  const now = Date.now();

  if (!forceRefresh && cachedCatalog && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const catalog = JSON.parse(raw) as Catalog;
    cachedCatalog = catalog;
    cacheTimestamp = now;
    return catalog;
  } catch (error) {
    throw new Error(
      `Failed to load catalog from ${CATALOG_PATH}. ` +
        `Run 'npm run export:catalog' to generate it. Error: ${error}`
    );
  }
}

/**
 * Clear the catalog cache (useful for testing).
 */
export function clearCatalogCache(): void {
  cachedCatalog = null;
  cacheTimestamp = 0;
}

/**
 * Get catalog metadata without loading full entries.
 */
export async function getCatalogMeta(): Promise<{
  version: string;
  generatedAt: string;
  epiconCount: number;
  docCount: number;
  repoUrl: string;
}> {
  const catalog = await loadCatalog();
  return {
    version: catalog.mobius_catalog_version,
    generatedAt: catalog.generated_at,
    epiconCount: catalog.stats.epiconCount,
    docCount: catalog.stats.docCount,
    repoUrl: catalog.repo.url,
  };
}

// ============================================================================
// EPICON FUNCTIONS
// ============================================================================

/**
 * List EPICON entries with optional filter.
 */
export async function listEpicons(filter?: EpiconFilter): Promise<EpiconEntry[]> {
  const catalog = await loadCatalog();
  let epicons = catalog.epicons;

  if (!filter) return epicons;

  if (filter.tier) {
    const tierLower = filter.tier.toLowerCase();
    epicons = epicons.filter((e) => (e.tier || "").toLowerCase() === tierLower);
  }

  if (filter.cycle) {
    const cycleLower = filter.cycle.toLowerCase();
    epicons = epicons.filter((e) => (e.cycle || "").toLowerCase() === cycleLower);
  }

  if (filter.status) {
    const statusLower = filter.status.toLowerCase();
    epicons = epicons.filter((e) => (e.status || "").toLowerCase() === statusLower);
  }

  if (filter.epicon_type) {
    const typeLower = filter.epicon_type.toLowerCase();
    epicons = epicons.filter((e) => (e.epicon_type || "").toLowerCase() === typeLower);
  }

  if (filter.author_name) {
    const authorLower = filter.author_name.toLowerCase();
    epicons = epicons.filter((e) =>
      (e.author_name || "").toLowerCase().includes(authorLower)
    );
  }

  if (filter.risk_level) {
    const riskLower = filter.risk_level.toLowerCase();
    epicons = epicons.filter((e) => (e.risk_level || "").toLowerCase() === riskLower);
  }

  if (filter.tag) {
    const tagLower = filter.tag.toLowerCase();
    epicons = epicons.filter((e) =>
      (e.tags || []).some((tag) => (tag || "").toLowerCase() === tagLower)
    );
  }

  return epicons;
}

/**
 * Get a single EPICON by epicon_id.
 */
export async function getEpiconById(epiconId: string): Promise<EpiconEntry | null> {
  const catalog = await loadCatalog();
  const found = catalog.epicons.find((e) => e.epicon_id === epiconId);
  return found || null;
}

/**
 * Get EPICONs by tier (convenience wrapper).
 */
export async function getEpiconsByTier(tier: string): Promise<EpiconEntry[]> {
  return listEpicons({ tier });
}

/**
 * Get EPICONs by cycle (convenience wrapper).
 */
export async function getEpiconsByCycle(cycle: string): Promise<EpiconEntry[]> {
  return listEpicons({ cycle });
}

/**
 * Get related EPICONs for a given EPICON.
 */
export async function getRelatedEpicons(epiconId: string): Promise<EpiconEntry[]> {
  const epicon = await getEpiconById(epiconId);
  if (!epicon || !epicon.related_epicons.length) return [];

  const catalog = await loadCatalog();
  return catalog.epicons.filter((e) => epicon.related_epicons.includes(e.epicon_id));
}

// ============================================================================
// DOC FUNCTIONS
// ============================================================================

/**
 * List all docs from the catalog.
 */
export async function listDocs(): Promise<DocEntry[]> {
  const catalog = await loadCatalog();
  return catalog.docs;
}

/**
 * List docs by category.
 */
export async function listDocsByCategory(category: string): Promise<DocEntry[]> {
  const catalog = await loadCatalog();
  const categoryLower = category.toLowerCase();
  return catalog.docs.filter((d) => d.category.toLowerCase() === categoryLower);
}

/**
 * Get a doc by path.
 */
export async function getDocByPath(docPath: string): Promise<DocEntry | null> {
  const catalog = await loadCatalog();
  const found = catalog.docs.find((d) => d.path === docPath);
  return found || null;
}

/**
 * Get unique doc categories.
 */
export async function getDocCategories(): Promise<string[]> {
  const catalog = await loadCatalog();
  const categories = new Set(catalog.docs.map((d) => d.category));
  return Array.from(categories).sort();
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Search the catalog for EPICONs and docs matching a query.
 * Simple substring matching on title, summary, and tags.
 */
export async function searchCatalog(query: string): Promise<SearchResult[]> {
  const catalog = await loadCatalog();
  const queryLower = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search EPICONs
  for (const epicon of catalog.epicons) {
    let score = 0;
    let matchedField = "";

    if (epicon.title.toLowerCase().includes(queryLower)) {
      score += 10;
      matchedField = "title";
    }
    if (epicon.summary.toLowerCase().includes(queryLower)) {
      score += 5;
      matchedField = matchedField || "summary";
    }
    if (epicon.tags.some((t) => t.toLowerCase().includes(queryLower))) {
      score += 3;
      matchedField = matchedField || "tags";
    }
    if (epicon.epicon_id.toLowerCase().includes(queryLower)) {
      score += 2;
      matchedField = matchedField || "epicon_id";
    }

    if (score > 0) {
      results.push({
        type: "epicon",
        path: epicon.path,
        title: epicon.title,
        matchedField,
        score,
      });
    }
  }

  // Search docs
  for (const doc of catalog.docs) {
    let score = 0;
    let matchedField = "";

    if (doc.title.toLowerCase().includes(queryLower)) {
      score += 10;
      matchedField = "title";
    }
    if (doc.summary.toLowerCase().includes(queryLower)) {
      score += 5;
      matchedField = matchedField || "summary";
    }
    if (doc.category.toLowerCase().includes(queryLower)) {
      score += 2;
      matchedField = matchedField || "category";
    }

    if (score > 0) {
      results.push({
        type: "doc",
        path: doc.path,
        title: doc.title,
        matchedField,
        score,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

// ============================================================================
// STATS FUNCTIONS
// ============================================================================

/**
 * Get statistics about EPICONs by tier.
 */
export async function getEpiconStatsByTier(): Promise<Record<string, number>> {
  const catalog = await loadCatalog();
  const stats: Record<string, number> = {};

  for (const epicon of catalog.epicons) {
    const tier = epicon.tier || "unknown";
    stats[tier] = (stats[tier] || 0) + 1;
  }

  return stats;
}

/**
 * Get statistics about EPICONs by status.
 */
export async function getEpiconStatsByStatus(): Promise<Record<string, number>> {
  const catalog = await loadCatalog();
  const stats: Record<string, number> = {};

  for (const epicon of catalog.epicons) {
    const status = epicon.status || "unknown";
    stats[status] = (stats[status] || 0) + 1;
  }

  return stats;
}

/**
 * Get all unique tags used across EPICONs.
 */
export async function getAllEpiconTags(): Promise<string[]> {
  const catalog = await loadCatalog();
  const tags = new Set<string>();

  for (const epicon of catalog.epicons) {
    for (const tag of epicon.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

// ============================================================================
// MCP COMMAND WIRING (for reference)
// ============================================================================

/**
 * Example MCP command wiring.
 * Use this pattern to wire the catalog tool into your MCP host.
 */
export const mcpCommands = {
  "mobius.catalog.meta": async () => getCatalogMeta(),

  "mobius.epicons.list": async (args: EpiconFilter) => listEpicons(args),

  "mobius.epicons.get": async (args: { epicon_id: string }) =>
    getEpiconById(args.epicon_id),

  "mobius.epicons.by_tier": async (args: { tier: string }) =>
    getEpiconsByTier(args.tier),

  "mobius.epicons.by_cycle": async (args: { cycle: string }) =>
    getEpiconsByCycle(args.cycle),

  "mobius.epicons.related": async (args: { epicon_id: string }) =>
    getRelatedEpicons(args.epicon_id),

  "mobius.epicons.stats.tier": async () => getEpiconStatsByTier(),

  "mobius.epicons.stats.status": async () => getEpiconStatsByStatus(),

  "mobius.epicons.tags": async () => getAllEpiconTags(),

  "mobius.docs.list": async () => listDocs(),

  "mobius.docs.by_category": async (args: { category: string }) =>
    listDocsByCategory(args.category),

  "mobius.docs.categories": async () => getDocCategories(),

  "mobius.search": async (args: { query: string }) => searchCatalog(args.query),
};
