import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// Simple IPFS pinning simulation - in production, use actual IPFS client
async function pinToIPFS(content: string): Promise<{ cid: string, sha256: string }> {
  // Simulate IPFS pinning by creating a hash-based CID
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const cid = `Qm${hash.substring(0, 44)}`; // Simulate CIDv0 format
  return { cid, sha256: hash };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"method_not_allowed" });
  
  const { markdown, integrityHex } = req.body || {};
  if (!markdown || !integrityHex) return res.status(400).json({ ok:false, error:"missing_params" });

  try {
    // Pin content to IPFS (simulated)
    const { cid, sha256 } = await pinToIPFS(markdown);
    
    const result = { ok:true, cid, sha256 };

    // Enqueue post-publish job (retryable)
    try {
      const rawLabel = req.query?.companion;
      // Sanitize label to prevent format string injection and ensure it's a string
      const label = typeof rawLabel === 'string' ? rawLabel.toLowerCase().replace(/[^a-z0-9_-]/gi, '') : '';
      if (label && integrityHex) {
        const enqueueRes = await fetch(`${req.headers.host?.startsWith('http') ? '' : 'http://localhost:3000'}/api/queue/enqueue`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ label, cid, integrityHex, sha256 })
        });
        
        if (enqueueRes.ok) {
          const enqueueData = await enqueueRes.json();
          // Sanitize log inputs to prevent log injection (label already sanitized, but be defensive)
          const safeLabel = label.replace(/\n/g, '').replace(/\r/g, '');
          const safeId = String(enqueueData.id || '').replace(/\n/g, '').replace(/\r/g, '');
          console.log('Enqueued publish job for %s:', safeLabel, safeId);
        } else {
          const errorText = await enqueueRes.text();
          const safeError = errorText.replace(/\n/g, '').replace(/\r/g, '');
          console.error("Failed to enqueue publish job:", safeError);
        }
      }
    } catch (enqueueError) {
      console.error("Non-fatal enqueue error:", enqueueError);
      // Don't fail the publish if enqueue fails
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Publish error:", error);
    return res.status(500).json({ ok:false, error: error?.message || "publish_failed" });
  }
}

