import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; 
import path from "path"; 
import crypto from "crypto";

const GH_TOKEN   = process.env.GITHUB_TOKEN || "";
const GH_REPO    = process.env.GITHUB_REPO  || ""; // e.g. "kaizencycle/OAA-API-Library"
const GH_BRANCH  = process.env.GITHUB_BRANCH || "main";
const WRITE_MODE = process.env.EOMM_WRITE_MODE || "disk"; // "disk" | "github"

function validateEntry(entry: any): string[] {
  const errs: string[] = [];
  if (!entry || typeof entry !== "object") { errs.push("not_an_object"); return errs; }
  for (const k of ["title","timestamp","agent","cycle","content"]) {
    if (!entry[k] || String(entry[k]).trim().length === 0) errs.push(`missing_${k}`);
  }
  if (entry.sources && !Array.isArray(entry.sources)) errs.push("sources_not_array");
  return errs;
}

function sha256Hex(s: string) { return crypto.createHash("sha256").update(s).digest("hex"); }
function slugify(s: string) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

/**
 * Validate and sanitize relative path to prevent path traversal
 */
function validateRelativePath(relPath: string): string {
  // Remove leading slashes and normalize
  const normalized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  
  // Check for path traversal attempts
  if (normalized.includes('..') || path.isAbsolute(normalized)) {
    throw new Error(`Invalid path: path traversal detected in ${relPath}`);
  }
  
  // Ensure path starts with allowed prefix
  if (!normalized.startsWith('data/eomm/')) {
    throw new Error(`Invalid path: must be within data/eomm/ directory`);
  }
  
  return normalized;
}

async function writeToDisk(relPath: string, body: string) {
  const safePath = validateRelativePath(relPath);
  const abs = path.join(process.cwd(), safePath);
  
  // Double-check the resolved path is within cwd
  const cwd = path.resolve(process.cwd());
  const resolvedPath = path.resolve(abs);
  if (!resolvedPath.startsWith(cwd + path.sep)) {
    throw new Error(`Invalid path: resolved path escapes working directory`);
  }
  
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, body);
  return abs;
}

/**
 * Validate GitHub repository name to prevent SSRF
 */
function validateGitHubRepo(repo: string): string {
  // Only allow alphanumeric, hyphens, underscores, and forward slashes
  // Format: owner/repo-name
  if (!/^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/.test(repo)) {
    throw new Error(`Invalid GitHub repository format: ${repo}`);
  }
  return repo;
}

/**
 * Validate GitHub branch name to prevent SSRF
 */
function validateGitHubBranch(branch: string): string {
  // Only allow alphanumeric, hyphens, underscores, forward slashes, and dots
  if (!/^[a-zA-Z0-9._\/-]+$/.test(branch)) {
    throw new Error(`Invalid GitHub branch format: ${branch}`);
  }
  return branch;
}

async function writeToGitHub(relPath: string, body: string) {
  if (!GH_TOKEN || !GH_REPO) throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO");
  
  // Validate inputs to prevent SSRF
  const safeRepo = validateGitHubRepo(GH_REPO);
  const safeBranch = validateGitHubBranch(GH_BRANCH);
  
  // Validate relPath to prevent path traversal
  if (relPath.includes('..') || relPath.includes('//') || relPath.startsWith('/')) {
    throw new Error(`Invalid path: ${relPath}`);
  }
  
  // Construct safe URL - only allow api.github.com
  const baseUrl = 'https://api.github.com';
  const url = `${baseUrl}/repos/${safeRepo}/contents/${encodeURIComponent(relPath)}`;
  const get = await fetch(`${url}?ref=${encodeURIComponent(safeBranch)}`, { headers: { authorization: `Bearer ${GH_TOKEN}` }});
  const exists = get.ok ? await get.json().catch(()=>null) : null;
  const sha = exists?.sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "authorization": `Bearer ${GH_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({
      message: `chore(eomm): ingest ${relPath}`,
      content: Buffer.from(body, "utf8").toString("base64"),
      branch: GH_BRANCH,
      sha
    })
  });
  if (!res.ok) throw new Error(`GitHub write failed: ${res.status} ${await res.text()}`);
  return relPath;
}

function buildJsonLd(entry: any, sha: string) {
  // Build citations from sources
  const citations = (entry.sources || []).map((s: any) => ({
    "@type": s.type === "repo" ? "SoftwareSourceCode" :
             s.type === "dataset" ? "Dataset" :
             "WebPage",
    "name": s.name || s.url,
    "url": s.url,
    "hash": s.hash,
    "note": s.note
  }));

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": entry.title,
    "author": entry.author || "Michael Judan",
    "agent": entry.agent,
    "dateCreated": entry.timestamp,
    "text": entry.content,
    "keywords": entry.tags || ["EOMM","OAA","Reflection"],
    "integrityHash": `sha256:${sha}`,
    "attestation": { "signer": "oaa_hub", "signature": `sha256:${sha}` },
    "citation": citations,
    "isBasedOn": citations.map((c: any) => c.url).slice(0, 32),
    "prov": {
      "generatedAtTime": new Date().toISOString(),
      "wasAttributedTo": entry.agent,
      "used": citations.map((c: any) => c.url)
    },
    "oaa": { "kind": "memory", "cycle": entry.cycle, "companion": entry.agent },
    "_source": { "eomm_file": `data/eomm/${entry.timestamp.replace(/[:]/g,"").slice(0,15)}-${entry.cycle || "C-XXX"}-${slugify(entry.title || "entry")}.json` }
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });

  const entry = typeof req.body === "object" ? req.body : (() => { try { return JSON.parse(String(req.body||"{}")); } catch { return null; }})();
  if (!entry) return res.status(200).json({ ok:false, verdict:"quarantine", errors:["invalid_json"] });

  const errors = validateEntry(entry);
  if (errors.length) return res.status(200).json({ ok:false, verdict:"quarantine", errors });

  const sha = sha256Hex(JSON.stringify(entry));
  const ts  = (entry.timestamp || new Date().toISOString()).replace(/[:]/g,"").slice(0,15); // YYYY-MM-DDTHHMM
  const name = `${ts}-${entry.cycle || "C-XXX"}-${slugify(entry.title || "entry")}.json`;
  const relPath = `data/eomm/${name}`;
  const body = JSON.stringify(entry, null, 2);

  try {
    if (WRITE_MODE === "github") {
      await writeToGitHub(relPath, body);
    } else {
      await writeToDisk(relPath, body);
    }

    // Build JSON-LD for beacon
    const jsonld = buildJsonLd(entry, sha);
    
    return res.status(200).json({ 
      ok: true, 
      verdict: "pass", 
      sha256: sha, 
      file: relPath,
      jsonld: jsonld
    });
  } catch (e: any) {
    return res.status(500).json({ ok:false, error: String(e.message || e) });
  }
}

