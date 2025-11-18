import crypto from "crypto";
import fetch, { Headers } from "node-fetch";
import { CFG } from "../config";
import { ALLOWLIST, isPrivateIP } from "./allowlist";

export type FetchedDoc = {
  url: string;
  status: number;
  contentType?: string;
  text: string;
  sha256: string;
  fetchedAt: string;
};

const DEFAULT_ALLOWED_PORTS = new Set(["", "443"]);

function hostMatchesAllowlist(hostname: string): boolean {
  const lowerHost = hostname.toLowerCase();
  for (const allowed of ALLOWLIST) {
    const normalized = allowed.toLowerCase();
    if (lowerHost === normalized || lowerHost.endsWith(`.${normalized}`)) {
      return true;
    }
  }
  return false;
}

function buildSafeAllowlistedUrl(candidate: string): URL {
  const trimmed = candidate.trim();
  if (!trimmed) {
    throw new Error("URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (error) {
    throw new Error(
      `Invalid URL: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();

  if (!hostMatchesAllowlist(hostname)) {
    throw new Error(`Domain not in allowlist: ${hostname}`);
  }
  if (isPrivateIP(hostname)) {
    throw new Error(`Private IP addresses not allowed: ${hostname}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed");
  }
  if (!DEFAULT_ALLOWED_PORTS.has(parsed.port)) {
    throw new Error("Custom ports are not allowed for sentinel fetches");
  }
  if (parsed.pathname.includes("..")) {
    throw new Error("Path traversal sequences are not allowed");
  }

  parsed.username = "";
  parsed.password = "";
  return parsed;
}

export async function fetchDoc(url: string): Promise<FetchedDoc> {
  const safeUrl = buildSafeAllowlistedUrl(url);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    CFG.FETCH_TIMEOUT_MS ?? 12000,
  );

  try {
    const res = await fetch(safeUrl.toString(), {
      method: "GET",
      headers: new Headers({
        "User-Agent": "OAA-Sentinel/1.0 (+Mobius Systems)",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      }),
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await res.text();
    const sha256 = crypto.createHash("sha256").update(text).digest("hex");

    return {
      url: safeUrl.toString(),
      status: res.status,
      contentType: res.headers.get("content-type") ?? undefined,
      text,
      sha256,
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

