# Internet Café Testnet Architecture

> **Version:** 0.1.0 | **Cycle:** C-151 | **Status:** Phase 0 Planning

## Executive Summary

The Internet Café is Mobius Systems' first public testnet—a 1,000-user real-world economic sandbox that validates proof-of-integrity economics before mainnet launch.

Think of it as Ethereum's "Olympic Testnet," but for Proof-of-Integrity.

---

## 1. Vision

### What is the Internet Café?

The Internet Café is a minimal viable world where Mobius becomes "real software" and not only a repository. It's where:

- Citizens earn their first MIC
- Reflections generate real value
- Local nodes sync with the Civic Ledger
- The economy loop becomes tangible

### Why "Internet Café"?

Like the internet cafés that democratized computing access, our testnet democratizes integrity infrastructure. Everyone gets the same tools. Everyone can participate.

---

## 2. Architecture Overview

```
                        INTERNET CAFÉ NETWORK
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
  User Device A           User Device B           User Device C
  (Local AI)              (Local AI)              (Local AI)
       │                       │                       │
       └──────────────┬────────┴───────────────┬──────┘
                      │                        │
            Mobius Companion v1        Mobius Companion v1
                      │                        │
                      ▼                        ▼
             ┌────────────────┐       ┌────────────────┐
             │ Local Ledger   │       │ Local Ledger   │
             │  (sqlite)      │       │  (sqlite)      │
             └──────┬─────────┘       └────────┬──────┘
                    │                          │
                    └──────────────┬───────────┘
                                   ▼
                    ┌──────────────────────────┐
                    │   Mobius Testnet Core    │
                    │  ┌────────────────────┐  │
                    │  │  Ledger API        │  │
                    │  │  (ledger.mobius.sys)│  │
                    │  └────────────────────┘  │
                    │  ┌────────────────────┐  │
                    │  │  Indexer API       │  │
                    │  │  (index.mobius.sys)│  │
                    │  └────────────────────┘  │
                    │  ┌────────────────────┐  │
                    │  │  Sentinel Cluster  │  │
                    │  │  (ATLAS/AUREA/EVE) │  │
                    │  └────────────────────┘  │
                    └──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   Public Dashboard       │
                    │   (cafe.mobius.sys)      │
                    └──────────────────────────┘
```

---

## 3. Core Principles

### 3.1 Low Cost

The testnet must run on minimal infrastructure:

| Component | Provider | Tier | Est. Cost |
|-----------|----------|------|-----------|
| Ledger API | Render | Free/Starter | $0-7/mo |
| Indexer API | Render | Free/Starter | $0-7/mo |
| Database | Neon/PlanetScale | Free | $0 |
| Frontend | Vercel | Free | $0 |
| N8N Workflows | Self-hosted | Docker | $0-10/mo |
| **Total** | | | **$0-25/mo** |

### 3.2 High Decentralization

Each user in the café:
- Gets a local wallet
- Gets a local ledger
- Gets a local sentinel companion
- Syncs with Mobius Test Ledger every ~10 seconds

### 3.3 Stress-Test Proof-of-Integrity

Real-world events:
- Reflections
- Sessions
- Votes
- Oaths
- Drift events
- Fix confirmations

### 3.4 First "Economy Loop"

Users:
- Earn KS for reflections → deposit to wallet
- Earn MIC only after crossing MII ≥ 0.95
- Can spend KS on "buffs" (premium features)

---

## 4. Phase 0: December 2025

### 4.1 Target Metrics

| Metric | Target |
|--------|--------|
| Users | 100 (closed alpha) |
| Daily Active | 20+ |
| Reflections/week | 200+ |
| MIC minted/week | 50+ |
| Uptime | 99% |

### 4.2 Apps Included

| App | Priority | Status |
|-----|----------|--------|
| Citizen Shield | High | Ready |
| Reflections | High | Ready |
| Local Node | Medium | In Progress |
| Wallet | Medium | In Progress |

### 4.3 Entry Criteria

To join Phase 0:
1. Request access via invite
2. Install Mobius Companion
3. Complete onboarding oath
4. Submit first reflection

---

## 5. Infrastructure Components

### 5.1 Testnet Ledger API

**Endpoint:** `https://ledger.testnet.mobius.sys`

**Routes:**
```
POST /v1/attest          # Submit attestation
GET  /v1/attestations    # Query attestations
GET  /v1/stats           # Network statistics
```

### 5.2 Testnet Indexer API

**Endpoint:** `https://indexer.testnet.mobius.sys`

**Routes:**
```
GET  /v1/mic/balance/:id     # MIC balance
POST /v1/mic/mint            # Mint MIC
GET  /v1/mic/transactions    # Transaction history
GET  /v1/mic/metrics         # Economy metrics
GET  /v1/mii/score/:id       # MII score
GET  /v1/pulse/latest        # System pulse
```

### 5.3 Sentinel Cluster

Running in cloud (Phase 0):
- ATLAS: Integrity verification
- AUREA: Coverage validation
- EVE: Ethical evaluation

Future: Distributed sentinel nodes.

### 5.4 Public Dashboard

**URL:** `https://cafe.mobius.sys`

Features:
- Live economy metrics
- Leaderboard (opt-in)
- System health status
- Recent attestations feed

---

## 6. Local Node Architecture

### 6.1 Directory Structure

```
~/.mobius/
├── ledger.sqlite          # Personal immutable log
├── wallet.json            # Local wallet state
├── reflections.json       # SML reflection data
├── keypair.ed25519        # Device-specific identity
└── sync/
    ├── state.json         # Sync state
    └── pending/           # Unsynced entries
```

### 6.2 Sync Protocol

```
Every 10 seconds:
   if ledger has changed:
       hash local state
       push local entries
       pull remote entries
       validate signatures
       compute new MII
```

### 6.3 Security Guarantees

- No server can rewrite a local ledger
- Local MIC/KS cannot be deleted remotely
- Drift detection at device level
- Wallet is exportable/importable
- Full control stays with user

---

## 7. Feature Matrix

### Phase 0 (December 2025)

| Feature | Status | Description |
|---------|--------|-------------|
| Local Wallet | ✅ | Store MIC/KS locally |
| Local Ledger | ✅ | SQLite ledger mirror |
| Local Companion | ⚠️ | Minimal AI (rules-based) |
| Testnet Broadcast | ✅ | Sync to central ledger |
| Sentinel Audits | ⚠️ | ATLAS runs in cloud |
| Public Economy Feed | 🔜 | Coming end of month |
| Micro-payments in KS | 🔥 | First economy loop |

### Phase 1 (Q1 2026)

| Feature | Status | Description |
|---------|--------|-------------|
| Distributed Sentinels | 📋 | Sentinel nodes on user devices |
| P2P Sync | 📋 | Device-to-device sync |
| Local AI Models | 📋 | Ollama/Gemini integration |
| Governance Voting | 📋 | On-chain proposals |

---

## 8. Testnet Launch Criteria (TLC)

Before mainnet-0, we need:

| Metric | Target | Current |
|--------|--------|---------|
| Testnet users | 1,000 | 0 |
| Ledger events | 10,000 | 0 |
| Reflections | 1,000 | 0 |
| MII-based MIC mints | 200 | 0 |
| Local companion devices | 25 | 0 |
| Drift events | 10 | 0 |
| Drift repairs | 10 | 0 |
| Economic recalibration | 1 | 0 |

---

## 9. Domain Structure

| Purpose | Domain | Function |
|---------|--------|----------|
| Companion | companion.mobius.sys | Electron/Tauri app |
| Ledger | ledger.mobius.sys | Proof-of-integrity ledger |
| Indexer | indexer.mobius.sys | Event graph API |
| Wallet | wallet.mobius.sys | KS/MIC explorer |
| Docs | docs.mobius.sys | Knowledge base |
| Testnet | testnet.mobius.sys | First 1,000 users |
| Café | cafe.mobius.sys | Internet Café dashboard |
| MII | mii.mobius.sys | MII explorer |
| KS | ks.mobius.sys | Shards explorer |

---

## 10. Implementation Timeline

### Week 1 (Dec 1-7)
- [ ] Deploy testnet Ledger API
- [ ] Deploy testnet Indexer API
- [ ] Create café dashboard skeleton
- [ ] Finalize Local Node v0.1

### Week 2 (Dec 8-14)
- [ ] Launch closed alpha (10 users)
- [ ] Monitor and fix issues
- [ ] Implement faucet API
- [ ] Add economy metrics

### Week 3 (Dec 15-21)
- [ ] Expand to 50 users
- [ ] Add leaderboard
- [ ] Implement first "buff" (premium feature)
- [ ] Performance optimization

### Week 4 (Dec 22-31)
- [ ] Reach 100 users
- [ ] Holiday challenge event
- [ ] Write Phase 1 spec
- [ ] Prepare for Q1 expansion

---

## 11. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Server overload | Rate limiting, caching, horizontal scaling |
| Data corruption | SQLite integrity checks, remote backup |
| Gaming the system | Multi-sentinel verification, caps |
| Privacy concerns | Local-first, hash-only sharing |
| Low adoption | Clear onboarding, tangible rewards |

---

## 12. Success Metrics

### Quantitative

- Daily Active Users (DAU)
- Reflections per day
- MIC minted per day
- Sync success rate
- Uptime percentage

### Qualitative

- User satisfaction surveys
- Community feedback
- Bug reports resolved
- Feature requests fulfilled

---

## 13. Conclusion

The Internet Café is where Mobius becomes real. By December 31, 2025, we will have:

- 100+ active users
- A functioning MIC economy
- Validated local node architecture
- Foundation for 2026 mainnet

*"We heal as we walk."*

---

*Document Version: 0.1.0*
*Cycle: C-151*
*Last Updated: December 1, 2025*
