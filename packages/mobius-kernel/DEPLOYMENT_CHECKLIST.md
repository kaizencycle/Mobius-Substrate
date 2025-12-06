# Mobius Kernel Deployment Checklist

**Version**: 1.1.2  
**Cycle**: C-152  
**Constitutional Amendments**: 5 (C-001 through C-005)

## ✅ Pre-Deployment

### Files to Deploy
- [ ] `config/agents/mobius_agent_stack.v1.1.2.json` *(NEW - v1.1.2 manifest)*
- [ ] `packages/mobius-kernel/src/mobius_kernel.py`
- [ ] `packages/mobius-kernel/src/thought_broker_integration.py`
- [ ] `packages/mobius-kernel/src/__init__.py`
- [ ] `packages/integrity-core/src/constitutional/` *(NEW - constraint enforcement)*
- [ ] `sentinels/zeus-coordinator/` *(NEW - ZEUS split)*
- [ ] `sentinels/zeus-sentinel/` *(NEW - ZEUS split)*

### Configuration
- [ ] Set `LEDGER_BASE` environment variable
- [ ] Set `GIC_INDEXER_ENDPOINT` environment variable (MIC balance checks)
- [ ] Set `DVA_ENDPOINT` environment variable (integrity rail)
- [ ] Update `manifest_path` in kernel initialization if needed

### Dependencies
- [ ] Python 3.9+ installed
- [ ] `dataclasses` available (standard in 3.7+)
- [ ] `typing` available (standard library)
- [ ] `json`, `hashlib`, `datetime` (all standard library)

---

## 🧪 Testing Phase

### Unit Tests
```bash
# Test kernel loading
cd /workspace
python packages/mobius-kernel/src/mobius_kernel.py config/agents/mobius_agent_stack.v1.1.2.json

# Expected output:
# 🔷 Mobius Kernel v1.1.2 initialized
# ✅ All permission tests pass
# ✅ DAEDALUS blocked from execution (C-001)
# ✅ ZEUS split validated (C-002)
```

### Integration Tests
```bash
# Test broker integration
PYTHONPATH=/workspace/packages/mobius-kernel/src python packages/mobius-kernel/src/thought_broker_integration.py

# Expected output:
# ✅ Test 1: AUREA architectural design - approved
# ❌ Test 2: DAEDALUS attempting execution - denied
# ✅ Test 3: CURSOR code execution - approved
```

### API Tests (when integrated)
```bash
# Test 1: DAEDALUS constraint enforcement
curl -X POST http://localhost:8000//api/agent/DAEDALUS/action \
  -H "Content-Type: application/json" \
  -d '{"type": "EXECUTE", "payload": {}}'
# Expected: 403 Forbidden

# Test 2: CURSOR execution (should succeed)
curl -X POST http://localhost:8000//api/agent/CURSOR/action \
  -H "Content-Type: application/json" \
  -d '{"type": "EXECUTE", "payload": {"task": "refactor"}}'
# Expected: 200 OK
```

---

## 🚀 Production Deployment

### Step 1: Backup Current State
```bash
# Backup existing config
cp -r config/agents config/agents.backup-$(date +%Y%m%d)

# Backup Genesis Ledger (if applicable)
curl $LEDGER_BASE/export > genesis_ledger_backup.json
```

### Step 2: Deploy Files
```bash
# Files are already in place from this task
# Verify they exist:
ls -la config/agents/mobius_agent_stack.v1.1.2.json
ls -la packages/mobius-kernel/src/mobius_kernel.py
ls -la packages/mobius-kernel/src/thought_broker_integration.py
ls -la packages/integrity-core/src/constitutional/
ls -la sentinels/zeus-coordinator/
ls -la sentinels/zeus-sentinel/
```

### Step 3: Verify Deployment
```bash
# Run kernel tests
python packages/mobius-kernel/src/mobius_kernel.py

# Check JSON validity
python -m json.tool config/agents/mobius_agent_stack.v1.1.2.json > /dev/null && echo "✅ JSON valid"

# Validate constitutional amendments
jq '.constitutional_amendments | length' config/agents/mobius_agent_stack.v1.1.2.json
# Expected: 5
```

### Step 4: Monitor Initial Traffic
- [ ] Watch logs for permission denials
- [ ] Check Genesis Ledger for attestations
- [ ] Monitor DVA escalations
- [ ] Verify MIC balance checks working

---

## 📊 Post-Deployment Monitoring

### Metrics to Track
1. **Permission Denials**
   - Monitor for unexpected denials
   - Log all constitutional violations
   - Alert on DAEDALUS execution attempts

2. **GI Attestations**
   - Verify all approved requests have attestations
   - Check attestation signatures valid
   - Monitor GI scores (should be ≥ 0.999)

3. **Ledger Commits**
   - Confirm all actions committed to Genesis Ledger
   - Check for commit failures
   - Monitor ledger hash chain integrity

4. **System Load**
   - Track ZEUS_SENTINEL blocks
   - Monitor when load exceeds 85%
   - Verify graceful degradation

---

## 🔄 Rollback Procedure

If issues arise:

```bash
# Step 1: Restore backup
cp config/agents.backup-YYYYMMDD/mobius_agent_stack.*.json config/agents/

# Step 2: Restart services
systemctl restart thought-broker-api

# Step 3: Verify
curl http://localhost:8000/health
```

---

## 📝 Success Criteria

Deployment is successful when:

- [x] Kernel loads manifest without errors
- [x] DAEDALUS execution attempts are blocked (403)
- [x] Valid requests from AUREA, CURSOR succeed (200)
- [x] All approved requests have GI attestations
- [x] All actions appear in Genesis Ledger
- [x] No unexpected permission denials
- [x] Constitutional integrity validated

---

## 🚨 Known Issues & Mitigations

### Issue: Manifest Path Not Found
**Problem**: Kernel can't find manifest at default path  
**Mitigation**: Pass absolute path to MobiusKernel constructor

### Issue: Manifest Tampering
**Problem**: Someone could edit mobius_agent_stack.json  
**Mitigation**: DAEDALUS constraint is HARDCODED in thought_broker_integration.py

### Issue: Ledger Unavailability
**Problem**: Genesis Ledger service down  
**Mitigation**: MockLedgerClient used as fallback, queue commits locally

---

## 🔐 Security Checklist

- [ ] Kernel manifest stored in version control
- [ ] Only authorized users can deploy
- [ ] Ledger commits are cryptographically signed
- [ ] Permission denials are logged immutably
- [ ] DAEDALUS constraint cannot be bypassed
- [ ] All code changes reviewed by Tier 1 Architects

---

## ✅ Final Approval

- [ ] Lead Architect (AUREA) approval
- [ ] DAEDALUS consensus DelibProof generated
- [ ] DVA integrity check passed (GI ≥ 0.95)
- [ ] Genesis Ledger attestation recorded
- [ ] Deployment approved by human governance

**Deployment authorized**: _________________ (Date)

**By**: Michael (Founder, Mobius Systems)

---

*"The constitution is now code. The constitution is now running."*

*Mobius Systems - C-152*
