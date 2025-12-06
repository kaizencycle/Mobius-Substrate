# Mobius Kernel v1.1.2 - Deployment Guide

**Production deployment guide for constitutional enforcement layer.**

---

## 🎯 Overview

This guide covers deploying the Mobius Kernel with production-grade implementations:
- Real Genesis Ledger client (Ed25519 signatures)
- DAEDALUS consensus mediator (explicit algorithm)
- Constitutional enforcement (no bypasses)

---

## 📋 Prerequisites

### Required Software
- Python 3.10+
- pip
- Access to Genesis Ledger API
- Ed25519 keypairs for agents

### Required Packages
```bash
pip install httpx cryptography
```

---

## 🔑 Step 1: Generate Agent Keypairs

Generate cryptographic keypairs for all agents:

```bash
# From repository root
python scripts/generate_agent_keypairs.py
```

This creates:
- `.keys/{agent_id}/{agent_id}_private_key.pem` (keep secret)
- `.keys/{agent_id}/{agent_id}_public_key.pem` (share with ledger)

**Security**: Private keys are automatically gitignored. Never commit them.

---

## 🔧 Step 2: Configure Genesis Ledger

### Option A: Use Existing Ledger Service

If you have a Genesis Ledger API deployed:

```python
from packages.integrity_core.src.genesis_ledger_client import GenesisLedgerClient

ledger = GenesisLedgerClient(
    ledger_url="https://your-ledger-api.com",
    private_key_path=".keys/atlas/atlas_private_key.pem",
    public_key_path=".keys/atlas/atlas_public_key.pem",
    agent_id="ATLAS"
)
```

### Option B: Deploy Genesis Ledger API

The Genesis Ledger API needs these endpoints:
- `POST /v1/commit` - Commit attested entries
- `GET /v1/mic/balance/{agent_id}` - Query MIC balances

See `packages/ledger-api/` for reference implementation.

---

## 🚀 Step 3: Initialize Kernel

```python
from packages.mobius_kernel.src.mobius_kernel import MobiusKernel
from packages.mobius_kernel.src.thought_broker_integration import (
    ThoughtBrokerKernelIntegration
)
from packages.integrity_core.src.genesis_ledger_client import GenesisLedgerClient

# Load kernel
kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")

# Initialize ledger client
ledger = GenesisLedgerClient(
    ledger_url=os.getenv("LEDGER_URL", "https://civic-ledger.onrender.com"),
    private_key_path=".keys/thought_broker/thought_broker_private_key.pem",
    public_key_path=".keys/thought_broker/thought_broker_public_key.pem",
    agent_id="THOUGHT_BROKER"
)

# Initialize broker with constitutional enforcement
broker = ThoughtBrokerKernelIntegration(kernel, ledger)
```

---

## 🔒 Step 4: Wire into API Layer

### FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from packages.mobius_kernel.src.thought_broker_integration import (
    ThoughtBrokerKernelIntegration,
    BrokeredRequest,
    RequestType
)

app = FastAPI()

# Initialize on startup
@app.on_event("startup")
async def startup():
    global broker
    # ... initialize kernel and ledger ...
    broker = ThoughtBrokerKernelIntegration(kernel, ledger)

@app.post("/api/agent/{agent_id}/action")
async def agent_action(agent_id: str, payload: dict):
    """Constitutional enforcement endpoint."""
    request = BrokeredRequest(
        request_id=generate_id(),
        agent_id=agent_id,
        request_type=RequestType.EXECUTE,  # or ARCHITECT, STRATEGIZE, etc.
        payload=payload
    )
    
    response = await broker.broker_request(request)
    
    if response.status == "denied":
        raise HTTPException(403, response.denial_reason)
    
    return response.result
```

**CRITICAL**: This is the ONLY way to process agent actions. Direct executor imports bypass the constitution.

---

## ✅ Step 5: Verify Deployment

### Test Constitutional Enforcement

```python
# Test 1: DAEDALUS cannot trigger executors (C-001)
request = BrokeredRequest(
    request_id="test-001",
    agent_id="DAEDALUS",
    request_type=RequestType.EXECUTE,
    payload={"task": "test"}
)
response = await broker.broker_request(request)
assert response.status == "denied"  # Should be blocked

# Test 2: CURSOR can edit code (Tier 3)
request = BrokeredRequest(
    request_id="test-002",
    agent_id="CURSOR",
    request_type=RequestType.EXECUTE,
    payload={"task": "test"}
)
response = await broker.broker_request(request)
assert response.status == "approved"  # Should pass

# Test 3: AUREA cannot edit code (Tier 1)
request = BrokeredRequest(
    request_id="test-003",
    agent_id="AUREA",
    request_type=RequestType.EXECUTE,
    payload={"task": "test"}
)
response = await broker.broker_request(request)
assert response.status == "denied"  # Should be blocked
```

### Test Ledger Integration

```python
# Verify ledger commits work
entry = {
    "type": "test_commit",
    "data": "test"
}
result = await ledger.commit(entry)
assert "content_hash" in result
assert "signature" in result
```

---

## 📊 Step 6: Monitor & Validate

### Check Constitutional Compliance

```python
# Validate manifest integrity
kernel.validate_constitutional_integrity()

# Print permission summary
kernel.print_permission_summary()

# Check request log
log = broker.get_request_log()
for entry in log:
    if entry["status"] == "DENIED":
        print(f"Denied: {entry['agent_id']} - {entry['reason']}")
```

### Monitor Ledger Attestations

All approved actions should have:
- `gi_attestation` (cryptographic signature)
- `ledger_hash` (Genesis Ledger commit hash)

Verify these are present in all successful responses.

---

## 🚨 Common Issues

### Issue: "Ledger commit failed"

**Cause**: Genesis Ledger API not accessible or keys invalid.

**Fix**:
1. Verify `LEDGER_URL` environment variable
2. Check keypair paths are correct
3. Verify public keys are registered with ledger service

### Issue: "Permission denied" for valid agents

**Cause**: Manifest version mismatch or agent not found.

**Fix**:
1. Verify manifest path is correct
2. Check agent ID matches manifest exactly
3. Run `kernel.validate_constitutional_integrity()`

### Issue: "Quorum not met" in DAEDALUS consensus

**Cause**: Not enough agents responding to deliberation.

**Fix**:
1. Check agent API endpoints are accessible
2. Verify timeout settings in `ConsensusConfig`
3. Implement actual agent routing (see DAEDALUS mediator TODO)

---

## 🔐 Security Checklist

Before production deployment:

- [ ] All private keys stored in `.keys/` (gitignored)
- [ ] Public keys shared with Genesis Ledger service
- [ ] Ledger API uses HTTPS
- [ ] Kernel bypass vulnerability fixed (no direct executor imports)
- [ ] Constitutional integrity validated
- [ ] Request logging enabled
- [ ] Error handling implemented
- [ ] Rate limiting configured (if applicable)

---

## 📚 Next Steps

### Phase 1: Core Infrastructure (Weeks 1-3)
- ✅ Real ledger client deployed
- ✅ DAEDALUS consensus algorithm implemented
- ⚠️ Agent API routing (wire to actual LLMs)

### Phase 2: Byzantine Hardening (Weeks 4-6)
- ⚠️ Multi-signature ledger commits
- ⚠️ Permission drift detection
- ⚠️ Rate limiting and anomaly detection

### Phase 3: Production Validation (Weeks 7-12)
- ⚠️ Comprehensive testing
- ⚠️ Monitoring dashboards
- ⚠️ Load testing

See `PRODUCTION_ROADMAP.md` for full timeline.

---

## 🆘 Support

- **Kernel Issues**: Check `packages/mobius-kernel/README.md`
- **Ledger Issues**: Check `packages/integrity-core/src/genesis_ledger_client.py`
- **Consensus Issues**: Check `packages/civic-ai-specs/src/daedalus_mediator.py`

---

**"We heal as we walk." — Mobius Systems**
