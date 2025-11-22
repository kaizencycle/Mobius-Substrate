# DVA Flows Overview

**Status:** Draft v0.1  
**Scope:** High-level map of the Dynamic Virtual Architecture (DVA) flow tiers that power Mobius Systems.

The DVA stack defines how Mobius coordinates AI engines, Sentinels, Civic Ledger, and human operators under constitutional guardrails. Each tier has a specific responsibility, and all flows remain orchestrator-agnostic.

---

## System Diagram

```mermaid
flowchart TD
    subgraph CLIENTS[Clients & Channels]
      U1[Web / App]
      U2[CLI / Tools]
      U3[City Nodes / Org Systems]
    end

    subgraph UNIVERSAL[Universal Orchestrator]
      W[Webhook /mobius/universal]
      B[Thought Broker<br/>/v1/deliberate]
      GIGI[GI Gate >= 0.95]
      LATT[Ledger Attest<br/>/ledger/attest]
      HH[Human Review Router]
    end

    subgraph LITE[DVA.LITE<br/>Monitoring Tier]
      ML[Monitor Broker & Ledger]
      AD[Anomaly Dashboard]
    end

    subgraph ONE[DVA.ONE<br/>Feedback & Learning]
      FB[Feedback Webhook<br/>/dva/one/feedback]
      LL[Learning Loop]
    end

    subgraph FULL[DVA.FULL<br/>Multi-Agent Tier]
      MA[Multi-Agent Orchestrator]
      RC[Recovery Protocol]
    end

    subgraph HIVE[DVA.HIVE<br/>Network Tier]
      HC[Consensus Topology]
      HG[Global Attestation]
    end

    subgraph LEDGER[Civic Ledger]
      LS[Stats / GI]
      LA[Attestations]
      LE[Events (Feedback, Proposals)]
    end

    CLIENTS --> W
    W --> B
    B --> GIGI
    GIGI -->|high GI| LATT
    GIGI -->|low GI or human_required| HH

    LATT --> LEDGER
    HH --> ONE

    LITE --> ML
    ML --> AD
    ML --> LEDGER

    ONE --> FB
    ONE --> LL
    LL --> LEDGER

    FULL --> MA
    FULL --> RC
    MA --> B
    RC --> ONE

    HIVE --> HC
    HC --> HG
    HG --> LEDGER
```

---

## Tier Responsibilities

- **Universal** — Master orchestrator routing user tasks → Thought Broker → Sentinels → GI gate → Ledger → output channels.
- **DVA.LITE** — Observability tier that measures uptime, latency, GI trends, and raises anomalies without changing behavior.
- **DVA.ONE** — Human-feedback collection plus nightly learning loops that turn overrides into proposals for Sentinel refinement.
- **DVA.FULL** — Multi-agent coordination, planning, and recovery for complex, long-running tasks.
- **DVA.HIVE** — Cross-node governance that aggregates integrity metrics and publishes global attestations.
- **Templates** — Standardized scaffolding for any future flow while preserving constitutional invariants.

For implementation details, see `infra/dva/flows/`.

