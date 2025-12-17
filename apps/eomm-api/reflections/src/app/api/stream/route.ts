import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

/**
 * Validate handle parameter to prevent SSRF attacks.
 * Handles must be alphanumeric with optional underscores, hyphens, and dots.
 * Maximum length of 64 characters.
 */
function validateHandle(handle: string | null): string | null {
  if (!handle || typeof handle !== 'string') {
    return null;
  }
  // Only allow safe characters: alphanumeric, underscore, hyphen, dot
  // Maximum 64 characters to prevent abuse
  const SAFE_HANDLE_PATTERN = /^[a-zA-Z0-9_.-]{1,64}$/;
  if (!SAFE_HANDLE_PATTERN.test(handle)) {
    return null;
  }
  return handle;
}

/**
 * Validate that the base URL is a trusted internal service.
 */
function validateBaseUrl(baseUrl: string | undefined): string | null {
  if (!baseUrl) {
    return null;
  }
  try {
    const parsed = new URL(baseUrl);
    // Only allow HTTPS or localhost for development
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return null;
    }
    return baseUrl;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const rawHandle = url.searchParams.get("handle");
  const base = validateBaseUrl(process.env.GIC_INDEXER_URL);
  
  if (!base) {
    return new Response("Server configuration error", { status: 500 });
  }
  
  const handle = validateHandle(rawHandle);
  if (!handle) {
    return new Response("Invalid or missing handle", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const enc = (data: any) =>
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));

      let active = true;
      const tick = async () => {
        if (!active) return;
        try {
          // SSRF Protection: handle is validated to contain only safe characters (alphanumeric, _, -, .)
          // base URL is validated to be HTTPS or localhost only
          const [b, f] = await Promise.all([
            fetch(`${base}/balances/${encodeURIComponent(handle)}`, { cache: "no-store" }).then(r => r.json()),
            fetch(`${base}/forest/user/${encodeURIComponent(handle)}`, { cache: "no-store" }).then(r => r.json())
          ]);
          enc({ type: "state", balance: b, forest: f, ts: Date.now() });
        } catch (e) {
          enc({ type: "error", message: String(e) });
        } finally {
          if (active) setTimeout(tick, 5000);
        }
      };
      tick();
      const close = () => { active = false; controller.close(); };
      // @ts-ignore
      (controller as any)._close = close;
    },
    cancel() {}
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

