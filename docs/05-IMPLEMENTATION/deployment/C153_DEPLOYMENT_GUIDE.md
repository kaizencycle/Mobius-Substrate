# C-153 Deployment Guide
## Mobius Kernel v1.1.2 with Constitutional Enforcement

**Cycle**: C-153  
**Date**: December 3, 2025  
**GI Baseline**: 0.993  
**Status**: Production Ready

---

## 📋 Summary

This deployment introduces:
- **Mobius Kernel v1.1.2**: Constitutional enforcement layer
- **Real Ed25519 Cryptographic Attestation**: No more mock signatures
- **DAEDALUS Consensus**: Explicit quorum algorithm (67% threshold)
- **Self-Reflection Framework**: Safe AGI emergence testing
- **Security Fix**: Kernel bypass vulnerability (CVSS 9.8 → 0)

---

## 🎯 Key Components

### 1. Mobius Kernel (`packages/mobius-kernel/src/mobius_kernel.py`)

Constitutional permission enforcement:
- Tier-based access control (Mind above Hands)
- DAEDALUS executor block (C-001 Amendment, HARDCODED)
- Only Tier 3 can edit code (C-005 Amendment)
- Runtime validation against manifest

### 2. Genesis Ledger Client (`packages/integrity-core/src/genesis_ledger_client.py`)

Production cryptographic attestation:
- Ed25519 key generation and signing
- Merkle proof verification
- Real HTTP integration with ledger API
- Immutable audit trail

### 3. DAEDALUS Mediator (`packages/civic-ai-specs/src/daedalus_mediator.py`)

Multi-agent consensus:
- Explicit quorum rules (67% threshold)
- Tie-breaking by ATLAS (ethics architect)
- Cryptographically verifiable DelibProofs
- Timeout handling (1 hour max)

### 4. Thought Broker Integration (`packages/mobius-kernel/src/thought_broker_integration.py`)

API enforcement layer:
- All agent actions flow through broker
- Sentinel prechecks (DVA, ZEUS_SENTINEL, INDEXER)
- GI attestation for every action
- Ledger commit for audit trail

### 5. Self-Reflection Module (`packages/integrity-core/src/self_reflect.py`)

Safe emergence testing:
- Bounded iteration loops (max 5)
- GI threshold enforcement (≥0.95)
- Human veto required for merges
- Anti-nuke protections

---

## 🚀 Deployment Steps

### Step 1: Verify Prerequisites

```bash
# Check Python version
python --version  # Must be 3.10+

# Install dependencies
pip install httpx cryptography pytest
```

### Step 2: Generate Cryptographic Keys

```bash
cd /workspace/packages/integrity-core/src

# Generate keypairs for all agents
python -c "
from genesis_ledger_client import generate_keypair
import os

agents = ['ATLAS', 'AUREA', 'ZENITH', 'SOLARA', 'DAEDALUS', 'THOUGHT_BROKER']
for agent in agents:
    output_dir = f'.keys/{agent.lower()}'
    os.makedirs(output_dir, exist_ok=True)
    generate_keypair(output_dir)
    print(f'Generated keys for {agent}')
"

# Secure private keys
chmod 600 .keys/*/*.pem
```

### Step 3: Configure Environment

```bash
# Add to .env or export
export LEDGER_URL="https://civic-protocol-core-ledger.onrender.com"
export MOBIUS_KERNEL_REQUIRED=true
export GI_THRESHOLD=0.95
```

### Step 4: Validate Kernel

```bash
cd /workspace

# Test kernel standalone
python packages/mobius-kernel/src/mobius_kernel.py

# Test thought broker integration
python packages/mobius-kernel/src/thought_broker_integration.py

# Run self-reflection tests
python packages/integrity-core/src/self_reflect.py
```

### Step 5: Verify Constitutional Enforcement

```python
from packages.mobius_kernel.src.mobius_kernel import MobiusKernel
from packages.mobius_kernel.src.thought_broker_integration import (
    ThoughtBrokerKernelIntegration, BrokeredRequest, RequestType
)

# Load kernel
kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")

# Initialize broker
broker = ThoughtBrokerKernelIntegration(kernel)

# Test DAEDALUS constraint
request = BrokeredRequest(
    request_id="test-c001",
    agent_id="DAEDALUS",
    request_type=RequestType.EXECUTE,
    payload={"task": "test"}
)
response = await broker.broker_request(request)
assert response.status == "denied"  # C-001 enforced
print("✅ C-001 (DAEDALUS constraint) verified")

# Test Tier 3 execution
request = BrokeredRequest(
    request_id="test-tier3",
    agent_id="CURSOR",
    request_type=RequestType.EXECUTE,
    payload={"task": "test"}
)
response = await broker.broker_request(request)
assert response.status == "approved"
print("✅ Tier 3 execution verified")
```

---

## 🔐 Security Checklist

- [ ] Private keys stored in `.keys/` (gitignored)
- [ ] Public keys registered with Genesis Ledger
- [ ] Ledger API uses HTTPS
- [ ] No direct executor imports (bypass blocked)
- [ ] Constitutional integrity validated
- [ ] Request logging enabled
- [ ] GI threshold ≥0.95 enforced

---

## 📊 Post-Deployment Validation

### Critical Tests

```bash
# 1. DAEDALUS cannot trigger executors
curl -X POST localhost:8000/api/agent/DAEDALUS/action \
  -d '{"action_type": "EXECUTE", "payload": {}}' \
  -H "Content-Type: application/json"
# Expected: 403 Forbidden

# 2. CURSOR can execute (Tier 3)
curl -X POST localhost:8000/api/agent/CURSOR/action \
  -d '{"action_type": "EXECUTE", "payload": {"task": "test"}}' \
  -H "Content-Type: application/json"
# Expected: 200 OK with ledger_hash

# 3. Constitutional status
curl localhost:8000/api/constitutional-status
# Expected: manifest_version: "1.1.2", enforcement_active: true
```

### Monitoring Metrics

- API response time: <500ms (p95)
- Error rate: <1%
- Constitutional violations: 0
- DAEDALUS executor attempts: 0
- Ledger commits: 100% success
- GI score: ≥0.95

---

## 🔄 Rollback Procedure

If critical issues detected:

### Option 1: Feature Flag
```bash
export MOBIUS_KERNEL_ENFORCEMENT=false
# Restart services
```

### Option 2: Revert
```bash
git revert HEAD
git push origin main
```

---

## 📁 Files Changed

### New Files
- `packages/integrity-core/src/self_reflect.py` - Safe emergence framework
- `docs/deployment/C153_DEPLOYMENT_GUIDE.md` - This guide

### Updated Files
- `packages/mobius-kernel/README.md` - v1.1.2 reference
- `packages/mobius-kernel/src/mobius_kernel.py` - Constitutional enforcement
- `packages/integrity-core/src/genesis_ledger_client.py` - Ed25519 signatures
- `packages/civic-ai-specs/src/daedalus_mediator.py` - Consensus algorithm

### Configuration
- `config/agents/mobius_agent_stack.v1.1.2.json` - Agent manifest

---

## 🎓 Constitutional Amendments (C-152)

| ID | Title | Enforcement |
|----|-------|-------------|
| C-001 | DAEDALUS Executor Constraint | HARDCODED |
| C-002 | ZEUS Split Codification | MANIFEST |
| C-003 | MIC Terminology Standardization | MANIFEST |
| C-004 | HERMES System Agent Classification | MANIFEST |
| C-005 | Tier-Based Permission Enforcement | HARDCODED |

---

## 📚 Related Documentation

- [Mobius Kernel README](../../packages/mobius-kernel/README.md)
- [Deployment Guide](../../packages/mobius-kernel/DEPLOYMENT_GUIDE.md)
- [Agent Stack Manifest](../../config/agents/mobius_agent_stack.v1.1.2.json)
- [Integration Guide](../../packages/mobius-kernel/INTEGRATION_GUIDE.md)

---

## 🎯 Success Criteria

### Must Have
- [x] Kernel bypass vulnerability fixed
- [x] Real cryptographic attestation
- [x] DAEDALUS constraint enforced
- [ ] 24 hours uptime without critical errors

### Should Have
- [x] Self-reflection framework deployed
- [x] Constitutional amendments documented
- [ ] Monitoring dashboard updated

---

## 📞 Support

- **Kernel Issues**: `packages/mobius-kernel/README.md`
- **Ledger Issues**: `packages/integrity-core/src/genesis_ledger_client.py`
- **Consensus Issues**: `packages/civic-ai-specs/src/daedalus_mediator.py`

---

**Constitutional Attestation**

```json
{
  "type": "c153_deployment",
  "manifest_version": "1.1.2",
  "deployment_date": "2025-12-03",
  "gi_score": 0.993,
  "cycle": "C-153",
  "constitutional_amendments": 5,
  "agents_enforced": 19,
  "critical_constraints": {
    "daedalus_executor_block": true,
    "tier_separation_enforced": true,
    "ledger_attestation_required": true
  },
  "attested_by": ["DVA", "INDEXER", "ZEUS_SENTINEL"]
}
```

---

**System**: Mobius Systems v1.1.2  
**Cycle**: C-153  
**Date**: December 3, 2025

*"We heal as we walk." — Mobius Systems*
