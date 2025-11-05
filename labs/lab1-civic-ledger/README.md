# Lab 1 — Civic Ledger Core

**Purpose:** Sovereign blockchain for civilization state - integrity proofs, GIC minting, DID registry, and public audit trail with Proof-of-Cycle (PoC) consensus.

**Spec:** See `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md` (Lab 1 section)

---

## Overview

Lab 1 implements the **foundational ledger infrastructure** for Kaizen OS. It provides:

1. **Civic Ledger API** — Blockchain kernel with Proof-of-Cycle (PoC) consensus
2. **GIC (Global Integrity Currency)** — Economic incentive layer tied to civic participation
3. **DID Registry** — Decentralized identity for citizens and AI companions
4. **Integrity Proofs** — GI score attestations and cryptographic verification
5. **Cycle Management** — Seed → Sweep → Seal → Ledger lifecycle
6. **Public Audit Trail** — Transparent, immutable record of all civic activity

This lab serves as the **trust anchor** for all other labs and ensures every action in Kaizen OS is verifiable, auditable, and integrity-scored.

---

## Architecture

```
Lab 1: Civic Ledger Core
├── Blockchain Layer
│   ├── apps/ledger-api/civic-protocol-core/
│   │   ├── ledger/                    # Blockchain kernel
│   │   │   ├── app/main.py           # FastAPI ledger service
│   │   │   ├── app/ledger.py         # Core ledger logic (blocks, txs)
│   │   │   └── app/verify.py         # Signature verification
│   │   ├── gic-indexer/              # GIC transaction indexer
│   │   │   └── app/main.py           # GIC mint/burn/transfer indexing
│   │   └── sdk/                      # Client SDKs (Python, JavaScript)
│   └── packages/gic-registry-contracts/  # Smart contracts
│       └── contracts/
│           ├── GIC.sol               # ERC-20 compatible GIC token
│           ├── GICGovernor.sol       # Governance contract
│           └── deploy/               # Deployment scripts
│
├── Integrity Layer
│   └── packages/integrity-core/
│       ├── src/gi-calculator.ts      # GI score calculation
│       ├── src/integrity-checker.ts  # Health checks
│       └── src/middleware.ts         # Express/FastAPI middleware
│
├── Identity Layer
│   └── packages/civic-sdk/
│       └── src/did/                  # DID resolution & registry
│
└── Economic Layer
    ├── docs/GIC_Whitepaper_Final.md
    └── docs/GIC_Foundation_Up_Economics_Addendum.md
```

---

## Core Concepts

### 1. Proof-of-Cycle (PoC) Consensus

Unlike Proof-of-Work or Proof-of-Stake, **Proof-of-Cycle** rewards **verified civic activity** through the Kaizen Cycle:

```
Seed (Intent) → Sweep (Deliberation) → Seal (Commit) → Ledger (Attest)
```

- **Seed:** Citizen or AI agent proposes an action
- **Sweep:** Multi-agent deliberation via Lab 2 (DelibProof consensus)
- **Seal:** Action is executed and cryptographically signed
- **Ledger:** Integrity proof is written to Civic Ledger

**Consensus Rules:**
- Minimum GI threshold: 0.90 (configurable per action type)
- Cycle duration: 24 hours (epoch) or event-driven
- Block finality: Immediate (no mining, no forking)
- Validator set: All active AI agents + human witnesses

### 2. Global Integrity Currency (GIC)

**Token Economics:**
- **Symbol:** GIC
- **Decimals:** 18
- **Initial Supply:** 1,000,000 GIC (minted at genesis)
- **Inflation:** 0% (fixed supply, no mining rewards)
- **Distribution:**
  - 50% → PublicGoodsPool (community projects)
  - 30% → Citizen Allocation (verified accounts)
  - 20% → FoundingAgents (ATLAS, AUREA, Zenith, Jade, Uriel)

**Usage:**
- **Compute allocation quota** (Lab 3)
- **Governance voting weight** (Lab 6)
- **Data marketplace settlements** (Lab 7)
- **Public goods funding** (Lab 5 healthcare, education)

**Minting Rules:**
- ✅ Civic actions with GI ≥ 0.95: +0.01 GIC per action
- ✅ DelibProof consensus with agreement ≥ 0.90: +0.05 GIC per proof
- ❌ Actions with GI < 0.90: No GIC reward
- 🔴 Malicious actions: -1.0 GIC penalty + reputation impact

### 3. Decentralized Identity (DID)

Every participant (citizen or AI) has a **did:kaizen:** identifier:

```
did:kaizen:alice
did:kaizen:atlas
did:kaizen:community_garden
```

**DID Document Schema:**
```json
{
  "did": "did:kaizen:alice",
  "publicKey": "ed25519:abc123...",
  "giScore": 0.987,
  "gicBalance": 150.5,
  "reputation": {
    "actionsCompleted": 1234,
    "consensusParticipation": 567,
    "lastActive": "2025-11-03T14:30:00Z"
  },
  "created": "2025-01-01T00:00:00Z"
}
```

### 4. Integrity Proofs

Every action generates an **IntegrityEvent** with GI score attestation:

```json
{
  "traceId": "tx_abc123def456",
  "namespace": "lab2-thought-broker",
  "agent": "atlas",
  "action": "delibproof_consensus",
  "agreement": 0.92,
  "giScore": 0.956,
  "providers": ["anthropic", "openai", "gemini"],
  "timestamp": "2025-11-03T14:30:00Z",
  "signature": "ed25519:xyz789..."
}
```

**Verification:**
1. Check signature against DID public key
2. Verify GI score ≥ minimum threshold
3. Validate timestamp within acceptable window
4. Confirm action is authorized for agent
5. Attest to ledger if all checks pass

---

## API Endpoints

### Civic Ledger API (`apps/ledger-api`)

**Base URL:** `http://localhost:5411` (dev) or deployed Render service

#### Core Ledger Endpoints

**GET `/blocks`** - List all blocks
```bash
curl http://localhost:5411/blocks
```

**GET `/blocks/{block_id}`** - Get specific block

**POST `/tx`** - Submit transaction
```json
{
  "from": "did:kaizen:alice",
  "to": "did:kaizen:bob",
  "amount": 10.0,
  "type": "gic_transfer",
  "signature": "ed25519:..."
}
```

**GET `/tx/{tx_id}`** - Get transaction details

#### GIC Indexer Endpoints (`gic-indexer/`)

**GET `/gic/balance/{did}`** - Get GIC balance

**GET `/gic/history/{did}`** - Get transaction history

**POST `/gic/mint`** - Mint GIC (requires proof of civic action)

#### Cycle Endpoints

**GET `/cycle/current`** - Get current cycle status
```json
{
  "cycle": "C-122",
  "phase": "sweep",
  "started_at": "2025-11-03T00:00:00Z",
  "ends_at": "2025-11-04T00:00:00Z",
  "gi_baseline": 0.993
}
```

**POST `/cycle/advance`** - Advance to next cycle phase (governance only)

#### Attestation Endpoints

**POST `/attest`** - Attest integrity proof to ledger
```json
{
  "namespace": "lab2-thought-broker",
  "traceId": "tx_abc123",
  "agent": "atlas",
  "agreement": 0.92,
  "giScore": 0.956,
  "providers": ["anthropic", "openai", "gemini"]
}
```

**GET `/attest/{trace_id}`** - Retrieve attestation

---

## SDK Usage

### Python SDK

```python
from sdk.python.client import CivicClient

# Initialize client
client = CivicClient(base_url="http://localhost:5411")

# Create DID
did = client.create_did("alice")
print(f"Created DID: {did}")

# Check GIC balance
balance = client.get_gic_balance("did:kaizen:alice")
print(f"Balance: {balance} GIC")

# Transfer GIC
tx = client.transfer_gic(
    from_did="did:kaizen:alice",
    to_did="did:kaizen:bob",
    amount=10.0,
    private_key="..."
)
print(f"Transfer TX: {tx['tx_id']}")

# Attest integrity proof
attestation = client.attest(
    namespace="lab2-thought-broker",
    trace_id="tx_abc123",
    agent="atlas",
    gi_score=0.956
)
print(f"Attestation: {attestation}")
```

### JavaScript SDK

```javascript
import { CivicClient } from './sdk/js/index.js';

const client = new CivicClient('http://localhost:5411');

// Create DID
const did = await client.createDID('alice');
console.log(`Created DID: ${did}`);

// Check balance
const balance = await client.getGICBalance('did:kaizen:alice');
console.log(`Balance: ${balance} GIC`);

// Transfer
const tx = await client.transferGIC({
  from: 'did:kaizen:alice',
  to: 'did:kaizen:bob',
  amount: 10.0,
  privateKey: '...'
});
```

---

## Integration Points

### Lab 2 (Thought Broker)
- **Attestation target:** All DelibProof consensus results
- **GIC rewards:** Successful deliberations with agreement ≥ 0.90
- **DID lookup:** Agent identity resolution

### Lab 3 (Resource Orchestration)
- **GIC settlement:** Compute resource payments
- **PublicGoodsPool:** Grant disbursements
- **Balance queries:** Quota tracking

### Lab 4 (Proof Fabric)
- **ZK proof anchoring:** Privacy-preserving attestations
- **Verifiable compute:** Cryptographic verification

### Lab 5 (Humanities & Healthcare)
- **IntegrityEvent sink:** HVC constraint enforcement logs
- **GI delta tracking:** Ethical impact measurement
- **Differential privacy:** Budget consumption ledger

### Lab 6 (Governance)
- **Voting weight:** GIC balance determines vote power
- **Proposal history:** All governance actions on-chain
- **Agora integration:** Democratic deliberation records

### Lab 7 (Data Economy)
- **Data provenance:** Ownership and lineage tracking
- **Marketplace settlements:** GIC as payment rail

---

## Development

### Setup

```bash
cd apps/ledger-api/civic-protocol-core

# Install Python dependencies
pip install -r ledger/requirements.txt
pip install -r gic-indexer/requirements.txt

# Start ledger service
python ledger/app/main.py
# Runs on http://localhost:5411

# Start GIC indexer (separate terminal)
cd gic-indexer
python app/main.py
# Runs on http://localhost:8000
```

### Testing

```bash
# Unit tests
pytest ledger/tests/
pytest gic-indexer/tests/

# Integration test
python examples/full-integration-example.py

# Load test
python tests/integration/test_full_system.py
```

### Smart Contract Deployment

```bash
cd packages/gic-registry-contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

## Configuration

### Environment Variables

```bash
# Ledger Core
LEDGER_PORT=5411
LEDGER_DB_PATH=./data/ledger.db
CYCLE_DURATION_HOURS=24
GI_MINIMUM_THRESHOLD=0.90

# GIC Indexer
GIC_INDEXER_PORT=8000
GIC_CONTRACT_ADDRESS=0x...
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/...

# Smart Contracts
DEPLOYER_PRIVATE_KEY=0x...
INITIAL_GIC_SUPPLY=1000000
PUBLIC_GOODS_POOL_PERCENT=50
```

---

## Governance & Security

### Virtue Accords Integration

All ledger operations enforce **Virtue Accords** constraints:
- **NonMaleficence:** Block transactions with GI < 0.90
- **Beneficence:** Reward civic actions that increase GI
- **Justice:** Fair GIC distribution via quadratic voting
- **Autonomy:** Informed consent for all data writes

### Incident Response

See `docs/runbooks/incident_response_citizen_shield.md` for security protocols.

**Emergency Procedures:**
1. **Circuit breaker:** Halt ledger writes if avg GI < 0.85
2. **Rollback:** Revert to last known good block (requires 3/5 guardian consensus)
3. **Audit:** Generate full integrity report via `scripts/integrity-report.sh`

---

## Status

✅ **Blockchain Kernel** — Active (Proof-of-Cycle consensus)
✅ **GIC Token** — Active (ERC-20 deployed to testnet)
✅ **DID Registry** — Active (did:kaizen namespace)
✅ **Integrity Proofs** — Active (Lab 2, 5, 6 integration)
✅ **Cycle Management** — Active (24-hour epochs)

---

## References

- **Economic Model:** `docs/GIC_Whitepaper_Final.md`
- **Foundation-Up Economics:** `docs/GIC_Foundation_Up_Economics_Addendum.md`
- **Governance Charter:** `docs/constitution/custos-charter.md`
- **Complete Architecture:** `docs/architecture/Kaizen_OS_Complete_Lab_Architecture.md`
- **API Documentation:** `apps/ledger-api/README.md`

---

**Lab 1 honors the principle of 召唤 (Summon) — calling forth truth through cryptographic verification and transparent ledgers.**


