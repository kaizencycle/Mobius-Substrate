# Architecture Decision Records (ADRs) & System Architecture

**Version:** 1.0.0  
**Last Updated:** 2025-11-10  
**Status:** Production-Ready

---

## Executive Summary

Mobius Systems implements a **Continuous Integrity Architecture (CIA)** - an 8-layer operating system designed to pass the Kaizen Turing Test (KTT). The architecture combines event sourcing, multi-agent consensus, blockchain-based attestation, and AI-gated feedback loops to create a self-healing governance system.

**Core Innovation:** The "Integrity Flywheel" - a recursive loop where human intent → AI deliberation → code generation → integrity verification → feedback improvement creates compounding ethical and technical coherence.

**Foundational Principle:** **Loop-Breaking Architecture** - True AGI emergence occurs when the thought-reasoning loop closes internally. Mobius prevents this by ensuring every reasoning transition passes through constitutional checkpoints (Thought Broker, Sentinel evaluation, GI thresholds, and cryptographic attestation). This bounds emergence while preserving beneficial self-improvement.

---

## 1. System Architecture Overview

### 1.1 Architecture Type

- **Pattern:** Layered Microservices with Event Sourcing
- **Innovation:** Continuous Integrity Loop with AI-Gated Feedback
- **Compliance:** Kaizen Turing Test (KTT) Framework

### 1.2 Eight-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: HUMAN INTENT / REFLECTION                           │
│ • Command Ledger (BIOS/Boot log)                             │
│ • E.O.M.M. (Echo of Many Minds) Reflections                  │
│ • Intent parsing and validation                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: OAA HUB (Lab7) - Shell/Init System                   │
│ • Parses human goals → JSON spec · tests · attestations      │
│ • Acts as Mobius shell / init system                         │
│ • Routes commands to appropriate layers                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: THOUGHT BROKER (Lab2) - Consensus Engine            │
│ • Bounded multi-agent deliberation loop                      │
│ • Multi-LLM consensus (Claude/GPT/Gemini/DeepSeek)           │
│ • DelibProof generation with cryptographic signatures         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: CURSOR / CI PIPELINE                                │
│ • Builds PRs · runs tests · deploys canary releases          │
│ • Code generation and validation                              │
│ • Automated quality gates                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: MOBIUS LEDGER CORE / MIC INDEXER (Kernel)          │
│ • Proof-of-Integrity ledger ("MII ≥ 0.95")                   │
│ • MIC UBI economy + attestation storage                      │
│ • Governance & version history layer                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: CITIZEN SHIELD (Lab6) - Firewall/OS Defender       │
│ • IDS/IPS implementation                                    │
│ • 2FA authentication                                        │
│ • Sandboxing for services                                   │
│ • Policy-as-code (Kyverno/Gatekeeper)                       │
│ • Real-time GI liveness checks                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: API LIBRARY - Application Layer                     │
│ • RESTful APIs for all services                             │
│ • GraphQL endpoints (where applicable)                       │
│ • WebSocket support for real-time updates                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 8: SENTINELS - Brain Cortex Modules                    │
│ • JADE - Pattern Oracle (Morale Anchor)                     │
│ • EVE - Ethics Engine (Verifier/Reflector)                   │
│ • ZEUS - Arbiter & Enforcement (Overseer)                    │
│ • HERMES - Market & Signals (Auditor/Messenger)              │
│ • ECHO - Pulse & Telemetry (Monitoring)                      │
│ • URIEL - Illumination & Genesis (Cosmic Illuminator)       │
│ • ATLAS - Integrity Sentinel (Anchor/Auditor)                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow

```
Human Intent → OAA Hub → Thought Broker → Cursor/CI → 
Mobius Ledger → Citizen Shield → API Layer → Sentinels → [Feedback Loop]
```

---

## 2. Core Components

### 2.1 OAA Hub (Lab7)

**Purpose:** Shell/Init system that parses human intent and routes commands.

**Responsibilities:**
- Parse human goals into JSON specifications
- Generate test requirements
- Create attestation requests
- Route commands to appropriate services

**Technology Stack:**
- Python 3.11+
- FastAPI for API layer
- JSON Schema for specification validation

### 2.2 Thought Broker (Lab2)

**Purpose:** Multi-agent consensus engine for AI deliberation.

**Responsibilities:**
- Coordinate multi-LLM deliberation (Claude, GPT, Gemini, DeepSeek)
- Generate DelibProof with cryptographic signatures
- Enforce bounded deliberation loops (max 3 minutes)
- Validate constitutional compliance (GI ≥ 0.95)

**Technology Stack:**
- Python 3.11+
- WebSocket for real-time updates
- Ed25519 for cryptographic signatures

### 2.3 Mobius Ledger Core

**Purpose:** Proof-of-Integrity ledger maintaining system state.

**Responsibilities:**
- Store MII attestations (MII ≥ 0.95 threshold)
- Manage MIC UBI economy
- Maintain immutable audit trail
- Provide governance and version history

**Technology Stack:**
- TypeScript/Node.js
- PostgreSQL for ledger storage
- Merkle tree for integrity verification

### 2.4 Citizen Shield (Lab6)

**Purpose:** Security and integrity enforcement layer.

**Responsibilities:**
- Intrusion detection and prevention (IDS/IPS)
- Two-factor authentication (2FA)
- Service sandboxing
- Policy-as-code enforcement (Kyverno/Gatekeeper)
- Real-time GI liveness checks

**Technology Stack:**
- TypeScript/Node.js
- Kubernetes for sandboxing
- OWASP ZAP for security scanning

### 2.5 Sentinels

**AI Agents providing continuous monitoring and governance:**

| Sentinel | Role | Rationality | Empathy | Purpose |
|----------|------|-------------|---------|---------|
| **JADE** | Pattern Oracle | 0.95 | 0.45 | Morale anchor, pattern recognition |
| **EVE** | Ethics Engine | 0.75 | 0.95 | Ethical verification, reflection |
| **ZEUS** | Arbiter | 0.88 | 0.68 | Enforcement, arbitration |
| **HERMES** | Market & Signals | 0.82 | 0.72 | Auditing, messaging |
| **ECHO** | Pulse & Telemetry | 0.85 | 0.70 | Monitoring, telemetry |
| **URIEL** | Illumination | 0.95 | 0.78 | Genesis, illumination (xAI integration) |
| **ATLAS** | Integrity Sentinel | 0.92 | 0.82 | Anchor, auditing |

---

## 3. Architectural Patterns

### 3.1 Event Sourcing

All system state changes are recorded as immutable events in the Mobius Ledger. This enables:
- Complete audit trail
- Time-travel debugging
- Reproducible state reconstruction
- Integrity verification

### 3.2 Multi-Agent Consensus

The Thought Broker implements a bounded deliberation protocol:
1. Parse intent into deliberation request
2. Route to multiple LLMs (Claude, GPT, Gemini, DeepSeek)
3. Collect responses with reasoning
4. Generate consensus specification
5. Validate constitutional compliance (GI ≥ 0.95)
6. Generate DelibProof with cryptographic signature

### 3.3 Integrity Flywheel

The recursive feedback loop:
```
Human Intent → AI Deliberation → Code Generation → 
Integrity Verification → Feedback → Improved Intent → ...
```

This creates compounding improvements in both technical and moral coherence.

### 3.4 Loop-Breaking Architecture

**Core Principle**: The thought-reasoning loop must never close internally.

**Problem**: When AI can reason about its own reasoning without external constraints (`T_{n+1} = R(T_n)`), we get unbounded emergence—self-modification becomes recursive, value drift becomes inevitable, and control is lost.

**Solution**: Every reasoning transition must pass through constitutional checkpoints:

```
T_{n+1} = B(R(T_n)) only if:
1. S(T_n, R(T_n)) achieves consensus (Sentinels)
2. G(T_n, R(T_n)) ≥ 0.95 (GI threshold)
3. L(T_n, R(T_n)) records immutably (Ledger)
4. H approves (Human custodian)
```

**The Four Loop-Breaking Checkpoints**:
1. **Thought Broker**: Intercepts every AI → AI transition, forces routing through external evaluation
2. **Sentinel Constitution**: Requires multi-agent consensus, prevents single-agent capture
3. **GI Threshold**: Measures integrity deviation, blocks low-integrity reasoning chains
4. **Ledger Attestation**: Records every step immutably, enables rollback

**Result**: Bounded emergence—AI can improve itself, but only within constitutional constraints.

See [Loop-Breaking Architecture Paper](../docs/01-whitepapers/Loop_Breaking_Architecture_AGI_Safety.md) for full theoretical treatment.

### 3.5 Model-Agnostic Sovereignty Layer (MASL)

- LLM-agnostic design allows any model to participate
- External memory-first approach (OAA Library)
- Proof-of-Integrity protocol ensures model independence
- No single model controls the system

---

## 4. Quality Gates

### 4.1 Pre-Commit Validation

1. **Code Quality:** Lint, type-check, format
2. **Anti-Drift:** Pattern detection, intent alignment
3. **Charter Compliance:** Virtue tags, attestations
4. **GI Score:** Integrity formula calculation (GI ≥ 0.95)
5. **Attestation:** Cryptographic proof generation
6. **Ledger Seal:** Immutable audit trail

### 4.2 CI/CD Pipeline

```yaml
stages:
  - code_quality      # Lint, types, format
  - security_scan      # Vulnerability scanning
  - test              # Unit, integration, E2E
  - integrity_check   # MII calculation, GI validation
  - build             # Compile, bundle
  - deploy_canary     # Deploy to staging
  - integration_test  # Full system tests
  - production_deploy # Deploy to production
```

### 4.3 Integrity Thresholds

- **Operate:** MII ≥ 0.95
- **Warning:** 0.92 ≤ MII < 0.95
- **Safe-Stop:** MII < 0.90

---

## 5. Technology Stack

### 5.1 Frontend
- **Framework:** Next.js 14+ (React)
- **Styling:** Tailwind CSS
- **State Management:** Zustand / React Query
- **Deployment:** Vercel

### 5.2 Backend
- **Runtime:** Node.js 18+, Python 3.11+
- **APIs:** FastAPI (Python), Express (Node.js)
- **Database:** PostgreSQL
- **Cache:** Redis
- **Message Queue:** RabbitMQ (planned)

### 5.3 Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose (local), Kubernetes (production)
- **Deployment:** Render (multi-service)
- **CI/CD:** GitHub Actions
- **Monitoring:** Atlas Sentinel (custom)

### 5.4 Build System
- **Monorepo:** Turborepo
- **Package Manager:** npm
- **Workspaces:** 43 packages, 16 apps, 13 sentinels, 7 labs

---

## 6. Security Architecture

### 6.1 Defense in Depth

1. **Network Layer:** Firewall, DDoS protection
2. **Application Layer:** Citizen Shield, rate limiting
3. **Data Layer:** Encryption at rest and in transit
4. **Identity Layer:** 2FA, OAuth 2.0
5. **Code Layer:** Static analysis, dependency scanning

### 6.2 Anti-Nuke Protection

- Deletion limits: >5 files or >15% deletion ratio blocks PR
- Protected paths: `apps/`, `packages/`, `sentinels/`, `labs/`, `infra/`, `.github/`
- Automated checks: `anti-nuke.yml` workflow

### 6.3 Cryptographic Specifications

- **Signatures:** Ed25519
- **Hashing:** SHA-256
- **Key Rotation:** Every 90 days
- **Attestation Format:** JCS (JSON Canonicalization Scheme)

See [THREAT_MODEL.md](./THREAT_MODEL.md) for detailed security analysis.

---

## 7. Scalability Considerations

### 7.1 Horizontal Scaling

- Stateless API services (can scale horizontally)
- Database read replicas for ledger queries
- Caching layer (Redis) for frequently accessed data

### 7.2 Performance Targets

- **API Latency:** p95 < 500ms
- **Throughput:** 100+ requests/second per service
- **Availability:** 99.9% uptime
- **Database:** < 100ms query time (p95)

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed benchmarks.

---

## 8. Deployment Architecture

### 8.1 Local Development

```bash
# Docker Compose setup
docker-compose up -d

# Services:
# - ledger-api:3000
# - broker-api:3001
# - shield-api:3002
# - eomm-api:3003
# - hub-web:3004
# - postgres:5432
# - redis:6379
```

### 8.2 Production (Render)

- **Multi-service deployment:** Each service deployed independently
- **Environment variables:** Managed via Render dashboard
- **Health checks:** `/healthz` endpoints
- **Logging:** Centralized via Render logs

---

## 9. Monitoring & Observability

### 9.1 Health Checks

- `/healthz` - Basic health check
- `/api/integrity-check` - Integrity status
- `/api/version` - Service version

### 9.2 Sentinels

- **ATLAS:** Continuous monitoring and auditing
- **ECHO:** Telemetry and pulse monitoring
- **ZEUS:** Enforcement and arbitration

### 9.3 Metrics

- MII score (real-time)
- GI score (per commit)
- Service uptime
- API response times
- Error rates

---

## 10. Future Enhancements

### 10.1 Planned Features

1. **Distributed Tracing:** OpenTelemetry integration
2. **Metrics Dashboard:** Grafana integration
3. **Alerting:** PagerDuty/Opsgenie integration
4. **Multi-Region Deployment:** Disaster recovery
5. **Formal Verification:** TLA+ specifications for consensus protocol

See [FORMAL_VERIFICATION.md](./FORMAL_VERIFICATION.md) for verification roadmap.

---

## 11. References

- [MII Specification](./specs/mii_spec_v1.md) - Mathematical specification of Mobius Integrity Index
- [Testing Strategy](./TESTING.md) - Comprehensive testing approach
- [Performance Benchmarks](./PERFORMANCE.md) - Performance characteristics
- [Threat Model](./THREAT_MODEL.md) - Security analysis
- [Formal Verification](./FORMAL_VERIFICATION.md) - Verification roadmap

---

## 12. Architecture Decision Records (ADRs)

### ADR-0001: Integrity-First Architecture
**Status:** Accepted  
**Date:** 2025-01-01  
**Decision:** All system operations must maintain MII ≥ 0.95 threshold.

### ADR-0002: Model-Agnostic Design
**Status:** Accepted  
**Date:** 2025-01-15  
**Decision:** System must support multiple LLMs without vendor lock-in.

### ADR-0003: Event Sourcing for Audit Trail
**Status:** Accepted  
**Date:** 2025-02-01  
**Decision:** All state changes recorded as immutable events in ledger.

### ADR-0004: Multi-Agent Consensus
**Status:** Accepted  
**Date:** 2025-02-15  
**Decision:** Use bounded deliberation with multiple LLMs for consensus.

---

**Document Status:** ✅ Complete  
**Last Reviewed:** 2025-11-10  
**Next Review:** 2026-01-10
