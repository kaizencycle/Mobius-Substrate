import type { Request, Response } from "express";
import crypto from "crypto";

/**
 * Verify dual signature requirement
 * Format: { human_signature: string, sentinel_signature: string }
 */
function verifyDualSignature(
  payload: any,
  humanSignature: string,
  sentinelSignature: string
): boolean {
  // TODO: Implement actual signature verification
  // For now, check that signatures are present and non-empty
  // In production, use cryptographic verification against known keys
  return (
    typeof humanSignature === "string" &&
    humanSignature.length > 0 &&
    typeof sentinelSignature === "string" &&
    sentinelSignature.length > 0
  );
}

/**
 * Generate attestation hash
 */
function generateAttestationHash(
  action: string,
  amount: bigint,
  timestamp: string,
  signatures: { human: string; sentinel: string }
): string {
  const payload = JSON.stringify({
    action,
    amount: amount.toString(),
    timestamp,
    signatures,
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * POST /attest/mint
 * Mint integrity credits with dual-signature attestation
 * 
 * Request body:
 * {
 *   amount_shards: string,  // BigInt as string
 *   human_signature: string,
 *   sentinel_signature: string,
 *   metadata?: object
 * }
 */
export async function mintAttestRoute(req: Request, res: Response) {
  try {
    const { amount_shards, human_signature, sentinel_signature, metadata } = req.body || {};

    // Validate required fields
    if (!amount_shards || !human_signature || !sentinel_signature) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["amount_shards", "human_signature", "sentinel_signature"],
      });
    }

    // Verify GI floor
    const giAggregatorUrl = process.env.GI_AGGREGATOR_URL;
    let gi = 0.999; // Default fallback
    if (giAggregatorUrl) {
      try {
        const giResponse = await fetch(`${giAggregatorUrl}/gi`, {
          signal: AbortSignal.timeout(5000),
        });
        if (giResponse.ok) {
          const giData = await giResponse.json();
          gi = giData.gi || gi;
        }
      } catch (error) {
        console.warn("GI aggregator unavailable, using default");
      }
    }

    const giFloor = parseFloat(process.env.GI_FLOOR_WARN || "0.950");
    if (gi < giFloor) {
      return res.status(403).json({
        error: "GI below required floor",
        current_gi: gi,
        required_gi: giFloor,
        status: "halted",
      });
    }

    // Verify dual signature
    if (!verifyDualSignature(req.body, human_signature, sentinel_signature)) {
      return res.status(401).json({
        error: "Invalid dual signature",
        message: "Both human and sentinel signatures are required",
      });
    }

    // Validate amount
    const amountBI = BigInt(amount_shards);
    if (amountBI <= 0n) {
      return res.status(400).json({
        error: "Amount must be positive",
      });
    }

    // Generate attestation
    const timestamp = new Date().toISOString();
    const attestationHash = generateAttestationHash(
      "mint",
      amountBI,
      timestamp,
      {
        human: human_signature,
        sentinel: sentinel_signature,
      }
    );

    // TODO: Persist to database
    // TODO: Emit event to ledger
    // TODO: Update balance

    res.status(201).json({
      success: true,
      attestation: {
        hash: attestationHash,
        action: "mint",
        amount_shards: amountBI.toString(),
        timestamp,
        gi_at_mint: gi,
      },
      metadata: metadata || {},
    });
  } catch (error: any) {
    console.error("Mint attestation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * POST /attest/burn
 * Burn integrity credits with dual-signature attestation
 * 
 * Request body:
 * {
 *   amount_shards: string,  // BigInt as string
 *   human_signature: string,
 *   sentinel_signature: string,
 *   reason?: string,
 *   metadata?: object
 * }
 */
export async function burnAttestRoute(req: Request, res: Response) {
  try {
    const { amount_shards, human_signature, sentinel_signature, reason, metadata } = req.body || {};

    // Validate required fields
    if (!amount_shards || !human_signature || !sentinel_signature) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["amount_shards", "human_signature", "sentinel_signature"],
      });
    }

    // Verify GI floor (same as mint)
    const giAggregatorUrl = process.env.GI_AGGREGATOR_URL;
    let gi = 0.999;
    if (giAggregatorUrl) {
      try {
        const giResponse = await fetch(`${giAggregatorUrl}/gi`, {
          signal: AbortSignal.timeout(5000),
        });
        if (giResponse.ok) {
          const giData = await giResponse.json();
          gi = giData.gi || gi;
        }
      } catch (error) {
        console.warn("GI aggregator unavailable, using default");
      }
    }

    const giFloor = parseFloat(process.env.GI_FLOOR_WARN || "0.950");
    if (gi < giFloor) {
      return res.status(403).json({
        error: "GI below required floor",
        current_gi: gi,
        required_gi: giFloor,
        status: "halted",
      });
    }

    // Verify dual signature
    if (!verifyDualSignature(req.body, human_signature, sentinel_signature)) {
      return res.status(401).json({
        error: "Invalid dual signature",
        message: "Both human and sentinel signatures are required",
      });
    }

    // Validate amount
    const amountBI = BigInt(amount_shards);
    if (amountBI <= 0n) {
      return res.status(400).json({
        error: "Amount must be positive",
      });
    }

    // Generate attestation
    const timestamp = new Date().toISOString();
    const attestationHash = generateAttestationHash(
      "burn",
      amountBI,
      timestamp,
      {
        human: human_signature,
        sentinel: sentinel_signature,
      }
    );

    // TODO: Persist to database
    // TODO: Emit event to ledger
    // TODO: Update balance (reduce supply)

    res.status(201).json({
      success: true,
      attestation: {
        hash: attestationHash,
        action: "burn",
        amount_shards: amountBI.toString(),
        timestamp,
        reason: reason || "Supply management",
        gi_at_burn: gi,
      },
      metadata: metadata || {},
    });
  } catch (error: any) {
    console.error("Burn attestation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

