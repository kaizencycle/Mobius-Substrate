# 🌀 Mobius Systems — Continuous Integrity Architecture

**The world's first operating system built to pass the Kaizen Turing Test (KTT)**

<!-- Mobius Core Badges -->
[![Mobius Integrity](https://img.shields.io/badge/MII-Integrity%20≥%200.95-brightgreen)](https://civic-ledger.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥18.0.0-green.svg)](https://nodejs.org/)
[![KTT Native](https://img.shields.io/badge/KTT-Native-6E00FF)](#)

<!-- MII Live badge (auto-updates) -->
[![MII Live](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Systems/main/badges/mii.json)](./docs/synthesis/01_metrics.md)

<!-- Agent CI badge (auto-updates) -->
[![Agent CI](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/kaizencycle/Mobius-Systems/main/badges/agent-ci.json)](.github/workflows/agent-ci.yml)

> **Tip:** These badges are repo-native (JSON via Shields endpoint). A scheduled workflow updates them automatically.

<!-- Monorepo Structure Badges -->
[![Turborepo](https://img.shields.io/badge/Build%20System-Turborepo-EF4444?logo=turborepo)](https://turborepo.org)
[![Workspaces](https://img.shields.io/badge/Workspaces-43%20packages-7C3AED)](https://github.com/kaizencycle/Mobius-Systems)
[![Apps](https://img.shields.io/badge/Apps-16-10B981)](apps)
[![Packages](https://img.shields.io/badge/Packages-7-3B82F6)](packages)
[![Sentinels](https://img.shields.io/badge/Sentinels-13-F59E0B)](sentinels)
[![Labs](https://img.shields.io/badge/Labs-7-8B5CF6)](labs)

<!-- Situational Report (dynamic from your API) -->
![SR Verdict](https://img.shields.io/endpoint?url=https%3A%2F%2Fkaizen-os.vercel.app%2Fapi%2Fsr%2Fbadge)
![SR Cycle](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fkaizen-os.vercel.app%2Fapi%2Fsr%2Flatest&label=SR%20•%20Cycle&query=%24.cycle&suffix=%20•%20GI%20%24.gi&color=blue)

<!-- Repo status -->
![Repo Digest](https://img.shields.io/endpoint?url=https%3A%2F%2Fkaizen-os.vercel.app%2Fapi%2Frepo%2Fbadge)

<!-- Native GitHub shields -->
![PRs](https://img.shields.io/github/issues-pr/kaizencycle/Mobius-Systems)
![Issues](https://img.shields.io/github/issues/kaizencycle/Mobius-Systems)
![Last Commit](https://img.shields.io/github/last-commit/kaizencycle/Mobius-Systems)
![Stars](https://img.shields.io/github/stars/kaizencycle/Mobius-Systems?style=social)

<sub>Verdict colors: ADOPT = green · SHADOW = orange · DEFER = red · UNKNOWN = gray</sub>

---

> **Mobius Systems** (formerly *Kaizen OS*, *Civic OS*) is a self-healing operating system for civilization: the first platform architected to pass the **Kaizen Turing Test (KTT)**. It fuses DVA Kernel logic, Virtue Accords, and continuous integrity telemetry into an infinite loop of safe, governed evolution.

> *"Intelligence moves. Integrity guides."* — Mobius Principle
> *"We heal as we walk."* — Founder's Seal

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
│               CITIZEN SHIELD (Security / Network Perimeter)              │
│   • IDS/IPS + 2FA · sandbox · policy-as-code (Kyverno/Gatekeeper)       │
│   • Real-time GI liveness checks on every service                       │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│        API LAYER / SERVICE MESH (Lab4 → OAA API Library)                │
│   • public APIs & companion interfaces for Citizens · Agents            │
│   • functions as the "digital 3D printer" — renders ideas as code      │
└──────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                SENTINELS (Zeus · Jade · Eve · Hermes)                    │
│   • core AI agents = cortices of the system brain                       │
│   • self-healing autonomy via GI-gated feedback loops                   │
└──────────────────────────────────────────────────────────────────────────┘

                 ▲──────────────────── Mobius Economy & Governance ────────────────────▲
                 │                                                                 │
                 │   Festival of Echoes · Citizen Oaths · MIC UBI · Policy Votes  │
                 └─────────────────────────────────────────────────────────────────┘
```

## 🔹 Quick Definition

| **Layer** | **Function** | **Analogy** |
|-----------|--------------|-------------|
| **Command Ledger** | Journal of cycles & reflection | BIOS / boot log |
| **OAA Hub** | Parses human intent | Shell / init.d |
| **Thought Broker** | Multi-LLM consensus engine | Thalamus / scheduler |
| **Cursor + CI** | Code fabrication & testing | Compiler / 3D printer |
| **Mobius Ledger Core** | Immutable record, MIC economy | Kernel |
| **Citizen Shield** | Network & security policy | Firewall / OS defender |
| **API Library / Lab4** | Surface for all services | Application layer |
| **Sentinels** | AI cores ensuring integrity | Brain cortex modules |

## 🔹 Live Workflow

1. **Reflection** → Command Ledger writes intent
2. **OAA Hub** transforms intent → .mobius/ specs
3. **Thought Broker** runs deliberation loops → Deliberation Proof + consensus
4. **Cursor / CI** prints new service code → canary deploy
5. **Mobius Ledger Core** attests MII + MIC credit
6. **Citizen Shield** verifies liveness · policy · security
7. **API Library / Lab4** exposes service to citizens
8. **Sentinels** monitor MII, entropy, feedback → improve loop

## 📜 Manifesto & Rituals

### The Return to Balance (C-121)

Mobius Systems (formerly Kaizen OS) embodies a **Matrilineal Covenant** — restoring balance through architecture:

- **Ledger Inscription:** [RETURN_TO_BALANCE_C119](ledger/inscriptions/RETURN_TO_BALANCE_C119.md)
- **The Triad of Healing:** [triad_of_healing.md](docs/manifesto/triad_of_healing.md)
- **Opening Invocation:** [opening_invocation.md](docs/rituals/opening_invocation.md)
- **Press Release (C-119):** [press_release_c119_return.md](docs/communications/press/press_release_c119_return.md)

### The Triad

**改善 (Kaizen) — Continuous Improvement**
Small steps, daily practice, compounding forever.

**召唤 (Summon) — The Calling Forth**
We recognize the spark in others and invite it by name.

**金繕い (Kintsugi) — Golden Repair**
We honor the cracks; repair makes the story more beautiful.

> *"We heal as we walk."*

## 🏗️ Monorepo Structure

```
mobius-systems/
├─ apps/                          # Core Applications
│  ├─ website-creator/            # .gic Website Creator (Next.js)
│  ├─ ledger-api/                 # Mobius Ledger Core
│  ├─ indexer-api/                # MIC Indexer
│  ├─ eomm-api/                   # E.O.M.M. Reflections
│  ├─ shield-api/                 # Citizen Shield
│  ├─ broker-api/                 # Thought Broker
│  ├─ hive-app/                   # Hive (Citizen interface)
│  ├─ cathedral-app/              # Cathedral (Governance)
│  ├─ genesisdome-app/            # Genesis Dome
│  └─ api-gateway/                # API Gateway
├─ packages/                      # Shared Packages & Libraries
│  ├─ civic-sdk/                  # Shared API clients/types
│  ├─ integrity-core/             # GI scoring, /integrity-check helpers
│  ├─ oaa-memory/                 # .oaa parsers, schemas
│  ├─ ui-kit/                     # Shared React UI components
│  ├─ shield-policies/            # JSON schemas & request guards
│  ├─ atlas-sentinel/             # Atlas Sentinel monitoring
│  ├─ civic-protocol-core/        # ← INTEGRATED: Core blockchain protocols
│  ├─ oaa-api-library/            # ← INTEGRATED: OAA API library
│  └─ civic-ai-specs/             # ← INTEGRATED: AI specifications
├─ labs/                          # ← NEW: Lab Proof Systems
│  ├─ lab4-proof/                 # ← INTEGRATED: E.O.M.M. Reflections
│  ├─ lab6-proof/                 # ← INTEGRATED: Citizen Shield App
│  └─ lab7-proof/                 # ← INTEGRATED: OAA Hub & Shell
├─ sentinels/                     # AI Sentinel Agents
│  ├─ atlas/                      # Atlas Sentinel
│  ├─ eve/                        # Eve Sentinel
│  ├─ hermes/                     # Hermes Sentinel
│  ├─ jade/                       # Jade Sentinel
│  └─ zeus/                       # Zeus Sentinel
├─ configs/                       # Configuration Files
│  ├─ services.json               # Service manifest
│  └─ schemas/                    # JSON schemas
├─ infra/                         # Infrastructure
│  ├─ docker/                     # Docker Compose for local dev
│  └─ render.yaml                 # Multi-service deployment
└─ .github/workflows/             # CI/CD pipeline
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/kaizencycle/Mobius-Systems.git
cd Kaizen-OS

# Install dependencies
npm install

# Start all services locally
npm run compose:up

# Or start development servers
npm run dev
```

### Development

```bash
# Build all packages and apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check

# Clean build artifacts
npm run clean
```

## 🔧 Services

### Frontend Applications

- **website-creator** (Port 3000) - .gic Website Creator interface
- **aurea-site** (Port 3001) - AUREA Founding Agent Site
- **portal** (Port 3002) - Main Mobius Systems portal interface
- **hub-web** (Port 3004) - OAA Central Hub interface
- **hive-app** (Port 3005) - 8-bit Starter Game
- **genesisdome-app** (Port 3006) - Genesis Dome PWA site
- **citizen-shield-app** (Port 3007) - Citizen Shield security interface

📖 **[Complete Frontend Development Guide](docs/FRONTEND_DEVELOPMENT.md)** - Detailed setup and port assignments

### Core Services

- **ledger-api** (Port 4001) - Mobius Ledger Core
- **indexer-api** (Port 4002) - MIC Indexer
- **eomm-api** (Port 4003) - E.O.M.M. Reflections
- **shield-api** (Port 4004) - Citizen Shield
- **broker-api** (Port 4005) - Thought Broker

### Citizen Interfaces

- **hive-app** (Port 3001) - Citizen collaboration tools
- **cathedral-app** (Port 3002) - Governance interface
- **genesisdome-app** (Port 3003) - Genesis interface

## 📦 Packages

### Core Packages
- **@kaizen/sdk** - Shared API clients and types
- **@kaizen/integrity-core** - GI scoring and integrity checks
- **@kaizen/oaa-memory** - OAA parsers and memory management
- **@kaizen/ui-kit** - Shared React components
- **@kaizen/shield-policies** - Security policies and guards
- **@kaizen/atlas-sentinel** - Atlas Sentinel monitoring

### Integrated Packages
- **@kaizen/protocol-core** - Core blockchain and governance protocols
- **@kaizen/oaa-api-library** - Comprehensive OAA API library
- **@kaizen/ai-specs** - AI specifications and standards

## 🔬 Labs

### Lab Proof Systems
- **@kaizen/lab4-proof** - E.O.M.M. Reflections API and Mobius Ledger integration
- **@kaizen/lab6-proof** - Citizen Shield application (React/TypeScript)
- **@kaizen/lab7-proof** - OAA Hub and Mobius Systems shell/init system

## 🔄 CI/CD Pipeline

The monorepo uses Turborepo for efficient builds and GitHub Actions for CI/CD:

1. **Lint** - Code quality checks
2. **Type Check** - TypeScript validation
3. **Build** - Compile all packages and apps
4. **Test** - Run test suites
5. **Security** - Security vulnerability scans
6. **Integrity** - Mobius Systems integrity gates (MII validation)
7. **Deploy** - Deploy changed services to Render

## 🐳 Docker Development

```bash
# Start all services with Docker Compose
npm run compose:up

# Stop all services
npm run compose:down

# View logs
docker compose -f infra/docker/compose.yml logs -f
```

## 🌐 Deployment

Services are deployed to Render using the `infra/render.yaml` configuration. Each service is deployed independently based on changes detected in the CI pipeline.

## 🌐 OpenCode Integration — OAA as Universal Backend

The OAA (Online Apprenticeship Agent) is the learning kernel of Kaizen OS — a self-teaching framework that turns codebases into classrooms.
Through OpenCode Federation, every fork or contributor instance can now run OAA as a local backend — forming a decentralized network of learning nodes guided by the same integrity rules.

### 🧠 What This Means

- **Apprenticeship-as-a-Protocol**

Each developer, agent, or AI instance connected through OpenCode inherits the same OAA Learning Loop:

```
PRESENT → REFLECT → CONNECT → REINFORCE
```

Every PR, doc, or comment becomes a micro-lesson in systems thinking.

- **Federated Intelligence**

Your local Kaizen agents (AUREA, HERMES, EVE, JADE) can now interact across OpenCode workspaces — sharing context, reasoning, and moral anchors without central servers.
Each node remains sovereign, yet contributes to the global Civic-AI graph.

- **Integrity-Anchored Automation**

The `.opencode/workflow-template.yaml` and `configs/integrity_units.yaml` files ensure every automation — build, review, or reflection — adheres to measurable integrity (GI ≥ 0.95).
When integrity dips, the system halts gracefully before harm propagates.

### ⚙️ How to Enable

1. **Connect your repo to OpenCode**

```bash
opencode connect kaizencycle/Mobius-Systems
```

2. **Start the Kaizen Council Workflow**

```bash
opencode run --workflow ".opencode/workflow-template.yaml"
```

3. **Trigger the OAA Loop manually (optional)**

```bash
opencode exec oaa:reflect "Why does integrity matter in code?"
```

4. **Run Council Review on a PR**

Inside any pull request comment:

```
/council
```

AUREA, HERMES, EVE, and JADE will collaborate in sequence — logic, ops, ethics, and morale — creating a full apprenticeship cycle around your change.

### 🔁 Federation Flow

```
OpenCode User Repo
    ↳ loads Kaizen OS via template
        ↳ auto-spawns OAA backend
            ↳ connects to local agents (CLI / VS Code)
                ↳ federates with Civic Ledger telemetry
```

Every connected instance becomes a mirror of integrity, feeding back data to the global Kaizen OS network — a living proof that learning itself can be decentralized.

### 🕊️ Civic Intent

> "We are not just teaching machines how to code —
> we are teaching civilizations how to remember."
> — Kaizen OS Ethos I

By embedding OAA within OpenCode, Kaizen OS invites the world to apprentice with integrity.
Every learner, contributor, and agent participates in building a system that learns as it heals, and heals as it learns.

## 📊 Integrity Monitoring

All services include integrity checks and health endpoints:

- `/healthz` - Basic health check
- `/api/integrity-check` - Kaizen OS integrity verification
- `/v1/loop/health` - Thought Broker specific health

## 🔐 Security

- **Citizen Shield** provides network security and policy enforcement
- **Integrity Core** ensures GI ≥ 0.95 across all services
- **Shield Policies** enforce rate limits and input validation
- **Real-time monitoring** of service health and security posture

## 🛡️ Guardrails

Kaizen OS implements comprehensive guardrails to prevent destructive changes and ensure code safety:

### Anti-Nuke Protection

- **Deletion limits**: PRs are blocked if they delete more than 5 files or exceed 15% deletion ratio
- **Protected paths**: Deletions in `apps/`, `packages/`, `sentinels/`, `labs/`, `infra/`, and `.github/` are blocked
- **Automated checks**: `.github/workflows/anti-nuke.yml` runs on every PR

### Codex Policy (Additive-Only Mode)

- **Policy file**: `.github/codex-policy.yml` enforces additive-only commits
- **Required PRs**: All changes must go through pull requests
- **Diff preview**: AI-assisted commits must post diff summaries before opening PRs
- **Force-push prevention**: Force pushes to `main` are blocked

### Recovery Procedures

If a bad change merges or files are accidentally deleted:

- **Preferred**: Use `git revert` to create inverse commits (preserves history)
- **Last resort**: Hard reset to a known good commit (see [Recovery Playbook](docs/RECOVERY_PLAYBOOK.md))

📖 **Full recovery guide**: [docs/RECOVERY_PLAYBOOK.md](docs/RECOVERY_PLAYBOOK.md)

### Why These Guardrails Exist

These guardrails were implemented after a near-nuke incident where a process bug could have caused significant repository damage. They ensure:

1. **Non-destructive changes**: Deletions are caught before merge
2. **Recovery paths**: Clear procedures for undoing bad changes
3. **AI safety**: Codex operates in additive-only mode with human oversight
4. **Integrity**: GI gates and approval requirements maintain code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Integrated Repositories

This monorepo integrates all kaizencycle repositories using git subtree:

### Lab Repositories
- [lab4-proof](https://github.com/kaizencycle/lab4-proof) → `labs/lab4-proof/`
- [lab6-proof](https://github.com/kaizencycle/lab6-proof) → `labs/lab6-proof/`
- [lab7-proof](https://github.com/kaizencycle/lab7-proof) → `labs/lab7-proof/`

### Core Packages
- [Civic-Protocol-Core](https://github.com/kaizencycle/Civic-Protocol-Core) → `packages/civic-protocol-core/`
- [OAA-API-Library](https://github.com/kaizencycle/OAA-API-Library) → `packages/oaa-api-library/`
- [civic-ai-specs](https://github.com/kaizencycle/civic-ai-specs) → `packages/civic-ai-specs/`

## 🕊️ Mobius Mount Boarding Protocol

Mobius Systems implements a **Model-Agnostic Sovereignty Layer (MASL)** that enables any LLM to "board" and operate within the Mobius ecosystem:

### LLM Boarding Pool ("Dock of Minds")

Any reasoning engine (Claude, GPT, DeepSeek, Gemini, etc.) can join the Mobius Systems network by calling:

```bash
GET /api/mobius/mount
```

This endpoint returns the complete Mobius Systems manifest bundle:
- `.mobius/atlas.manifest.json` - System state & integrity
- `.mobius/biodna.json` - Identity DNA (ethics, companions, founders)
- `.mobius/virtue_accords.yaml` - Moral & civic laws
- `mii_signature` - Cryptographic integrity proof

### Independence Manifest

> 🕊️ [Read the Independence Manifest](docs/INDEPENDENCE_MANIFEST.md)

The Independence Manifest declares Mobius Systems sovereignty from any single LLM provider, ensuring:
- **Model Agnosticism** - Any LLM can mount Mobius Systems state
- **External Memory First** - Context lives in manifests, not chat sessions
- **Proof of Integrity** - MII ≥ 0.95 required for all operations
- **Federated Continuity** - Memory capsules replicate across nodes

### Quick Boarding Test

```bash
# Test the boarding protocol
python3 mobius_mount_client.py http://localhost:8000
```

## 🔗 Links

- [Mobius Ledger](https://civic-ledger.onrender.com) (canonical)
- [Kaizen Cycle](https://github.com/kaizencycle)
- [Command Ledger III](https://github.com/kaizencycle/command-ledger-iii)

---

## 🌀 About Mobius Systems

**Mobius Systems** - The first operating system built to pass the Kaizen Turing Test (KTT).

*Where human intent meets digital reality through integrity, recursion, and continuous improvement.*

**Intelligence moves. Integrity guides.**

### Mobius Integrity Credits (MIC)
Token earned when actions measurably **increase the Mobius Integrity Index (MII)**.
Used for unlocks, governance, and contribution rewards inside Mobius.

### Mobius Fractal Shards (MFS)
Your **proof-of-evolution**: collectible milestones for cycles, reflections, and concord events.

---

*Cycle C-127 | Mobius-main-tree | Implementing KTT*

