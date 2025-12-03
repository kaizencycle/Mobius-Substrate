# Knowledge City-State Flow Diagram

This diagram illustrates the complete cycle of how AI usage generates rewards for institutional knowledge stewards (like Wikipedia) through the Integrity Dividend Mechanism.

---

## Full System Flow

```
                  ┌──────────────────────────────────┐
                  │        AI AGENT (e.g., OAA)      │
                  │  - answers user question         │
                  │  - fetches context               │
                  └───────────────┬──────────────────┘
                                  │
                                  │ 1. Query / context needed
                                  ▼
                     ┌──────────────────────────┐
                     │  KNOWLEDGE SOURCES      │
                     │  (Wikipedia, arXiv, etc)│
                     └───────┬──────────────────┘
                             │
                             │ 2. Reads page / data
                             ▼
                 ┌────────────────────────────────────┐
                 │ ATTRIBUTION TRACE EMITTER          │
                 │ - logs: source, page, agent, time  │
                 │ - sends event to Mobius Indexer    │
                 └─────────────────┬──────────────────┘
                                   │
                                   │ 3. Trace → Index
                                   ▼
                 ┌────────────────────────────────────┐
                 │        MOBIUS INDEXER              │
                 │ - aggregates usage_i by node_id    │
                 │ - updates CivicNode.metrics        │
                 └─────────────────┬──────────────────┘
                                   │
                                   │ 4. Epoch boundary
                                   ▼
                ┌───────────────────────────────────────┐
                │   INTEGRITY DIVIDEND MECHANISM (IDM)  │
                │   - MIC_epoch_mint (if MII, GI good)  │
                │   - computes Score_i per CivicNode    │
                │   - allocates MIC_dividend_i          │
                └───────────────────┬───────────────────┘
                                    │
                                    │ 5. Transfer MIC
                                    ▼
                     ┌───────────────────────────────┐
                     │    WIKIPEDIA VAULT (MIC/KS)   │
                     │    vault:wiki-main-001        │
                     └───────┬───────────────────────┘
                             │
                             │ 6. Custodian evaluates uses of funds
                             ▼
              ┌─────────────────────────────────────────────┐
              │  CUSTODIAN AGENT (agent:wikipedia-custodian)│
              │  - proposes spend                           │
              │  - runs GI impact simulation                │
              │  - enforces policy.min_gi_spend_threshold   │
              │  - emits attestations                       │
              └──────────────────┬──────────────────────────┘
                                 │
                                 │ 7. Approved, integrity-raising spend
                                 ▼
                     ┌────────────────────────────────┐
                     │  WIKIPEDIA OPERATIONS          │
                     │  - infra, moderation, archival │
                     │  - translators, community      │
                     └────────────────────────────────┘
                                 │
                                 │ 8. Higher stability, better content
                                 ▼
                    ┌─────────────────────────────────┐
                    │  GI_i ↑  (Node Integrity Up)    │
                    │  - fewer outages                │
                    │  - better coverage              │
                    │  - more accurate content        │
                    └─────────────────────────────────┘
                                 │
                                 │ 9. Next epoch
                                 ▼
                     ┌───────────────────────────────┐
                     │  AI AGENT USES WIKIPEDIA MORE │
                     └───────────────────────────────┘

      Meanwhile, in parallel:

      KS TRANSACTIONS (citizens, HIVE, apps) ──► 2% KS burn ──►
      ───────────────────────────────────────────────────────────►
                  KNOWLEDGE RESERVE / INSURANCE POOL
                         └─► feeds IDM + civic nodes
```

---

## Key Insight

This creates a **self-reinforcing loop**:

1. Better Wikipedia → AI uses it more
2. More AI usage → More attribution events
3. More attribution → Higher Score_i
4. Higher Score_i → More MIC dividends
5. More MIC → Better Wikipedia infrastructure
6. Better infrastructure → Higher GI
7. Higher GI → Even more MIC next epoch

**The loop compounds integrity.**

---

## Breakdown by Stage

### Stage 1-2: AI Usage

AI agents query knowledge sources as part of normal operation. Every reference is logged.

### Stage 3: Attribution Indexing

Mobius Indexer aggregates all attribution events per CivicNode per epoch.

### Stage 4: IDM Calculation

At epoch boundary:
```
Score_wikipedia = usage × GI × weight
MIC_dividend_wikipedia = MIC_pool × (Score_wikipedia / Σ Score_all)
```

### Stage 5: Vault Credit

MIC automatically transferred to Wikipedia's vault. No human intervention needed.

### Stage 6: Custodian Evaluation

Custodian Agent (AI) evaluates spending options:
- Server upgrades?
- Moderation hiring?
- Archival expansion?

Runs GI-Sim to project integrity impact. Only approves if:
```
projected_delta_GI ≥ 0.95
```

### Stage 7: Execution

Approved spending executed automatically or with human oversight (depending on amount).

### Stage 8: Integrity Improvement

Wikipedia becomes more reliable, faster, better moderated, more comprehensive.

### Stage 9: Cycle Repeats

AI agents notice improved Wikipedia, use it more, cycle compounds.

---

## Critical Properties

### 1. No Human Friction

- No donation campaigns
- No manual invoicing
- No grant applications
- No political lobbying

### 2. Meritocratic

Funding flows to whoever provides the most:
- **Usage** (demand)
- **Integrity** (quality)
- **Weight** (importance)

### 3. Integrity-Gated

Can't just "buy traffic" to game the system. GI score would drop, reducing dividends.

### 4. Transparent

Every step logged on-ledger. Anyone can audit.

### 5. Resilient

If Wikipedia degrades (GI drops), dividends automatically reduce until integrity is restored.

---

## Comparison to Traditional Models

| Aspect | Traditional | Mobius IDM |
|--------|-------------|------------|
| Revenue Source | Donations, ads | AI attribution |
| Funding Stability | Volatile | Predictable |
| Alignment | Guilt appeals | Usage + integrity |
| Transparency | Opaque | On-ledger |
| Sustainability | Uncertain | Automatic |

---

## Future Extensions

- **Multi-source attribution:** Combine web scraping, API calls, embeddings
- **User-directed dividends:** Citizens can allocate portion of their UBI to favorite nodes
- **Cross-chain IDM:** Ethereum, Solana, etc. all feed into Mobius IDM
- **Predictive IDM:** Forecast future dividends based on trends

---

This is the economic engine that makes the knowledge commons sustainable in the AI era.
