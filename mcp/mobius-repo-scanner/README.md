# @mobius/mcp-repo-scanner

MCP server that exposes the Mobius-Substrate repository as a **queryable knowledge substrate** for DVA agents.

> Turns the monorepo into a digital library with structured JSON tools.

## Features

- 🔍 **repo_summary** - High-level snapshot of the repository
- 🌲 **list_tree** - Directory tree as structured JSON
- 📄 **read_file** - Safe, bounded file retrieval
- 🔎 **search_files** - Grep-like search across files
- 📚 **list_epicons** - Discover EPICON reasoning artifacts
- 📋 **export_catalog** - Generate DVA agent manifest

## Installation

```bash
cd mcp/mobius-repo-scanner
npm install
npm run build
```

## Usage

### As MCP Server

Start the server (connects via stdio):

```bash
npm start
```

Or with a custom repo root:

```bash
MOBIUS_REPO_ROOT=/path/to/repo npm start
```

### MCP Client Configuration

#### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "mobius-repo-scanner": {
      "command": "node",
      "args": [
        "/absolute/path/to/Mobius-Substrate/mcp/mobius-repo-scanner/build/index.js"
      ],
      "env": {
        "MOBIUS_REPO_ROOT": "/absolute/path/to/Mobius-Substrate"
      }
    }
  }
}
```

#### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` in workspace or global config):

```json
{
  "mcpServers": {
    "mobius-repo-scanner": {
      "command": "node",
      "args": [
        "./mcp/mobius-repo-scanner/build/index.js"
      ],
      "env": {
        "MOBIUS_REPO_ROOT": "${workspaceFolder}"
      }
    }
  }
}
```

#### Generic MCP Client

```json
{
  "mcpServers": {
    "mobius-repo-scanner": {
      "command": "node",
      "args": ["./mcp/mobius-repo-scanner/build/index.js"],
      "env": {
        "MOBIUS_REPO_ROOT": "/path/to/Mobius-Substrate"
      }
    }
  }
}
```

## Tools Reference

### repo_summary

Get a high-level overview of the repository.

**Input:** None

**Output:**
```json
{
  "repoRoot": "/path/to/repo",
  "topLevelDirectories": ["apps", "docs", "packages", ...],
  "topLevelFiles": ["README.md", "package.json", ...],
  "approxTopLevelSizeBytes": 12345,
  "excludedPatterns": ["node_modules", ".git", ...]
}
```

### list_tree

List directory structure as JSON.

**Input:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `subpath` | string | "." | Path to scan |
| `maxDepth` | number | 3 | Max recursion depth (0-10) |
| `includeExtensions` | string[] | null | Filter by extensions |

**Example:**
```json
{
  "subpath": "packages",
  "maxDepth": 2,
  "includeExtensions": [".ts", ".json"]
}
```

### read_file

Read a file's contents with size limits.

**Input:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `filePath` | string | required | Path to file |
| `maxBytes` | number | 80000 | Max bytes to read (limit: 200000) |

**Output:**
```json
{
  "filePath": "docs/epicon/EPICON-01.md",
  "sizeBytes": 15234,
  "truncated": false,
  "content": "# EPICON-01: ..."
}
```

### search_files

Search for text across files.

**Input:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `subpath` | string | "." | Path to search under |
| `query` | string | required | Search query (case-insensitive) |
| `maxDepth` | number | 5 | Max recursion depth |
| `includeExtensions` | string[] | null | Filter by extensions |
| `maxFiles` | number | 100 | Max files to scan |
| `maxMatches` | number | 200 | Max total matches |
| `maxMatchesPerFile` | number | 10 | Max matches per file |

**Example:**
```json
{
  "subpath": "docs",
  "query": "DVA.HIVE",
  "includeExtensions": [".md"]
}
```

### list_epicons

Discover EPICON documents in the repo.

**Input:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `subpath` | string | "." | Path to search under |
| `maxDepth` | number | 6 | Max recursion depth |
| `maxFiles` | number | 300 | Max files to list |

**Output:**
```json
{
  "totalEpicons": 10,
  "epicons": [
    {
      "path": "docs/epicon/EPICON-01.md",
      "name": "EPICON-01.md",
      "sizeBytes": 15234
    }
  ]
}
```

### export_catalog

Generate a knowledge manifest for DVA agents.

**Input:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `epiconRoot` | string | "docs/epicon" | EPICON directory |
| `docsRoot` | string | "docs" | Documentation directory |
| `outputPath` | string | "catalog/mobius_catalog.json" | Output path |
| `includeDocs` | boolean | true | Include general docs |
| `maxDepth` | number | 6 | Max scan depth |

**Output:**
```json
{
  "success": true,
  "outputPath": "catalog/mobius_catalog.json",
  "epiconCount": 10,
  "docCount": 742,
  "generatedAt": "2025-12-30T12:00:00Z"
}
```

## Security

The MCP server implements several security measures:

### Path Scoping

All paths are resolved relative to `MOBIUS_REPO_ROOT` and validated to prevent directory traversal attacks.

### Excluded Patterns

The following are automatically excluded from all scans:
- `node_modules/`
- `.git/`
- `.env*` files
- `*.pem`, `*.key` files
- `secrets/` directories
- Build artifacts (`dist/`, `build/`, `.next/`, etc.)

### Size Limits

- `read_file` has a hard cap of 200KB
- All tools have configurable limits for files/matches/depth

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run linter
npm run lint
```

## Architecture

```
mcp/mobius-repo-scanner/
├── src/
│   └── index.ts      # Main MCP server + all tools
├── epicon/
│   └── EPICON_MCP_REPO_SCANNER_V1.md
├── package.json
├── tsconfig.json
└── README.md
```

## EPICON

This package is documented in:
- `epicon/EPICON_MCP_REPO_SCANNER_V1.md`

## Related

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Mobius-Substrate](https://github.com/kaizencycle/Mobius-Substrate)

---

*"We heal as we walk." — Mobius Systems*
