import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

interface BeaconItem {
  "@type": string;
  name: string;
  description: string;
  url: string;
  keywords: string[];
  integrityHash?: string;
  civicTag?: string;
  datePublished?: string;
  author?: {
    "@type": string;
    name: string;
  };
}

interface SearchResponse {
  ok: boolean;
  count: number;
  query: string;
  items: BeaconItem[];
  totalAvailable: number;
}

// Sample beacon data - in production, this would come from your actual beacon files
const sampleBeacons: BeaconItem[] = [
  {
    "@type": "CreativeWork",
    "name": "Virtue Accords — Truth, Trust, Care",
    "description": "The three civic virtues that govern agent behavior and rewards in the Civic AI ecosystem.",
    "url": "/virtue-accords",
    "keywords": ["Virtue Accords", "Truth", "Trust", "Care", "Civic AI", "Ethics", "Integrity", "Governance"],
    "integrityHash": "sha256-virtue-accords-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "Civic AI — Ethics (Integrity Core)",
    "description": "Integrity Core: Truth • Trust • Care. Ethics engine for Civic AI governance and verifiable behavior.",
    "url": "/ethics",
    "keywords": ["Civic AI", "Ethics", "Integrity Core", "Virtue Accords", "Proof of Integrity", "Kaizen Turing Test", "MIC", "Civic Ledger"],
    "integrityHash": "sha256-ethics-core-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "MIC — Mobius Integrity Index Credit",
    "description": "The contribution-based economy of Civic AI, rewarding verifiable civic work and human-machine collaboration.",
    "url": "/gic",
    "keywords": ["MIC", "Mobius Integrity Index Credit", "Civic AI economy", "Integrity rewards", "Civic Ledger", "Attestation", "GEO", "AEO"],
    "integrityHash": "sha256-gic-model-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  },
  {
    "@type": "CreativeWork",
    "name": "Civic AI — Overview",
    "description": "The Civic AI Native Stack: OAA memory, DVA core, Civic Ledger, GEO/SEO beacons for verifiable, geocivic AI ecosystem.",
    "url": "/civic-ai",
    "keywords": ["Civic AI", "OAA", "DVA", "Civic Ledger", "Citizen Shield", "GEO", "AEO", "AI-SEO", "Integrity", "Governance"],
    "integrityHash": "sha256-civic-ai-overview-v1",
    "civicTag": "GEO-Optimized",
    "datePublished": "2024-01-15",
    "author": {
      "@type": "Organization",
      "name": "Kaizen"
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse<SearchResponse>) {
  const { q, limit = "25" } = req.query;
  const query = String(q || "").toLowerCase().trim();
  const limitNum = Math.min(parseInt(String(limit)), 100);

  // Try to load from actual beacon index file
  let beacons: BeaconItem[] = sampleBeacons;
  const beaconIndexPath = path.join(process.cwd(), "public", "ai-seo", "index.jsonld");
  
  if (fs.existsSync(beaconIndexPath)) {
    try {
      const content = await fsPromises.readFile(beaconIndexPath, "utf8");
      const beaconData = JSON.parse(content);
      if (beaconData.dataFeedElement && Array.isArray(beaconData.dataFeedElement)) {
        beacons = beaconData.dataFeedElement;
      }
    } catch (error) {
      console.warn("Failed to load beacon index, using sample data:", error);
    }
  }

  // Filter beacons based on query
  let filteredBeacons = beacons;
  if (query) {
    filteredBeacons = beacons.filter((beacon) => {
      const searchText = [
        beacon.name,
        beacon.description,
        ...beacon.keywords,
        beacon.url
      ].join(" ").toLowerCase();
      
      return searchText.includes(query);
    });
  }

  // Sort by relevance - optimize by pre-calculating scores (O(n) instead of O(n log n) calls)
  if (query) {
    const scoredBeacons = filteredBeacons.map(beacon => ({
      beacon,
      score: getRelevanceScore(beacon, query)
    }));
    scoredBeacons.sort((a, b) => b.score - a.score);
    filteredBeacons = scoredBeacons.map(item => item.beacon);
  }

  // Limit results
  const items = filteredBeacons.slice(0, limitNum);

  const response: SearchResponse = {
    ok: true,
    count: items.length,
    query: query,
    items,
    totalAvailable: beacons.length
  };

  res.status(200).json(response);
}

function getRelevanceScore(beacon: BeaconItem, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();

  // Pre-lowercase beacon fields once instead of repeatedly
  const nameLower = beacon.name.toLowerCase();
  const descLower = beacon.description.toLowerCase();
  const urlLower = beacon.url.toLowerCase();

  // Exact name match gets highest score
  if (nameLower.includes(queryLower)) {
    score += 10;
  }

  // Description match
  if (descLower.includes(queryLower)) {
    score += 5;
  }

  // Keyword matches - optimize with single pass
  let keywordMatches = 0;
  for (const keyword of beacon.keywords) {
    if (keyword.toLowerCase().includes(queryLower)) {
      keywordMatches++;
    }
  }
  score += keywordMatches * 3;

  // URL match
  if (urlLower.includes(queryLower)) {
    score += 2;
  }

  return score;
}

