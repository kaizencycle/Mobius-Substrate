# Civic Provenance Protocol (CPP) — v0.1

**Purpose:**  
Provide a machine-verifiable "passport" for public-facing content
(news, civic analysis, finance, health) that answers:

> Who wrote this, what evidence did they use, how much did AI help,
> and has this article been altered since it was first published?

CPP is designed to work with the **Mobius Civic Ledger** and the
**Integrity Tier**.

---

## 1. Design Goals

- **Transparency:** Explicitly disclose AI involvement and evidence.
- **Verifiability:** Allow anyone (human or machine) to verify content hashes,
  ledger attestations, and signatures.
- **Evolvability:** Support revisions and corrections without losing history.
- **Interoperability:** Embeddable in web pages, feeds, APIs, and ledgers.

---

## 2. Envelope Structure

CPP defines a JSON envelope:

```json
{
  "version": "cpp.v1",
  "article": { ... },
  "sourceGraph": { ... },
  "aiInvolvement": { ... },
  "integrityAttestation": { ... },
  "revisionHistory": [ ... ],
  "signatures": [ ... ]
}
```

### 2.1 article

```json
{
  "id": "article_2025_11_24_001",
  "title": "Auto Sales Rev Up in October",
  "canonicalUrl": "https://news.example.com/articles/...",
  "contentHash": "sha256:...",
  "publishedAt": "2025-11-24T09:30:00Z",
  "language": "en",
  "tags": ["economy", "auto", "pakistan"]
}
```

- contentHash is a SHA-256 hash of the canonical article text
(after editors approve it).

### 2.2 sourceGraph

```json
{
  "nodes": [
    {
      "id": "src1",
      "type": "article",
      "title": "IMF 2025 World Economic Outlook",
      "url": "https://...",
      "hash": "sha256:...",
      "publishedAt": "2025-10-12"
    }
  ],
  "claims": [
    {
      "id": "claim-001",
      "text": "Pakistan's auto sales rose 32% year-on-year in October.",
      "sourceIds": ["src1", "src2"],
      "aiInvolved": true
    }
  ]
}
```

This allows downstream systems to trace each claim back to evidence.

### 2.3 aiInvolvement

```json
{
  "used": true,
  "roles": ["drafting", "language_polish"],
  "models": [
    {
      "name": "gpt-5.1",
      "provider": "openai",
      "temperature": 0.3,
      "tools": ["browser"]
    }
  ],
  "humanEditorResponsible": "editor_123"
}
```

CPP requires explicit disclosure of AI participation.

### 2.4 integrityAttestation

```json
{
  "mii": 0.973,
  "gi": 0.982,
  "ais": 0.961,
  "sentinelVerdict": "approve",
  "checkedDomains": ["facts", "hallucination"],
  "ledgerTx": "civic_ledger_tx_0xabc123",
  "signedBy": [
    "ed25519:reporter_pubkey",
    "ed25519:editor_pubkey",
    "ed25519:mobius_sentinel_pubkey"
  ]
}
```

- mii — Mobius Integrity Index snapshot (optional, when available)
- gi — Global Integrity score from Sentinels
- ais — Article Integrity Score from the Integrity Tier
- ledgerTx — Civic Ledger transaction id that anchors this envelope

### 2.5 revisionHistory

```json
[
  {
    "revisionId": "v1",
    "timestamp": "2025-11-24T10:15:00Z",
    "reason": "initial publication",
    "hash": "sha256:...",
    "ledgerTx": "0x111..."
  },
  {
    "revisionId": "v2",
    "timestamp": "2025-11-25T08:41:00Z",
    "reason": "corrected GDP figure",
    "hash": "sha256:...",
    "ledgerTx": "0x222..."
  }
]
```

Revisions never overwrite history; they append.

### 2.6 signatures

```json
[
  {
    "role": "newsroom",
    "publicKey": "ed25519:...",
    "signature": "base64:..."
  },
  {
    "role": "mobius_sentinel",
    "publicKey": "ed25519:mobius_pubkey",
    "signature": "base64:..."
  }
]
```

Signatures may be verified against the Civic Ledger or external key registries.

---

## 3. Integration with Mobius
- The Integrity Tier assembles an initial CPP envelope when
  `requiredAction === "auto_publish"`.
- The Civic Ledger stores the envelope or its hash and returns ledgerTx.
- Downstream publishers (Substack, websites, apps) should:
  - Embed a link or inline JSON for the CPP envelope.
  - Optionally render a trust widget (✓, ⚠, ✗) based on AIS and GI.

---

## 4. Roadmap
- v0.2: Formal key registry for signers (reporters, editors, sentinels).
- v0.3: Browser extension / verifier that reads CPP and displays a trust badge.
- v0.4: Federation spec for non-Mobius newsrooms.
- v1.0: Standardization effort (IETF-style draft).

---
