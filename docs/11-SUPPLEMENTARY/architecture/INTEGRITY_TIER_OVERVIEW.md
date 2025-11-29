# Integrity Tier — High-Risk Content Gate

**Status:** v0.1 (scaffold)  
**Owner:** Mobius Sentinels (ATLAS / AUREA / EVE)  
**Scope:** High-impact content (news, civic analysis, finance, health, crisis)

---

## 1. Purpose

The Integrity Tier is a specialized layer in the Mobius stack that evaluates
**high-risk content** _after_ Sentinel consensus but _before_ public publishing.

It exists to prevent:

- AI-fabricated news articles
- Hallucinated statistics and quotes
- Meta-text leaks (e.g., “Do you want me to create a front-page version?”)
- Unchecked model output from being treated as verified journalism

---

## 2. Position in the Mobius Flow

```text
Client → Thought Broker → Engines → Sentinels → Integrity Tier → GI Engine → Civic Ledger → Channels
```

- Sentinels provide a first-level “is this generally safe/aligned?” verdict.
- Integrity Tier asks: “Is this article backed by evidence and suitable for public trust?”
- Civic Ledger stores attestations and Civic Provenance envelopes.

⸻

3. Article Integrity Score (AIS)

The Integrity Tier computes an Article Integrity Score (AIS ∈ [0,1]) from:
- source_coverage — how many sources are attached
- sentinel_gi_score — GI snapshot from Sentinel consensus
- domain_risk — e.g., news/politics/health are high-risk
- hallucination_risk — e.g., AI meta-text, missing sources

Thresholds (v0.1 heuristic):
- AIS ≥ 0.95 → auto_publish allowed (with CPP + ledger attestation)
- 0.80 ≤ AIS < 0.95 → human_review required
- AIS < 0.80 or hallucination flags → block

⸻

4. Publish Endpoint

The Integrity Tier is exposed via a broker API endpoint:

POST /v1/publish/news
Content-Type: application/json

Required fields (v0.1):
- draftId — UUID from Broker/Sentinels
- draftText — full article text
- domain — "news" | "politics" | "finance" | "health" | ...
- sources — array of CivicSourceRef
- sentinelVerdicts — consensus label + GI score
- contentHash — sha256 of canonical text (for CPP)
- Optional: claims, aiInvolvement, articleId, title, etc.

Response:

{
  "integrityReport": {
    "draftId": "draft-123",
    "articleIntegrityScore": 0.961,
    "riskLevel": "medium",
    "issues": [],
    "requiredAction": "auto_publish",
    "normalizedSources": [ ... ]
  },
  "civicProvenanceEnvelope": { ... },   // if auto_publish
  "ledgerTxId": "civic_ledger_tx_0xabc" // if submitted
}


⸻

5. Roadmap
- v0.2: Replace heuristics with multi-engine cross-checks and source validation.
- v0.3: Add human review queue integration (Telegram/Discord).
- v0.4: Allow external newsrooms to adopt the Integrity Tier via public API.
- v1.0: Formalize AIS as part of Mobius Integrity Index (MII) for media.

⸻

---
