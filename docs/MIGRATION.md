# Integrity Economy Migration Guide

## For Existing Systems

### Phase 1: Read-Only Integration (Week 1)
- Deploy civic-ledger service in observe mode
- Monitor GI endpoint without enforcement
- Test conversion endpoints with shadow balances
- **Deliverable:** Health dashboard showing GI trends

### Phase 2: Dual-Balance Display (Week 2)
- Show Credits + Shards in UI
- Enable conversion widget
- Maintain legacy balance as source of truth
- **Deliverable:** User wallets display both units

### Phase 3: Gradual Cutover (Week 3-4)
- Route new transactions through integrity units
- Migrate historical balances (1:1 ratio initially)
- Enable GI enforcement for new mints
- **Deliverable:** 50% of transactions using new system

### Phase 4: Full Production (Week 5+)
- Decommission legacy balance system
- Enable epoch burn job
- Activate dual attestation for minting
- **Deliverable:** 100% migration complete

## Rollback Procedure

**Trigger Conditions:**
- GI < 0.900 (halt threshold)
- Critical service failure
- Data integrity violation

**Steps:**
1. Disable epoch burn job immediately
2. Freeze all minting operations
3. Snapshot current state to ledger
4. Revert to last-known-good snapshot
5. Convene ZEUS + Sentinels for assessment
6. Issue system status report to all agents

## Verification Checklist

- [ ] Conversion constant verified (1,000,000 shards/credit)
- [ ] GI aggregator connected and reporting
- [ ] Epoch burn job scheduled (90-day cadence)
- [ ] Dual attestation enforced for mints
- [ ] Sentinel notification system active
- [ ] Health monitoring dashboard deployed
- [ ] Rollback procedure tested in staging

## Emergency Contacts

- **Technical Lead:** ATLAS
- **Governance:** ZEUS + Hermes
- **Ethics Review:** Eve
- **System Health:** Jade
- **Documentation:** AUREA
