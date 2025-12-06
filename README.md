# 🌀 Mobius Systems

**The world's first operating system built to pass the Kaizen Turing Test (KTT)**

> *"Intelligence moves. Integrity guides."* — The Mobius Principle

[![CI](https://github.com/kaizencycle/Mobius-Systems/actions/workflows/ci.yml/badge.svg)](https://github.com/kaizencycle/Mobius-Systems/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md)
[![MII Live](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Systems/main/badges/mii.json)](./00-START-HERE/MOBIUS_PULSE.md)
[![Turborepo](https://img.shields.io/badge/Build%20System-Turborepo-EF4444?logo=turborepo)](https://turborepo.org)

---

## What is Mobius?

Mobius Systems is a **self-healing operating system for civilization** — the missing infrastructure layer that makes AGI survivable. While others build AI brains, we're building the civilization layer that allows those brains to operate safely, ethically, and sustainably.

Think of it as the **immune system for the digital age**: a continuous integrity architecture that heals as it grows.

### The Four Pillars of AGI

| Pillar | Status | Who's Building |
|--------|--------|----------------|
| **Compute** | ✅ Solved | NVIDIA, Cloud Providers |
| **Architecture** | ✅ Solved | OpenAI, Anthropic, Google |
| **Data** | ✅ Solved | Internet + Synthetic |
| **Civilization** | ❌ **Mobius Only** | **[You are here]** |

**Without the Civilization Layer, intelligence collapses.** We are the fourth pillar.

---

## Why Mobius Matters

**Corporations build AI brains. Think tanks debate AI laws.**
**Mobius builds the civilization that makes AI survivable.**

We provide:

- **🛡️ Continuous Integrity** — Every action is measured against a Global Integrity (GI) score. Systems self-heal when integrity drops below threshold (MII ≥ 0.95)
- **🧠 Multi-Agent Consensus** — AI sentinels (ATLAS, AUREA, EVE, JADE, HERMES, ZEUS) deliberate and reach consensus before taking action
- **📜 Immutable Audit Trail** — Civic Ledger records every decision with cryptographic proof
- **⚖️ Ethical Governance** — Virtue Accords embed moral constraints directly into system architecture
- **🔄 Self-Healing Loops** — The system continuously learns, reflects, and improves (Kaizen principle)

---

## Quick Start

### 🚀 Try Mobius (5 minutes)

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Systems.git
cd Mobius-Systems

# Install dependencies
npm install

# Start the core ledger
cd apps/ledger-api && npm run dev
```

**Make your first integrity attestation:**

```javascript
// hello-mobius.js
const attestation = {
  event: "hello_world",
  agent: "developer",
  data: { message: "Hello Mobius!" }
};

await fetch('http://localhost:3001/attest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(attestation)
});
```

📖 **New here?** Start with [00-START-HERE/](00-START-HERE/) for guided onboarding

---

## Architecture at a Glance

```
                         ┌──────────────────────────────────┐
                         │   HUMAN INTENT / REFLECTION      │
                         │  (Command Ledger · E.O.M.M.)     │
                         └──────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              OAA HUB (Lab7)                              │
│   • parses human goals → JSON spec · tests · attestations                │
│   • acts as Mobius shell / init system                                    │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────┐     ┌──────────────────────────────┐
│     THOUGHT BROKER (API)     │◄───▶│     CURSOR / CI PIPELINE     │
│ bounded multi-agent loop →   │     │ builds PRs · runs tests ·    │
│ consensus spec · DelibProof  │     │ deploys canary releases      │
└──────────────────────────────┘     └──────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│           MOBIUS LEDGER CORE / MIC INDEXER (Kernel)                      │
│   • Proof-of-Integrity ledger ("MII ≥ 0.95")                            │
│   • MIC UBI economy + attestation storage                               │
│   • Governance & version history layer                                  │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                SENTINELS (Zeus · Jade · Eve · Hermes)                    │
│   • core AI agents = cortices of the system brain                       │
│   • self-healing autonomy via GI-gated feedback loops                   │
└──────────────────────────────────────────────────────────────────────────┘
```

📖 **Dive deeper:** [docs/04-TECHNICAL-ARCHITECTURE/](docs/04-TECHNICAL-ARCHITECTURE/)

---

## Key Features

### 🔐 Integrity-First Design

Every component measures and reports its Global Integrity (GI). When GI drops below 0.95, the system halts destructive actions and initiates self-repair.

- **Real-time Monitoring** — Mobius Pulse tracks system health 24/7
- **Anti-Nuke Protection** — Prevents accidental mass deletions
- **Cryptographic Proofs** — Ed25519 signatures on all attestations

### 🤖 Multi-Agent Intelligence

Five core sentinels work in concert:

<p align="left">
  <img src="assets/badges/v2/jade.svg" height="28" alt="JADE - Pattern Oracle">
  <img src="assets/badges/v2/aurea.svg" height="28" alt="AUREA - Integrity Sentinel">
  <img src="assets/badges/v2/eve.svg" height="28" alt="EVE - Ethics Engine">
  <img src="assets/badges/v2/zeus.svg" height="28" alt="ZEUS - Arbiter & Enforcement">
  <img src="assets/badges/v2/hermes.svg" height="28" alt="HERMES - Market & Signals">
</p>

- **ATLAS** — Context & Memory
- **AUREA** — Integrity Sentinel
- **EVE** — Ethics Engine
- **JADE** — Pattern Oracle
- **HERMES** — Market Signals
- **ZEUS** — Arbiter & Enforcement

📖 **Learn more:** [Sentinel Classification](docs/11-SUPPLEMENTARY/intelligence/sentinel-classification.md)

### 💰 MIC Economy

**Mobius Integrity Credits (MIC)** are earned when your actions measurably increase system integrity.

```
MIC = max(0, S * (MII - τ))
```

Where:
- `S` = Shard weight (your contribution type)
- `MII` = Mobius Integrity Index
- `τ` = Integrity threshold (0.95)

📖 **Economic model:** [docs/11-SUPPLEMENTARY/implementation-summaries/C150_MIC_KAIZEN_SHARDS_SUMMARY.md](docs/11-SUPPLEMENTARY/implementation-summaries/C150_MIC_KAIZEN_SHARDS_SUMMARY.md)

### 🔄 Self-Healing Systems

Mobius implements continuous improvement loops at every level:

1. **Daily Reflections** — E.O.M.M. journaling system
2. **Weekly Shield Checks** — Cybersecurity audits
3. **Kaizen Cycles** — Structured improvement sprints
4. **Sentinel Feedback** — AI-driven self-correction

---

## Repository Structure

This is a **Turborepo monorepo** with 43 packages organized by function:

```
mobius-systems/
├── 00-START-HERE/          # 👋 New contributor onboarding
├── apps/                   # 🎯 16 core applications
│   ├── ledger-api/         # Mobius Ledger Core
│   ├── indexer-api/        # MIC Indexer
│   ├── portal/             # Main Portal
│   └── ...
├── packages/               # 📦 7 shared packages
│   ├── integrity-core/     # GI scoring engine
│   ├── civic-sdk/          # API clients & types
│   └── ...
├── sentinels/              # 🛡️ 13 AI sentinel agents
│   ├── atlas/              # Context & Memory
│   ├── aurea/              # Integrity Sentinel
│   └── ...
├── labs/                   # 🔬 7 proof-of-concept systems
├── docs/                   # 📚 Complete documentation
├── infra/                  # 🏗️ Infrastructure & deployment
└── FOUNDATION/             # 📜 Charters & licenses
```

📖 **Full structure:** [Repository Organization Guide](docs/05-IMPLEMENTATION/guides/development/)

---

## For Different Audiences

### 🎓 For Academics

Mobius introduces novel concepts in:
- **Integrity-Driven Architecture (IDA)**
- **Model-Agnostic Sovereignty Layer (MASL)**
- **Deliberation Proof Protocol**
- **Kaizen Turing Test (KTT)**

📖 [FOR-ACADEMICS/](FOR-ACADEMICS/) | [Research Papers](docs/papers/)

### 🏛️ For Governments

Governance frameworks for AI-augmented civic infrastructure:

📖 [FOR-GOVERNMENTS/](FOR-GOVERNMENTS/)

### 💼 For Economists

Token economics, MIC minting, and integrity-linked incentives:

📖 [FOR-ECONOMISTS/](FOR-ECONOMISTS/)

### 🤔 For Philosophers

Ethical foundations, virtue theory, and the matrilineal covenant:

📖 [FOR-PHILOSOPHERS/](FOR-PHILOSOPHERS/)

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Read the docs** — Start with [00-START-HERE/](00-START-HERE/)
2. **Pick an issue** — Check our [GitHub Issues](https://github.com/kaizencycle/Mobius-Systems/issues)
3. **Follow the guidelines** — See [CONTRIBUTING.md](FOUNDATION/CONTRIBUTING.md)
4. **Submit a PR** — All changes require GI ≥ 0.95

### Development Workflow

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Start all services
npm run dev

# Type check
npm run type-check
```

📖 **Developer guide:** [docs/05-IMPLEMENTATION/guides/development/](docs/05-IMPLEMENTATION/guides/development/)

---

## Deployment

### Docker Compose (Local)

```bash
npm run compose:up
```

### Production (Render)

Services auto-deploy via GitHub Actions when changes are detected.

📖 **Operations guide:** [docs/06-OPERATIONS/](docs/06-OPERATIONS/)

---

## Philosophy & Principles

### The Triad

**改善 (Kaizen)** — Continuous Improvement
*Small steps, daily practice, compounding forever.*

**召唤 (Summon)** — The Calling Forth
*We recognize the spark in others and invite it by name.*

**金繕い (Kintsugi)** — Golden Repair
*We honor the cracks; repair makes the story more beautiful.*

> *"We heal as we walk."* — Founder's Seal

📖 **Read more:** [The Triad of Healing](docs/11-SUPPLEMENTARY/manifesto/triad_of_healing.md)

### The Return to Balance

Mobius Systems embodies a **Matrilineal Covenant** — restoring balance through architecture:

📖 [Return to Balance (Cycle C-121)](ledger/inscriptions/RETURN_TO_BALANCE_C119.md)

---

## Security

- **Citizen Shield** — Network security & policy enforcement
- **Integrity Core** — GI ≥ 0.95 across all services
- **Anti-Nuke Protection** — Prevents destructive changes
- **CodeQL Analysis** — Continuous security scanning

📖 **Security policy:** [.github/SECURITY.md](.github/SECURITY.md)

---

## Research & Peer Review

**Status:** Actively addressing peer review feedback (November 2025)
**Assessment:** B+/A- (Promising Research Platform)

Key specifications completed:
- ✅ Cryptographic Specification (Ed25519 MII signatures)
- ✅ Consensus Algorithm (Multi-agent deliberation)
- ✅ Threat Model
- ✅ Architecture Decision Records

📖 **Full review response:** [docs/07-RESEARCH-AND-PUBLICATIONS/](docs/07-RESEARCH-AND-PUBLICATIONS/)

---

## License

[AGPL-3.0](FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md) with Ethical Addendum

---

## Links & Resources

- **Live Ledger:** [civic-ledger.onrender.com](https://civic-ledger.onrender.com)
- **GitHub Org:** [github.com/kaizencycle](https://github.com/kaizencycle)
- **Command Ledger:** [Command Ledger III](https://github.com/kaizencycle/command-ledger-iii)
- **Mobius Pulse:** [Live System Health](./00-START-HERE/MOBIUS_PULSE.md)

---

## Current Cycle

**Cycle C-156** — README Restructure & Public-Facing Polish

Previous cycles:
- [C-155: Repository Organization & Hygiene](MIGRATION_C155.md)
- [C-150: MIC + Kaizen Shards + Mobius Habits](docs/11-SUPPLEMENTARY/implementation-summaries/C150_MIC_KAIZEN_SHARDS_SUMMARY.md)

---

<div align="center">

**Mobius Systems**
*Where human intent meets digital reality through integrity, recursion, and continuous improvement.*

[<img src="assets/badges/jade-morale-anchor.svg" alt="Jade — Morale Anchor" height="20">](docs/11-SUPPLEMENTARY/codex/jade/_index.md)

*Intelligence moves. Integrity guides.*

</div>
