#!/usr/bin/env node
/**
 * @mobius/mcp-repo-scanner
 *
 * MCP server that exposes the Mobius-Substrate repository as a queryable
 * knowledge substrate for DVA agents. Turns the monorepo into a digital
 * library with structured JSON tools.
 *
 * Tools:
 * - repo_summary: High-level snapshot of the repo
 * - list_tree: Directory tree as JSON
 * - read_file: Safe, bounded file retrieval
 * - search_files: Grep-like search across files
 * - list_epicons: Discover EPICON documents
 * - export_catalog: Generate a manifest for DVA agents
 *
 * @author Michael Judan <kaizencycle>
 * @license MIT
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// Root of the repo to scan. Override via env if needed.
const REPO_ROOT = process.env.MOBIUS_REPO_ROOT || process.cwd();

// Patterns to exclude from scans (security + noise reduction)
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.turbo/,
  /\.cache/,
  /__pycache__/,
  /\.pyc$/,
  /\.env/,
  /\.pem$/,
  /\.key$/,
  /secrets/,
];

// Initialize MCP server
const server = new McpServer({
  name: "mobius-repo-scanner",
  version: "0.1.0",
});

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Safe path resolution scoped to REPO_ROOT.
 * Prevents directory traversal attacks via ".." segments.
 */
function resolveScopedPath(subpath: string): string {
  const raw = subpath.trim() === "" ? "." : subpath;
  const resolved = path.resolve(REPO_ROOT, raw);
  if (!resolved.startsWith(path.resolve(REPO_ROOT))) {
    throw new Error("Path escapes REPO_ROOT - access denied");
  }
  return resolved;
}

/**
 * Check if a path should be excluded from scanning.
 */
function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Generate SHA256 hash of content.
 */
function hashContent(content: string): string {
  return "sha256:" + crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Normalize file extensions for filtering.
 */
function normalizeExtensions(extensions?: string[]): string[] | null {
  if (!extensions || extensions.length === 0) return null;
  return extensions.map((e) => (e.startsWith(".") ? e : `.${e}`));
}

/**
 * Check if a file matches a name pattern (for EPICON detection).
 */
function isEpiconFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.endsWith(".md") && lower.includes("epicon");
}

// ============================================================================
// TYPES
// ============================================================================

interface TreeNode {
  type: "dir" | "file";
  name: string;
  path: string;
  sizeBytes?: number;
  children?: TreeNode[];
}

interface FileMatch {
  filePath: string;
  lineNumber: number;
  line: string;
}

interface EpiconEntry {
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
  integrity_index_baseline: number | null;
  risk_level: string | null;
  created_at: string | null;
  updated_at: string | null;
  content_hash: string;
  summary: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Recursively walk directory and build a lightweight tree structure.
 */
function walkDir(
  baseDir: string,
  maxDepth: number,
  currentDepth = 0,
  includeExtensions?: string[] | null
): TreeNode[] {
  if (currentDepth > maxDepth) return [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(baseDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const results: TreeNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.name);
    const relPath = path.relative(REPO_ROOT, fullPath);

    // Skip excluded paths
    if (shouldExclude(fullPath)) continue;

    if (entry.isDirectory()) {
      results.push({
        type: "dir",
        name: entry.name,
        path: relPath,
        children: walkDir(fullPath, maxDepth, currentDepth + 1, includeExtensions),
      });
    } else if (entry.isFile()) {
      // Filter by extension if specified
      if (
        includeExtensions &&
        includeExtensions.length > 0 &&
        !includeExtensions.some((ext) => entry.name.endsWith(ext))
      ) {
        continue;
      }

      try {
        const stats = fs.statSync(fullPath);
        results.push({
          type: "file",
          name: entry.name,
          path: relPath,
          sizeBytes: stats.size,
        });
      } catch {
        // Skip files we can't stat
      }
    }
  }

  return results;
}

/**
 * Search for a query string within a file.
 */
function searchInFile(
  fullPath: string,
  relPath: string,
  query: string,
  maxMatchesPerFile: number
): FileMatch[] {
  let content: string;
  try {
    content = fs.readFileSync(fullPath, "utf8");
  } catch {
    return [];
  }

  const lines = content.split(/\r?\n/);
  const lowerQuery = query.toLowerCase();
  const matches: FileMatch[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (matches.length >= maxMatchesPerFile) break;
    const line = lines[i];
    if (line.toLowerCase().includes(lowerQuery)) {
      matches.push({
        filePath: relPath,
        lineNumber: i + 1,
        line: line.trim().substring(0, 200), // Truncate long lines
      });
    }
  }

  return matches;
}

/**
 * Parse YAML frontmatter from markdown content.
 * Simple implementation - for production use gray-matter library.
 */
function parseFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, unknown> = {};

  // Simple YAML parsing for common cases
  const lines = yaml.split(/\r?\n/);
  let currentKey = "";
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Array item
    if (trimmed.startsWith("- ") && inArray) {
      arrayValues.push(trimmed.slice(2).replace(/^["']|["']$/g, ""));
      continue;
    }

    // End previous array if we hit a new key
    if (inArray && !trimmed.startsWith("- ")) {
      result[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    // Key: value pair
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0) {
      const key = trimmed.slice(0, colonIndex).trim();
      const value = trimmed.slice(colonIndex + 1).trim();

      if (value === "") {
        // Might be start of array or nested object
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else {
        // Simple value
        let parsedValue: unknown = value.replace(/^["']|["']$/g, "");

        // Try to parse numbers
        if (/^\d+(\.\d+)?$/.test(parsedValue as string)) {
          parsedValue = parseFloat(parsedValue as string);
        }
        // Parse booleans
        if (parsedValue === "true") parsedValue = true;
        if (parsedValue === "false") parsedValue = false;
        if (parsedValue === "null") parsedValue = null;

        result[key] = parsedValue;
      }
    }
  }

  // Handle final array
  if (inArray && arrayValues.length > 0) {
    result[currentKey] = arrayValues;
  }

  return result;
}

// ============================================================================
// MCP TOOLS
// ============================================================================

/**
 * Tool 1: repo_summary
 * High-level snapshot: top-level dirs, file counts, size estimate.
 */
server.tool(
  "repo_summary",
  "Return a high-level JSON summary of the Mobius-Substrate repo (top-level directories, file counts, rough size).",
  {},
  async () => {
    const root = REPO_ROOT;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(root, { withFileTypes: true });
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Cannot read repo root: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    const dirs: string[] = [];
    const files: string[] = [];
    let approxBytes = 0;

    for (const entry of entries) {
      if (shouldExclude(entry.name)) continue;

      if (entry.isDirectory()) {
        dirs.push(entry.name);
      } else if (entry.isFile()) {
        files.push(entry.name);
        try {
          const stats = fs.statSync(path.join(root, entry.name));
          approxBytes += stats.size;
        } catch {
          // Skip files we can't stat
        }
      }
    }

    const payload = {
      repoRoot: root,
      topLevelDirectories: dirs.sort(),
      topLevelFiles: files.sort(),
      approxTopLevelSizeBytes: approxBytes,
      excludedPatterns: EXCLUDE_PATTERNS.map((p) => p.source),
      note: "This is a shallow summary (top-level only). Use list_tree for deeper paths.",
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 2: list_tree
 * Returns a directory tree starting at a subpath.
 */
server.tool(
  "list_tree",
  "List a directory tree of the repo as JSON (dirs + files) for a given subpath.",
  {
    subpath: z
      .string()
      .describe("Subpath within the repo (e.g. '.', 'apps/browser', 'packages/core').")
      .default("."),
    maxDepth: z
      .number()
      .int()
      .min(0)
      .max(10)
      .default(3)
      .describe("Maximum directory depth to traverse (0 = only that directory)."),
    includeExtensions: z
      .array(z.string())
      .optional()
      .describe(
        "Optional list of file extensions to include (e.g. ['.ts', '.md']). If omitted, all file types are included."
      ),
  },
  async (args) => {
    let rootForScan: string;
    try {
      rootForScan = resolveScopedPath(args.subpath);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Invalid path: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    const normalizedExts = normalizeExtensions(args.includeExtensions);
    const tree = walkDir(rootForScan, args.maxDepth, 0, normalizedExts);

    const payload = {
      repoRoot: REPO_ROOT,
      subpath: args.subpath,
      maxDepth: args.maxDepth,
      includeExtensions: args.includeExtensions ?? null,
      tree,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 3: read_file
 * Reads a file (with size limit) and returns text content.
 */
server.tool(
  "read_file",
  "Read a specific file from the Mobius-Substrate repo (with size limits) and return its content as text.",
  {
    filePath: z
      .string()
      .min(1, "filePath is required")
      .describe("Path within the repo, e.g. 'README.md' or 'apps/browser/src/page.tsx'."),
    maxBytes: z
      .number()
      .int()
      .min(1)
      .max(200000)
      .default(80000)
      .describe(
        "Maximum number of bytes to read from the file (default ~80KB, hard limit 200KB)."
      ),
  },
  async (args) => {
    let fullPath: string;
    try {
      fullPath = resolveScopedPath(args.filePath);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Invalid path: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    // Security check
    if (shouldExclude(fullPath)) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: "This file is excluded from scanning for security reasons." }),
          },
        ],
        isError: true,
      };
    }

    let stats: fs.Stats;
    try {
      stats = fs.statSync(fullPath);
    } catch {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `File not found: ${args.filePath}` }),
          },
        ],
        isError: true,
      };
    }

    if (!stats.isFile()) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `${args.filePath} is not a regular file.` }),
          },
        ],
        isError: true,
      };
    }

    const bytesToRead = Math.min(args.maxBytes, stats.size);
    let text: string;

    try {
      const fd = fs.openSync(fullPath, "r");
      const buffer = Buffer.alloc(bytesToRead);
      fs.readSync(fd, buffer, 0, bytesToRead, 0);
      fs.closeSync(fd);
      text = buffer.toString("utf8");
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Cannot read file: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    const payload = {
      filePath: args.filePath,
      sizeBytes: stats.size,
      truncated: stats.size > bytesToRead,
      content: text,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 4: search_files
 * Grep-like search for a text query in files.
 */
server.tool(
  "search_files",
  "Search for a text query in files under a subpath of the Mobius-Substrate repo.",
  {
    subpath: z
      .string()
      .default(".")
      .describe("Subpath within the repo to search under, e.g. 'docs', 'apps', '.'."),
    query: z
      .string()
      .min(1, "query is required")
      .describe("Case-insensitive substring to search for (e.g. 'DVA.HIVE')."),
    maxDepth: z
      .number()
      .int()
      .min(0)
      .max(10)
      .default(5)
      .describe("Maximum directory depth to traverse from subpath."),
    includeExtensions: z
      .array(z.string())
      .optional()
      .describe(
        "Optional list of file extensions to include (e.g. ['.ts', '.md']). If omitted, all file types are searched."
      ),
    maxFiles: z
      .number()
      .int()
      .min(1)
      .max(500)
      .default(100)
      .describe("Maximum number of files to scan."),
    maxMatches: z
      .number()
      .int()
      .min(1)
      .max(2000)
      .default(200)
      .describe("Maximum total number of matches to return."),
    maxMatchesPerFile: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of matches to record per file."),
  },
  async (args) => {
    let rootForScan: string;
    try {
      rootForScan = resolveScopedPath(args.subpath);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Invalid path: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    const normalizedExts = normalizeExtensions(args.includeExtensions);

    let filesScanned = 0;
    let totalMatches = 0;
    const matches: FileMatch[] = [];

    function walkForSearch(currentPath: string, depth: number): void {
      if (depth > args.maxDepth) return;
      if (filesScanned >= args.maxFiles || totalMatches >= args.maxMatches) return;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(currentPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (filesScanned >= args.maxFiles || totalMatches >= args.maxMatches) break;

        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.relative(REPO_ROOT, fullPath);

        if (shouldExclude(fullPath)) continue;

        if (entry.isDirectory()) {
          walkForSearch(fullPath, depth + 1);
        } else if (entry.isFile()) {
          if (
            normalizedExts &&
            normalizedExts.length > 0 &&
            !normalizedExts.some((ext) => entry.name.endsWith(ext))
          ) {
            continue;
          }

          filesScanned++;
          const fileMatches = searchInFile(
            fullPath,
            relPath,
            args.query,
            args.maxMatchesPerFile
          );

          for (const m of fileMatches) {
            if (totalMatches >= args.maxMatches) break;
            matches.push(m);
            totalMatches++;
          }
        }
      }
    }

    walkForSearch(rootForScan, 0);

    const payload = {
      repoRoot: REPO_ROOT,
      subpath: args.subpath,
      query: args.query,
      maxDepth: args.maxDepth,
      includeExtensions: args.includeExtensions ?? null,
      filesScanned,
      totalMatches,
      matches,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 5: list_epicons
 * List EPICON documents in the repo (manuscript shelf).
 */
server.tool(
  "list_epicons",
  "List EPICON documents in the repo (EPICON*.md style) under a given subpath.",
  {
    subpath: z
      .string()
      .default(".")
      .describe("Subpath to search under for EPICON docs (e.g. '.', 'docs', 'epicon')."),
    maxDepth: z
      .number()
      .int()
      .min(0)
      .max(10)
      .default(6)
      .describe("Maximum depth to recurse from subpath."),
    maxFiles: z
      .number()
      .int()
      .min(1)
      .max(1000)
      .default(300)
      .describe("Hard cap on number of EPICON files to list."),
  },
  async (args) => {
    let rootForScan: string;
    try {
      rootForScan = resolveScopedPath(args.subpath);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ error: `Invalid path: ${error}` }),
          },
        ],
        isError: true,
      };
    }

    const epicons: { path: string; name: string; sizeBytes: number }[] = [];
    let visited = 0;

    function walk(currentPath: string, depth: number): void {
      if (depth > args.maxDepth) return;
      if (visited >= args.maxFiles) return;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(currentPath, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        if (visited >= args.maxFiles) break;

        const fullPath = path.join(currentPath, entry.name);
        const relPath = path.relative(REPO_ROOT, fullPath);

        if (shouldExclude(fullPath)) continue;

        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          if (isEpiconFile(entry.name)) {
            visited++;
            try {
              const stats = fs.statSync(fullPath);
              epicons.push({
                path: relPath,
                name: entry.name,
                sizeBytes: stats.size,
              });
            } catch {
              epicons.push({
                path: relPath,
                name: entry.name,
                sizeBytes: 0,
              });
            }
          }
        }
      }
    }

    walk(rootForScan, 0);

    const payload = {
      repoRoot: REPO_ROOT,
      subpath: args.subpath,
      maxDepth: args.maxDepth,
      totalEpicons: epicons.length,
      epicons,
    };

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  }
);

/**
 * Tool 6: export_catalog
 * Generate a mobius_catalog.json manifest for DVA agents.
 */
server.tool(
  "export_catalog",
  "Scan the repo for EPICONs (and optionally docs) and emit a mobius_catalog.json manifest for DVA agents.",
  {
    epiconRoot: z
      .string()
      .default("docs/epicon")
      .describe("Root directory for EPICON files."),
    docsRoot: z
      .string()
      .default("docs")
      .describe("Root directory for documentation files."),
    outputPath: z
      .string()
      .default("catalog/mobius_catalog.json")
      .describe("Output path for the catalog manifest."),
    includeDocs: z
      .boolean()
      .default(true)
      .describe("Whether to include general docs in the catalog."),
    maxDepth: z
      .number()
      .int()
      .min(1)
      .max(10)
      .default(6)
      .describe("Maximum depth to scan for files."),
  },
  async (args) => {
    const epicons: EpiconEntry[] = [];
    const docs: {
      path: string;
      title: string;
      category: string;
      tags: string[];
      content_hash: string;
      summary: string;
    }[] = [];

    // Helper to walk and collect EPICONs
    function walkEpicons(dir: string, depth: number): void {
      if (depth > args.maxDepth) return;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (shouldExclude(fullPath)) continue;

        if (entry.isDirectory()) {
          walkEpicons(fullPath, depth + 1);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          try {
            const raw = fs.readFileSync(fullPath, "utf8");
            const relPath = path.relative(REPO_ROOT, fullPath);
            const data = parseFrontmatter(raw);

            // Extract first heading as title fallback
            const titleMatch = raw.match(/^#\s+(.+)$/m);
            const fallbackTitle = titleMatch ? titleMatch[1] : entry.name.replace(".md", "");

            epicons.push({
              epicon_id: (data.epicon_id as string) || path.basename(entry.name, ".md"),
              path: relPath,
              title: (data.title as string) || fallbackTitle,
              cycle: (data.cycle as string) || null,
              epoch: (data.epoch as string) || null,
              tier: (data.tier as string) || null,
              epicon_type: (data.epicon_type as string) || null,
              status: (data.status as string) || "active",
              author_name: (data.author_name as string) || (data.author as string) || null,
              author_wallet: (data.author_wallet as string) || null,
              tags: (data.tags as string[]) || [],
              related_prs: (data.related_prs as string[]) || [],
              related_commits: (data.related_commits as string[]) || [],
              integrity_index_baseline: (data.integrity_index_baseline as number) ?? null,
              risk_level: (data.risk_level as string) || null,
              created_at: (data.created_at as string) || null,
              updated_at: (data.updated_at as string) || null,
              content_hash: hashContent(raw),
              summary: (data.summary as string) || "",
            });
          } catch {
            // Skip files we can't read
          }
        }
      }
    }

    // Helper to walk and collect docs
    function walkDocs(dir: string, depth: number): void {
      if (depth > args.maxDepth) return;

      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (shouldExclude(fullPath)) continue;

        // Skip the epicon directory if we're already scanning it separately
        if (fullPath.includes("epicon")) continue;

        if (entry.isDirectory()) {
          walkDocs(fullPath, depth + 1);
        } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".mdx"))) {
          try {
            const raw = fs.readFileSync(fullPath, "utf8");
            const relPath = path.relative(REPO_ROOT, fullPath);

            // Extract first heading as title
            const titleMatch = raw.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : entry.name.replace(/\.mdx?$/, "");

            // Infer category from path
            const pathParts = relPath.split(path.sep);
            const category = pathParts.length > 1 ? pathParts[1] : "general";

            docs.push({
              path: relPath,
              title,
              category,
              tags: [],
              content_hash: hashContent(raw),
              summary: "",
            });
          } catch {
            // Skip files we can't read
          }
        }
      }
    }

    // Scan EPICON directory
    try {
      const epiconDir = resolveScopedPath(args.epiconRoot);
      walkEpicons(epiconDir, 0);
    } catch {
      // EPICON directory might not exist
    }

    // Scan docs directory
    if (args.includeDocs) {
      try {
        const docsDir = resolveScopedPath(args.docsRoot);
        walkDocs(docsDir, 0);
      } catch {
        // Docs directory might not exist
      }
    }

    // Build catalog object
    const catalog = {
      mobius_catalog_version: "1.0.0",
      generated_at: new Date().toISOString(),
      repo: {
        name: "Mobius-Substrate",
        url: "https://github.com/kaizencycle/Mobius-Substrate",
        default_branch: "main",
        commit: process.env.GIT_COMMIT || "",
      },
      stats: {
        epiconCount: epicons.length,
        docCount: docs.length,
      },
      epicons,
      docs,
    };

    // Write to disk
    try {
      const outFullPath = resolveScopedPath(args.outputPath);
      const outDir = path.dirname(outFullPath);

      // Ensure output directory exists
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outFullPath, JSON.stringify(catalog, null, 2), "utf8");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                outputPath: args.outputPath,
                epiconCount: epicons.length,
                docCount: docs.length,
                generatedAt: catalog.generated_at,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: `Failed to write catalog: ${error}`,
              epiconCount: epicons.length,
              docCount: docs.length,
            }),
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================================================
// BOOTSTRAP
// ============================================================================

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`
╔══════════════════════════════════════════════════════════════════╗
║                   MOBIUS REPO SCANNER MCP                       ║
║                     DVA Agent Library                           ║
╠══════════════════════════════════════════════════════════════════╣
║  Tools:                                                          ║
║    • repo_summary   - High-level repo overview                   ║
║    • list_tree      - Directory tree as JSON                     ║
║    • read_file      - Safe, bounded file retrieval               ║
║    • search_files   - Grep-like search across files              ║
║    • list_epicons   - Discover EPICON documents                  ║
║    • export_catalog - Generate DVA agent manifest                ║
╠══════════════════════════════════════════════════════════════════╣
║  Root: ${REPO_ROOT.padEnd(52)}║
╚══════════════════════════════════════════════════════════════════╝

"We heal as we walk." — Mobius Systems
  `);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
