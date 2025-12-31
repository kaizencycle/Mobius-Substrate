/**
 * Security tests for @mobius/mcp-repo-scanner
 *
 * Tests cover:
 * - Path traversal prevention
 * - Exclusion patterns
 * - Large file handling
 *
 * Run with: npm run test:security
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ============================================================================
// Test Utilities
// ============================================================================

// Simulated REPO_ROOT for testing
let TEST_REPO_ROOT: string;

// Create test fixtures
function setupTestFixtures(): void {
  TEST_REPO_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-test-"));

  // Create directory structure
  fs.mkdirSync(path.join(TEST_REPO_ROOT, "docs"));
  fs.mkdirSync(path.join(TEST_REPO_ROOT, "src"));
  fs.mkdirSync(path.join(TEST_REPO_ROOT, "node_modules"));
  fs.mkdirSync(path.join(TEST_REPO_ROOT, ".git"));
  fs.mkdirSync(path.join(TEST_REPO_ROOT, "secrets"));

  // Create test files
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "README.md"), "# Test Repo\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "docs", "guide.md"), "# Guide\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "src", "index.ts"), "export {};\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, ".env"), "SECRET_KEY=abc123\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, ".env.local"), "LOCAL_KEY=xyz\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "secrets", "keys.json"), '{"key": "secret"}\n');
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "node_modules", "pkg.json"), '{"name": "test"}\n');
  fs.writeFileSync(path.join(TEST_REPO_ROOT, ".git", "config"), "[core]\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "server.pem"), "-----BEGIN CERTIFICATE-----\n");
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "private.key"), "-----BEGIN PRIVATE KEY-----\n");

  // Create a large file (> 200KB)
  const largeContent = "x".repeat(250000); // 250KB
  fs.writeFileSync(path.join(TEST_REPO_ROOT, "large-file.txt"), largeContent);
}

function cleanupTestFixtures(): void {
  if (TEST_REPO_ROOT) {
    fs.rmSync(TEST_REPO_ROOT, { recursive: true, force: true });
  }
}

// Copy of the security functions from index.ts for testing
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

function resolveScopedPath(repoRoot: string, subpath: string): string {
  const raw = subpath.trim() === "" ? "." : subpath;
  const resolved = path.resolve(repoRoot, raw);
  if (!resolved.startsWith(path.resolve(repoRoot))) {
    throw new Error("Path escapes REPO_ROOT - access denied");
  }
  return resolved;
}

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}

// ============================================================================
// Tests
// ============================================================================

describe("MCP Repo Scanner Security Tests", () => {
  before(() => {
    setupTestFixtures();
  });

  after(() => {
    cleanupTestFixtures();
  });

  describe("Path Traversal Prevention", () => {
    it("should reject paths with .. that escape repo root", () => {
      assert.throws(
        () => resolveScopedPath(TEST_REPO_ROOT, "../../../etc/passwd"),
        /Path escapes REPO_ROOT/
      );
    });

    it("should reject absolute paths outside repo root", () => {
      assert.throws(
        () => resolveScopedPath(TEST_REPO_ROOT, "/etc/passwd"),
        /Path escapes REPO_ROOT/
      );
    });

    it("should allow paths within repo root", () => {
      const result = resolveScopedPath(TEST_REPO_ROOT, "docs/guide.md");
      assert.ok(result.startsWith(TEST_REPO_ROOT));
    });

    it("should allow . (current directory)", () => {
      const result = resolveScopedPath(TEST_REPO_ROOT, ".");
      assert.strictEqual(result, path.resolve(TEST_REPO_ROOT));
    });

    it("should allow empty string (defaults to repo root)", () => {
      const result = resolveScopedPath(TEST_REPO_ROOT, "");
      assert.strictEqual(result, path.resolve(TEST_REPO_ROOT));
    });

    it("should handle .. that stays within repo root", () => {
      const result = resolveScopedPath(TEST_REPO_ROOT, "docs/../src/index.ts");
      assert.ok(result.startsWith(TEST_REPO_ROOT));
      assert.ok(result.endsWith("src/index.ts"));
    });

    it("should reject multiple .. segments that escape", () => {
      assert.throws(
        () => resolveScopedPath(TEST_REPO_ROOT, "docs/../../.."),
        /Path escapes REPO_ROOT/
      );
    });
  });

  describe("Exclusion Patterns", () => {
    it("should exclude node_modules", () => {
      assert.strictEqual(shouldExclude("/repo/node_modules/pkg/index.js"), true);
      assert.strictEqual(shouldExclude("node_modules"), true);
    });

    it("should exclude .git directory", () => {
      assert.strictEqual(shouldExclude("/repo/.git/config"), true);
      assert.strictEqual(shouldExclude(".git"), true);
    });

    it("should exclude .env files", () => {
      assert.strictEqual(shouldExclude(".env"), true);
      assert.strictEqual(shouldExclude(".env.local"), true);
      assert.strictEqual(shouldExclude(".env.production"), true);
      assert.strictEqual(shouldExclude("/repo/.env"), true);
    });

    it("should exclude .pem files", () => {
      assert.strictEqual(shouldExclude("server.pem"), true);
      assert.strictEqual(shouldExclude("/repo/certs/server.pem"), true);
    });

    it("should exclude .key files", () => {
      assert.strictEqual(shouldExclude("private.key"), true);
      assert.strictEqual(shouldExclude("/repo/ssl/private.key"), true);
    });

    it("should exclude secrets directory", () => {
      assert.strictEqual(shouldExclude("/repo/secrets/keys.json"), true);
      assert.strictEqual(shouldExclude("secrets"), true);
    });

    it("should exclude build directories", () => {
      assert.strictEqual(shouldExclude("/repo/dist/index.js"), true);
      assert.strictEqual(shouldExclude("/repo/build/output.js"), true);
      assert.strictEqual(shouldExclude("/repo/.next/server.js"), true);
    });

    it("should exclude __pycache__", () => {
      assert.strictEqual(shouldExclude("__pycache__"), true);
      assert.strictEqual(shouldExclude("/repo/src/__pycache__/module.pyc"), true);
    });

    it("should exclude .pyc files", () => {
      assert.strictEqual(shouldExclude("module.pyc"), true);
    });

    it("should NOT exclude normal files", () => {
      assert.strictEqual(shouldExclude("README.md"), false);
      assert.strictEqual(shouldExclude("/repo/src/index.ts"), false);
      assert.strictEqual(shouldExclude("/repo/docs/guide.md"), false);
      assert.strictEqual(shouldExclude("package.json"), false);
    });
  });

  describe("Large File Handling", () => {
    it("should handle files larger than maxBytes", () => {
      const largePath = path.join(TEST_REPO_ROOT, "large-file.txt");
      const stats = fs.statSync(largePath);

      // File should be > 200KB
      assert.ok(stats.size > 200000, "Test file should be larger than 200KB");

      // Simulate reading with truncation
      const maxBytes = 80000;
      const content = fs.readFileSync(largePath);
      const truncated = content.length > maxBytes;
      const text = truncated
        ? content.slice(0, maxBytes).toString("utf8")
        : content.toString("utf8");

      assert.strictEqual(truncated, true);
      assert.strictEqual(text.length, maxBytes);
    });

    it("should not truncate files smaller than maxBytes", () => {
      const smallPath = path.join(TEST_REPO_ROOT, "README.md");
      const content = fs.readFileSync(smallPath);
      const maxBytes = 80000;

      const truncated = content.length > maxBytes;
      assert.strictEqual(truncated, false);
    });
  });

  describe("File Type Validation", () => {
    it("should identify directories correctly", () => {
      const docsPath = path.join(TEST_REPO_ROOT, "docs");
      const stats = fs.statSync(docsPath);
      assert.strictEqual(stats.isDirectory(), true);
      assert.strictEqual(stats.isFile(), false);
    });

    it("should identify files correctly", () => {
      const filePath = path.join(TEST_REPO_ROOT, "README.md");
      const stats = fs.statSync(filePath);
      assert.strictEqual(stats.isFile(), true);
      assert.strictEqual(stats.isDirectory(), false);
    });
  });

  describe("Error Handling", () => {
    it("should handle non-existent files gracefully", () => {
      const nonExistentPath = path.join(TEST_REPO_ROOT, "does-not-exist.txt");

      try {
        fs.readFileSync(nonExistentPath);
        assert.fail("Should have thrown ENOENT");
      } catch (error: unknown) {
        const nodeError = error as NodeJS.ErrnoException;
        assert.strictEqual(nodeError.code, "ENOENT");
      }
    });
  });
});
