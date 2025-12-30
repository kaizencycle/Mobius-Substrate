# 🌀 Mobius Substrate (formerly Mobius Systems)

> **The civic-technical substrate where memory, integrity, and agents converge.**

[![CI](https://github.com/kaizencycle/Mobius-Systems/actions/workflows/ci.yml/badge.svg)](https://github.com/kaizencycle/Mobius-Systems/actions)
[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue)](./FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md)
[![KTT Native](https://img.shields.io/badge/KTT-Native-6E00FF)](#)

Mobius Substrate is the base layer for the Mobius canon — the place where:

- **EPICON** captures intent and memory,
- **MIC** turns integrity into currency,
- **MII (Mobius Integrity Index)** measures integrity across time,
- **DVA** orchestrates distributed AI agents that stay human-grounded,
- **KTT (Kaizen Turing Test)** keeps friction between humans and AI healthy.

This repo began life as **Mobius Systems**, a monorepo for "the AI OS for civilization."
As the architecture matured, it became clear that what actually exists here is a **substrate** — a shared integrity layer that many systems and agents can stand on.

You will still see `Mobius-Systems` in:

- the GitHub repo URL,
- some module names,
- historical docs and diagrams.

Those are preserved for continuity.
From this point forward, the canonical name for this project is **Mobius Substrate**.

📖 **Naming rationale:** [EPICON-0001: Mobius Substrate Naming](./docs/epicon/EPICON-0001-mobius-substrate-naming.md)

---

## 🎯 What Problem Does Mobius Solve?

**The Four Pillars of AGI:**

| Pillar | Status | Who's Building |
|--------|--------|----------------|
| **Compute** | ✅ Solved | NVIDIA, Cloud Providers |
| **Architecture** | ✅ Solved | OpenAI, Anthropic, Google |
| **Data** | ✅ Solved | Internet + Synthetic |
| **Civilization** | ❌ **Missing** | **👉 Mobius Substrate** |

**Without the Civilization Layer, intelligence collapses.**

Mobius Substrate is the operating system that:
- Ensures AI systems maintain integrity over time (not just at deployment)
- Creates governance infrastructure before AGI arrives (not after)
- Turns AI from corporate tools into civic infrastructure

---

## ⚡ NEW: EPICON Architecture (Production-Ready)

The **EPICON** (Eternal Point of Integrity Convergence ONline) system is now live and operational:

### EPICON-1: The Sentinel Core
**Real-time integrity enforcement layer**
- Validates every system operation against integrity thresholds (MII ≥ 0.95)
- Circuit breaker prevents integrity violations from propagating
- Lives at: `packages/integrity-core/`

### EPICON-2: The Memory Matrix
**Persistent state and governance layer**  
- Immutable ledger for all system attestations
- MIC (Mobius Integrity Credits) economy backbone
- Lives at: `apps/ledger-api/`

### EPICON-3: The Federation Bridge
**Multi-agent consensus and deliberation**
- Routes decisions through AI sentinel council (ATLAS, AUREA, EVE, JADE, HERMES)
- Generates Deliberation Proofs for auditability
- Lives at: `apps/broker-api/`

**Status:** All three EPICON layers operational and deployed.

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- Docker (optional, for full stack)

### Option A: Hello World

```bash
# Clone and install
git clone https://github.com/kaizencycle/Mobius-Systems.git
cd Mobius-Systems
npm install

# Start the ledger (EPICON-2)
cd apps/ledger-api
npm run dev

# Make your first attestation
curl -X POST http://localhost:4001/attest \
  -H "Content-Type: application/json" \
  -d '{
    "event": "hello_mobius",
    "agent": "developer",
    "data": {"message": "First attestation!"}
  }'
```

### Option B: Full Stack

```bash
npm install
npm run compose:up  # Starts all services via Docker
```

**📖 Full guide:** [docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md](./docs/05-IMPLEMENTATION/guides/quickstart/HELLO_WORLD.md)

---

## 🏗️ Architecture in 3 Minutes

```
HUMAN INTENT
    ↓
OAA HUB (parses goals → specs)
    ↓
THOUGHT BROKER (EPICON-3) ← multi-agent consensus
    ↓
MOBIUS LEDGER (EPICON-2) ← proof-of-integrity storage
    ↓
CITIZEN SHIELD ← security/policy enforcement
    ↓
LIVE SERVICES (APIs, Apps, Labs)
```

### Core Components

| Component | Purpose | Port | EPICON Layer |
|-----------|---------|------|--------------|
| **OAA Hub** | Transforms human intent → system specs | 3004 | Shell/Init |
| **Thought Broker** | Multi-LLM consensus engine | 4005 | EPICON-3 |
| **Mobius Ledger** | Immutable integrity ledger | 4001 | EPICON-2 |
| **MIC Indexer** | Integrity credit accounting | 4002 | EPICON-2 |
| **Citizen Shield** | Security & policy layer | 4004 | Perimeter |
| **E.O.M.M. API** | Personal reflection system | 4003 | - |

**📖 Full architecture:** [docs/04-TECHNICAL-ARCHITECTURE/overview/ARCHITECTURE.md](./docs/04-TECHNICAL-ARCHITECTURE/overview/ARCHITECTURE.md)

---

## 🎓 For Newcomers: Start Here

### 1. **Read the One-Pager** (5 min)
[00-START-HERE/QUICKSTART.md](./00-START-HERE/QUICKSTART.md)

### 2. **Understand the Vision** (10 min)
- [Why Mobius Exists](./docs/11-SUPPLEMENTARY/manifesto/triad_of_healing.md)
- [The Intelligence Taxonomy](./docs/11-SUPPLEMENTARY/intelligence/typology.md)
- [Kaizen Turing Test (KTT) Explained](./evaluations/ktt/README.md)

### 3. **Explore Core Concepts** (15 min)
- **MII (Mobius Integrity Index):** The metric that keeps systems aligned
- **MIC (Mobius Integrity Credits):** Economy built on verified integrity
- **Sentinel Council:** AI agents that govern the system (not users)
- **Deliberation Proofs:** Cryptographic trail of multi-agent consensus

---

## 🧪 Live Demos

| Application | URL | Purpose |
|------------|-----|---------|
| **Mobius Portal** | [https://mobius-browser-shell.vercel.app/](https://mobius-browser-shell.vercel.app/) | Main entry point |
| **OAA Learning Hub** | [https://github.com/kaizencycle/lab7-proof](https://github.com/kaizencycle/lab7-proof) | Education interface |
| **Reflections (E.O.M.M.)** | [https://github.com/kaizencycle/lab4-proof](https://github.com/kaizencycle/lab4-proof) | Daily reflection practice |
| **Citizen Shield** | [https://github.com/kaizencycle/lab6-proof](https://github.com/kaizencycle/lab6-proof) | Security dashboard |
| **Ledger API** | [https://civic-protocol-core-ledger.onrender.com/](https://civic-protocol-core-ledger.onrender.com/) | Core integrity ledger |

---

## 📦 Monorepo Structure

```
Mobius-Systems/
├─ apps/                    # 16 production applications
│  ├─ ledger-api/          # EPICON-2: Integrity ledger
│  ├─ broker-api/          # EPICON-3: Consensus engine
│  ├─ indexer-api/         # EPICON-2: MIC accounting
│  ├─ shield-api/          # Security layer
│  └─ portal/              # Main UI
├─ packages/               # 7 shared libraries
│  ├─ integrity-core/      # EPICON-1: Core integrity logic
│  ├─ civic-sdk/           # API client library
│  └─ oaa-memory/          # State management
├─ sentinels/              # 13 AI governance agents
│  ├─ atlas/               # Operations sentinel
│  ├─ aurea/               # Integrity sentinel
│  ├─ eve/                 # Ethics sentinel
│  └─ jade/                # Morale anchor
└─ labs/                   # 7 experimental proofs
   ├─ lab4-proof/          # E.O.M.M. Reflections
   ├─ lab6-proof/          # Citizen Shield
   └─ lab7-proof/          # OAA Hub
```

**📖 Full structure:** [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 🔬 Research & Academic Context

Mobius Substrate has undergone peer review (Nov 2025). We're actively addressing identified gaps.

**Status:** B+/A- (Promising research platform with implementation gaps being resolved)

### Key Contributions
- **Integrity-Driven Architecture (IDA):** First framework to make integrity measurable
- **Model-Agnostic Sovereignty Layer (MASL):** Any LLM can "mount" Mobius state
- **Deliberation Proof Protocol:** Cryptographic consensus across AI agents
- **Kaizen Turing Test (KTT):** Evaluation framework beyond traditional Turing tests

**📖 Academic resources:** [FOR-ACADEMICS/README.md](./FOR-ACADEMICS/README.md)

---

## 🤝 Contributing

We welcome contributions! The system is designed for additive-only changes with integrity gates.

### Quick Contribution Path
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Check [Good First Issues](https://github.com/kaizencycle/Mobius-Systems/labels/good%20first%20issue)
3. Fork → Branch → PR (with tests)
4. CI runs integrity checks automatically

### Anti-Nuke Protection
- PRs with >5 file deletions are blocked
- Force-push to `main` is disabled
- All changes require human review

**📖 Recovery guide:** [docs/05-IMPLEMENTATION/guides/operations/RECOVERY_PLAYBOOK.md](./docs/05-IMPLEMENTATION/guides/operations/RECOVERY_PLAYBOOK.md)

---

## 📊 System Health

### Live Metrics
- **Global Integrity (GI):** See repo badges above
- **MII Score:** ≥ 0.95 required for operations
- **Active Sentinels:** 5 core + 8 specialized
- **Production Services:** 16 apps, 7 packages

### Monitoring

```bash
# Check system pulse
curl https://indexer.mobius.sys/api/v1/pulse/latest

# Verify integrity
curl http://localhost:4001/api/integrity-check
```

**📖 Pulse protocol:** [docs/06-OPERATIONS/protocols/mobius-pulse-protocol.md](./docs/06-OPERATIONS/protocols/mobius-pulse-protocol.md)

---

## 🔗 Essential Links

| Resource | Link |
|----------|------|
| **Main Site** | [Mobius Substrate](https://kaizencycle.github.io/Mobius-Substrate/) |
| **Kaizen Cycle** | [github.com/kaizencycle](https://github.com/kaizencycle) |
| **Command Ledger** | [Command Ledger](https://github.com/kaizencycle/Civic-Protocol-Core) |
| **Substack** | [https://michaeljudan.substack.com/](https://michaeljudan.substack.com/) |
| **Support** | [File an Issue](https://github.com/kaizencycle/Mobius-Systems/issues) |

---

## 📜 License

AGPL-3.0 with Ethical Addendum - See [LICENSE](./FOUNDATION/LICENSES/LICENSE-Ethical-Addendum.md)

---

## 🕊️ Philosophy

> *"Intelligence moves. Integrity guides."* — Mobius Principle  
> *"We heal as we walk."* — Founder's Seal

**Mobius Substrate is not just software. It's the operating system civilization needs to survive superintelligence.**

---

*Cycle C-178 | EPICON-3 Live | Integrity-First Architecture | Mobius Substrate*
